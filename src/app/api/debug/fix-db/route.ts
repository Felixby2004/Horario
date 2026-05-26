import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Consulta para encontrar todas las secuencias y sus tablas/columnas asociadas
    const sequences: any[] = await prisma.$queryRaw`
      SELECT 
        t.relname AS table_name, 
        a.attname AS column_name, 
        s.relname AS sequence_name
      FROM pg_class s
      JOIN pg_depend d ON d.objid = s.oid
      JOIN pg_class t ON d.refobjid = t.oid
      JOIN pg_attribute a ON (d.refobjid = a.attrelid AND d.refobjsubid = a.attnum)
      WHERE s.relkind = 'S' AND t.relkind = 'r';
    `;

    const results = [];

    for (const seq of sequences) {
      try {
        const { table_name, column_name, sequence_name } = seq;
        
        // Ejecutar el setval dinámicamente para cada secuencia encontrada
        await prisma.$executeRawUnsafe(`
          SELECT setval('"${sequence_name}"', (SELECT COALESCE(MAX("${column_name}"), 0) + 1 FROM "${table_name}"), false);
        `);
        
        results.push({ table: table_name, column: column_name, sequence: sequence_name, status: 'success' });
      } catch (err: any) {
        results.push({ table: seq.table_name, status: 'error', message: err.message });
      }
    }

    // Si la consulta anterior no devuelve nada (dependiendo de la versión de PG), 
    // intentamos con los nombres manuales más comunes
    if (results.length === 0) {
      const manualTables = ['usuario', 'docente', 'curso', 'grupo', 'ambiente', 'periodo_academico'];
      for (const table of manualTables) {
        try {
          let idCol = table === 'periodo_academico' ? 'id_periodo' : `id_${table}`;
          const manualSeq = `${table}_${idCol}_seq`;
          await prisma.$executeRawUnsafe(`
            SELECT setval('${manualSeq}', (SELECT COALESCE(MAX("${idCol}"), 0) + 1 FROM "${table}"), false);
          `);
          results.push({ table, status: 'manual_success' });
        } catch (e) {}
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje: 'Sincronización de secuencias completada',
      secuencias_procesadas: results.length,
      detalles: results
    });
  } catch (error: any) {
    return NextResponse.json({
      exito: false,
      error: error.message
    }, { status: 500 });
  }
}
