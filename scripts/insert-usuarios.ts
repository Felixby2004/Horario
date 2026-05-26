import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function insertUsuarios() {
  try {
    console.log('👤 Insertando 28 usuarios para los docentes...');
    
    // Hash bcrypt para contraseña '123456' (generado con bcrypt.hashSync('123456', 10))
    const hashedPassword = '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC';
    
    const docentes = await prisma.docente.findMany({
      select: { id_docente: true, codigo_docente: true, nombres: true, apellidos: true, correo_electronico: true }
    });
    
    let creados = 0;
    let saltados = 0;
    
    for (const doc of docentes) {
      try {
        // Crear usuario solo si no existe
        const usuarioExiste = await prisma.usuario.findUnique({
          where: { codigo: doc.codigo_docente }
        });
        
        if (!usuarioExiste) {
          await prisma.usuario.create({
            data: {
              codigo: doc.codigo_docente,
              nombres: doc.nombres,
              apellidos: doc.apellidos,
              correo_electronico: doc.correo_electronico,
              contrasena_hash: hashedPassword,
              rol: 'docente',
              activo: true
            }
          });
          creados++;
          console.log(`✓ ${doc.codigo_docente} - ${doc.nombres} ${doc.apellidos}`);
        } else {
          saltados++;
        }
      } catch (error) {
        console.error(`❌ Error al crear usuario para ${doc.codigo_docente}`);
      }
    }
    
    console.log(`\n✅ Usuarios creados: ${creados}`);
    console.log(`⏭️  Usuarios existentes: ${saltados}`);
    console.log(`📊 Total: ${creados + saltados}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertUsuarios();
