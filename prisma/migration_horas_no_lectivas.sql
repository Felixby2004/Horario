-- Migración para agregar funcionalidad de horas no lectivas y carga académica
-- Fecha: 2025-06-03
-- Sistema: UNT Horarios

-- 1. Crear nuevos enums

CREATE TYPE "tipo_dedicacion_laboral" AS ENUM (
  'dedicacion_exclusiva',
  'tiempo_completo',
  'tiempo_parcial_20',
  'por_horas'
);

CREATE TYPE "tipo_actividad_no_lectiva" AS ENUM (
  'tutoria_consejeria',
  'investigacion',
  'responsabilidad_social',
  'gestion_gobierno',
  'asesoria_tesis_jurado',
  'perfeccionamiento'
);

CREATE TYPE "estado_carga_academica" AS ENUM (
  'borrador',
  'enviado',
  'en_revision',
  'observado',
  'validado',
  'aprobado',
  'publicado',
  'cancelado'
);

-- 2. Actualizar tabla docente

ALTER TABLE "docente"
ADD COLUMN "tipo_dedicacion_laboral" "tipo_dedicacion_laboral",
ADD COLUMN "dni_docente" VARCHAR(20);

-- 3. Crear tabla carga_academica
CREATE TABLE "carga_academica" (
    "id_carga_academica" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "horas_lectivas" INTEGER NOT NULL DEFAULT 0,
    "horas_preparacion_evaluacion" INTEGER NOT NULL DEFAULT 0,
    "horas_no_lectivas" INTEGER NOT NULL DEFAULT 0,
    "horas_totales" INTEGER NOT NULL DEFAULT 0,
    "horas_meta" INTEGER NOT NULL DEFAULT 40,
    "estado" "estado_carga_academica" NOT NULL DEFAULT 'borrador',
    "observaciones_generales" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_envio" TIMESTAMP(3),
    "fecha_aprobacion" TIMESTAMP(3),
    "aprobado_por" INTEGER,

    CONSTRAINT "carga_academica_pkey" PRIMARY KEY ("id_carga_academica")
);

CREATE UNIQUE INDEX "carga_academica_id_docente_id_periodo_key" ON "carga_academica"("id_docente", "id_periodo");

ALTER TABLE "carga_academica" ADD CONSTRAINT "carga_academica_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carga_academica" ADD CONSTRAINT "carga_academica_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "carga_academica" ADD CONSTRAINT "carga_academica_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Crear tabla actividad_no_lectiva
CREATE TABLE "actividad_no_lectiva" (
    "id_actividad_no_lectiva" SERIAL NOT NULL,
    "id_carga_academica" INTEGER NOT NULL,
    "tipo_actividad" "tipo_actividad_no_lectiva" NOT NULL,
    "datos_sustento" JSONB,
    "horarios_actividad" JSONB,
    "horas_asignadas" INTEGER NOT NULL DEFAULT 0,
    "estado" "estado_carga_academica" NOT NULL DEFAULT 'borrador',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividad_no_lectiva_pkey" PRIMARY KEY ("id_actividad_no_lectiva")
);

ALTER TABLE "actividad_no_lectiva" ADD CONSTRAINT "actividad_no_lectiva_id_carga_academica_fkey" FOREIGN KEY ("id_carga_academica") REFERENCES "carga_academica"("id_carga_academica") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Crear tabla historial_carga_academica
CREATE TABLE "historial_carga_academica" (
    "id_historial" SERIAL NOT NULL,
    "id_carga_academica" INTEGER NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "estado_anterior" "estado_carga_academica",
    "estado_nuevo" "estado_carga_academica" NOT NULL,
    "usuario_id" INTEGER,
    "observaciones" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_carga_academica_pkey" PRIMARY KEY ("id_historial")
);

ALTER TABLE "historial_carga_academica" ADD CONSTRAINT "historial_carga_academica_id_carga_academica_fkey" FOREIGN KEY ("id_carga_academica") REFERENCES "carga_academica"("id_carga_academica") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "historial_carga_academica" ADD CONSTRAINT "historial_carga_academica_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
