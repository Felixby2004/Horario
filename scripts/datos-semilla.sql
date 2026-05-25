  -- -- Script de datos semilla para sistema de horarios ESTO NO
  -- -- Universidad Nacional de Trujillo - Escuela de Ingeniería de Sistemas

  -- -- Insertar período académico
  -- INSERT INTO periodo_academico (nombre, anio, semestre, fecha_inicio, fecha_fin, estado)
  -- VALUES 
  --   ('2024-I', 2024, 1, '2024-03-01', '2024-07-31', 'en_curso'),
  --   ('2024-II', 2024, 2, '2024-08-01', '2024-12-31', 'planificacion');

  -- -- Insertar docentes de ejemplo
  -- INSERT INTO docente (codigo_docente, nombres, apellidos, modalidad, categoria, antiguedad, correo_electronico, telefono, grado_academico, especialidad, dedicacion, activo)
  -- VALUES
  --   ('DOC-001', 'Juan Carlos', 'Pérez García', 'nombrado', 'principal', 15, 'jperez@unitru.edu.pe', '999111222', 'doctor', 'Ingeniería de Software', 'tiempo_completo', true),
  --   ('DOC-002', 'María Elena', 'Rodríguez Silva', 'nombrado', 'asociado', 10, 'mrodriguez@unitru.edu.pe', '999222333', 'doctor', 'Inteligencia Artificial', 'tiempo_completo', true),
  --   ('DOC-003', 'Carlos Alberto', 'López Martínez', 'nombrado', 'auxiliar', 5, 'clopez@unitru.edu.pe', '999333444', 'maestro', 'Bases de Datos', 'tiempo_completo', true),
  --   ('DOC-004', 'Ana Patricia', 'Fernández Torres', 'contratado', 'principal', 8, 'afernandez@unitru.edu.pe', '999444555', 'doctor', 'Redes y Comunicaciones', 'tiempo_parcial', true),
  --   ('DOC-005', 'Luis Fernando', 'Sánchez Ramos', 'contratado', 'jefe_practica', 2, 'lsanchez@unitru.edu.pe', '999555666', 'bachiller', 'Programación', 'tiempo_parcial', true);

  -- -- Insertar cursos
  -- INSERT INTO curso (codigo, nombre, horas_teoria, horas_laboratorio, horas_practica, creditos, ciclo, plan_estudios, activo)
  -- VALUES
  --   ('SIST-301', 'Desarrollo de Software I', 3, 2, 0, 4, 5, '2020', true),
  --   ('SIST-302', 'Base de Datos I', 3, 2, 0, 4, 5, '2020', true),
  --   ('SIST-401', 'Desarrollo de Software II', 3, 2, 0, 4, 7, '2020', true),
  --   ('SIST-402', 'Inteligencia Artificial', 4, 2, 0, 5, 8, '2020', true),
  --   ('SIST-303', 'Redes y Comunicaciones', 3, 2, 0, 4, 6, '2020', true);

  -- -- Insertar ambientes
  -- INSERT INTO ambiente (codigo, nombre, tipo, capacidad, piso, pabellon, equipamiento, activo)
  -- VALUES
  --   ('A-301', 'Aula 301', 'aula', 40, 3, 'A', 'Proyector, pizarra acrílica', true),
  --   ('A-302', 'Aula 302', 'aula', 35, 3, 'A', 'Proyector, pizarra acrílica', true),
  --   ('LAB-201', 'Laboratorio de Cómputo 1', 'laboratorio', 30, 2, 'B', '30 PCs, proyector, aire acondicionado', true),
  --   ('LAB-202', 'Laboratorio de Cómputo 2', 'laboratorio', 25, 2, 'B', '25 PCs, proyector, servidor local', true),
  --   ('LAB-301', 'Laboratorio de Redes', 'laboratorio', 20, 3, 'B', '20 PCs, equipos de red, switches', true);

  -- -- Insertar usuarios (admin y docentes)
  -- INSERT INTO usuario (codigo, nombres, apellidos, correo_electronico, contrasena_hash, rol, activo)
  -- VALUES
  --   ('ADMIN001', 'Administrador', 'Sistema', 'admin@unitru.edu.pe', '$2a$10$XYZ...', 'administrador', true),
  --   ('DOC-001', 'Juan Carlos', 'Pérez García', 'jperez@unitru.edu.pe', '$2a$10$ABC...', 'docente', true),
  --   ('DOC-002', 'María Elena', 'Rodríguez Silva', 'mrodriguez@unitru.edu.pe', '$2a$10$DEF...', 'docente', true);

  -- -- Insertar días no laborables
  -- INSERT INTO dia_no_laborable (id_periodo, fecha, descripcion, tipo)
  -- VALUES
  --   (1, '2024-04-01', 'Semana Santa', 'feriado_nacional'),
  --   (1, '2024-05-01', 'Día del Trabajo', 'feriado_nacional'),
  --   (1, '2024-06-29', 'San Pedro y San Pablo', 'feriado_nacional');

  -- -- Nota: Las contraseñas deben ser hasheadas con bcrypt
  -- -- Contraseña de ejemplo: 'password123' -> debe ser hasheada antes de insertar
-- =============================================
-- DATOS SEMILLA - SISTEMA DE HORARIOS UNT
-- =============================================

-- Períodos académicos ESTE
INSERT INTO periodo_academico (codigo, nombre, anio, semestre, fecha_inicio, fecha_fin, estado)
VALUES 
  ('2024-I',  '2024-I',  2024, 1, '2024-03-01', '2024-07-31', 'en_curso'),
  ('2024-II', '2024-II', 2024, 2, '2024-08-01', '2024-12-31', 'planificacion');

-- Docentes
INSERT INTO docente (codigo_docente, nombres, apellidos, modalidad, categoria, antiguedad, correo_electronico, telefono, grado_academico, especialidad, dedicacion, activo, fecha_actualizacion)
VALUES
  ('DOC-001', 'Juan Carlos',   'Pérez García',     'nombrado',   'principal',    15, 'jperez@unitru.edu.pe',     '999111222', 'doctor',    'Ingeniería de Software',  'tiempo_completo', true, NOW()),
  ('DOC-002', 'María Elena',   'Rodríguez Silva',  'nombrado',   'asociado',     10, 'mrodriguez@unitru.edu.pe', '999222333', 'doctor',    'Inteligencia Artificial', 'tiempo_completo', true, NOW()),
  ('DOC-003', 'Carlos Alberto','López Martínez',   'nombrado',   'auxiliar',      5, 'clopez@unitru.edu.pe',     '999333444', 'maestro',   'Bases de Datos',          'tiempo_completo', true, NOW()),
  ('DOC-004', 'Ana Patricia',  'Fernández Torres', 'contratado', 'principal',     8, 'afernandez@unitru.edu.pe', '999444555', 'doctor',    'Redes y Comunicaciones',  'tiempo_parcial',  true, NOW()),
  ('DOC-005', 'Luis Fernando', 'Sánchez Ramos',    'contratado', 'jefe_practica', 2, 'lsanchez@unitru.edu.pe',   '999555666', 'bachiller', 'Programación',            'tiempo_parcial',  true, NOW());

-- Cursos
INSERT INTO curso (codigo, nombre, horas_teoria, horas_laboratorio, horas_practica, creditos, ciclo, plan_estudios, activo)
VALUES
  ('SIST-301', 'Desarrollo de Software I',  3, 2, 0, 4, 5, '2020', true),
  ('SIST-302', 'Base de Datos I',           3, 2, 0, 4, 5, '2020', true),
  ('SIST-401', 'Desarrollo de Software II', 3, 2, 0, 4, 7, '2020', true),
  ('SIST-402', 'Inteligencia Artificial',   4, 2, 0, 5, 8, '2020', true),
  ('SIST-303', 'Redes y Comunicaciones',    3, 2, 0, 4, 6, '2020', true);

-- Ambientes
INSERT INTO ambiente (codigo, nombre, tipo, capacidad, piso, pabellon, equipamiento, activo, fecha_actualizacion)
VALUES
  ('A-301',   'Aula 301',                'aula',        40, '3', 'A', 'Proyector, pizarra acrílica',            true, NOW()),
  ('A-302',   'Aula 302',                'aula',        35, '3', 'A', 'Proyector, pizarra acrílica',            true, NOW()),
  ('LAB-201', 'Laboratorio de Cómputo 1','laboratorio', 30, '2', 'B', '30 PCs, proyector, aire acondicionado', true, NOW()),
  ('LAB-202', 'Laboratorio de Cómputo 2','laboratorio', 25, '2', 'B', '25 PCs, proyector, servidor local',     true, NOW()),
  ('LAB-301', 'Laboratorio de Redes',    'laboratorio', 20, '3', 'B', '20 PCs, equipos de red, switches',      true, NOW());

-- Usuarios
INSERT INTO usuario (codigo, nombres, apellidos, correo_electronico, contrasena_hash, rol, activo, fecha_actualizacion)
VALUES
  ('ADMIN001', 'Administrador', 'Sistema',          'admin@unitru.edu.pe',      '$2a$10$XYZ...', 'administrador_sistema', true, NOW()),
  ('DOC-001',  'Juan Carlos',   'Pérez García',     'jperez@unitru.edu.pe',     '$2a$10$ABC...', 'docente',               true, NOW()),
  ('DOC-002',  'María Elena',   'Rodríguez Silva',  'mrodriguez@unitru.edu.pe', '$2a$10$DEF...', 'docente',               true, NOW());

-- Días no laborables
INSERT INTO dia_no_laborable (id_periodo, fecha, descripcion, tipo)
VALUES
  ((SELECT id_periodo FROM periodo_academico WHERE codigo = '2024-I'), '2024-04-01', 'Semana Santa',          'feriado_nacional'),
  ((SELECT id_periodo FROM periodo_academico WHERE codigo = '2024-I'), '2024-05-01', 'Día del Trabajo',       'feriado_nacional'),
  ((SELECT id_periodo FROM periodo_academico WHERE codigo = '2024-I'), '2024-06-29', 'San Pedro y San Pablo', 'feriado_nacional');