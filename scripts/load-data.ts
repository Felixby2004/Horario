import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function loadData() {
  try {
    console.log('📂 Cargando datos desde nuevo.sql...');
    
    // Leer el archivo SQL con los datos
    const sqlPath = path.join(process.cwd(), 'nuevo.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Dividir por líneas y filtrar comentarios puros
    const lines = sqlContent.split('\n');
    let processedContent = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Ignorar líneas vacías y comentarios puros (que comienzan con --)
      if (trimmed && !trimmed.startsWith('--')) {
        processedContent += line + '\n';
      }
    }
    
    // Dividir por puntos y coma, respetando bloques DO $$ ... $$
    const statements: string[] = [];
    let current = '';
    let inDollarQuote = false;
    
    for (let i = 0; i < processedContent.length; i++) {
      const char = processedContent[i];
      const nextChars = processedContent.substring(i, i + 2);
      
      // Detectar inicio/fin de dollar-quoted strings
      if (nextChars === '$$') {
        inDollarQuote = !inDollarQuote;
        current += char;
        i++; // Skip next $
        continue;
      }
      
      // Si encontramos ; fuera de un bloque dollar-quote, es fin de statement
      if (char === ';' && !inDollarQuote) {
        current += char;
        const statement = current.trim();
        if (statement) {
          statements.push(statement);
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    // Agregar último statement si existe
    if (current.trim()) {
      statements.push(current.trim());
    }
    
    console.log(`📋 Se encontraron ${statements.length} instrucciones SQL`);
    
    // Ejecutar cada statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await prisma.$executeRawUnsafe(stmt);
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`✓ Procesados ${i + 1}/${statements.length} statements`);
        }
      } catch (error: any) {
        // Ignorar errores de duplicados y restricciones
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('foreign key') ||
          error.message.includes('no fue generado')
        ) {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Error en statement ${i + 1}: ${error.message}`);
          console.error(`Statement: ${stmt.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\n✅ Datos cargados exitosamente`);
    console.log(`   - Statements procesados: ${successCount}/${statements.length}`);
    console.log(`   - Errores ignorados: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

loadData();
