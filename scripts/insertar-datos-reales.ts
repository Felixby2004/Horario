
import { PrismaClient, TipoAmbiente } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando inserción de datos reales...');

  // 1. Insertar período académico
  console.log('📅 Insertando período académico 2026-I...');
  const periodo = await prisma.periodoAcademico.create({
    data: {
      codigo: '2026-I',
      nombre: '2026-I',
      anio: 2026,
      semestre: 1,
      fecha_inicio: new Date('2026-04-13'),
      fecha_fin: new Date('2026-08-08'),
      fecha_inicio_clases: new Date('2026-04-13'),
      fecha_fin_clases: new Date('2026-08-08'),
      activo: true,
      estado: 'planificacion'
    }
  });
  console.log('✓ Período académico creado con ID:', periodo.id_periodo);

  // 2. Insertar ambientes
  console.log('🏢 Insertando ambientes...');
  const ambientesData = [
    { codigo: 'A-307', nombre: 'Posgrado A-307', tipo: 'aula' as TipoAmbiente, capacidad: 40, piso: '3', pabellon: 'A', equipamiento: 'Proyector, pizarra', activo: true },
    { codigo: 'A-303', nombre: 'Posgrado A-303', tipo: 'aula' as TipoAmbiente, capacidad: 35, piso: '3', pabellon: 'A', equipamiento: 'Proyector, pizarra', activo: true },
    { codigo: 'A-311', nombre: 'Posgrado A-311', tipo: 'aula' as TipoAmbiente, capacidad: 30, piso: '3', pabellon: 'A', equipamiento: 'Proyector, pizarra', activo: true },
    { codigo: 'A-301', nombre: 'Posgrado A-301', tipo: 'aula' as TipoAmbiente, capacidad: 30, piso: '3', pabellon: 'A', equipamiento: 'Proyector, pizarra', activo: true },
    { codigo: 'LAB1', nombre: 'Laboratorio 1', tipo: 'laboratorio' as TipoAmbiente, capacidad: 25, piso: '1', pabellon: 'B', equipamiento: 'Computadoras, software', activo: true },
    { codigo: 'LAB2', nombre: 'Laboratorio 2', tipo: 'laboratorio' as TipoAmbiente, capacidad: 25, piso: '1', pabellon: 'B', equipamiento: 'Computadoras, software', activo: true },
    { codigo: 'LAB3', nombre: 'Laboratorio 3', tipo: 'laboratorio' as TipoAmbiente, capacidad: 25, piso: '1', pabellon: 'B', equipamiento: 'Computadoras, software', activo: true },
    { codigo: 'LAB4', nombre: 'Laboratorio 4', tipo: 'laboratorio' as TipoAmbiente, capacidad: 25, piso: '1', pabellon: 'B', equipamiento: 'Computadoras, software', activo: true },
    { codigo: 'LAB_FISICA', nombre: 'Laboratorio de Física', tipo: 'laboratorio' as TipoAmbiente, capacidad: 20, piso: '1', pabellon: 'C', equipamiento: 'Equipos de física', activo: true },
    { codigo: 'AUDIOVISUALES', nombre: 'Aula Audiovisuales', tipo: 'auditorio' as TipoAmbiente, capacidad: 60, piso: '2', pabellon: 'C', equipamiento: 'Proyector, sonido', activo: true },
    { codigo: 'TALLER_CONF', nombre: 'Taller de Confecciones - Ing. Industrial', tipo: 'laboratorio' as TipoAmbiente, capacidad: 20, piso: '1', pabellon: 'D', equipamiento: 'Máquinas de coser', activo: true },
    { codigo: 'PAB_IND', nombre: 'Pabellón Ing. Industrial', tipo: 'aula' as TipoAmbiente, capacidad: 40, piso: '1', pabellon: 'Industrial', equipamiento: 'Pizarra', activo: true }
  ];
  const ambientes = await prisma.ambiente.createMany({
    data: ambientesData
  });
  console.log('✓ Ambientes creados:', ambientes.count);

  // Obtener ambientes con sus IDs
  const ambientesDB = await prisma.ambiente.findMany();
  const ambienteMap = new Map(ambientesDB.map(a => [a.codigo, a.id_ambiente]));

  // 3. Insertar docentes y usuarios
  console.log('👨‍🏫 Insertando docentes y usuarios...');
  
  // Generar hash para contraseña '123456'
  const hashedPassword = bcrypt.hashSync('123456', 10);

  const docentesData = [
    { codigo_docente: 'DOC001', nombres: 'Marcelino', apellidos: 'Torres Villanueva', modalidad: 'nombrado' as const, categoria: 'principal' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'mtorres@unitru.edu.pe', activo: true, codigo_usuario: 'torres' },
    { codigo_docente: 'DOC002', nombres: 'Alberto', apellidos: 'Mendoza de los Santos', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'amendoza@unitru.edu.pe', activo: true, codigo_usuario: 'mendoza' },
    { codigo_docente: 'DOC003', nombres: 'Paul', apellidos: 'Cotrina Castellanos', modalidad: 'contratado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'pcotrina@unitru.edu.pe', activo: true, codigo_usuario: 'cotrina' },
    { codigo_docente: 'DOC004', nombres: 'Bertha', apellidos: 'Urtecho Zavaleta', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'burtecho@unitru.edu.pe', activo: true, codigo_usuario: 'urtecho' },
    { codigo_docente: 'DOC005', nombres: 'Martha', apellidos: 'Cardoso', modalidad: 'nombrado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'mcardoso@unitru.edu.pe', activo: true, codigo_usuario: 'cardoso' },
    { codigo_docente: 'DOC006', nombres: 'Jose Luis', apellidos: 'Ponte Bejarano', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jponte@unitru.edu.pe', activo: true, codigo_usuario: 'ponte' },
    { codigo_docente: 'DOC007', nombres: 'Jorge Luis', apellidos: 'Rios Gonzales', modalidad: 'nombrado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jrios@unitru.edu.pe', activo: true, codigo_usuario: 'rios' },
    { codigo_docente: 'DOC008', nombres: 'Segundo', apellidos: 'Guibar Obeso', modalidad: 'nombrado' as const, categoria: 'principal' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'sguibar@unitru.edu.pe', activo: true, codigo_usuario: 'guibar' },
    { codigo_docente: 'DOC009', nombres: 'Zoraida', apellidos: 'Vidal Melgarejo', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'zvidal@unitru.edu.pe', activo: true, codigo_usuario: 'vidal' },
    { codigo_docente: 'DOC010', nombres: 'Everson David', apellidos: 'Agreda Gamboa', modalidad: 'nombrado' as const, categoria: 'principal' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'eagreda@unitru.edu.pe', activo: true, codigo_usuario: 'agreda' },
    { codigo_docente: 'DOC011', nombres: 'Juan Carlos', apellidos: 'Abando Roldán', modalidad: 'contratado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'jabando@unitru.edu.pe', activo: true, codigo_usuario: 'abando' },
    { codigo_docente: 'DOC012', nombres: 'Marcos', apellidos: 'Ferrer Reyna', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'mferrer@unitru.edu.pe', activo: true, codigo_usuario: 'ferrer' },
    { codigo_docente: 'DOC013', nombres: 'Teresita', apellidos: 'Rojas García', modalidad: 'nombrado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'trojas@unitru.edu.pe', activo: true, codigo_usuario: 'rojas' },
    { codigo_docente: 'DOC014', nombres: 'Juan', apellidos: 'Carrascal Cabanillas', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jcarrascal@unitru.edu.pe', activo: true, codigo_usuario: 'carrascal' },
    { codigo_docente: 'DOC015', nombres: 'Vilma', apellidos: 'Mendez Gil', modalidad: 'nombrado' as const, categoria: 'principal' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'vmendez@unitru.edu.pe', activo: true, codigo_usuario: 'mendez' },
    { codigo_docente: 'DOC016', nombres: 'Sheyla Laura', apellidos: 'Escobedo Rodríguez', modalidad: 'contratado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'sescobedo@unitru.edu.pe', activo: true, codigo_usuario: 'escobedo' },
    { codigo_docente: 'DOC017', nombres: 'Luis', apellidos: 'Boy Chavil', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'lboy@unitru.edu.pe', activo: true, codigo_usuario: 'boy' },
    { codigo_docente: 'DOC018', nombres: 'Juan Carlos', apellidos: 'Obando Roldan', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jcobando@unitru.edu.pe', activo: true, codigo_usuario: 'obando' },
    { codigo_docente: 'DOC019', nombres: 'Robert Jerry', apellidos: 'Sánchez Ticona', modalidad: 'contratado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'rsanchez@unitru.edu.pe', activo: true, codigo_usuario: 'sanchez' },
    { codigo_docente: 'DOC020', nombres: 'Cesar', apellidos: 'Arellano Salazar', modalidad: 'nombrado' as const, categoria: 'principal' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'carellano@unitru.edu.pe', activo: true, codigo_usuario: 'arellano' },
    { codigo_docente: 'DOC021', nombres: 'Camilo', apellidos: 'Suárez Rebaza', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'csuarez@unitru.edu.pe', activo: true, codigo_usuario: 'suarez' },
    { codigo_docente: 'DOC022', nombres: 'Marcos', apellidos: 'Baca Lopez', modalidad: 'nombrado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'mbaca@unitru.edu.pe', activo: true, codigo_usuario: 'baca' },
    { codigo_docente: 'DOC023', nombres: 'Ana', apellidos: 'Cuadra Mitzugary', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'acuadra@unitru.edu.pe', activo: true, codigo_usuario: 'cuadra' },
    { codigo_docente: 'DOC024', nombres: 'Juan Pedro', apellidos: 'Santos Fernández', modalidad: 'nombrado' as const, categoria: 'principal' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jsantos@unitru.edu.pe', activo: true, codigo_usuario: 'santos' },
    { codigo_docente: 'DOC025', nombres: 'Ricardo', apellidos: 'Mendoza Rivera', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'rmendoza@unitru.edu.pe', activo: true, codigo_usuario: 'mendoza_r' },
    { codigo_docente: 'DOC026', nombres: 'Oscar Romel', apellidos: 'Alcántara Moreno', modalidad: 'contratado' as const, categoria: 'auxiliar' as const, dedicacion: 'tiempo_parcial' as const, correo_electronico: 'oalcantara@unitru.edu.pe', activo: true, codigo_usuario: 'alcantara' },
    { codigo_docente: 'DOC027', nombres: 'Jhoe', apellidos: 'Gonzalez Vasquez', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jgonzalez@unitru.edu.pe', activo: true, codigo_usuario: 'gonzalez' },
    { codigo_docente: 'DOC028', nombres: 'José', apellidos: 'Gómez Ávila', modalidad: 'nombrado' as const, categoria: 'asociado' as const, dedicacion: 'tiempo_completo' as const, correo_electronico: 'jgomez@unitru.edu.pe', activo: true, codigo_usuario: 'gomez' }
  ];

  // Crear docentes y usuarios en transacción
  const docentesMap = new Map<string, number>();

  for (const docenteData of docentesData) {
    const docente = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const usuario = await tx.usuario.create({
        data: {
          codigo: docenteData.codigo_usuario,
          nombres: docenteData.nombres,
          apellidos: docenteData.apellidos,
          correo_electronico: docenteData.correo_electronico,
          contrasena_hash: hashedPassword,
          rol: 'docente',
          activo: docenteData.activo
        }
      });

      // Crear docente con relación a usuario
      const docente = await tx.docente.create({
        data: {
          codigo_docente: docenteData.codigo_docente,
          nombres: docenteData.nombres,
          apellidos: docenteData.apellidos,
          modalidad: docenteData.modalidad,
          categoria: docenteData.categoria,
          dedicacion: docenteData.dedicacion,
          correo_electronico: docenteData.correo_electronico,
          activo: docenteData.activo,
          id_usuario: usuario.id_usuario,
          perfil_completo: true
        }
      });

      return docente;
    });

    docentesMap.set(docenteData.codigo_docente, docente.id_docente);
    console.log(`✓ Docente ${docenteData.codigo_docente} - ${docenteData.nombres} ${docenteData.apellidos}`);
  }
  console.log('✓ Docentes y usuarios creados:', docentesData.length);

  // 4. Insertar cursos
  console.log('📚 Insertando cursos...');
  const cursosData = [
    // Ciclo I
    { codigo: 'IS101', nombre: 'Introducción a la Programación', horas_teoria: 2, horas_practica: 0, horas_laboratorio: 2, creditos: 4, ciclo: 1, activo: true },
    { codigo: 'IS102', nombre: 'Introducción a la Ingeniería de Sistemas', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 0, creditos: 3, ciclo: 1, activo: true },
    { codigo: 'MA103', nombre: 'Estadística General', horas_teoria: 0, horas_practica: 0, horas_laboratorio: 2, creditos: 2, ciclo: 1, activo: true },
    { codigo: 'HU104', nombre: 'Desarrollo Personal', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 0, creditos: 4, ciclo: 1, activo: true },
    { codigo: 'MA105', nombre: 'Desarrollo del Pensamiento Lógico Matemático', horas_teoria: 1, horas_practica: 4, horas_laboratorio: 0, creditos: 5, ciclo: 1, activo: true },
    { codigo: 'HU106', nombre: 'Lectura Crítica y Redacción de Textos Académicos', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 0, creditos: 4, ciclo: 1, activo: true },
    { codigo: 'MA107', nombre: 'Introducción al Análisis Matemático', horas_teoria: 2, horas_practica: 4, horas_laboratorio: 0, creditos: 6, ciclo: 1, activo: true },
    // Ciclo III
    { codigo: 'IS201', nombre: 'Programación Orientada a Objetos II', horas_teoria: 2, horas_practica: 0, horas_laboratorio: 4, creditos: 6, ciclo: 3, activo: true },
    { codigo: 'IS202', nombre: 'Sistemática', horas_teoria: 2, horas_practica: 1, horas_laboratorio: 2, creditos: 5, ciclo: 3, activo: true },
    { codigo: 'IS203', nombre: 'Ingeniería Gráfica', horas_teoria: 1, horas_practica: 1, horas_laboratorio: 2, creditos: 4, ciclo: 3, activo: true },
    { codigo: 'MA204', nombre: 'Matemática Aplicada', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 3, activo: true },
    { codigo: 'MA205', nombre: 'Estadística Aplicada', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 3, activo: true },
    { codigo: 'AD206', nombre: 'Administración General', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 0, creditos: 4, ciclo: 3, activo: true },
    { codigo: 'FS207', nombre: 'Física Electrónica', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 3, activo: true },
    { codigo: 'PS208', nombre: 'Psicología Organizacional', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 2, creditos: 6, ciclo: 3, activo: true },
    // Ciclo VII
    { codigo: 'IS301', nombre: 'Ingeniería de Datos I', horas_teoria: 2, horas_practica: 1, horas_laboratorio: 3, creditos: 6, ciclo: 7, activo: true },
    { codigo: 'IS302', nombre: 'Sistemas de Información', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 2, creditos: 6, ciclo: 7, activo: true },
    { codigo: 'IS303', nombre: 'Transformación Digital', horas_teoria: 2, horas_practica: 0, horas_laboratorio: 2, creditos: 4, ciclo: 7, activo: true },
    { codigo: 'IS304', nombre: 'Tecnología Web', horas_teoria: 1, horas_practica: 1, horas_laboratorio: 2, creditos: 4, ciclo: 7, activo: true },
    { codigo: 'IS305', nombre: 'Arquitectura de Computadoras', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 7, activo: true },
    { codigo: 'IS306', nombre: 'Teleinformática', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 7, activo: true },
    { codigo: 'II307', nombre: 'Investigación de Operaciones', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 7, activo: true },
    { codigo: 'CF308', nombre: 'Contabilidad Gerencial', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 7, activo: true },
    // Ciclo IX
    { codigo: 'IS401', nombre: 'Ingeniería de Software I', horas_teoria: 2, horas_practica: 1, horas_laboratorio: 3, creditos: 6, ciclo: 9, activo: true },
    { codigo: 'IS402', nombre: 'Redes y Comunicaciones I', horas_teoria: 1, horas_practica: 1, horas_laboratorio: 3, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS403', nombre: 'Negocios Electrónicos', horas_teoria: 2, horas_practica: 0, horas_laboratorio: 0, creditos: 2, ciclo: 9, activo: true },
    { codigo: 'IS404', nombre: 'Gestión de Servicios de TI', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS405', nombre: 'Administración de Base de Datos', horas_teoria: 1, horas_practica: 1, horas_laboratorio: 3, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS406', nombre: 'Cadena de Suministros', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 0, creditos: 4, ciclo: 9, activo: true },
    { codigo: 'IS407', nombre: 'Tesis I', horas_teoria: 1, horas_practica: 1, horas_laboratorio: 3, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS408', nombre: 'Hackeo Ético', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS409', nombre: 'Auditoría Informática', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS410', nombre: 'Gestión de Proyectos de TI', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS411', nombre: 'Emprendimiento Tecnológico', horas_teoria: 2, horas_practica: 0, horas_laboratorio: 2, creditos: 4, ciclo: 9, activo: true },
    { codigo: 'IS412', nombre: 'Ingeniería Web', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 2, creditos: 6, ciclo: 9, activo: true },
    { codigo: 'IS413', nombre: 'Computación en la Nube', horas_teoria: 2, horas_practica: 2, horas_laboratorio: 2, creditos: 6, ciclo: 9, activo: true },
    { codigo: 'IS414', nombre: 'Analítica de Negocios', horas_teoria: 1, horas_practica: 2, horas_laboratorio: 2, creditos: 5, ciclo: 9, activo: true },
    { codigo: 'IS415', nombre: 'Metodología de la Investigación Científica', horas_teoria: 2, horas_practica: 0, horas_laboratorio: 2, creditos: 4, ciclo: 9, activo: true }
  ];
  const cursos = await prisma.curso.createMany({ data: cursosData });
  console.log('✓ Cursos creados:', cursos.count);
  const cursosDB = await prisma.curso.findMany();
  const cursoMap = new Map(cursosDB.map(c => [c.codigo, c.id_curso]));

  // 5. Insertar grupos
  console.log('👥 Insertando grupos...');
  const gruposData = cursosDB.map(curso => ({
    id_curso: curso.id_curso,
    id_periodo: periodo.id_periodo,
    codigo_grupo: 'A',
    capacidad_maxima: 40,
    cantidad_matriculados: 25,
    activo: true
  }));
  const grupos = await prisma.grupo.createMany({ data: gruposData });
  console.log('✓ Grupos creados:', grupos.count);
  const gruposDB = await prisma.grupo.findMany();
  const grupoMap = new Map(gruposDB.map(g => [g.id_curso, g.id_grupo]));

  // 6. Insertar docente_curso
  console.log('👨‍🏫📚 Insertando relaciones docente-curso...');
  const docenteCursoData = [
    { docente_codigo: 'DOC001', curso_codigo: 'IS101', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC003', curso_codigo: 'IS101', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC002', curso_codigo: 'IS102', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC005', curso_codigo: 'MA103', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC004', curso_codigo: 'HU104', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC006', curso_codigo: 'MA105', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC007', curso_codigo: 'HU106', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC008', curso_codigo: 'MA107', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC009', curso_codigo: 'IS201', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC009', curso_codigo: 'IS201', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC010', curso_codigo: 'IS202', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC010', curso_codigo: 'IS202', tipo_clase: 'practica' as const, prioridad: 1 },
    { docente_codigo: 'DOC011', curso_codigo: 'IS203', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC011', curso_codigo: 'IS203', tipo_clase: 'practica' as const, prioridad: 1 },
    { docente_codigo: 'DOC012', curso_codigo: 'MA204', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC013', curso_codigo: 'MA205', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC014', curso_codigo: 'AD206', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC015', curso_codigo: 'FS207', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC016', curso_codigo: 'PS208', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC017', curso_codigo: 'IS301', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC017', curso_codigo: 'IS301', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC018', curso_codigo: 'IS302', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC010', curso_codigo: 'IS303', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC019', curso_codigo: 'IS304', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC019', curso_codigo: 'IS304', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC020', curso_codigo: 'IS305', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC021', curso_codigo: 'IS306', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC022', curso_codigo: 'II307', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC023', curso_codigo: 'CF308', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC024', curso_codigo: 'IS401', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC024', curso_codigo: 'IS401', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC020', curso_codigo: 'IS402', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC026', curso_codigo: 'IS403', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC025', curso_codigo: 'IS404', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC027', curso_codigo: 'IS405', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC027', curso_codigo: 'IS405', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC010', curso_codigo: 'IS406', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC024', curso_codigo: 'IS407', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC024', curso_codigo: 'IS407', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC021', curso_codigo: 'IS408', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC026', curso_codigo: 'IS409', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC025', curso_codigo: 'IS410', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC028', curso_codigo: 'IS411', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC002', curso_codigo: 'IS412', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC002', curso_codigo: 'IS412', tipo_clase: 'laboratorio' as const, prioridad: 1 },
    { docente_codigo: 'DOC028', curso_codigo: 'IS413', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC025', curso_codigo: 'IS414', tipo_clase: 'teoria' as const, prioridad: 1 },
    { docente_codigo: 'DOC003', curso_codigo: 'IS415', tipo_clase: 'teoria' as const, prioridad: 1 }
  ];
  const docenteCursoDB = docenteCursoData.map(d => ({
    id_docente: docentesMap.get(d.docente_codigo)!,
    id_curso: cursoMap.get(d.curso_codigo)!,
    tipo_clase: d.tipo_clase,
    prioridad: d.prioridad,
    activo: true
  }));
  const docenteCurso = await prisma.docenteCurso.createMany({ data: docenteCursoDB });
  console.log('✓ Relaciones docente-curso creadas:', docenteCurso.count);

  // 7. Insertar curso_ambiente
  console.log('📚🏢 Insertando relaciones curso-ambiente...');
  const cursoAmbienteData = [
    { curso_codigo: 'IS101', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS101', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS102', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'MA103', ambiente_codigo: 'LAB3', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'HU104', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'MA105', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'HU106', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'MA107', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS201', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS201', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS202', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS202', ambiente_codigo: 'LAB2', tipo_clase: 'practica' as const },
    { curso_codigo: 'IS203', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS203', ambiente_codigo: 'LAB1', tipo_clase: 'practica' as const },
    { curso_codigo: 'MA204', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'MA205', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'AD206', ambiente_codigo: 'PAB_IND', tipo_clase: 'teoria' as const },
    { curso_codigo: 'FS207', ambiente_codigo: 'LAB_FISICA', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'PS208', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS301', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS301', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS302', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS303', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS304', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS304', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS305', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS306', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'II307', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'CF308', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS401', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS401', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS402', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS403', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS404', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS404', ambiente_codigo: 'LAB2', tipo_clase: 'practica' as const },
    { curso_codigo: 'IS405', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS405', ambiente_codigo: 'LAB3', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS406', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS407', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS407', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS408', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS408', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS409', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS409', ambiente_codigo: 'LAB3', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS410', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS411', ambiente_codigo: 'A-301', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS411', ambiente_codigo: 'LAB2', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS412', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS412', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS413', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS413', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const },
    { curso_codigo: 'IS414', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const },
    { curso_codigo: 'IS415', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const }
  ];
  const cursoAmbienteDB = cursoAmbienteData.map(c => ({
    id_curso: cursoMap.get(c.curso_codigo)!,
    id_ambiente: ambienteMap.get(c.ambiente_codigo)!,
    tipo_clase: c.tipo_clase
  }));
  const cursoAmbiente = await prisma.cursoAmbiente.createMany({ data: cursoAmbienteDB });
  console.log('✓ Relaciones curso-ambiente creadas:', cursoAmbiente.count);

  // 8. Insertar horarios asignados
  console.log('⏰ Insertando horarios asignados...');
  const horariosData = [
    { docente_codigo: 'DOC001', curso_codigo: 'IS101', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC002', curso_codigo: 'IS102', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '09:00', hora_fin: '10:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC003', curso_codigo: 'IS101', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 1, hora_inicio: '10:00', hora_fin: '12:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC004', curso_codigo: 'HU104', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '12:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC005', curso_codigo: 'MA103', ambiente_codigo: 'LAB3', tipo_clase: 'laboratorio' as const, dia_semana: 2, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC006', curso_codigo: 'MA105', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '09:00', hora_fin: '10:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC007', curso_codigo: 'HU106', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '10:00', hora_fin: '12:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC008', curso_codigo: 'MA107', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '12:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC001', curso_codigo: 'IS101', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC002', curso_codigo: 'IS102', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC003', curso_codigo: 'IS101', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 3, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC004', curso_codigo: 'HU104', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC005', curso_codigo: 'MA103', ambiente_codigo: 'LAB3', tipo_clase: 'laboratorio' as const, dia_semana: 4, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC006', curso_codigo: 'MA105', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC007', curso_codigo: 'HU106', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC008', curso_codigo: 'MA107', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC001', curso_codigo: 'IS101', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC002', curso_codigo: 'IS102', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 6, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC009', curso_codigo: 'IS201', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC010', curso_codigo: 'IS202', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC011', curso_codigo: 'IS203', ambiente_codigo: 'PAB_IND', tipo_clase: 'practica' as const, dia_semana: 1, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC012', curso_codigo: 'MA204', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '13:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC013', curso_codigo: 'MA205', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC014', curso_codigo: 'AD206', ambiente_codigo: 'PAB_IND', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC015', curso_codigo: 'FS207', ambiente_codigo: 'LAB_FISICA', tipo_clase: 'laboratorio' as const, dia_semana: 2, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC016', curso_codigo: 'PS208', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC009', curso_codigo: 'IS201', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 3, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC010', curso_codigo: 'IS202', ambiente_codigo: 'LAB2', tipo_clase: 'practica' as const, dia_semana: 3, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC011', curso_codigo: 'IS203', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '11:00', hora_fin: '12:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC012', curso_codigo: 'MA204', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '12:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC013', curso_codigo: 'MA205', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC014', curso_codigo: 'AD206', ambiente_codigo: 'PAB_IND', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC015', curso_codigo: 'FS207', ambiente_codigo: 'LAB_FISICA', tipo_clase: 'laboratorio' as const, dia_semana: 4, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC016', curso_codigo: 'PS208', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC009', curso_codigo: 'IS201', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC010', curso_codigo: 'IS202', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC011', curso_codigo: 'IS203', ambiente_codigo: 'PAB_IND', tipo_clase: 'practica' as const, dia_semana: 5, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC012', curso_codigo: 'MA204', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '13:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC017', curso_codigo: 'IS301', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC018', curso_codigo: 'IS302', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC019', curso_codigo: 'IS304', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const, dia_semana: 1, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC020', curso_codigo: 'IS305', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '13:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC021', curso_codigo: 'IS306', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC022', curso_codigo: 'II307', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC023', curso_codigo: 'CF308', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC017', curso_codigo: 'IS301', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 2, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC018', curso_codigo: 'IS302', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC019', curso_codigo: 'IS304', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC020', curso_codigo: 'IS305', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '11:00', hora_fin: '12:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC021', curso_codigo: 'IS306', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '12:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC022', curso_codigo: 'II307', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC023', curso_codigo: 'CF308', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC017', curso_codigo: 'IS301', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC018', curso_codigo: 'IS302', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC019', curso_codigo: 'IS304', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const, dia_semana: 5, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC020', curso_codigo: 'IS305', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC021', curso_codigo: 'IS306', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC022', curso_codigo: 'II307', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 5, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC024', curso_codigo: 'IS401', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC020', curso_codigo: 'IS402', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC026', curso_codigo: 'IS403', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '11:00', hora_fin: '12:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC025', curso_codigo: 'IS404', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 1, hora_inicio: '12:00', hora_fin: '14:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC027', curso_codigo: 'IS405', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC010', curso_codigo: 'IS406', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC024', curso_codigo: 'IS407', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC021', curso_codigo: 'IS408', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 2, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC026', curso_codigo: 'IS409', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC025', curso_codigo: 'IS410', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC028', curso_codigo: 'IS411', ambiente_codigo: 'A-301', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC002', curso_codigo: 'IS412', ambiente_codigo: 'A-303', tipo_clase: 'teoria' as const, dia_semana: 3, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC028', curso_codigo: 'IS413', ambiente_codigo: 'A-311', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC025', curso_codigo: 'IS414', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC003', curso_codigo: 'IS415', ambiente_codigo: 'A-307', tipo_clase: 'teoria' as const, dia_semana: 4, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC024', curso_codigo: 'IS401', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 4, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC027', curso_codigo: 'IS405', ambiente_codigo: 'LAB3', tipo_clase: 'laboratorio' as const, dia_semana: 5, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC002', curso_codigo: 'IS412', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 5, hora_inicio: '09:00', hora_fin: '11:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC028', curso_codigo: 'IS413', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const, dia_semana: 5, hora_inicio: '11:00', hora_fin: '13:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC021', curso_codigo: 'IS408', ambiente_codigo: 'LAB1', tipo_clase: 'laboratorio' as const, dia_semana: 5, hora_inicio: '13:00', hora_fin: '15:00', estado: 'publicado' as const },
    { docente_codigo: 'DOC024', curso_codigo: 'IS407', ambiente_codigo: 'LAB4', tipo_clase: 'laboratorio' as const, dia_semana: 6, hora_inicio: '07:00', hora_fin: '09:00', estado: 'publicado' as const }
  ];

  const horariosDB = horariosData.map(h => ({
    id_docente: docentesMap.get(h.docente_codigo)!,
    id_curso: cursoMap.get(h.curso_codigo)!,
    id_grupo: grupoMap.get(cursoMap.get(h.curso_codigo)!)!,
    id_ambiente: ambienteMap.get(h.ambiente_codigo)!,
    tipo_clase: h.tipo_clase,
    dia_semana: h.dia_semana,
    hora_inicio: h.hora_inicio,
    hora_fin: h.hora_fin,
    id_periodo: periodo.id_periodo,
    estado: h.estado
  }));

  const horarios = await prisma.horarioAsignado.createMany({ data: horariosDB });
  console.log('✓ Horarios asignados creados:', horarios.count);

  console.log('\n✅ Inserción de datos completada exitosamente! 🎉');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la inserción:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

