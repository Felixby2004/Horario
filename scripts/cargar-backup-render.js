#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuración
const DATABASE_URL = 'postgresql://admin:IsnXQwDG3ds3YYzP2eb8c0H8lBdhzZVk@dpg-d8ajoljbc2fs7383fua0-a.ohio-postgres.render.com/horarios_unt_4sr3';
const BACKUP_FILE = path.join(__dirname, '..', 'backup-completo.sql');

console.log('🚀 Iniciando carga de backup en Render...\n');

// Verificar que el archivo existe
if (!fs.existsSync(BACKUP_FILE)) {
  console.error(`❌ Error: Archivo ${BACKUP_FILE} no encontrado`);
  process.exit(1);
}

console.log(`📁 Usando backup: ${BACKUP_FILE}`);
console.log(`🔗 Conectando a: ${DATABASE_URL.split('@')[1]}...\n`);

// Usar psql a través de npx (si está disponible) o mostrar instrucción manual
const command = `psql "${DATABASE_URL}" < "${BACKUP_FILE}"`;

console.log('⚙️  Ejecutando: psql en el archivo de backup...\n');

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error durante la carga:');
    console.error(stderr);
    
    // Si psql no está disponible, mostrar alternativas
    if (stderr.includes('no se reconoce') || stderr.includes('not found')) {
      console.log('\n📋 ALTERNATIVAS:\n');
      console.log('1️⃣  Usar DBeaver (GUI):');
      console.log('   - Descargar: https://dbeaver.io');
      console.log('   - Conectar con External URL proporcionada');
      console.log('   - Ejecutar el archivo backup-completo.sql\n');
      
      console.log('2️⃣  Usar pgAdmin online:');
      console.log('   - Ir a: https://pgadmin.io');
      console.log('   - Conectar con External URL\n');
      
      console.log('3️⃣  Usar herramienta de Render:');
      console.log('   - Acceder a tu dashboard de Render');
      console.log('   - Ir a tu BD PostgreSQL');
      console.log('   - Buscar opción de restaurar backup\n');
    }
    
    process.exit(1);
  }
  
  console.log('✅ Backup cargado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log('✓ BD: horarios_unt_4sr3');
  console.log('✓ Usuario: admin');
  console.log('✓ Host: Ohio (Render)\n');
  
  process.exit(0);
});
