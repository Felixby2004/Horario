
import { PrismaClient } from '../generated/prisma-client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed para el usuario Sanchez 123456...');

  // 1. Eliminar datos anteriores (para pruebas)
  console.log('🧹 Limpiando datos antiguos...');
  await prisma.actividadNoLectiva.deleteMany({});
  await prisma.cargaAcademica.deleteMany({});
  await prisma.historialCargaAcademica.deleteMany({});
  await prisma.docenteCurso.deleteMany({});
  await prisma.docente.deleteMany({ where: { codigo_docente: '123456' } });
  await prisma.usuario.deleteMany({ where: { codigo: '123456' } });

  // 2. Asegurar que existan facultad y departamento
  let facultad = await prisma.facultad.findFirst({ where: { codigo: 'FING' } });
  if (!facultad) {
    facultad = await prisma.facultad.create({
      data: {
        codigo: 'FING',
        nombre: 'Facultad de Ingeniería'
      }
    });
  }

  let departamento = await prisma.departamentoAcademico.findFirst({
    where: { codigo: 'INF' }
  });
  if (!departamento) {
    departamento = await prisma.departamentoAcademico.create({
      data: {
        codigo: 'INF',
        nombre: 'Departamento de Ingeniería de Sistemas',
        id_facultad: facultad.id_facultad
      }
    });
  }

  // 3. Obtener cualquier período académico existente
  let periodo = await prisma.periodoAcademico.findFirst({});
  if (!periodo) {
    periodo = await prisma.periodoAcademico.create({
      data: {
        codigo: '2024-I',
        nombre: 'Ciclo Académico 2024-I',
        anio: 2024,
        semestre: 1,
        fecha_inicio: new Date('2024-03-01'),
        fecha_fin: new Date('2024-07-15'),
        estado: 'planificacion'
      }
    });
  }

  // 4. Asegurar que existan cursos
  const cursosExistentes = await prisma.curso.findMany({ take: 3 });
  if (cursosExistentes.length === 0) {
    await prisma.curso.createMany({
      data: [
        {
          codigo: 'INFO-101',
          nombre: 'Introducción a la Programación',
          creditos: 4,
          horas_teoria: 3,
          horas_practica: 2,
          ciclo: 1
        },
        {
          codigo: 'INFO-102',
          nombre: 'Matemáticas Discretas',
          creditos: 3,
          horas_teoria: 2,
          horas_practica: 1,
          ciclo: 1
        },
        {
          codigo: 'INFO-201',
          nombre: 'Estructuras de Datos',
          creditos: 4,
          horas_teoria: 3,
          horas_practica: 2,
          ciclo: 2
        }
      ]
    });
  }

  // 5. Crear el usuario Sanchez
  const passwordHash = await bcrypt.hash('123456', 10);
  const usuario = await prisma.usuario.create({
    data: {
      codigo: '123456',
      nombres: 'Roberto',
      apellidos: 'Sanchez Ticona',
      correo_electronico: 'roberto.sanchez@unt.edu.pe',
      contrasena_hash: passwordHash,
      rol: 'docente'
    }
  });

  // 6. Crear el docente asociado
  const docente = await prisma.docente.create({
    data: {
      id_usuario: usuario.id_usuario,
      codigo_docente: '123456',
      nombres: 'Roberto',
      apellidos: 'Sanchez Ticona',
      modalidad: 'nombrado',
      categoria: 'principal',
      tipo_dedicacion_laboral: 'tiempo_completo',
      antiguedad: 10,
      id_facultad: facultad.id_facultad,
      id_departamento: departamento.id_departamento,
      escuela_profesional: 'Ingeniería de Sistemas'
    }
  });

  // 7. Crear Carga Académica para el periodo
  const carga = await prisma.cargaAcademica.create({
    data: {
      id_docente: docente.id_docente,
      id_periodo: periodo.id_periodo,
      estado: 'borrador',
      horas_lectivas: 0,
      horas_preparacion: 0,
      horas_no_lectivas: 0,
      horas_totales: 0
    }
  });

  // 8. Crear algunos DocenteCurso con horas
  const cursos = await prisma.curso.findMany({ take: 3 });
  if (cursos.length > 0) {
    await prisma.docenteCurso.create({
      data: {
        id_docente: docente.id_docente,
        id_curso: cursos[0].id_curso,
        tipo_clase: 'teoria',
        horas_asignadas: 6
      }
    });
    if (cursos.length > 1) {
      await prisma.docenteCurso.create({
        data: {
          id_docente: docente.id_docente,
          id_curso: cursos[1].id_curso,
          tipo_clase: 'teoria',
          horas_asignadas: 4
        }
      });
    }
  }

  // 9. Calcular horas iniciales usando la API logic
  const dc = await prisma.docenteCurso.findMany({
    where: { id_docente: docente.id_docente, activo: true }
  });
  const horasLectivas = dc.reduce((sum, item) => sum + (item.horas_asignadas || 0), 0);
  const horasPreparacion = Math.ceil(horasLectivas * 0.5);

  await prisma.cargaAcademica.update({
    where: { id_carga: carga.id_carga },
    data: {
      horas_lectivas: horasLectivas,
      horas_preparacion: horasPreparacion,
      horas_totales: horasLectivas + horasPreparacion
    }
  });

  console.log('✅ Datos creados exitosamente!');
  console.log('');
  console.log('📌 Credenciales de prueba:');
  console.log('   Usuario: 123456');
  console.log('   Contraseña: 123456');
  console.log('');
  console.log('👉 Accede a http://localhost:3000 y prueba el sistema!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

