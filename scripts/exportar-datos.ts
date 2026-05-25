
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, 'datos-exportados');

async function exportarDatos() {
  console.log('📦 Iniciando exportación de datos...');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`✓ Carpeta creada: ${DATA_DIR}`);
  }

  try {
    console.log('1. Exportando Periodos Académicos...');
    const periodos = await prisma.periodoAcademico.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'periodos-academicos.json'),
      JSON.stringify(periodos, null, 2)
    );

    console.log('2. Exportando Usuarios...');
    const usuarios = await prisma.usuario.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'usuarios.json'),
      JSON.stringify(usuarios, null, 2)
    );

    console.log('3. Exportando Docentes...');
    const docentes = await prisma.docente.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'docentes.json'),
      JSON.stringify(docentes, null, 2)
    );

    console.log('4. Exportando Cursos...');
    const cursos = await prisma.curso.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'cursos.json'),
      JSON.stringify(cursos, null, 2)
    );

    console.log('5. Exportando Grupos...');
    const grupos = await prisma.grupo.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'grupos.json'),
      JSON.stringify(grupos, null, 2)
    );

    console.log('6. Exportando Ambientes...');
    const ambientes = await prisma.ambiente.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'ambientes.json'),
      JSON.stringify(ambientes, null, 2)
    );

    console.log('7. Exportando DocenteCurso...');
    const docenteCursos = await prisma.docenteCurso.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'docente-cursos.json'),
      JSON.stringify(docenteCursos, null, 2)
    );

    console.log('8. Exportando DocenteGrupo...');
    const docenteGrupos = await prisma.docenteGrupo.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'docente-grupos.json'),
      JSON.stringify(docenteGrupos, null, 2)
    );

    console.log('9. Exportando CursoAmbiente...');
    const cursoAmbientes = await prisma.cursoAmbiente.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'curso-ambientes.json'),
      JSON.stringify(cursoAmbientes, null, 2)
    );

    console.log('10. Exportando Ventanas de Atención...');
    const ventanas = await prisma.ventanaAtencion.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'ventanas-atencion.json'),
      JSON.stringify(ventanas, null, 2)
    );

    console.log('11. Exportando Horarios Asignados...');
    const horarios = await prisma.horarioAsignado.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'horarios-asignados.json'),
      JSON.stringify(horarios, null, 2)
    );

    console.log('12. Exportando Días No Laborables...');
    const diasNoLaborables = await prisma.diaNoLaborable.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'dias-no-laborables.json'),
      JSON.stringify(diasNoLaborables, null, 2)
    );

    console.log('13. Exportando Restricciones Institucionales...');
    const restricciones = await prisma.restriccionInstitucional.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'restricciones-institucionales.json'),
      JSON.stringify(restricciones, null, 2)
    );

    console.log('14. Exportando Disponibilidad Docente...');
    const disponibilidad = await prisma.disponibilidadDocente.findMany();
    fs.writeFileSync(
      path.join(DATA_DIR, 'disponibilidad-docente.json'),
      JSON.stringify(disponibilidad, null, 2)
    );

    console.log('\n✅ Exportación completada exitosamente!');
    console.log(`📁 Datos guardados en: ${DATA_DIR}`);

  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportarDatos();
