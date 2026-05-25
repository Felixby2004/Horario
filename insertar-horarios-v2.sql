-- =============================================
-- BACKUP COMPLETO DE LA BASE DE DATOS
-- Sistema de Horarios UNT
-- Generado: 18/5/2026, 11:08:20 p. m.
-- =============================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


-- =============================================
-- TABLA: periodo_academico
-- =============================================

INSERT INTO "periodo_academico" ("id_periodo", "codigo", "nombre", "anio", "semestre", "fecha_inicio", "fecha_fin", "fecha_inicio_clases", "fecha_fin_clases", "activo", "estado", "fecha_creacion") VALUES
  (2, '2024-II', '2024-II', 2024, 2, '2024-08-01', '2024-12-31', NULL, NULL, true, 'finalizado', '2026-05-19T02:39:58.335Z'),
  (1, '2024-I', '2024-I', 2024, 1, '2024-03-01', '2024-07-31', NULL, NULL, true, 'finalizado', '2026-05-19T02:39:58.335Z');

-- =============================================
-- TABLA: usuario
-- =============================================

INSERT INTO "usuario" ("id_usuario", "codigo", "nombres", "apellidos", "correo_electronico", "contrasena_hash", "rol", "activo", "ultimo_acceso", "fecha_creacion", "fecha_actualizacion") VALUES
  (1, 'ADMIN001', 'Administrador', 'Sistema', 'admin@unitru.edu.pe', '.05.X3vGTVxTu58tY6jr5YD7gfcow/mgrNPZKgmFl1HW', 'administrador_sistema', true, NULL, '2026-05-19T02:39:58.350Z', '2026-05-19T02:39:58.350Z'),
  (2, 'DOC-001', 'Juan Carlos', 'Perez Garc?a', 'jperez@unitru.edu.pe', '.05.X3vGTVxTu58tY6jr5YD7gfcow/mgrNPZKgmFl1HW', 'docente', true, NULL, '2026-05-19T02:39:58.350Z', '2026-05-19T02:39:58.350Z'),
  (3, 'DOC-002', 'María Elena', 'Rodrguez Silva', 'mrodriguez@unitru.edu.pe', '.05.X3vGTVxTu58tY6jr5YD7gfcow/mgrNPZKgmFl1HW', 'docente', true, NULL, '2026-05-19T02:39:58.350Z', '2026-05-19T02:39:58.350Z'),
  (5, 'admin', 'Administrador', 'Sistema', 'admin@unt.edu.pe', '$2a$10$xH12IBNi0.05.X3vGTVxTu58tY6jr5YD7gfcow/mgrNPZKgmFl1HW', 'administrador_sistema', true, '2026-05-19T03:26:26.618Z', '2026-05-19T02:43:11.591Z', '2026-05-19T03:26:26.620Z');

-- =============================================
-- TABLA: docente
-- =============================================

INSERT INTO "docente" ("id_docente", "id_usuario", "codigo_docente", "nombres", "apellidos", "modalidad", "categoria", "dedicacion", "antiguedad", "fecha_ingreso", "correo_electronico", "telefono", "grado_academico", "especialidad", "horas_maximas_semanales", "activo", "fecha_creacion", "fecha_actualizacion", "direccion", "disponibilidad", "escuela_profesional", "foto_perfil", "perfil_completo", "horas_totales_asignadas") VALUES
  (1, NULL, 'DOC-001', 'Juan Carlos', 'Perez Garcia', 'nombrado', 'principal', 'tiempo_completo', 15, NULL, 'jperez@unitru.edu.pe', '999111222', 'doctor', 'Ingenier?a de Software', 40, true, '2026-05-19T02:39:58.345Z', '2026-05-19T02:39:58.345Z', NULL, NULL, NULL, NULL, false, 0),
  (2, NULL, 'DOC-002', 'Maria Elena', 'Rodriguez Silva', 'nombrado', 'asociado', 'tiempo_completo', 10, NULL, 'mrodriguez@unitru.edu.pe', '999222333', 'doctor', 'Inteligencia Artificial', 40, true, '2026-05-19T02:39:58.345Z', '2026-05-19T02:39:58.345Z', NULL, NULL, NULL, NULL, false, 0),
  (3, NULL, 'DOC-003', 'Carlos Alberto', 'LLopez Martinez', 'nombrado', 'auxiliar', 'tiempo_completo', 5, NULL, 'clopez@unitru.edu.pe', '999333444', 'maestro', 'Bases de Datos', 40, true, '2026-05-19T02:39:58.345Z', '2026-05-19T02:39:58.345Z', NULL, NULL, NULL, NULL, false, 0),
  (4, NULL, 'DOC-004', 'Ana Patricia', 'Fernandez Torres', 'contratado', 'principal', 'tiempo_parcial', 8, NULL, 'afernandez@unitru.edu.pe', '999444555', 'doctor', 'Redes y Comunicaciones', 40, true, '2026-05-19T02:39:58.345Z', '2026-05-19T02:39:58.345Z', NULL, NULL, NULL, NULL, false, 0),
  (5, NULL, 'DOC-005', 'Luis Fernando', 'SSanchez Ramos', 'contratado', 'jefe_practica', 'tiempo_parcial', 2, NULL, 'lsanchez@unitru.edu.pe', '999555666', 'bachiller', 'Programacion', 40, true, '2026-05-19T02:39:58.345Z', '2026-05-19T02:39:58.345Z', NULL, NULL, NULL, NULL, false, 0);

-- =============================================
-- TABLA: curso
-- =============================================

INSERT INTO "curso" ("id_curso", "codigo", "nombre", "horas_teoria", "horas_laboratorio", "horas_practica", "creditos", "ciclo", "plan_estudios", "prerequisitos", "activo", "fecha_creacion") VALUES
  (1, 'SIST-301', 'Desarrollo de Software I', 3, 2, 0, 4, 5, '2020', NULL, true, '2026-05-19T02:39:58.347Z'),
  (2, 'SIST-302', 'Base de Datos I', 3, 2, 0, 4, 5, '2020', NULL, true, '2026-05-19T02:39:58.347Z'),
  (3, 'SIST-401', 'Desarrollo de Software II', 3, 2, 0, 4, 7, '2020', NULL, true, '2026-05-19T02:39:58.347Z'),
  (4, 'SIST-402', 'Inteligencia Artificial', 4, 2, 0, 5, 8, '2020', NULL, true, '2026-05-19T02:39:58.347Z'),
  (5, 'SIST-303', 'Redes y Comunicaciones', 3, 2, 0, 4, 6, '2020', NULL, true, '2026-05-19T02:39:58.347Z');

-- =============================================
-- TABLA: grupo
-- =============================================

INSERT INTO "grupo" ("id_grupo", "id_curso", "id_periodo", "codigo_grupo", "capacidad_maxima", "cantidad_matriculados", "activo", "observaciones", "fecha_creacion") VALUES
  (1, 1, 1, 'A', 40, 35, true, NULL, '2026-05-19T02:54:19.323Z'),
  (2, 1, 1, 'B', 40, 38, true, NULL, '2026-05-19T02:54:19.323Z'),
  (3, 2, 1, 'A', 30, 28, true, NULL, '2026-05-19T02:54:19.323Z'),
  (4, 3, 1, 'A', 40, 40, true, NULL, '2026-05-19T02:54:19.323Z'),
  (5, 4, 1, 'A', 35, 32, true, NULL, '2026-05-19T02:54:19.323Z'),
  (6, 5, 1, 'A', 40, 37, true, NULL, '2026-05-19T02:54:19.323Z');

-- =============================================
-- TABLA: ambiente
-- =============================================

INSERT INTO "ambiente" ("id_ambiente", "codigo", "nombre", "tipo", "capacidad", "piso", "pabellon", "equipamiento", "activo", "requiere_mantenimiento", "observaciones", "fecha_creacion", "fecha_actualizacion") VALUES
  (1, 'A-301', 'Aula 301', 'aula', 40, '3', 'A', 'Proyector, pizarra acrilica', true, false, NULL, '2026-05-19T02:39:58.349Z', '2026-05-19T02:39:58.349Z'),
  (2, 'A-302', 'Aula 302', 'aula', 35, '3', 'A', 'Proyector, pizarra acrilica', true, false, NULL, '2026-05-19T02:39:58.349Z', '2026-05-19T02:39:58.349Z'),
  (3, 'LAB-201', 'Laboratorio de Computo 1', 'laboratorio', 30, '2', 'B', '30 PCs, proyector, aire acondicionado', true, false, NULL, '2026-05-19T02:39:58.349Z', '2026-05-19T02:39:58.349Z'),
  (4, 'LAB-202', 'Laboratorio de Computo 2', 'laboratorio', 25, '2', 'B', '25 PCs, proyector, servidor local', true, false, NULL, '2026-05-19T02:39:58.349Z', '2026-05-19T02:39:58.349Z'),
  (5, 'LAB-301', 'Laboratorio de Redes', 'laboratorio', 20, '3', 'B', '20 PCs, equipos de red, switches', true, false, NULL, '2026-05-19T02:39:58.349Z', '2026-05-19T02:39:58.349Z');

-- =============================================
-- TABLA: docente_curso
-- =============================================

INSERT INTO "docente_curso" ("id_docente_curso", "id_docente", "id_curso", "tipo_clase", "experiencia_anios", "prioridad", "activo", "fecha_asignacion", "horas_asignadas") VALUES
  (1, 1, 1, 'teoria', 0, 1, true, '2026-05-19T02:54:19.330Z', 6),
  (2, 1, 1, 'laboratorio', 0, 1, true, '2026-05-19T02:54:19.330Z', 4),
  (3, 2, 4, 'teoria', 0, 1, true, '2026-05-19T02:54:19.330Z', 8),
  (4, 2, 4, 'laboratorio', 0, 1, true, '2026-05-19T02:54:19.330Z', 4),
  (5, 3, 2, 'teoria', 0, 1, true, '2026-05-19T02:54:19.330Z', 6),
  (6, 3, 2, 'laboratorio', 0, 1, true, '2026-05-19T02:54:19.330Z', 4),
  (7, 4, 5, 'teoria', 0, 1, true, '2026-05-19T02:54:19.330Z', 6),
  (8, 4, 5, 'laboratorio', 0, 1, true, '2026-05-19T02:54:19.330Z', 4),
  (9, 5, 3, 'teoria', 0, 1, true, '2026-05-19T02:54:19.330Z', 6),
  (10, 5, 3, 'laboratorio', 0, 1, true, '2026-05-19T02:54:19.330Z', 4);

-- =============================================
-- TABLA: docente_grupo
-- =============================================

INSERT INTO "docente_grupo" ("id_docente_grupo", "id_docente", "id_grupo", "activo", "fecha_asignacion") VALUES
  (1, 1, 1, true, '2026-05-19T02:55:22.516Z'),
  (2, 1, 2, true, '2026-05-19T02:55:22.516Z'),
  (3, 3, 3, true, '2026-05-19T02:55:22.516Z'),
  (4, 5, 4, true, '2026-05-19T02:55:22.516Z'),
  (5, 2, 5, true, '2026-05-19T02:55:22.516Z'),
  (6, 4, 6, true, '2026-05-19T02:55:22.516Z');

-- =============================================
-- TABLA: ventana_atencion
-- =============================================

INSERT INTO "ventana_atencion" ("id_ventana", "id_periodo", "fecha", "orden_prioridad", "modalidad", "categoria", "hora_inicio", "hora_fin", "intervalo_minutos", "cantidad_docentes", "cantidad_atendidos", "completado", "activo", "fecha_creacion") VALUES
  (10, 2, '2026-06-08', 1, 'nombrado', 'principal', '08:00', '09:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.737Z'),
  (11, 2, '2026-06-08', 2, 'nombrado', 'asociado', '09:30', '11:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.744Z'),
  (12, 2, '2026-06-08', 3, 'nombrado', 'auxiliar', '11:00', '12:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.749Z'),
  (13, 2, '2026-06-08', 4, 'nombrado', 'jefe_practica', '12:30', '14:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.755Z'),
  (14, 2, '2026-06-08', 5, 'contratado', 'principal', '14:00', '15:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.758Z'),
  (15, 2, '2026-06-08', 6, 'contratado', 'asociado', '15:30', '17:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.762Z'),
  (16, 2, '2026-06-08', 7, 'contratado', 'auxiliar', '17:00', '18:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.771Z'),
  (17, 2, '2026-06-08', 8, 'contratado', 'jefe_practica', '18:30', '20:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.775Z'),
  (18, 2, '2026-06-09', 9, 'nombrado', 'principal', '08:00', '09:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.778Z'),
  (19, 2, '2026-06-09', 10, 'nombrado', 'asociado', '09:30', '11:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.782Z'),
  (20, 2, '2026-06-09', 11, 'nombrado', 'auxiliar', '11:00', '12:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.789Z'),
  (21, 2, '2026-06-09', 12, 'nombrado', 'jefe_practica', '12:30', '14:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.792Z'),
  (22, 2, '2026-06-09', 13, 'contratado', 'principal', '14:00', '15:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.794Z'),
  (23, 2, '2026-06-09', 14, 'contratado', 'asociado', '15:30', '17:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.799Z'),
  (24, 2, '2026-06-09', 15, 'contratado', 'auxiliar', '17:00', '18:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.806Z'),
  (25, 2, '2026-06-09', 16, 'contratado', 'jefe_practica', '18:30', '20:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.808Z'),
  (26, 2, '2026-06-10', 17, 'nombrado', 'principal', '08:00', '09:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.811Z'),
  (27, 2, '2026-06-10', 18, 'nombrado', 'asociado', '09:30', '11:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.814Z'),
  (28, 2, '2026-06-10', 19, 'nombrado', 'auxiliar', '11:00', '12:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.820Z'),
  (29, 2, '2026-06-10', 20, 'nombrado', 'jefe_practica', '12:30', '14:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.824Z'),
  (30, 2, '2026-06-10', 21, 'contratado', 'principal', '14:00', '15:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.826Z'),
  (31, 2, '2026-06-10', 22, 'contratado', 'asociado', '15:30', '17:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.828Z'),
  (32, 2, '2026-06-10', 23, 'contratado', 'auxiliar', '17:00', '18:30', 15, 0, 0, false, true, '2026-05-19T04:02:51.832Z'),
  (33, 2, '2026-06-10', 24, 'contratado', 'jefe_practica', '18:30', '20:00', 15, 0, 0, false, true, '2026-05-19T04:02:51.838Z');

-- =============================================
-- TABLA: horario_asignado
-- =============================================

INSERT INTO "horario_asignado" ("id_asignacion", "id_docente", "id_curso", "id_grupo", "tipo_clase", "id_ambiente", "dia_semana", "hora_inicio", "hora_fin", "id_periodo", "id_ventana", "estado", "observaciones", "creado_por", "fecha_creacion", "fecha_actualizacion") VALUES
  (6, 1, 1, 1, 'teoria', 1, 1, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.521Z', '2026-05-19T02:55:22.521Z'),
  (7, 3, 2, 3, 'teoria', 2, 1, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.521Z', '2026-05-19T02:55:22.521Z'),
  (8, 5, 3, 4, 'teoria', 1, 1, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.521Z', '2026-05-19T02:55:22.521Z'),
  (9, 2, 4, 5, 'teoria', 2, 1, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.521Z', '2026-05-19T02:55:22.521Z'),
  (10, 4, 5, 6, 'teoria', 1, 1, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.521Z', '2026-05-19T02:55:22.521Z'),
  (11, 1, 1, 2, 'teoria', 2, 1, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.521Z', '2026-05-19T02:55:22.521Z'),
  (12, 5, 3, 4, 'teoria', 2, 2, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.528Z', '2026-05-19T02:55:22.528Z'),
  (13, 2, 4, 5, 'teoria', 1, 2, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.528Z', '2026-05-19T02:55:22.528Z'),
  (14, 1, 1, 1, 'teoria', 2, 2, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.528Z', '2026-05-19T02:55:22.528Z'),
  (15, 3, 2, 3, 'teoria', 1, 2, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.528Z', '2026-05-19T02:55:22.528Z'),
  (16, 4, 5, 6, 'teoria', 2, 2, '16:00', '18:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.528Z', '2026-05-19T02:55:22.528Z'),
  (17, 1, 1, 2, 'teoria', 1, 2, '16:00', '18:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.528Z', '2026-05-19T02:55:22.528Z'),
  (18, 1, 1, 1, 'laboratorio', 3, 3, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.530Z', '2026-05-19T02:55:22.530Z'),
  (19, 3, 2, 3, 'laboratorio', 4, 3, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.530Z', '2026-05-19T02:55:22.530Z'),
  (20, 5, 3, 4, 'laboratorio', 5, 3, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.530Z', '2026-05-19T02:55:22.530Z'),
  (21, 2, 4, 5, 'laboratorio', 3, 3, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.530Z', '2026-05-19T02:55:22.530Z'),
  (22, 4, 5, 6, 'laboratorio', 4, 3, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.530Z', '2026-05-19T02:55:22.530Z'),
  (23, 1, 1, 2, 'laboratorio', 5, 3, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.530Z', '2026-05-19T02:55:22.530Z'),
  (24, 1, 1, 2, 'laboratorio', 3, 4, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.532Z', '2026-05-19T02:55:22.532Z'),
  (25, 3, 2, 3, 'laboratorio', 5, 4, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.532Z', '2026-05-19T02:55:22.532Z'),
  (26, 5, 3, 4, 'laboratorio', 4, 4, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.532Z', '2026-05-19T02:55:22.532Z'),
  (27, 2, 4, 5, 'laboratorio', 5, 4, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.532Z', '2026-05-19T02:55:22.532Z'),
  (28, 4, 5, 6, 'laboratorio', 3, 4, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.532Z', '2026-05-19T02:55:22.532Z'),
  (29, 1, 1, 1, 'practica', 1, 5, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.534Z', '2026-05-19T02:55:22.534Z'),
  (30, 3, 2, 3, 'practica', 2, 5, '08:00', '10:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.534Z', '2026-05-19T02:55:22.534Z'),
  (31, 5, 3, 4, 'practica', 1, 5, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.534Z', '2026-05-19T02:55:22.534Z'),
  (32, 2, 4, 5, 'practica', 2, 5, '10:00', '12:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.534Z', '2026-05-19T02:55:22.534Z'),
  (33, 4, 5, 6, 'practica', 1, 5, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.534Z', '2026-05-19T02:55:22.534Z'),
  (34, 1, 1, 2, 'practica', 2, 5, '14:00', '16:00', 1, NULL, 'confirmado', NULL, 1, '2026-05-19T02:55:22.534Z', '2026-05-19T02:55:22.534Z');

-- =============================================
-- TABLA: dia_no_laborable
-- =============================================

INSERT INTO "dia_no_laborable" ("id_dia_no_laborable", "fecha", "descripcion", "tipo", "afecta_clases", "id_periodo") VALUES
  (1, '2024-04-01', 'Semana Santa', 'feriado_nacional', true, 1),
  (2, '2024-05-01', 'Dia del Trabajo', 'feriado_nacional', true, 1),
  (3, '2024-06-29', 'San Pedro y San Pablo', 'feriado_nacional', true, 1);