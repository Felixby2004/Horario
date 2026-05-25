
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, 'datos-exportados');

async function importarDatos() {
  console.log('📦 Iniciando importación de datos...');

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Carpeta de datos no encontrada: ${DATA_DIR}`);
    process.exit(1);
  }

  try {
    console.log('⚠️  Eliminando datos existentes (orden inverso para evitar conflictos)...');
    
    await prisma.disponibilidadDocente.deleteMany();
    await prisma.restriccionInstitucional.deleteMany();
    await prisma.diaNoLaborable.deleteMany();
    await prisma.horarioAsignado.deleteMany();
    await prisma.ventanaAtencion.deleteMany();
    await prisma.cursoAmbiente.deleteMany();
    await prisma.docenteGrupo.deleteMany();
    await prisma.docenteCurso.deleteMany();
    await prisma.ambiente.deleteMany();
    await prisma.grupo.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.docente.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.periodoAcademico.deleteMany();

    console.log('✓ Datos existentes eliminados');

    console.log('\n1. Importando Periodos Académicos...');
    const periodosData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'periodos-academicos.json'), 'utf-8')
    );
    for (const periodo of periodosData) {
      await prisma.periodoAcademico.create({ data: periodo });
    }
    console.log(`✓ ${periodosData.length} periodos importados`);

    console.log('\n2. Importando Usuarios...');
    const usuariosData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'usuarios.json'), 'utf-8')
    );
    for (const usuario of usuariosData) {
      await prisma.usuario.create({ data: usuario });
    }
    console.log(`✓ ${usuariosData.length} usuarios importados`);

    console.log('\n3. Importando Docentes...');
    const docentesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'docentes.json'), 'utf-8')
    );
    for (const docente of docentesData) {
      await prisma.docente.create({ data: docente });
    }
    console.log(`✓ ${docentesData.length} docentes importados`);

    console.log('\n4. Importando Cursos...');
    const cursosData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'cursos.json'), 'utf-8')
    );
    for (const curso of cursosData) {
      await prisma.curso.create({ data: curso });
    }
    console.log(`✓ ${cursosData.length} cursos importados`);

    console.log('\n5. Importando Grupos...');
    const gruposData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'grupos.json'), 'utf-8')
    );
    for (const grupo of gruposData) {
      await prisma.grupo.create({ data: grupo });
    }
    console.log(`✓ ${gruposData.length} grupos importados`);

    console.log('\n6. Importando Ambientes...');
    const ambientesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'ambientes.json'), 'utf-8')
    );
    for (const ambiente of ambientesData) {
      await prisma.ambiente.create({ data: ambiente });
    }
    console.log(`✓ ${ambientesData.length} ambientes importados`);

    console.log('\n7. Importando DocenteCurso...');
    const docenteCursosData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'docente-cursos.json'), 'utf-8')
    );
    for (const dc of docenteCursosData) {
      await prisma.docenteCurso.create({ data: dc });
    }
    console.log(`✓ ${docenteCursosData.length} registros importados`);

    console.log('\n8. Importando DocenteGrupo...');
    const docenteGruposData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'docente-grupos.json'), 'utf-8')
    );
    for (const dg of docenteGruposData) {
      await prisma.docenteGrupo.create({ data: dg });
    }
    console.log(`✓ ${docenteGruposData.length} registros importados`);

    console.log('\n9. Importando CursoAmbiente...');
    const cursoAmbientesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'curso-ambientes.json'), 'utf-8')
    );
    for (const ca of cursoAmbientesData) {
      await prisma.cursoAmbiente.create({ data: ca });
    }
    console.log(`✓ ${cursoAmbientesData.length} registros importados`);

    console.log('\n10. Importando Ventanas de Atención...');
    const ventanasData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'ventanas-atencion.json'), 'utf-8')
    );
    for (const ventana of ventanasData) {
      await prisma.ventanaAtencion.create({ data: ventana });
    }
    console.log(`✓ ${ventanasData.length} ventanas importadas`);

    console.log('\n11. Importando Horarios Asignados...');
    const horariosData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'horarios-asignados.json'), 'utf-8')
    );
    for (const horario of horariosData) {
      await prisma.horarioAsignado.create({ data: horario });
    }
    console.log(`✓ ${horariosData.length} horarios importados`);

    console.log('\n12. Importando Días No Laborables...');
    const diasNoLaborablesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'dias-no-laborables.json'), 'utf-8')
    );
    for (const dia of diasNoLaborablesData) {
      await prisma.diaNoLaborable.create({ data: dia });
    }
    console.log(`✓ ${diasNoLaborablesData.length} días importados`);

    console.log('\n13. Importando Restricciones Institucionales...');
    const restriccionesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'restricciones-institucionales.json'), 'utf-8')
    );
    for (const restriccion of restriccionesData) {
      await prisma.restriccionInstitucional.create({ data: restriccion });
    }
    console.log(`✓ ${restriccionesData.length} restricciones importadas`);

    console.log('\n14. Importando Disponibilidad Docente...');
    const disponibilidadData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'disponibilidad-docente.json'), 'utf-8')
    );
    for (const disp of disponibilidadData) {
      await prisma.disponibilidadDocente.create({ data: disp });
    }
    console.log(`✓ ${disponibilidadData.length} registros importados`);

    console.log('\n✅ Importación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importarDatos();
