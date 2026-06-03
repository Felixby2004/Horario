/**
 * Script para ejecutar los índices SQL en Neon
 * Ejecutar: node execute-indexes.js
 */

const fs = require('fs');
const { Client } = require('pg');

const dbUrl = process.argv[2] || 'postgresql://neondb_owner:npg_1vZP6UWptzNq@ep-withered-smoke-aqq3g5zh-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString: dbUrl });

async function executeIndexes() {
  try {
    console.log('🔗 Conectando a Neon...');
    await client.connect();
    console.log('✅ Conectado a Neon');

    console.log('📋 Leyendo archivo SQL...');
    const sql = fs.readFileSync('./prisma/migrations/optimize_indexes.sql', 'utf8');
    
    console.log('🚀 Ejecutando índices...');
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`  → Ejecutando: ${command.substring(0, 60)}...`);
        await client.query(command);
        console.log('    ✅ OK');
      }
    }

    console.log('\n✅ Todos los índices se crearon correctamente');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Los índices ya existen (ignorando)');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    await client.end();
    console.log('🔌 Desconectado');
  }
}

executeIndexes();
