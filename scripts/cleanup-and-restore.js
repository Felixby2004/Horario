const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Leer el archivo nuevo.sql
const sqlPath = path.join(__dirname, 'nuevo.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// URL de conexión
const dbUrl = 'postgresql://postgres:123456@localhost:5432/horarios_unt?schema=public';

// Crear un script SQL que primero borre todo y luego ejecute el nuevo
const cleanAndRestoreSql = `
-- Eliminar todas las tablas y tipos
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Importar el nuevo esquema
${sqlContent}
`;

// Guardar en archivo temporal
const tempSqlPath = path.join(__dirname, 'temp_execute.sql');
fs.writeFileSync(tempSqlPath, cleanAndRestoreSql, 'utf-8');

console.log('✓ Archivo temporal creado');
console.log('Ejecutando SQL...');

// Usar pg_restore o psql directamente
const pgCommand = `psql "${dbUrl}" -f "${tempSqlPath}"`;

exec(pgCommand, (error, stdout, stderr) => {
  // Limpiar archivo temporal
  fs.unlinkSync(tempSqlPath);
  
  if (error) {
    console.error('❌ Error:', error.message);
    if (stderr) console.error('STDERR:', stderr);
    process.exit(1);
  }
  
  console.log('✅ Base de datos limpiada y recreada exitosamente');
  console.log(stdout);
  process.exit(0);
});
