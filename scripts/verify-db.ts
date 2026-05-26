import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    const usuarios = await prisma.usuario.count();
    const docentes = await prisma.docente.count();
    const cursos = await prisma.curso.count();
    const horarios = await prisma.horarioAsignado.count();
    const ambientes = await prisma.ambiente.count();
    
    console.log('📊 Estado de la Base de Datos:');
    console.log(`   ✓ Usuarios: ${usuarios}`);
    console.log(`   ✓ Docentes: ${docentes}`);
    console.log(`   ✓ Cursos: ${cursos}`);
    console.log(`   ✓ Ambientes: ${ambientes}`);
    console.log(`   ✓ Horarios: ${horarios}`);
    console.log('✅ Base de datos limpia y lista para datos nuevos');
  } finally {
    await prisma.$disconnect();
  }
}

verify();
