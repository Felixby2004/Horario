
import { PrismaClient, TipoModalidad, TipoCategoria } from '@prisma/client';

const prisma = new PrismaClient();

const CONFIGURACION_ESTANDAR = [
  {
    fecha: new Date('2026-06-08'),
    turnos: [
      { orden: 1, categoria: 'principal' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '08:00', hasta: '09:30' },
      { orden: 2, categoria: 'asociado' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '09:30', hasta: '11:00' },
      { orden: 3, categoria: 'auxiliar' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '11:00', hasta: '12:30' },
      { orden: 4, categoria: 'jefe_practica' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '12:30', hasta: '14:00' },
      { orden: 5, categoria: 'principal' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '14:00', hasta: '15:30' },
      { orden: 6, categoria: 'asociado' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '15:30', hasta: '17:00' },
      { orden: 7, categoria: 'auxiliar' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '17:00', hasta: '18:30' },
      { orden: 8, categoria: 'jefe_practica' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '18:30', hasta: '20:00' }
    ]
  },
  {
    fecha: new Date('2026-06-09'),
    turnos: [
      { orden: 1, categoria: 'principal' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '08:00', hasta: '09:30' },
      { orden: 2, categoria: 'asociado' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '09:30', hasta: '11:00' },
      { orden: 3, categoria: 'auxiliar' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '11:00', hasta: '12:30' },
      { orden: 4, categoria: 'jefe_practica' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '12:30', hasta: '14:00' },
      { orden: 5, categoria: 'principal' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '14:00', hasta: '15:30' },
      { orden: 6, categoria: 'asociado' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '15:30', hasta: '17:00' },
      { orden: 7, categoria: 'auxiliar' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '17:00', hasta: '18:30' },
      { orden: 8, categoria: 'jefe_practica' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '18:30', hasta: '20:00' }
    ]
  },
  {
    fecha: new Date('2026-06-10'),
    turnos: [
      { orden: 1, categoria: 'principal' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '08:00', hasta: '09:30' },
      { orden: 2, categoria: 'asociado' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '09:30', hasta: '11:00' },
      { orden: 3, categoria: 'auxiliar' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '11:00', hasta: '12:30' },
      { orden: 4, categoria: 'jefe_practica' as TipoCategoria, tipo: 'nombrado' as TipoModalidad, desde: '12:30', hasta: '14:00' },
      { orden: 5, categoria: 'principal' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '14:00', hasta: '15:30' },
      { orden: 6, categoria: 'asociado' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '15:30', hasta: '17:00' },
      { orden: 7, categoria: 'auxiliar' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '17:00', hasta: '18:30' },
      { orden: 8, categoria: 'jefe_practica' as TipoCategoria, tipo: 'contratado' as TipoModalidad, desde: '18:30', hasta: '20:00' }
    ]
  }
];

async function insertarConfiguracionEstandar() {
  console.log('📋 Insertando configuración estándar de ventanas...');

  try {
    const periodos = await prisma.periodoAcademico.findMany({
      where: { activo: true },
      orderBy: { id_periodo: 'desc' },
      take: 1
    });

    if (periodos.length === 0) {
      console.error('❌ No hay períodos académicos activos');
      process.exit(1);
    }

    const periodoActivo = periodos[0];
    console.log(`✓ Usando período: ${periodoActivo.nombre}`);

    await prisma.ventanaAtencion.deleteMany({
      where: { id_periodo: periodoActivo.id_periodo }
    });
    console.log('✓ Ventanas anteriores eliminadas');

    let totalVentanas = 0;
    let ordenGlobal = 1;
    for (const dia of CONFIGURACION_ESTANDAR) {
      for (const turno of dia.turnos) {
        await prisma.ventanaAtencion.create({
          data: {
            id_periodo: periodoActivo.id_periodo,
            fecha: dia.fecha,
            orden_prioridad: ordenGlobal,
            modalidad: turno.tipo,
            categoria: turno.categoria,
            hora_inicio: turno.desde,
            hora_fin: turno.hasta,
            intervalo_minutos: 15,
            activo: true
          }
        });
        totalVentanas++;
        ordenGlobal++;
      }
    }

    console.log(`✅ Configuración estándar insertada exitosamente!`);
    console.log(`📊 Total de ventanas: ${totalVentanas}`);
    console.log(`📅 Días configurados: ${CONFIGURACION_ESTANDAR.length}`);

  } catch (error) {
    console.error('❌ Error al insertar configuración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

insertarConfiguracionEstandar();
