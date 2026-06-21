import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerPlanesEstudioDisponibles, validarDatosPlan, validarDuplicidadPlan } from '@/lib/planesEstudio';
import { obtenerUsuarioAutenticadoOpcional } from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';

function normalizarTextoOracion(valor: unknown) {
  const texto = String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!texto) return '';

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export async function GET() {
  try {
    const planes = await obtenerPlanesEstudioDisponibles();
    const codigos = planes.map((plan) => String(plan.codigo || '').trim()).filter(Boolean);
    const cursos = codigos.length
      ? await prisma.curso.findMany({
          where: {
            activo: true,
            plan_estudios: {
              in: codigos
            }
          },
          select: {
            plan_estudios: true,
            creditos: true
          }
        })
      : [];

    const resumenPorPlan = new Map<string, { total_cursos: number; total_creditos: number }>();
    for (const curso of cursos) {
      const codigoPlan = String(curso.plan_estudios || '').trim();
      if (!codigoPlan) continue;

      const resumenActual = resumenPorPlan.get(codigoPlan) || {
        total_cursos: 0,
        total_creditos: 0
      };

      resumenActual.total_cursos += 1;
      resumenActual.total_creditos += curso.creditos || 0;
      resumenPorPlan.set(codigoPlan, resumenActual);
    }

    const detalles = planes.map((plan) => {
      const resumen = resumenPorPlan.get(String(plan.codigo || '').trim()) || {
        total_cursos: 0,
        total_creditos: 0
      };

      return {
        ...plan,
        total_cursos: resumen.total_cursos,
        total_creditos: resumen.total_creditos
      };
    });

    return NextResponse.json({
      exito: true,
      datos: detalles
    });
  } catch (error: any) {
    console.error('Error listando planes de estudio:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'No se pudieron cargar los planes de estudio.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const errores = {
      ...validarDatosPlan(body),
      ...(await validarDuplicidadPlan(body))
    };

    if (Object.keys(errores).length) {
      return NextResponse.json(
        { exito: false, errores, error: 'Los datos del plan no son válidos.' },
        { status: 400 }
      );
    }

    const idDepartamento = Number.parseInt(String(body.id_departamento), 10);
    const departamento = await prisma.departamentoAcademico.findUnique({
      where: {
        id_departamento: idDepartamento
      }
    });

    if (!departamento) {
      return NextResponse.json(
        { exito: false, error: 'La escuela profesional seleccionada no existe.' },
        { status: 400 }
      );
    }

    const usuario = await obtenerUsuarioAutenticadoOpcional(request);
    const nuevoPlan = await prisma.planEstudio.create({
      data: {
        codigo: String(body.codigo || '').trim(),
        nombre: normalizarTextoOracion(body.nombre),
        anio_creacion: Number.parseInt(String(body.anio_creacion), 10),
        anio_vigencia: Number.parseInt(String(body.anio_vigencia), 10),
        estado: body.estado !== false,
        resolucion_aprobacion: String(body.resolucion_aprobacion || '').trim() || null,
        id_departamento: idDepartamento,
        descripcion_cambios: normalizarTextoOracion(body.descripcion_cambios || '') || null,
        fecha_ultima_modificacion: new Date(),
        id_usuario_modificador: usuario?.id_usuario || null
      },
      include: {
        departamento: true,
        usuario_modificador: {
          select: {
            id_usuario: true,
            nombres: true,
            apellidos: true
          }
        },
        _count: {
          select: {
            versiones: true
          }
        }
      }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Plan académico creado correctamente.',
      datos: nuevoPlan
    });
  } catch (error: any) {
    console.error('Error creando plan de estudio:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'No se pudo crear el plan de estudio.' },
      { status: 500 }
    );
  }
}
