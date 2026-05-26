-- Esquema completo en SQL generado desde prisma/schema.prisma.
-- Pensado para despliegue manual en PostgreSQL.
-- No cambia la logica de la aplicacion; solo define tipos, tablas, indices y relaciones.

DO $$ BEGIN
    CREATE TYPE "tipo_rol" AS ENUM (
        'administrador_sistema',
        'director_escuela',
        'coordinador_academico',
        'operador_horarios',
        'docente'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_periodo" AS ENUM (
        'planificacion',
        'asignacion_horarios',
        'en_curso',
        'finalizado'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_modalidad" AS ENUM (
        'nombrado',
        'contratado'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_categoria" AS ENUM (
        'principal',
        'asociado',
        'auxiliar',
        'jefe_practica'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_dedicacion" AS ENUM (
        'tiempo_completo',
        'tiempo_parcial',
        'por_horas'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_clase" AS ENUM (
        'teoria',
        'laboratorio',
        'practica'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_ambiente" AS ENUM (
        'aula',
        'laboratorio',
        'auditorio',
        'sala_reuniones'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_horario" AS ENUM (
        'borrador',
        'solicitado',
        'aprobado',
        'confirmado',
        'publicado',
        'modificado',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_dia_no_laborable" AS ENUM (
        'feriado_nacional',
        'feriado_local',
        'mantenimiento',
        'institucional',
        'duelo'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_preasignacion" AS ENUM (
        'pendiente',
        'confirmada',
        'cancelada'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_conflicto" AS ENUM (
        'cruce_docente',
        'cruce_grupo',
        'cruce_ambiente',
        'exceso_horas_docente',
        'ambiente_no_disponible',
        'fuera_franja'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "accion_auditoria" AS ENUM (
        'crear',
        'modificar',
        'eliminar',
        'confirmar',
        'publicar',
        'cancelar',
        'reasignar'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "canal_notificacion" AS ENUM (
        'correo',
        'whatsapp',
        'telegram'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_envio" AS ENUM (
        'pendiente',
        'enviado',
        'entregado',
        'leido',
        'fallido',
        'rebotado'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_cola" AS ENUM (
        'pendiente',
        'procesando',
        'completado',
        'fallido'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_citacion" AS ENUM (
        'programada',
        'confirmada_docente',
        'rechazada',
        'completada',
        'cancelada'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "estado_fase_disponibilidad" AS ENUM (
        'no_iniciada',
        'abierta',
        'cerrada',
        'procesada'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(100),
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "rol" "tipo_rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario"),
    CONSTRAINT "usuario_codigo_key" UNIQUE ("codigo"),
    CONSTRAINT "usuario_correo_electronico_key" UNIQUE ("correo_electronico")
);

CREATE TABLE IF NOT EXISTS "periodo_academico" (
    "id_periodo" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "anio" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "fecha_inicio_clases" DATE,
    "fecha_fin_clases" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "estado" "estado_periodo" NOT NULL DEFAULT 'planificacion',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "periodo_academico_pkey" PRIMARY KEY ("id_periodo"),
    CONSTRAINT "periodo_academico_codigo_key" UNIQUE ("codigo")
);

CREATE TABLE IF NOT EXISTS "docente" (
    "id_docente" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "codigo_docente" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "modalidad" "tipo_modalidad" NOT NULL,
    "categoria" "tipo_categoria" NOT NULL,
    "dedicacion" "tipo_dedicacion",
    "antiguedad" INTEGER NOT NULL DEFAULT 0,
    "fecha_ingreso" DATE,
    "correo_electronico" VARCHAR(100),
    "telefono" VARCHAR(20),
    "grado_academico" VARCHAR(50),
    "especialidad" VARCHAR(100),
    "horas_maximas_semanales" INTEGER NOT NULL DEFAULT 40,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direccion" VARCHAR(200),
    "disponibilidad" TEXT,
    "escuela_profesional" VARCHAR(150),
    "foto_perfil" VARCHAR(255),
    "perfil_completo" BOOLEAN NOT NULL DEFAULT false,
    "horas_totales_asignadas" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "docente_pkey" PRIMARY KEY ("id_docente"),
    CONSTRAINT "docente_id_usuario_key" UNIQUE ("id_usuario"),
    CONSTRAINT "docente_codigo_docente_key" UNIQUE ("codigo_docente"),
    CONSTRAINT "docente_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "curso" (
    "id_curso" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "horas_teoria" INTEGER NOT NULL DEFAULT 0,
    "horas_laboratorio" INTEGER NOT NULL DEFAULT 0,
    "horas_practica" INTEGER NOT NULL DEFAULT 0,
    "creditos" INTEGER NOT NULL,
    "ciclo" INTEGER,
    "plan_estudios" VARCHAR(50),
    "prerequisitos" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso"),
    CONSTRAINT "curso_codigo_key" UNIQUE ("codigo")
);

CREATE TABLE IF NOT EXISTS "grupo" (
    "id_grupo" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "codigo_grupo" VARCHAR(10) NOT NULL,
    "capacidad_maxima" INTEGER NOT NULL DEFAULT 40,
    "cantidad_matriculados" INTEGER DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grupo_pkey" PRIMARY KEY ("id_grupo"),
    CONSTRAINT "grupo_id_curso_codigo_grupo_id_periodo_key" UNIQUE ("id_curso", "codigo_grupo", "id_periodo"),
    CONSTRAINT "grupo_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grupo_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "docente_curso" (
    "id_docente_curso" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "tipo_clase" "tipo_clase" NOT NULL,
    "experiencia_anios" INTEGER DEFAULT 0,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horas_asignadas" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "docente_curso_pkey" PRIMARY KEY ("id_docente_curso"),
    CONSTRAINT "docente_curso_id_docente_id_curso_tipo_clase_key" UNIQUE ("id_docente", "id_curso", "tipo_clase"),
    CONSTRAINT "docente_curso_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "docente_curso_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "docente_grupo" (
    "id_docente_grupo" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "docente_grupo_pkey" PRIMARY KEY ("id_docente_grupo"),
    CONSTRAINT "docente_grupo_id_docente_id_grupo_key" UNIQUE ("id_docente", "id_grupo"),
    CONSTRAINT "docente_grupo_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "docente_grupo_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo"("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ambiente" (
    "id_ambiente" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" "tipo_ambiente" NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "piso" VARCHAR(10),
    "pabellon" VARCHAR(50),
    "equipamiento" TEXT,
    "caracteristicas" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "requiere_mantenimiento" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ambiente_pkey" PRIMARY KEY ("id_ambiente"),
    CONSTRAINT "ambiente_codigo_key" UNIQUE ("codigo")
);

CREATE TABLE IF NOT EXISTS "curso_ambiente" (
    "id_curso_ambiente" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_ambiente" INTEGER NOT NULL,
    "tipo_clase" "tipo_clase" NOT NULL,
    CONSTRAINT "curso_ambiente_pkey" PRIMARY KEY ("id_curso_ambiente"),
    CONSTRAINT "curso_ambiente_id_curso_id_ambiente_tipo_clase_key" UNIQUE ("id_curso", "id_ambiente", "tipo_clase"),
    CONSTRAINT "curso_ambiente_id_ambiente_fkey" FOREIGN KEY ("id_ambiente") REFERENCES "ambiente"("id_ambiente") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "curso_ambiente_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ventana_atencion" (
    "id_ventana" SERIAL NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "orden_prioridad" INTEGER NOT NULL,
    "modalidad" "tipo_modalidad" NOT NULL,
    "categoria" "tipo_categoria" NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "intervalo_minutos" INTEGER NOT NULL DEFAULT 15,
    "cantidad_docentes" INTEGER DEFAULT 0,
    "cantidad_atendidos" INTEGER DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ventana_atencion_pkey" PRIMARY KEY ("id_ventana"),
    CONSTRAINT "ventana_atencion_id_periodo_orden_prioridad_modalidad_categoria_key" UNIQUE ("id_periodo", "orden_prioridad", "modalidad", "categoria"),
    CONSTRAINT "ventana_atencion_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "horario_asignado" (
    "id_asignacion" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "tipo_clase" "tipo_clase" NOT NULL,
    "id_ambiente" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "id_ventana" INTEGER,
    "estado" "estado_horario" NOT NULL DEFAULT 'borrador',
    "observaciones" TEXT,
    "creado_por" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "horario_asignado_pkey" PRIMARY KEY ("id_asignacion"),
    CONSTRAINT "horario_asignado_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "horario_asignado_id_ambiente_fkey" FOREIGN KEY ("id_ambiente") REFERENCES "ambiente"("id_ambiente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "horario_asignado_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "horario_asignado_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "horario_asignado_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo"("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "horario_asignado_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "horario_asignado_id_ventana_fkey" FOREIGN KEY ("id_ventana") REFERENCES "ventana_atencion"("id_ventana") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "seleccion_temporal_horario" (
    "id_seleccion" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "tipo_clase" "tipo_clase" NOT NULL,
    "id_ambiente" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "sesion_id" VARCHAR(100) NOT NULL,
    "fecha_seleccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seleccion_temporal_horario_pkey" PRIMARY KEY ("id_seleccion"),
    CONSTRAINT "seleccion_temporal_horario_sesion_id_dia_semana_hora_inicio_key" UNIQUE ("sesion_id", "dia_semana", "hora_inicio"),
    CONSTRAINT "seleccion_temporal_horario_id_ambiente_fkey" FOREIGN KEY ("id_ambiente") REFERENCES "ambiente"("id_ambiente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "seleccion_temporal_horario_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "seleccion_temporal_horario_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "seleccion_temporal_horario_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo"("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "seleccion_temporal_horario_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "disponibilidad_docente" (
    "id_disponibilidad" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "es_restriccion" BOOLEAN NOT NULL DEFAULT false,
    "motivo_restriccion" VARCHAR(200),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "disponibilidad_docente_pkey" PRIMARY KEY ("id_disponibilidad"),
    CONSTRAINT "disponibilidad_docente_id_docente_dia_semana_hora_inicio_id_periodo_key" UNIQUE ("id_docente", "dia_semana", "hora_inicio", "id_periodo"),
    CONSTRAINT "disponibilidad_docente_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "disponibilidad_docente_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "restriccion_institucional" (
    "id_restriccion" SERIAL NOT NULL,
    "tipo_restriccion" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "configuracion" JSONB NOT NULL,
    "id_periodo" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "restriccion_institucional_pkey" PRIMARY KEY ("id_restriccion"),
    CONSTRAINT "restriccion_institucional_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "dia_no_laborable" (
    "id_dia_no_laborable" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "tipo" "tipo_dia_no_laborable" NOT NULL,
    "afecta_clases" BOOLEAN NOT NULL DEFAULT true,
    "id_periodo" INTEGER,
    CONSTRAINT "dia_no_laborable_pkey" PRIMARY KEY ("id_dia_no_laborable"),
    CONSTRAINT "dia_no_laborable_fecha_id_periodo_key" UNIQUE ("fecha", "id_periodo"),
    CONSTRAINT "dia_no_laborable_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "preasignacion" (
    "id_preasignacion" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "tipo_clase" "tipo_clase" NOT NULL,
    "id_ambiente" INTEGER,
    "dia_semana" INTEGER,
    "hora_inicio" VARCHAR(5),
    "hora_fin" VARCHAR(5),
    "id_periodo" INTEGER NOT NULL,
    "estado" "estado_preasignacion" NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "preasignacion_pkey" PRIMARY KEY ("id_preasignacion"),
    CONSTRAINT "preasignacion_id_ambiente_fkey" FOREIGN KEY ("id_ambiente") REFERENCES "ambiente"("id_ambiente") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "preasignacion_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "preasignacion_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "preasignacion_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo"("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "preasignacion_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "conflicto_horario" (
    "id_conflicto" SERIAL NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "tipo_conflicto" "tipo_conflicto" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_docente_1" INTEGER,
    "id_docente_2" INTEGER,
    "id_curso" INTEGER,
    "id_ambiente" INTEGER,
    "dia_semana" INTEGER,
    "hora_inicio" VARCHAR(5),
    "hora_fin" VARCHAR(5),
    "resuelto" BOOLEAN NOT NULL DEFAULT false,
    "fecha_deteccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMP(3),
    "resuelto_por" INTEGER,
    CONSTRAINT "conflicto_horario_pkey" PRIMARY KEY ("id_conflicto"),
    CONSTRAINT "conflicto_horario_id_ambiente_fkey" FOREIGN KEY ("id_ambiente") REFERENCES "ambiente"("id_ambiente") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "conflicto_horario_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "conflicto_horario_id_docente_1_fkey" FOREIGN KEY ("id_docente_1") REFERENCES "docente"("id_docente") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "conflicto_horario_id_docente_2_fkey" FOREIGN KEY ("id_docente_2") REFERENCES "docente"("id_docente") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "conflicto_horario_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "conflicto_horario_resuelto_por_fkey" FOREIGN KEY ("resuelto_por") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "auditoria_horario" (
    "id_auditoria" SERIAL NOT NULL,
    "id_asignacion" INTEGER,
    "accion" "accion_auditoria" NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "direccion_ip" VARCHAR(45),
    "motivo" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_horario_pkey" PRIMARY KEY ("id_auditoria"),
    CONSTRAINT "auditoria_horario_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "horario_asignado"("id_asignacion") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "auditoria_horario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "configuracion_notificaciones" (
    "id_configuracion" SERIAL NOT NULL,
    "tipo_notificacion" VARCHAR(50) NOT NULL,
    "canal" "canal_notificacion" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "plantilla_mensaje" TEXT,
    "hora_envio" VARCHAR(5),
    "dias_antelacion" INTEGER DEFAULT 1,
    "minutos_antelacion" INTEGER,
    "configuracion_adicional" JSONB,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "configuracion_notificaciones_pkey" PRIMARY KEY ("id_configuracion"),
    CONSTRAINT "configuracion_notificaciones_tipo_notificacion_canal_key" UNIQUE ("tipo_notificacion", "canal")
);

CREATE TABLE IF NOT EXISTS "preferencias_notificacion_docente" (
    "id_preferencia" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "canal" "canal_notificacion" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "datos_contacto" JSONB NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_verificacion" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "preferencias_notificacion_docente_pkey" PRIMARY KEY ("id_preferencia"),
    CONSTRAINT "preferencias_notificacion_docente_id_docente_canal_key" UNIQUE ("id_docente", "canal"),
    CONSTRAINT "preferencias_notificacion_docente_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "historial_notificaciones" (
    "id_notificacion" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_ventana" INTEGER,
    "tipo_notificacion" VARCHAR(50) NOT NULL,
    "canal" "canal_notificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado_envio" "estado_envio" NOT NULL DEFAULT 'pendiente',
    "fecha_envio" TIMESTAMP(3),
    "fecha_entrega" TIMESTAMP(3),
    "codigo_respuesta" VARCHAR(50),
    "respuesta_servidor" TEXT,
    "intentos" INTEGER NOT NULL DEFAULT 1,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_notificaciones_pkey" PRIMARY KEY ("id_notificacion"),
    CONSTRAINT "historial_notificaciones_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "historial_notificaciones_id_docente_fecha_creacion_idx" ON "historial_notificaciones" ("id_docente", "fecha_creacion" DESC);
CREATE INDEX IF NOT EXISTS "historial_notificaciones_estado_envio_fecha_creacion_idx" ON "historial_notificaciones" ("estado_envio", "fecha_creacion");

CREATE TABLE IF NOT EXISTS "cola_notificaciones" (
    "id_cola" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "tipo_notificacion" VARCHAR(50) NOT NULL,
    "canal" "canal_notificacion" NOT NULL,
    "datos_mensaje" JSONB NOT NULL,
    "fecha_programada" TIMESTAMP(3) NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 5,
    "estado" "estado_cola" NOT NULL DEFAULT 'pendiente',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "maximo_intentos" INTEGER NOT NULL DEFAULT 3,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_procesamiento" TIMESTAMP(3),
    CONSTRAINT "cola_notificaciones_pkey" PRIMARY KEY ("id_cola"),
    CONSTRAINT "cola_notificaciones_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "cola_notificaciones_fecha_programada_estado_prioridad_idx" ON "cola_notificaciones" ("fecha_programada", "estado", "prioridad");

CREATE TABLE IF NOT EXISTS "fase_disponibilidad" (
    "id_fase_disponibilidad" SERIAL NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "estado" "estado_fase_disponibilidad" NOT NULL DEFAULT 'no_iniciada',
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "bloques_tiempo" VARCHAR(50) NOT NULL DEFAULT '30',
    "instrucciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fase_disponibilidad_pkey" PRIMARY KEY ("id_fase_disponibilidad"),
    CONSTRAINT "fase_disponibilidad_id_periodo_key" UNIQUE ("id_periodo"),
    CONSTRAINT "fase_disponibilidad_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "disponibilidad_docente_registro" (
    "id_registro" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_fase" INTEGER NOT NULL,
    "matriz_disponibilidad" JSONB NOT NULL,
    "bloques_preferidos" JSONB,
    "notas" VARCHAR(500),
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "disponibilidad_docente_registro_pkey" PRIMARY KEY ("id_registro"),
    CONSTRAINT "disponibilidad_docente_registro_id_docente_id_fase_key" UNIQUE ("id_docente", "id_fase"),
    CONSTRAINT "disponibilidad_docente_registro_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "disponibilidad_docente_registro_id_fase_fkey" FOREIGN KEY ("id_fase") REFERENCES "fase_disponibilidad"("id_fase_disponibilidad") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "disponibilidad_docente_registro_id_fase_idx" ON "disponibilidad_docente_registro" ("id_fase");

CREATE TABLE IF NOT EXISTS "citacion_docente" (
    "id_citacion" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "id_ventana" INTEGER NOT NULL,
    "fecha_citacion" DATE NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "numero_orden_turno" INTEGER NOT NULL,
    "estado" "estado_citacion" NOT NULL DEFAULT 'programada',
    "confirmado_docente" BOOLEAN NOT NULL DEFAULT false,
    "fecha_confirmacion" TIMESTAMP(3),
    "razon_rechazo" VARCHAR(300),
    "observaciones" TEXT,
    "notificacion_enviada" BOOLEAN NOT NULL DEFAULT false,
    "recordatorio_enviado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "citacion_docente_pkey" PRIMARY KEY ("id_citacion"),
    CONSTRAINT "citacion_docente_id_docente_id_periodo_id_ventana_key" UNIQUE ("id_docente", "id_periodo", "id_ventana"),
    CONSTRAINT "citacion_docente_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "citacion_docente_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "citacion_docente_id_ventana_fkey" FOREIGN KEY ("id_ventana") REFERENCES "ventana_atencion"("id_ventana") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "citacion_docente_fecha_citacion_hora_inicio_idx" ON "citacion_docente" ("fecha_citacion", "hora_inicio");
CREATE INDEX IF NOT EXISTS "citacion_docente_estado_notificacion_enviada_idx" ON "citacion_docente" ("estado", "notificacion_enviada");

CREATE TABLE IF NOT EXISTS "configuracion_turnos_atencion" (
    "id_configuracion" SERIAL NOT NULL,
    "id_ventana" INTEGER NOT NULL,
    "minutos_por_turno" INTEGER NOT NULL DEFAULT 15,
    "cantidad_turnos" INTEGER NOT NULL,
    "permitir_reprogramacion" BOOLEAN NOT NULL DEFAULT true,
    "dias_previos_minimo" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "configuracion_turnos_atencion_pkey" PRIMARY KEY ("id_configuracion"),
    CONSTRAINT "configuracion_turnos_atencion_id_ventana_key" UNIQUE ("id_ventana"),
    CONSTRAINT "configuracion_turnos_atencion_id_ventana_fkey" FOREIGN KEY ("id_ventana") REFERENCES "ventana_atencion"("id_ventana") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "historial_citacion" (
    "id_historial" SERIAL NOT NULL,
    "id_citacion" INTEGER NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "estado_anterior" "estado_citacion",
    "estado_nuevo" "estado_citacion" NOT NULL,
    "cambios" JSONB,
    "razon" TEXT,
    "usuario_id" INTEGER,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_citacion_pkey" PRIMARY KEY ("id_historial")
);

CREATE INDEX IF NOT EXISTS "usuario_codigo_idx" ON "usuario" ("codigo");
CREATE INDEX IF NOT EXISTS "usuario_correo_electronico_idx" ON "usuario" ("correo_electronico");

CREATE INDEX IF NOT EXISTS "docente_codigo_docente_idx" ON "docente" ("codigo_docente");
CREATE INDEX IF NOT EXISTS "docente_id_usuario_idx" ON "docente" ("id_usuario");

CREATE INDEX IF NOT EXISTS "grupo_id_curso_id_periodo_idx" ON "grupo" ("id_curso", "id_periodo");
CREATE INDEX IF NOT EXISTS "ventana_atencion_id_periodo_idx" ON "ventana_atencion" ("id_periodo");
CREATE INDEX IF NOT EXISTS "horario_asignado_id_periodo_idx" ON "horario_asignado" ("id_periodo");
CREATE INDEX IF NOT EXISTS "horario_asignado_id_ventana_idx" ON "horario_asignado" ("id_ventana");
CREATE INDEX IF NOT EXISTS "seleccion_temporal_horario_fecha_expiracion_idx" ON "seleccion_temporal_horario" ("fecha_expiracion");
CREATE INDEX IF NOT EXISTS "preferencias_notificacion_docente_id_docente_canal_idx" ON "preferencias_notificacion_docente" ("id_docente", "canal");

-- Fin del esquema completo.




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