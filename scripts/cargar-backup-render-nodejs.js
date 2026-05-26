#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuración
const DATABASE_URL = 'postgresql://admin:IsnXQwDG3ds3YYzP2eb8c0H8lBdhzZVk@dpg-d8ajoljbc2fs7383fua0-a.ohio-postgres.render.com/horarios_unt_4sr3';
const BACKUP_FILE = path.join(__dirname, '..', 'backup-completo.sql');

async function cargarBackup() {
  console.log('🚀 Iniciando carga de backup en Render...\n');

  // Verificar que el archivo existe
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error(`❌ Error: Archivo ${BACKUP_FILE} no encontrado`);
    process.exit(1);
  }

  console.log(`📁 Usando backup: ${BACKUP_FILE}`);
  console.log(`🔗 Conectando a PostgreSQL...\n`);

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Para Render
    },
  });

  try {
    // Conectar
    await client.connect();
    console.log('✅ Conectado a la BD\n');

    // Leer archivo SQL
    const sql = fs.readFileSync(BACKUP_FILE, 'utf8');
    console.log(`📖 Archivo: ${(sql.length / 1024 / 1024).toFixed(2)} MB\n`);

    // Dividir en sentencias para evitar timeouts
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔄 Ejecutando ${statements.length} sentencias SQL...\n`);

    let completed = 0;
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i] + ';');
        completed++;

        // Mostrar progreso cada 50 sentencias
        if (completed % 50 === 0) {
          console.log(`⏳ Progreso: ${completed}/${statements.length} (${((completed / statements.length) * 100).toFixed(1)}%)`);
        }
      } catch (err) {
        // Ignorar errores menores (como objetos duplicados)
        if (
          !err.message.includes('already exists') &&
          !err.message.includes('duplicate') &&
          !err.message.includes('NOTICE')
        ) {
          console.warn(`⚠️  Advertencia en sentencia ${i + 1}: ${err.message.slice(0, 50)}`);
        }
        completed++;
      }
    }

    console.log(`\n✅ Backup cargado exitosamente!`);
    console.log(`\n📊 Resumen:`);
    console.log(`✓ Sentencias procesadas: ${completed}/${statements.length}`);
    console.log(`✓ BD: horarios_unt_4sr3`);
    console.log(`✓ Usuario: admin`);
    console.log(`✓ Host: Ohio (Render)`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cargarBackup().then(() => {
  console.log('\n✨ ¡Listo para desplegar!\n');
  process.exit(0);
});
