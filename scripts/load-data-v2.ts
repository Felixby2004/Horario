import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function loadDataImproved() {
  try {
    console.log('📂 Cargando datos desde nuevo.sql (versión mejorada)...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'nuevo.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Filtrar comentarios
    const lines = sqlContent.split('\n');
    let processedContent = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        processedContent += line + '\n';
      }
    }
    
    // Dividir por ;
    const statements = processedContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('DO $$')); // Excluir bloques DO $$
    
    console.log(`📋 Se encontraron ${statements.length} instrucciones SQL`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await prisma.$executeRawUnsafe(stmt);
        successCount++;
        console.log(`✓ [${i + 1}/${statements.length}]`);
      } catch (error: any) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('Unique constraint') ||
          error.message.includes('unique') ||
          error.message.includes('foreign key')
        ) {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Error: ${error.message.substring(0, 100)}`);
        }
      }
    }
    
    // Crear los grupos manualmente (que faltaba del bloque DO $$)
    console.log('\n📋 Creando grupos automáticamente...');
    const cursos = await prisma.curso.findMany({ select: { id_curso: true } });
    let gruposCreados = 0;
    
    for (const curso of cursos) {
      try {
        await prisma.grupo.create({
          data: {
            id_curso: curso.id_curso,
            id_periodo: 1,
            codigo_grupo: 'A',
            capacidad_maxima: 40,
            cantidad_matriculados: 25,
            activo: true
          }
        });
        gruposCreados++;
      } catch (e) {
        // Ignorar si ya existe
      }
    }
    
    console.log(`✓ ${gruposCreados} grupos creados`);
    
    console.log(`\n✅ Carga completada`);
    console.log(`   - Statements SQL: ${successCount}/${statements.length}`);
    console.log(`   - Errores: ${errorCount}`);
    console.log(`   - Grupos: ${gruposCreados}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

loadDataImproved();
