



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


