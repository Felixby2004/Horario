
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Verificando usuarios en la base de datos...');
  
  const usuarios = await prisma.usuario.findMany({
    orderBy: { id_usuario: 'asc' }
  });
  
  console.log('\n📋 Usuarios encontrados:');
  usuarios.forEach(u => {
    console.log(`  ID: ${u.id_usuario}, Código: ${u.codigo}, Nombre: ${u.nombres} ${u.apellidos}, Rol: ${u.rol}`);
  });
  
  // Generar hash para contraseña 'admin123'
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  console.log('\n🔑 Insertando usuario admin...');
  
  // Verificar si ya existe un admin
  const adminExiste = await prisma.usuario.findUnique({
    where: { codigo: 'admin' }
  });
  
  if (adminExiste) {
    console.log('⚠️  El usuario admin ya existe con ID:', adminExiste.id_usuario);
    return;
  }
  
  // Insertar admin con id 1
  const admin = await prisma.usuario.create({
    data: {
      id_usuario: 1,
      codigo: 'admin',
      nombres: 'Administrador',
      apellidos: 'Sistema',
      correo_electronico: 'admin@unitru.edu.pe',
      contrasena_hash: hashedPassword,
      rol: 'administrador_sistema',
      activo: true
    }
  });
  
  console.log('✅ Admin creado exitosamente!');
  console.log('  ID:', admin.id_usuario);
  console.log('  Código:', admin.codigo);
  console.log('  Nombre:', admin.nombres, admin.apellidos);
  console.log('  Rol:', admin.rol);
  console.log('\n🔐 Credenciales:');
  console.log('  Usuario: admin');
  console.log('  Contraseña: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

