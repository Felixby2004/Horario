const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const main = async () => {
  const sqlPath = path.join(__dirname, '..', 'nuevo.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  const pool = new Pool({
    connectionString: 'postgresql://postgres:123456@localhost:5432/horarios_unt',
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    const client = await pool.connect();

    console.log('🗑️  Eliminando esquema actual...');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');

    console.log('📥 Ejecutando nuevo esquema...');
    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error('Error en statement:', statement.substring(0, 100));
          throw err;
        }
      }
    }

    console.log('✅ Base de datos limpiada y recreada exitosamente');
    console.log('📊 Esquema actualizado con éxito');

    client.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();
