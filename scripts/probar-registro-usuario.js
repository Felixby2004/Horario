const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const marca = Date.now();

  const usuario = await prisma.usuario.create({
    data: {
      codigo: `TMP-${marca}`,
      nombres: 'Tmp',
      apellidos: 'User',
      correo_electronico: `tmp-${marca}@example.com`,
      contrasena_hash: await bcrypt.hash('123456', 10),
      rol: 'docente',
      activo: true,
    },
  });

  await prisma.usuario.delete({
    where: { id_usuario: usuario.id_usuario },
  });

  console.log(`Registro temporal OK: ${usuario.id_usuario}`);
}

main()
  .catch(async (error) => {
    console.error('Error en validación de registro:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });