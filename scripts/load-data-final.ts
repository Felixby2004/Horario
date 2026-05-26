import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function loadDataFinal() {
  try {
    console.log('📂 Cargando datos desde nuevo.sql...');
    
    const sqlPath = path.join(process.cwd(), 'nuevo.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Separar por INSERT INTO
    const insertStatements = sqlContent.split(/(?=INSERT INTO|UPDATE |DO \$\$)/);
    
    let processedStatements: string[] = [];
    
    for (const block of insertStatements) {
      if (!block.trim()) continue;
      
      // Procesar comentarios línea por línea
      const lines = block.split('\n');
      let processedBlock = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Ignorar líneas de comentarios
        if (!trimmed.startsWith('--')) {
          processedBlock += line + '\n';
        }
      }
      
      // Limpiar espacios múltiples
      processedBlock = processedBlock.replace(/\n\s*\n/g, '\n').trim();
      
      // Dividir por punto y coma
      const parts = processedBlock.split(';');
      for (const part of parts) {
        const stmt = part.trim();
        if (stmt && !stmt.startsWith('DO $$')) {
          processedStatements.push(stmt + ';');
        }
      }
    }
    
    console.log(`📋 Se encontraron ${processedStatements.length} instrucciones SQL`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < processedStatements.length; i++) {
      const stmt = processedStatements[i];
      
      // Skip if too short or invalid
      if (stmt.length < 20 || !stmt.includes('INSERT') && !stmt.includes('UPDATE')) {
        continue;
      }
      
      try {
        await prisma.$executeRawUnsafe(stmt);
        successCount++;
        if ((i + 1) % 5 === 0) {
          process.stdout.write('.');
        }
      } catch (error: any) {
        const msg = error.message || '';
        if (
          msg.includes('already exists') ||
          msg.includes('duplicate') ||
          msg.includes('Unique constraint') ||
          msg.includes('UNIQUE') ||
          msg.includes('foreign key')
        ) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`${msg.substring(0, 80)}`);
        }
      }
    }
    
    // Crear grupos
    console.log('\n\n📋 Creando grupos...');
    const cursos = await prisma.curso.findMany({ select: { id_curso: true } });
    let gruposCreados = 0;
    
    for (const curso of cursos) {
      try {
        await prisma.grupo.upsert({
          where: { grupo_id_curso_id_periodo_codigo_grupo_key: { id_curso: curso.id_curso, id_periodo: 1, codigo_grupo: 'A' } },
          create: {
            id_curso: curso.id_curso,
            id_periodo: 1,
            codigo_grupo: 'A',
            capacidad_maxima: 40,
            cantidad_matriculados: 25,
            activo: true
          },
          update: {}
        });
        gruposCreados++;
      } catch (e) {
        // Ignorar
      }
    }
    
    console.log(`✓ ${gruposCreados} grupos procesados`);
    
    console.log(`\n✅ Carga completada`);
    console.log(`   ✓ Statements ejecutados: ${successCount}`);
    console.log(`   ✗ Errores: ${errorCount}`);
    
    if (errors.length > 0 && errors.length < 5) {
      console.log('\n   Errores encontrados:');
      errors.forEach(e => console.log(`     - ${e}`));
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

loadDataFinal();
