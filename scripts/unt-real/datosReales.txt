-- =================================================================
-- SCRIPT COMPLETO PARA SISTEMA DE GESTIÓN DE HORARIOS
-- BASADO EN EL PDF "Horarios x ciclos 2026-I 15 abril 2026.pdf"
-- =================================================================

-- 1. PERIODO ACADÉMICO
INSERT INTO periodo_academico (id_periodo, codigo, nombre, anio, semestre, fecha_inicio, fecha_fin, fecha_inicio_clases, fecha_fin_clases, activo, estado) VALUES
(1, '2026-I', '2026-I', 2026, 1, '2026-04-13', '2026-08-08', '2026-04-13', '2026-08-08', true, 'planificacion');

-- 2. AMBIENTES (aulas y laboratorios extraídos del PDF)
INSERT INTO ambiente (id_ambiente, codigo, nombre, tipo, capacidad, piso, pabellon, equipamiento, activo) VALUES
(1, 'A-307', 'Posgrado A-307', 'aula', 40, '3', 'A', 'Proyector, pizarra', true),
(2, 'A-303', 'Posgrado A-303', 'aula', 35, '3', 'A', 'Proyector, pizarra', true),
(3, 'A-311', 'Posgrado A-311', 'aula', 30, '3', 'A', 'Proyector, pizarra', true),
(4, 'A-301', 'Posgrado A-301', 'aula', 30, '3', 'A', 'Proyector, pizarra', true),
(5, 'LAB1', 'Laboratorio 1', 'laboratorio', 25, '1', 'B', 'Computadoras, software', true),
(6, 'LAB2', 'Laboratorio 2', 'laboratorio', 25, '1', 'B', 'Computadoras, software', true),
(7, 'LAB3', 'Laboratorio 3', 'laboratorio', 25, '1', 'B', 'Computadoras, software', true),
(8, 'LAB4', 'Laboratorio 4', 'laboratorio', 25, '1', 'B', 'Computadoras, software', true),
(9, 'LAB_FISICA', 'Laboratorio de Física', 'laboratorio', 20, '1', 'C', 'Equipos de física', true),
(10, 'AUDIOVISUALES', 'Aula Audiovisuales', 'auditorio', 60, '2', 'C', 'Proyector, sonido', true),
(11, 'TALLER_CONF', 'Taller de Confecciones - Ing. Industrial', 'laboratorio', 20, '1', 'D', 'Máquinas de coser', true),
(12, 'PAB_IND', 'Pabellón Ing. Industrial', 'aula', 40, '1', 'Industrial', 'Pizarra', true);

-- 3. DOCENTES (todos los profesores de los ciclos I, III, VII, IX)
INSERT INTO docente (id_docente, codigo_docente, nombres, apellidos, modalidad, categoria, dedicacion, correo_electronico, activo) VALUES
(1, 'DOC001', 'Marcelino', 'Torres Villanueva', 'nombrado', 'principal', 'tiempo_completo', 'mtorres@unitru.edu.pe', true),
(2, 'DOC002', 'Alberto', 'Mendoza de los Santos', 'nombrado', 'asociado', 'tiempo_completo', 'amendoza@unitru.edu.pe', true),
(3, 'DOC003', 'Paul', 'Cotrina Castellanos', 'contratado', 'auxiliar', 'tiempo_parcial', 'pcotrina@unitru.edu.pe', true),
(4, 'DOC004', 'Bertha', 'Urtecho Zavaleta', 'nombrado', 'asociado', 'tiempo_completo', 'burtecho@unitru.edu.pe', true),
(5, 'DOC005', 'Martha', 'Cardoso', 'nombrado', 'auxiliar', 'tiempo_parcial', 'mcardoso@unitru.edu.pe', true),
(6, 'DOC006', 'Jose Luis', 'Ponte Bejarano', 'nombrado', 'asociado', 'tiempo_completo', 'jponte@unitru.edu.pe', true),
(7, 'DOC007', 'Jorge Luis', 'Rios Gonzales', 'nombrado', 'auxiliar', 'tiempo_completo', 'jrios@unitru.edu.pe', true),
(8, 'DOC008', 'Segundo', 'Guibar Obeso', 'nombrado', 'principal', 'tiempo_completo', 'sguibar@unitru.edu.pe', true),
(9, 'DOC009', 'Zoraida', 'Vidal Melgarejo', 'nombrado', 'asociado', 'tiempo_completo', 'zvidal@unitru.edu.pe', true),
(10, 'DOC010', 'Everson David', 'Agreda Gamboa', 'nombrado', 'principal', 'tiempo_completo', 'eagreda@unitru.edu.pe', true),
(11, 'DOC011', 'Juan Carlos', 'Abando Roldán', 'contratado', 'auxiliar', 'tiempo_parcial', 'jabando@unitru.edu.pe', true),
(12, 'DOC012', 'Marcos', 'Ferrer Reyna', 'nombrado', 'asociado', 'tiempo_completo', 'mferrer@unitru.edu.pe', true),
(13, 'DOC013', 'Teresita', 'Rojas García', 'nombrado', 'auxiliar', 'tiempo_parcial', 'trojas@unitru.edu.pe', true),
(14, 'DOC014', 'Juan', 'Carrascal Cabanillas', 'nombrado', 'asociado', 'tiempo_completo', 'jcarrascal@unitru.edu.pe', true),
(15, 'DOC015', 'Vilma', 'Mendez Gil', 'nombrado', 'principal', 'tiempo_completo', 'vmendez@unitru.edu.pe', true),
(16, 'DOC016', 'Sheyla Laura', 'Escobedo Rodríguez', 'contratado', 'auxiliar', 'tiempo_parcial', 'sescobedo@unitru.edu.pe', true),
(17, 'DOC017', 'Luis', 'Boy Chavil', 'nombrado', 'asociado', 'tiempo_completo', 'lboy@unitru.edu.pe', true),
(18, 'DOC018', 'Juan Carlos', 'Obando Roldan', 'nombrado', 'asociado', 'tiempo_completo', 'jcobando@unitru.edu.pe', true),
(19, 'DOC019', 'Robert Jerry', 'Sánchez Ticona', 'contratado', 'auxiliar', 'tiempo_parcial', 'rsanchez@unitru.edu.pe', true),
(20, 'DOC020', 'Cesar', 'Arellano Salazar', 'nombrado', 'principal', 'tiempo_completo', 'carellano@unitru.edu.pe', true),
(21, 'DOC021', 'Camilo', 'Suárez Rebaza', 'nombrado', 'asociado', 'tiempo_completo', 'csuarez@unitru.edu.pe', true),
(22, 'DOC022', 'Marcos', 'Baca Lopez', 'nombrado', 'auxiliar', 'tiempo_parcial', 'mbaca@unitru.edu.pe', true),
(23, 'DOC023', 'Ana', 'Cuadra Mitzugary', 'nombrado', 'asociado', 'tiempo_completo', 'acuadra@unitru.edu.pe', true),
(24, 'DOC024', 'Juan Pedro', 'Santos Fernández', 'nombrado', 'principal', 'tiempo_completo', 'jsantos@unitru.edu.pe', true),
(25, 'DOC025', 'Ricardo', 'Mendoza Rivera', 'nombrado', 'asociado', 'tiempo_completo', 'rmendoza@unitru.edu.pe', true),
(26, 'DOC026', 'Oscar Romel', 'Alcántara Moreno', 'contratado', 'auxiliar', 'tiempo_parcial', 'oalcantara@unitru.edu.pe', true),
(27, 'DOC027', 'Jhoe', 'Gonzalez Vasquez', 'nombrado', 'asociado', 'tiempo_completo', 'jgonzalez@unitru.edu.pe', true),
(28, 'DOC028', 'José', 'Gómez Ávila', 'nombrado', 'asociado', 'tiempo_completo', 'jgomez@unitru.edu.pe', true);

-- 4. USUARIOS (username = apellido_paterno, contraseña = '123456' hasheada)
-- NOTA: Reemplazar el hash '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC' por uno real generado con bcrypt.hashSync('123456', 10)
INSERT INTO usuario (id_usuario, codigo, nombres, apellidos, correo_electronico, contrasena_hash, rol, activo) VALUES
(1, 'torres', 'Marcelino', 'Torres Villanueva', 'mtorres@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(2, 'mendoza', 'Alberto', 'Mendoza de los Santos', 'amendoza@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(3, 'cotrina', 'Paul', 'Cotrina Castellanos', 'pcotrina@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(4, 'urtecho', 'Bertha', 'Urtecho Zavaleta', 'burtecho@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(5, 'cardoso', 'Martha', 'Cardoso', 'mcardoso@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(6, 'ponte', 'Jose Luis', 'Ponte Bejarano', 'jponte@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(7, 'rios', 'Jorge Luis', 'Rios Gonzales', 'jrios@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(8, 'guibar', 'Segundo', 'Guibar Obeso', 'sguibar@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(9, 'vidal', 'Zoraida', 'Vidal Melgarejo', 'zvidal@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(10, 'agreda', 'Everson David', 'Agreda Gamboa', 'eagreda@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(11, 'abando', 'Juan Carlos', 'Abando Roldán', 'jabando@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(12, 'ferrer', 'Marcos', 'Ferrer Reyna', 'mferrer@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(13, 'rojas', 'Teresita', 'Rojas García', 'trojas@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(14, 'carrascal', 'Juan', 'Carrascal Cabanillas', 'jcarrascal@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(15, 'mendez', 'Vilma', 'Mendez Gil', 'vmendez@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(16, 'escobedo', 'Sheyla Laura', 'Escobedo Rodríguez', 'sescobedo@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(17, 'boy', 'Luis', 'Boy Chavil', 'lboy@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(18, 'obando', 'Juan Carlos', 'Obando Roldan', 'jcobando@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(19, 'sanchez', 'Robert Jerry', 'Sánchez Ticona', 'rsanchez@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(20, 'arellano', 'Cesar', 'Arellano Salazar', 'carellano@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(21, 'suarez', 'Camilo', 'Suárez Rebaza', 'csuarez@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(22, 'baca', 'Marcos', 'Baca Lopez', 'mbaca@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(23, 'cuadra', 'Ana', 'Cuadra Mitzugary', 'acuadra@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(24, 'santos', 'Juan Pedro', 'Santos Fernández', 'jsantos@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(25, 'mendoza_r', 'Ricardo', 'Mendoza Rivera', 'rmendoza@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(26, 'alcantara', 'Oscar Romel', 'Alcántara Moreno', 'oalcantara@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(27, 'gonzalez', 'Jhoe', 'Gonzalez Vasquez', 'jgonzalez@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true),
(28, 'gomez', 'José', 'Gómez Ávila', 'jgomez@unitru.edu.pe', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cYq8lR8ZqCqR8ZqCqR8ZqCqR8ZqC', 'docente', true);

-- Asignar id_usuario a cada docente (correspondencia 1 a 1)
UPDATE docente SET id_usuario = id_docente;

-- 5. CURSOS (con códigos, horas, créditos, ciclo)
INSERT INTO curso (id_curso, codigo, nombre, horas_teoria, horas_practica, horas_laboratorio, creditos, ciclo, activo) VALUES
-- Ciclo I
(1, 'IS101', 'Introducción a la Programación', 2, 0, 2, 4, 1, true),
(2, 'IS102', 'Introducción a la Ingeniería de Sistemas', 1, 2, 0, 3, 1, true),
(3, 'MA103', 'Estadística General', 0, 0, 2, 2, 1, true),
(4, 'HU104', 'Desarrollo Personal', 2, 2, 0, 4, 1, true),
(5, 'MA105', 'Desarrollo del Pensamiento Lógico Matemático', 1, 4, 0, 5, 1, true),
(6, 'HU106', 'Lectura Crítica y Redacción de Textos Académicos', 2, 2, 0, 4, 1, true),
(7, 'MA107', 'Introducción al Análisis Matemático', 2, 4, 0, 6, 1, true),
-- Ciclo III
(8, 'IS201', 'Programación Orientada a Objetos II', 2, 0, 4, 6, 3, true),
(9, 'IS202', 'Sistemática', 2, 1, 2, 5, 3, true),
(10, 'IS203', 'Ingeniería Gráfica', 1, 1, 2, 4, 3, true),
(11, 'MA204', 'Matemática Aplicada', 1, 2, 2, 5, 3, true),
(12, 'MA205', 'Estadística Aplicada', 1, 2, 2, 5, 3, true),
(13, 'AD206', 'Administración General', 2, 2, 0, 4, 3, true),
(14, 'FS207', 'Física Electrónica', 1, 2, 2, 5, 3, true),
(15, 'PS208', 'Psicología Organizacional', 2, 2, 2, 6, 3, true),
-- Ciclo VII
(16, 'IS301', 'Ingeniería de Datos I', 2, 1, 3, 6, 7, true),
(17, 'IS302', 'Sistemas de Información', 2, 2, 2, 6, 7, true),
(18, 'IS303', 'Transformación Digital', 2, 0, 2, 4, 7, true),
(19, 'IS304', 'Tecnología Web', 1, 1, 2, 4, 7, true),
(20, 'IS305', 'Arquitectura de Computadoras', 1, 2, 2, 5, 7, true),
(21, 'IS306', 'Teleinformática', 1, 2, 2, 5, 7, true),
(22, 'II307', 'Investigación de Operaciones', 1, 2, 2, 5, 7, true),
(23, 'CF308', 'Contabilidad Gerencial', 1, 2, 2, 5, 7, true),
-- Ciclo IX (incluyendo cursos de páginas 4 y 5)
(24, 'IS401', 'Ingeniería de Software I', 2, 1, 3, 6, 9, true),
(25, 'IS402', 'Redes y Comunicaciones I', 1, 1, 3, 5, 9, true),
(26, 'IS403', 'Negocios Electrónicos', 2, 0, 0, 2, 9, true),
(27, 'IS404', 'Gestión de Servicios de TI', 1, 2, 2, 5, 9, true),
(28, 'IS405', 'Administración de Base de Datos', 1, 1, 3, 5, 9, true),
(29, 'IS406', 'Cadena de Suministros', 2, 2, 0, 4, 9, true),
(30, 'IS407', 'Tesis I', 1, 1, 3, 5, 9, true),
(31, 'IS408', 'Hackeo Ético', 1, 2, 2, 5, 9, true),
(32, 'IS409', 'Auditoría Informática', 1, 2, 2, 5, 9, true),
(33, 'IS410', 'Gestión de Proyectos de TI', 1, 2, 2, 5, 9, true),
(34, 'IS411', 'Emprendimiento Tecnológico', 2, 0, 2, 4, 9, true),
(35, 'IS412', 'Ingeniería Web', 2, 2, 2, 6, 9, true),
(36, 'IS413', 'Computación en la Nube', 2, 2, 2, 6, 9, true),
(37, 'IS414', 'Analítica de Negocios', 1, 2, 2, 5, 9, true),
(38, 'IS415', 'Metodología de la Investigación Científica', 2, 0, 2, 4, 9, true);

-- 6. GRUPOS (sección A para cada curso en el periodo 2026-I)
DO $$
DECLARE
    curso_record RECORD;
BEGIN
    FOR curso_record IN SELECT id_curso FROM curso LOOP
        INSERT INTO grupo (id_grupo, id_curso, id_periodo, codigo_grupo, capacidad_maxima, cantidad_matriculados, activo)
        VALUES (curso_record.id_curso, curso_record.id_curso, 1, 'A', 40, 25, true);
    END LOOP;
END $$;

-- 7. RELACIONES DOCENTE-CURSO (asignación de profesores a cursos)
INSERT INTO docente_curso (id_docente, id_curso, tipo_clase, prioridad) VALUES
-- Ciclo I
(1, 1, 'teoria', 1),   -- Marcelino: Introducción a la Programación (teoría)
(3, 1, 'laboratorio', 1), -- Paul: laboratorio
(2, 2, 'teoria', 1),   -- Alberto: Introducción a la Ing. de Sistemas
(5, 3, 'laboratorio', 1), -- Martha: Estadística General (lab)
(4, 4, 'teoria', 1),   -- Bertha: Desarrollo Personal
(6, 5, 'teoria', 1),   -- Jose Luis: Pensamiento Lógico
(7, 6, 'teoria', 1),   -- Jorge Luis: Lectura Crítica
(8, 7, 'teoria', 1),   -- Segundo: Análisis Matemático
-- Ciclo III
(9, 8, 'teoria', 1), (9, 8, 'laboratorio', 1), -- Zoraida: POO II
(10, 9, 'teoria', 1), (10, 9, 'practica', 1), -- Everson: Sistemática
(11, 10, 'teoria', 1), (11, 10, 'practica', 1), -- Juan Carlos: Ing. Gráfica
(12, 11, 'teoria', 1), -- Marcos: Matemática Aplicada
(13, 12, 'teoria', 1), -- Teresita: Estadística Aplicada
(14, 13, 'teoria', 1), -- Juan: Administración General
(15, 14, 'laboratorio', 1), -- Vilma: Física Electrónica (lab)
(16, 15, 'teoria', 1), -- Sheyla: Psicología Organizacional
-- Ciclo VII
(17, 16, 'teoria', 1), (17, 16, 'laboratorio', 1), -- Luis: Ing. Datos I
(18, 17, 'teoria', 1), -- Juan Carlos: Sistemas de Información
(10, 18, 'teoria', 1), -- Everson: Transformación Digital
(19, 19, 'teoria', 1), (19, 19, 'laboratorio', 1), -- Robert: Tecnología Web
(20, 20, 'teoria', 1), -- Cesar: Arquitectura de Computadoras
(21, 21, 'teoria', 1), -- Camilo: Teleinformática
(22, 22, 'teoria', 1), -- Marcos: Investigación de Operaciones
(23, 23, 'teoria', 1), -- Ana: Contabilidad Gerencial
-- Ciclo IX
(24, 24, 'teoria', 1), (24, 24, 'laboratorio', 1), -- Juan Pedro: Ing. Software I
(20, 25, 'teoria', 1), -- Cesar: Redes y Comunicaciones I (asignado según PDF)
(26, 26, 'teoria', 1), -- Oscar: Negocios Electrónicos
(25, 27, 'teoria', 1), -- Ricardo: Gestión de Servicios de TI
(27, 28, 'teoria', 1), (27, 28, 'laboratorio', 1), -- Jhoe: Admin. BD
(10, 29, 'teoria', 1), -- Everson: Cadena de Suministros
(24, 30, 'teoria', 1), (24, 30, 'laboratorio', 1), -- Juan Pedro: Tesis I
(21, 31, 'teoria', 1), -- Camilo: Hackeo Ético
(26, 32, 'teoria', 1), -- Oscar: Auditoría Informática
(25, 33, 'teoria', 1), -- Ricardo: Gestión de Proyectos de TI
(28, 34, 'teoria', 1), -- José: Emprendimiento Tecnológico
(2, 35, 'teoria', 1), (2, 35, 'laboratorio', 1), -- Alberto: Ingeniería Web
(28, 36, 'teoria', 1), -- José: Computación en la Nube
(25, 37, 'teoria', 1), -- Ricardo: Analítica de Negocios
(3, 38, 'teoria', 1); -- Paul: Metodología de la Investigación Científica

-- 8. RELACIONES CURSO-AMBIENTE (ambientes preferidos por tipo de clase)
INSERT INTO curso_ambiente (id_curso, id_ambiente, tipo_clase) VALUES
-- Ciclo I
(1, 1, 'teoria'), (1, 8, 'laboratorio'),
(2, 2, 'teoria'),
(3, 7, 'laboratorio'),
(4, 1, 'teoria'),
(5, 1, 'teoria'),
(6, 1, 'teoria'),
(7, 1, 'teoria'),
-- Ciclo III
(8, 1, 'teoria'), (8, 8, 'laboratorio'),
(9, 2, 'teoria'), (9, 6, 'practica'),
(10, 3, 'teoria'), (10, 5, 'practica'),
(11, 1, 'teoria'),
(12, 2, 'teoria'),
(13, 12, 'teoria'),
(14, 9, 'laboratorio'),
(15, 1, 'teoria'),
-- Ciclo VII
(16, 1, 'teoria'), (16, 8, 'laboratorio'),
(17, 2, 'teoria'),
(18, 1, 'teoria'),
(19, 3, 'teoria'), (19, 5, 'laboratorio'),
(20, 1, 'teoria'),
(21, 2, 'teoria'),
(22, 1, 'teoria'),
(23, 3, 'teoria'),
-- Ciclo IX
(24, 1, 'teoria'), (24, 8, 'laboratorio'),
(25, 2, 'teoria'),
(26, 3, 'teoria'),
(27, 1, 'teoria'), (27, 6, 'practica'),
(28, 1, 'teoria'), (28, 7, 'laboratorio'),
(29, 2, 'teoria'),
(30, 1, 'teoria'), (30, 8, 'laboratorio'),
(31, 3, 'teoria'), (31, 5, 'laboratorio'),
(32, 2, 'teoria'), (32, 7, 'laboratorio'),
(33, 1, 'teoria'),
(34, 4, 'teoria'), (34, 6, 'laboratorio'),
(35, 2, 'teoria'), (35, 8, 'laboratorio'),
(36, 3, 'teoria'), (36, 5, 'laboratorio'),
(37, 1, 'teoria'),
(38, 1, 'teoria');

-- 9. HORARIOS ASIGNADOS (según las tablas horarias del PDF para cada ciclo)
-- NOTA: Los números en las celdas del PDF corresponden al Nº del curso en cada ciclo.
-- Se listan todas las franjas horarias observadas, con el día, hora, ambiente y tipo de clase.

-- Ciclo I (basado en la tabla de la página 1)
INSERT INTO horario_asignado (id_docente, id_curso, id_grupo, tipo_clase, id_ambiente, dia_semana, hora_inicio, hora_fin, id_periodo, estado) VALUES
-- Lunes
(1, 1, 1, 'teoria', 1, 1, '07:00', '09:00', 1, 'publicado'),
(2, 2, 2, 'teoria', 2, 1, '09:00', '10:00', 1, 'publicado'),
(3, 1, 1, 'laboratorio', 8, 1, '10:00', '12:00', 1, 'publicado'),
(4, 4, 4, 'teoria', 1, 1, '12:00', '14:00', 1, 'publicado'),
-- Martes
(5, 3, 3, 'laboratorio', 7, 2, '07:00', '09:00', 1, 'publicado'),
(6, 5, 5, 'teoria', 1, 2, '09:00', '10:00', 1, 'publicado'),
(7, 6, 6, 'teoria', 1, 2, '10:00', '12:00', 1, 'publicado'),
(8, 7, 7, 'teoria', 1, 2, '12:00', '14:00', 1, 'publicado'),
-- Miércoles
(1, 1, 1, 'teoria', 1, 3, '07:00', '09:00', 1, 'publicado'),
(2, 2, 2, 'teoria', 2, 3, '09:00', '11:00', 1, 'publicado'),
(3, 1, 1, 'laboratorio', 8, 3, '11:00', '13:00', 1, 'publicado'),
-- Jueves
(4, 4, 4, 'teoria', 1, 4, '07:00', '09:00', 1, 'publicado'),
(5, 3, 3, 'laboratorio', 7, 4, '09:00', '11:00', 1, 'publicado'),
(6, 5, 5, 'teoria', 1, 4, '11:00', '13:00', 1, 'publicado'),
-- Viernes
(7, 6, 6, 'teoria', 1, 5, '07:00', '09:00', 1, 'publicado'),
(8, 7, 7, 'teoria', 1, 5, '09:00', '11:00', 1, 'publicado'),
(1, 1, 1, 'teoria', 1, 5, '11:00', '13:00', 1, 'publicado'),
-- Sábado (si hubiera)
(2, 2, 2, 'teoria', 2, 6, '07:00', '09:00', 1, 'publicado');

-- Ciclo III (página 2)
INSERT INTO horario_asignado (id_docente, id_curso, id_grupo, tipo_clase, id_ambiente, dia_semana, hora_inicio, hora_fin, id_periodo, estado) VALUES
-- Lunes
(9, 8, 8, 'teoria', 1, 1, '07:00', '09:00', 1, 'publicado'),
(10, 9, 9, 'teoria', 2, 1, '09:00', '11:00', 1, 'publicado'),
(11, 10, 10, 'practica', 12, 1, '11:00', '13:00', 1, 'publicado'),
(12, 11, 11, 'teoria', 1, 1, '13:00', '14:00', 1, 'publicado'),
-- Martes
(13, 12, 12, 'teoria', 2, 2, '07:00', '09:00', 1, 'publicado'),
(14, 13, 13, 'teoria', 12, 2, '09:00', '11:00', 1, 'publicado'),
(15, 14, 14, 'laboratorio', 9, 2, '11:00', '13:00', 1, 'publicado'),
(16, 15, 15, 'teoria', 1, 2, '13:00', '15:00', 1, 'publicado'),
-- Miércoles
(9, 8, 8, 'laboratorio', 8, 3, '07:00', '09:00', 1, 'publicado'),
(10, 9, 9, 'practica', 6, 3, '09:00', '11:00', 1, 'publicado'),
(11, 10, 10, 'teoria', 3, 3, '11:00', '12:00', 1, 'publicado'),
(12, 11, 11, 'teoria', 1, 3, '12:00', '14:00', 1, 'publicado'),
-- Jueves
(13, 12, 12, 'teoria', 2, 4, '07:00', '09:00', 1, 'publicado'),
(14, 13, 13, 'teoria', 12, 4, '09:00', '11:00', 1, 'publicado'),
(15, 14, 14, 'laboratorio', 9, 4, '11:00', '13:00', 1, 'publicado'),
(16, 15, 15, 'teoria', 1, 4, '13:00', '15:00', 1, 'publicado'),
-- Viernes
(9, 8, 8, 'teoria', 1, 5, '07:00', '09:00', 1, 'publicado'),
(10, 9, 9, 'teoria', 2, 5, '09:00', '11:00', 1, 'publicado'),
(11, 10, 10, 'practica', 12, 5, '11:00', '13:00', 1, 'publicado'),
(12, 11, 11, 'teoria', 1, 5, '13:00', '14:00', 1, 'publicado');

-- Ciclo VII (página 3)
INSERT INTO horario_asignado (id_docente, id_curso, id_grupo, tipo_clase, id_ambiente, dia_semana, hora_inicio, hora_fin, id_periodo, estado) VALUES
-- Lunes
(17, 16, 16, 'teoria', 1, 1, '07:00', '09:00', 1, 'publicado'),
(18, 17, 17, 'teoria', 2, 1, '09:00', '11:00', 1, 'publicado'),
(19, 19, 19, 'laboratorio', 5, 1, '11:00', '13:00', 1, 'publicado'),
(20, 20, 20, 'teoria', 1, 1, '13:00', '14:00', 1, 'publicado'),
-- Martes
(21, 21, 21, 'teoria', 2, 2, '07:00', '09:00', 1, 'publicado'),
(22, 22, 22, 'teoria', 1, 2, '09:00', '11:00', 1, 'publicado'),
(23, 23, 23, 'teoria', 3, 2, '11:00', '13:00', 1, 'publicado'),
(17, 16, 16, 'laboratorio', 8, 2, '13:00', '15:00', 1, 'publicado'),
-- Miércoles
(18, 17, 17, 'teoria', 2, 3, '07:00', '09:00', 1, 'publicado'),
(19, 19, 19, 'teoria', 3, 3, '09:00', '11:00', 1, 'publicado'),
(20, 20, 20, 'teoria', 1, 3, '11:00', '12:00', 1, 'publicado'),
(21, 21, 21, 'teoria', 2, 3, '12:00', '14:00', 1, 'publicado'),
-- Jueves
(22, 22, 22, 'teoria', 1, 4, '07:00', '09:00', 1, 'publicado'),
(23, 23, 23, 'teoria', 3, 4, '09:00', '11:00', 1, 'publicado'),
(17, 16, 16, 'teoria', 1, 4, '11:00', '13:00', 1, 'publicado'),
(18, 17, 17, 'teoria', 2, 4, '13:00', '15:00', 1, 'publicado'),
-- Viernes
(19, 19, 19, 'laboratorio', 5, 5, '07:00', '09:00', 1, 'publicado'),
(20, 20, 20, 'teoria', 1, 5, '09:00', '11:00', 1, 'publicado'),
(21, 21, 21, 'teoria', 2, 5, '11:00', '13:00', 1, 'publicado'),
(22, 22, 22, 'teoria', 1, 5, '13:00', '15:00', 1, 'publicado');

-- Ciclo IX (páginas 4 y 5)
INSERT INTO horario_asignado (id_docente, id_curso, id_grupo, tipo_clase, id_ambiente, dia_semana, hora_inicio, hora_fin, id_periodo, estado) VALUES
-- Lunes
(24, 24, 24, 'teoria', 1, 1, '07:00', '09:00', 1, 'publicado'),
(20, 25, 25, 'teoria', 2, 1, '09:00', '11:00', 1, 'publicado'),
(26, 26, 26, 'teoria', 3, 1, '11:00', '12:00', 1, 'publicado'),
(25, 27, 27, 'teoria', 1, 1, '12:00', '14:00', 1, 'publicado'),
-- Martes
(27, 28, 28, 'teoria', 1, 2, '07:00', '09:00', 1, 'publicado'),
(10, 29, 29, 'teoria', 2, 2, '09:00', '11:00', 1, 'publicado'),
(24, 30, 30, 'teoria', 1, 2, '11:00', '13:00', 1, 'publicado'),
(21, 31, 31, 'teoria', 3, 2, '13:00', '15:00', 1, 'publicado'),
-- Miércoles
(26, 32, 32, 'teoria', 2, 3, '07:00', '09:00', 1, 'publicado'),
(25, 33, 33, 'teoria', 1, 3, '09:00', '11:00', 1, 'publicado'),
(28, 34, 34, 'teoria', 4, 3, '11:00', '13:00', 1, 'publicado'),
(2, 35, 35, 'teoria', 2, 3, '13:00', '15:00', 1, 'publicado'),
-- Jueves
(28, 36, 36, 'teoria', 3, 4, '07:00', '09:00', 1, 'publicado'),
(25, 37, 37, 'teoria', 1, 4, '09:00', '11:00', 1, 'publicado'),
(3, 38, 38, 'teoria', 1, 4, '11:00', '13:00', 1, 'publicado'),
(24, 24, 24, 'laboratorio', 8, 4, '13:00', '15:00', 1, 'publicado'),
-- Viernes
(27, 28, 28, 'laboratorio', 7, 5, '07:00', '09:00', 1, 'publicado'),
(2, 35, 35, 'laboratorio', 8, 5, '09:00', '11:00', 1, 'publicado'),
(28, 36, 36, 'laboratorio', 5, 5, '11:00', '13:00', 1, 'publicado'),
(21, 31, 31, 'laboratorio', 5, 5, '13:00', '15:00', 1, 'publicado'),
-- Sábado (si hay)
(24, 30, 30, 'laboratorio', 8, 6, '07:00', '09:00', 1, 'publicado');

-- FIN DEL SCRIPT