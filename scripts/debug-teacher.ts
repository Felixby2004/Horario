import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTeacherAndWindows() {
  try {
    console.log('--- Buscando Docente ---');
    const usuario = await prisma.usuario.findUnique({
      where: { correo_electronico: 'eq@gmail.com' },
      include: { docente: true }
    });

    if (!usuario) {
      console.log('Usuario no encontrado: eq@gmail.com');
    } else {
      console.log('Usuario:', JSON.stringify(usuario, null, 2));
      console.log('Docente:', JSON.stringify(usuario.docente, null, 2));
    }

    console.log('\n--- Buscando Período Activo ---');
    const periodoActivo = await prisma.periodoAcademico.findFirst({
      where: { activo: true }
    });
    console.log('Período Activo:', JSON.stringify(periodoActivo, null, 2));

    if (periodoActivo) {
      console.log('\n--- Buscando Ventanas para el Período Activo ---');
      const ventanas = await prisma.ventanaAtencion.findMany({
        where: { id_periodo: periodoActivo.id_periodo },
        orderBy: { orden_prioridad: 'asc' }
      });
      console.log('Ventanas:', JSON.stringify(ventanas, null, 2));
      
      const hoy = new Date();
      const hoyLima = new Date(hoy.toLocaleString("en-US", {timeZone: "America/Lima"}));
      const fechaHoy = hoyLima.toISOString().split('T')[0];
      console.log('\nFecha Hoy (Lima):', fechaHoy);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeacherAndWindows();
