import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerSnapshotPlanEstudio, registrarVersionPlanEstudio } from '@/lib/planesEstudio';
import { obtenerUsuarioAutenticadoOpcional } from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idPlan = Number.parseInt(params.id, 10);
    if (!Number.isFinite(idPlan) || idPlan <= 0) {
      return NextResponse.json(
        { exito: false, error: 'El identificador del plan no es válido.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const numeroVersion = Number.parseInt(String(body.numero_version), 10);
    if (!Number.isFinite(numeroVersion) || numeroVersion <= 0) {
      return NextResponse.json(
        { exito: false, error: 'Debe indicar una versión válida para restaurar.' },
        { status: 400 }
      );
    }

    const version = await prisma.historialVersionPlanEstudio.findFirst({
      where: {
        id_plan: idPlan,
        numero_version: numeroVersion
      }
    });

    if (!version) {
      return NextResponse.json(
        { exito: false, error: 'La versión solicitada no existe.' },
        { status: 404 }
      );
    }

    const objetivo = version.snapshot_despues as any;
    if (!objetivo?.plan || !Array.isArray(objetivo?.cursos)) {
      return NextResponse.json(
        { exito: false, error: 'La versión almacenada no tiene un snapshot válido.' },
        { status: 400 }
      );
    }

    const usuario = await obtenerUsuarioAutenticadoOpcional(request);
    const snapshotAntes = await obtenerSnapshotPlanEstudio(idPlan);
    const codigoActual = snapshotAntes.plan.codigo;
    const codigoRestaurado = String(objetivo.plan.codigo || '').trim();

    await prisma.$transaction(async (tx) => {
      await tx.curso.updateMany({
        where: {
          plan_estudios: codigoActual
        },
        data: {
          plan_estudios: null
        }
      });

      await tx.planEstudio.update({
        where: {
          id_plan: idPlan
        },
        data: {
          codigo: codigoRestaurado,
          nombre: objetivo.plan.nombre,
          anio_creacion: objetivo.plan.anio_creacion,
          anio_vigencia: objetivo.plan.anio_vigencia,
          estado: Boolean(objetivo.plan.estado),
          resolucion_aprobacion: objetivo.plan.resolucion_aprobacion || null,
          id_departamento: objetivo.plan.id_departamento || null,
          fecha_ultima_modificacion: new Date(),
          id_usuario_modificador: usuario?.id_usuario || null,
          descripcion_cambios: `Restauración de la versión ${numeroVersion}`
        }
      });

      for (const curso of objetivo.cursos) {
        await tx.curso.update({
          where: {
            id_curso: curso.id_curso
          },
          data: {
            nombre: curso.nombre,
            tipo_curso: curso.tipo_curso || null,
            ciclo: curso.ciclo || null,
            creditos: curso.creditos,
            horas_teoria: curso.horas_teoria,
            horas_practica: curso.horas_practica,
            horas_laboratorio: curso.horas_laboratorio,
            prerequisitos: curso.prerequisitos || null,
            prerequisitos_relacion: {
              deleteMany: {},
              ...(Array.isArray(curso.prerequisito_ids) && curso.prerequisito_ids.length
                ? {
                    create: curso.prerequisito_ids.map((prerequisitoId: number) => ({
                      id_curso_prerequisito: prerequisitoId
                    }))
                  }
                : {})
            },
            plan_estudios: codigoRestaurado,
            id_departamento: objetivo.plan.id_departamento || null,
            escuela_profesional: objetivo.plan.escuela_profesional || null
          }
        });
      }
    });

    const snapshotDespues = await obtenerSnapshotPlanEstudio(idPlan);
    await registrarVersionPlanEstudio({
      idPlan,
      idUsuarioResponsable: usuario?.id_usuario || null,
      descripcionCambios: `Se restauró la versión ${numeroVersion}.`,
      snapshotAntes,
      snapshotDespues,
      restauradaDesdeVersion: numeroVersion
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Se restauró la versión ${numeroVersion} del plan de estudio.`
    });
  } catch (error: any) {
    console.error('Error restaurando versión del plan:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'No se pudo restaurar la versión del plan.' },
      { status: 500 }
    );
  }
}
