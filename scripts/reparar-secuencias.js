const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const sequences = await prisma.$queryRawUnsafe(`
    SELECT
      seq.relname AS seq_name,
      ns.nspname AS schema_name,
      tbl.relname AS table_name,
      att.attname AS column_name
    FROM pg_class seq
    JOIN pg_depend dep ON dep.objid = seq.oid AND dep.deptype = 'a'
    JOIN pg_class tbl ON dep.refobjid = tbl.oid
    JOIN pg_namespace ns ON ns.oid = seq.relnamespace
    JOIN pg_attribute att ON att.attrelid = tbl.oid AND att.attnum = dep.refobjsubid
    WHERE seq.relkind = 'S'
      AND ns.nspname = 'public'
    ORDER BY tbl.relname, att.attname
  `);

  for (const sequence of sequences) {
    const sequenceName = `${sequence.schema_name}.${sequence.seq_name}`;
    const sql = `SELECT setval('${sequenceName}', COALESCE((SELECT MAX("${sequence.column_name}") FROM "${sequence.schema_name}"."${sequence.table_name}"), 0) + 1, false)`;
    await prisma.$executeRawUnsafe(sql);
  }

  console.log(`Secuencias ajustadas: ${sequences.length}`);
}

main()
  .catch(async (error) => {
    console.error('Error al ajustar secuencias:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });