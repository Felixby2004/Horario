import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API: Búsqueda de docentes
export async function buscarDocentes(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const termino = searchParams.get('q') || '';

  const docentes = await prisma.docente.findMany({
    where: {
      OR: [
        { codigo_docente: { contains: termino } },
        { nombres: { contains: termino, mode: 'insensitive' } },
        { apellidos: { contains: termino, mode: 'insensitive' } },
        { correo_electronico: { contains: termino } }
      ],
      activo: true
    },
    take: 20
  });

  return NextResponse.json({ exito: true, datos: docentes });
}

// API: Docentes por categoría
export async function docentesPorCategoria(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria');

  const docentes = await prisma.docente.findMany({
    where: {
      categoria: categoria as any,
      activo: true
    },
    orderBy: { antiguedad: 'desc' }
  });

  return NextResponse.json({ exito: true, datos: docentes });
}

// API: Horario del docente
export async function horarioDocente(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const idPeriodo = searchParams.get('periodo');

  const horarios = await prisma.horarioAsignado.findMany({
    where: {
      id_docente: parseInt(params.id),
      ...(idPeriodo && { id_periodo: parseInt(idPeriodo) }),
      estado: { in: ['confirmado', 'publicado'] }
    },
    include: {
      curso: true,
      grupo: true,
      ambiente: true,
      periodo: true
    },
    orderBy: [
      { dia_semana: 'asc' },
      { hora_inicio: 'asc' }
    ]
  });

  return NextResponse.json({ exito: true, datos: horarios });
}

// API: Cursos del docente
export async function cursosDocente(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const grupos = await prisma.grupoCurso.findMany({
    where: { id_docente: parseInt(params.id) },
    include: {
      curso: true,
      horarios_asignados: {
        where: { estado: { in: ['confirmado', 'publicado'] } }
      }
    }
  });

  return NextResponse.json({ exito: true, datos: grupos });
}

// API: Verificar WhatsApp
export async function verificarWhatsApp(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { numero } = await request.json();

  // Simular verificación
  const verificado = numero && numero.length >= 9;

  if (verificado) {
    await prisma.docente.update({
      where: { id_docente: parseInt(params.id) },
      data: { telefono: numero }
    });
  }

  return NextResponse.json({ 
    exito: verificado,
    mensaje: verificado ? 'WhatsApp verificado' : 'Número inválido'
  });
}

// API: Probar notificación
export async function probarNotificacion(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { canal } = await request.json();

  // Simular envío de notificación de prueba
  const exito = true;

  return NextResponse.json({
    exito,
    mensaje: `Notificación de prueba enviada por ${canal}`
  });
}

// API: Disponibilidad de ambiente
export async function disponibilidadAmbiente(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const idPeriodo = searchParams.get('periodo');
  const dia = searchParams.get('dia');

  const horarios = await prisma.horarioAsignado.findMany({
    where: {
      id_ambiente: parseInt(params.id),
      ...(idPeriodo && { id_periodo: parseInt(idPeriodo) }),
      ...(dia && { dia_semana: dia as any }),
      estado: { in: ['confirmado', 'publicado'] }
    },
    include: {
      curso: true,
      grupo: true,
      docente: true
    }
  });

  return NextResponse.json({ exito: true, datos: horarios });
}

// API: Período activo
export async function periodoActivo() {
  const periodo = await prisma.periodoAcademico.findFirst({
    where: { activo: true }
  });

  return NextResponse.json({ exito: true, datos: periodo });
}

// API: Cambiar estado de período
export async function cambiarEstadoPeriodo(request: NextRequest) {
  const { id_periodo, activo } = await request.json();

  // Desactivar otros períodos si este se activa
  if (activo) {
    await prisma.periodoAcademico.updateMany({
      where: { activo: true },
      data: { activo: false }
    });
  }

  const periodo = await prisma.periodoAcademico.update({
    where: { id_periodo },
    data: { activo }
  });

  return NextResponse.json({ exito: true, datos: periodo });
}
