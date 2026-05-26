import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creando tabla configuracion_sistema...');
  
  try {
    // Crear la tabla directamente si no existe
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "configuracion_sistema" (
        "id_configuracion" SERIAL NOT NULL,
        "bloques_horarios" INTEGER NOT NULL DEFAULT 10,
        "duracion_bloque" INTEGER NOT NULL DEFAULT 90,
        "hora_inicio" VARCHAR(5) NOT NULL DEFAULT '07:00',
        "hora_fin" VARCHAR(5) NOT NULL DEFAULT '22:00',
        "max_horas_docente" INTEGER NOT NULL DEFAULT 40,
        "min_horas_entre_clases" INTEGER NOT NULL DEFAULT 0,
        "permitir_clases_seguidas" BOOLEAN NOT NULL DEFAULT true,
        "validar_capacidad_ambiente" BOOLEAN NOT NULL DEFAULT true,
        "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id_configuracion")
      )
    `);

    // Insertar configuración por defecto si no existe
    const count = await prisma.$executeRawUnsafe(
      'SELECT COUNT(*) FROM "configuracion_sistema"'
    );
    
    if (count === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "configuracion_sistema" (
          "bloques_horarios", 
          "duracion_bloque",
          "hora_inicio",
          "hora_fin",
          "max_horas_docente",
          "permitir_clases_seguidas",
          "validar_capacidad_ambiente"
        ) VALUES (10, 90, '07:00', '22:00', 40, true, true)
      `);
      console.log('✅ Tabla creada y configuración por defecto insertada');
    } else {
      console.log('ℹ️  Tabla ya existe con datos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
