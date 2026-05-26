import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Lista de tablas con sus secuencias (estándar de PostgreSQL para serial)
    const tables = [
      'usuario',
      'periodo_academico',
      'docente',
      'curso',
      'grupo',
      'ambiente',
      'horario_asignado',
      'auditoria_horario',
      'conflicto_horario',
      'dia_no_laborable',
      'disponibilidad_docente',
      'disponibilidad_docente_registro',
      'docente_curso',
      'docente_grupo',
      'fase_disponibilidad',
      'historial_notificaciones',
      'preasignacion',
      'preferencias_notificacion_docente',
      'restriccion_institucional',
      'seleccion_temporal_horario',
      'ventana_atencion',
      'cola_notificaciones',
      'citacion_docente'
    ];

    const results = [];

    for (const table of tables) {
      try {
        // Obtener el nombre de la columna ID (usualmente id_nombretabla)
        // Pero en este esquema varían un poco, así que mapeamos los nombres correctos
        let idColumn = `id_${table}`;
        if (table === 'usuario') idColumn = 'id_usuario';
        if (table === 'periodo_academico') idColumn = 'id_periodo';
        if (table === 'horario_asignado') idColumn = 'id_horario';
        if (table === 'auditoria_horario') idColumn = 'id_auditoria';
        if (table === 'conflicto_horario') idColumn = 'id_conflicto';
        if (table === 'dia_no_laborable') idColumn = 'id_dia_no_laborable';
        if (table === 'disponibilidad_docente') idColumn = 'id_disponibilidad';
        if (table === 'disponibilidad_docente_registro') idColumn = 'id_registro';
        if (table === 'docente_curso') idColumn = 'id_docente_curso';
        if (table === 'docente_grupo') idColumn = 'id_docente_grupo';
        if (table === 'fase_disponibilidad') idColumn = 'id_fase';
        if (table === 'historial_notificaciones') idColumn = 'id_historial';
        if (table === 'preasignacion') idColumn = 'id_preasignacion';
        if (table === 'preferencias_notificacion_docente') idColumn = 'id_preferencia';
        if (table === 'restriccion_institucional') idColumn = 'id_restriccion';
        if (table === 'seleccion_temporal_horario') idColumn = 'id_seleccion';
        if (table === 'ventana_atencion') idColumn = 'id_ventana';
        if (table === 'cola_notificaciones') idColumn = 'id_cola';
        if (table === 'citacion_docente') idColumn = 'id_citacion';

        const seqName = `${table}_${idColumn}_seq`;
        
        await prisma.$executeRawUnsafe(`
          SELECT setval('${seqName}', (SELECT COALESCE(MAX(${idColumn}), 0) + 1 FROM "${table}"), false);
        `);
        results.push({ table, status: 'success' });
      } catch (err: any) {
        results.push({ table, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje: 'Proceso de sincronización de secuencias finalizado',
      detalles: results
    });
  } catch (error: any) {
    return NextResponse.json({
      exito: false,
      error: error.message
    }, { status: 500 });
  }
}
