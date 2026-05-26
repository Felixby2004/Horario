import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanAndRestore() {
  try {
    console.log('🔌 Conectando a la base de datos...');

    console.log('🗑️  Eliminando esquema actual...');
    await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public');

    console.log('📥 Ejecutando nuevo esquema...');

    // Leer el archivo SQL limpio (sin comentarios)
    const sqlPath = path.join(process.cwd(), 'nuevo_clean.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Ejecutar el SQL completo como un único comando
    // Dividir solo por puntos y comas que NO estén dentro de bloques DO
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarQuoteDelim = '';

    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const remaining = sqlContent.substring(i);

      // Detectar inicio de dollar quote
      if (char === '$' && !inDollarQuote) {
        const match = remaining.match(/^\$([a-zA-Z_][a-zA-Z0-9_]*)?\$/);
        if (match) {
          inDollarQuote = true;
          dollarQuoteDelim = match[0];
          currentStatement += match[0];
          i += match[0].length - 1;
          continue;
        }
      }

      // Detectar fin de dollar quote
      if (
        inDollarQuote &&
        remaining.startsWith(dollarQuoteDelim)
      ) {
        inDollarQuote = false;
        currentStatement += dollarQuoteDelim;
        i += dollarQuoteDelim.length - 1;
        continue;
      }

      // Si encontramos ; y no estamos en dollar quote
      if (char === ';' && !inDollarQuote) {
        currentStatement += char;
        const trimmed = currentStatement.trim();

        if (trimmed.length > 0 && !trimmed.startsWith('--')) {
          try {
            await prisma.$executeRawUnsafe(trimmed);
          } catch (err: any) {
            // Ignorar errores de objetos duplicados
            if (
              !err.message.includes('already exists') &&
              !err.message.includes('duplicate')
            ) {
              console.error('Error en statement:');
              console.error(trimmed.substring(0, 300));
              throw err;
            }
          }
        }

        currentStatement = '';
        continue;
      }

      currentStatement += char;
    }

    console.log('✅ Base de datos limpiada y recreada exitosamente');
    console.log('📊 Esquema actualizado con éxito');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndRestore();
