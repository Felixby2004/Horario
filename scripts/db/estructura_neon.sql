--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: accion_auditoria; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.accion_auditoria AS ENUM (
    'crear',
    'modificar',
    'eliminar',
    'confirmar',
    'publicar',
    'cancelar',
    'reasignar'
);


--
-- Name: canal_notificacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.canal_notificacion AS ENUM (
    'correo',
    'whatsapp',
    'telegram'
);


--
-- Name: estado_citacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_citacion AS ENUM (
    'programada',
    'confirmada_docente',
    'rechazada',
    'completada',
    'cancelada'
);


--
-- Name: estado_cola; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_cola AS ENUM (
    'pendiente',
    'procesando',
    'completado',
    'fallido'
);


--
-- Name: estado_envio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_envio AS ENUM (
    'pendiente',
    'enviado',
    'entregado',
    'leido',
    'fallido',
    'rebotado'
);


--
-- Name: estado_fase_disponibilidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_fase_disponibilidad AS ENUM (
    'no_iniciada',
    'abierta',
    'cerrada',
    'procesada'
);


--
-- Name: estado_horario; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_horario AS ENUM (
    'borrador',
    'solicitado',
    'aprobado',
    'confirmado',
    'publicado',
    'modificado',
    'cancelado'
);


--
-- Name: estado_periodo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_periodo AS ENUM (
    'planificacion',
    'asignacion_horarios',
    'en_curso',
    'finalizado'
);


--
-- Name: estado_preasignacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_preasignacion AS ENUM (
    'pendiente',
    'confirmada',
    'cancelada'
);


--
-- Name: tipo_ambiente; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_ambiente AS ENUM (
    'aula',
    'laboratorio',
    'auditorio',
    'sala_reuniones'
);


--
-- Name: tipo_categoria; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_categoria AS ENUM (
    'principal',
    'asociado',
    'auxiliar',
    'jefe_practica'
);


--
-- Name: tipo_clase; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_clase AS ENUM (
    'teoria',
    'laboratorio',
    'practica'
);


--
-- Name: tipo_conflicto; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_conflicto AS ENUM (
    'cruce_docente',
    'cruce_grupo',
    'cruce_ambiente',
    'exceso_horas_docente',
    'ambiente_no_disponible',
    'fuera_franja'
);


--
-- Name: tipo_dedicacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_dedicacion AS ENUM (
    'tiempo_completo',
    'tiempo_parcial',
    'por_horas'
);


--
-- Name: tipo_dia_no_laborable; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_dia_no_laborable AS ENUM (
    'feriado_nacional',
    'feriado_local',
    'mantenimiento',
    'institucional',
    'duelo'
);


--
-- Name: tipo_modalidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_modalidad AS ENUM (
    'nombrado',
    'contratado'
);


--
-- Name: tipo_rol; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_rol AS ENUM (
    'administrador_sistema',
    'director_escuela',
    'coordinador_academico',
    'operador_horarios',
    'docente'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: ambiente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ambiente (
    id_ambiente integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo public.tipo_ambiente NOT NULL,
    capacidad integer NOT NULL,
    piso character varying(10),
    pabellon character varying(50),
    equipamiento text,
    caracteristicas jsonb,
    activo boolean DEFAULT true NOT NULL,
    requiere_mantenimiento boolean DEFAULT false NOT NULL,
    observaciones text,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: ambiente_id_ambiente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ambiente_id_ambiente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ambiente_id_ambiente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ambiente_id_ambiente_seq OWNED BY public.ambiente.id_ambiente;


--
-- Name: auditoria_horario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria_horario (
    id_auditoria integer NOT NULL,
    id_asignacion integer,
    accion public.accion_auditoria NOT NULL,
    usuario_id integer NOT NULL,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    direccion_ip character varying(45),
    motivo text,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: auditoria_horario_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditoria_horario_id_auditoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auditoria_horario_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditoria_horario_id_auditoria_seq OWNED BY public.auditoria_horario.id_auditoria;


--
-- Name: citacion_docente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.citacion_docente (
    id_citacion integer NOT NULL,
    id_docente integer NOT NULL,
    id_periodo integer NOT NULL,
    id_ventana integer NOT NULL,
    fecha_citacion date NOT NULL,
    hora_inicio character varying(5) NOT NULL,
    hora_fin character varying(5) NOT NULL,
    numero_orden_turno integer NOT NULL,
    estado public.estado_citacion DEFAULT 'programada'::public.estado_citacion NOT NULL,
    confirmado_docente boolean DEFAULT false NOT NULL,
    fecha_confirmacion timestamp(3) without time zone,
    razon_rechazo character varying(300),
    observaciones text,
    notificacion_enviada boolean DEFAULT false NOT NULL,
    recordatorio_enviado boolean DEFAULT false NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: citacion_docente_id_citacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.citacion_docente_id_citacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: citacion_docente_id_citacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.citacion_docente_id_citacion_seq OWNED BY public.citacion_docente.id_citacion;


--
-- Name: cola_notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cola_notificaciones (
    id_cola integer NOT NULL,
    id_docente integer NOT NULL,
    tipo_notificacion character varying(50) NOT NULL,
    canal public.canal_notificacion NOT NULL,
    datos_mensaje jsonb NOT NULL,
    fecha_programada timestamp(3) without time zone NOT NULL,
    prioridad integer DEFAULT 5 NOT NULL,
    estado public.estado_cola DEFAULT 'pendiente'::public.estado_cola NOT NULL,
    intentos integer DEFAULT 0 NOT NULL,
    maximo_intentos integer DEFAULT 3 NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_procesamiento timestamp(3) without time zone
);


--
-- Name: cola_notificaciones_id_cola_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cola_notificaciones_id_cola_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cola_notificaciones_id_cola_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cola_notificaciones_id_cola_seq OWNED BY public.cola_notificaciones.id_cola;


--
-- Name: configuracion_notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_notificaciones (
    id_configuracion integer NOT NULL,
    tipo_notificacion character varying(50) NOT NULL,
    canal public.canal_notificacion NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    plantilla_mensaje text,
    hora_envio character varying(5),
    dias_antelacion integer DEFAULT 1,
    minutos_antelacion integer,
    configuracion_adicional jsonb,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: configuracion_notificaciones_id_configuracion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_notificaciones_id_configuracion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_notificaciones_id_configuracion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_notificaciones_id_configuracion_seq OWNED BY public.configuracion_notificaciones.id_configuracion;


--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_sistema (
    id_configuracion integer NOT NULL,
    bloques_horarios integer DEFAULT 10 NOT NULL,
    duracion_bloque integer DEFAULT 90 NOT NULL,
    hora_inicio character varying(5) DEFAULT '07:00'::character varying NOT NULL,
    hora_fin character varying(5) DEFAULT '22:00'::character varying NOT NULL,
    max_horas_docente integer DEFAULT 40 NOT NULL,
    min_horas_entre_clases integer DEFAULT 0 NOT NULL,
    permitir_clases_seguidas boolean DEFAULT true NOT NULL,
    validar_capacidad_ambiente boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: configuracion_sistema_id_configuracion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_sistema_id_configuracion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_sistema_id_configuracion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_sistema_id_configuracion_seq OWNED BY public.configuracion_sistema.id_configuracion;


--
-- Name: configuracion_turnos_atencion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_turnos_atencion (
    id_configuracion integer NOT NULL,
    id_ventana integer NOT NULL,
    minutos_por_turno integer DEFAULT 15 NOT NULL,
    cantidad_turnos integer NOT NULL,
    permitir_reprogramacion boolean DEFAULT true NOT NULL,
    dias_previos_minimo integer DEFAULT 1 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: configuracion_turnos_atencion_id_configuracion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_turnos_atencion_id_configuracion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_turnos_atencion_id_configuracion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_turnos_atencion_id_configuracion_seq OWNED BY public.configuracion_turnos_atencion.id_configuracion;


--
-- Name: conflicto_horario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conflicto_horario (
    id_conflicto integer NOT NULL,
    id_periodo integer NOT NULL,
    tipo_conflicto public.tipo_conflicto NOT NULL,
    descripcion text NOT NULL,
    id_docente_1 integer,
    id_docente_2 integer,
    id_curso integer,
    id_ambiente integer,
    dia_semana integer,
    hora_inicio character varying(5),
    hora_fin character varying(5),
    resuelto boolean DEFAULT false NOT NULL,
    fecha_deteccion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_resolucion timestamp(3) without time zone,
    resuelto_por integer
);


--
-- Name: conflicto_horario_id_conflicto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conflicto_horario_id_conflicto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conflicto_horario_id_conflicto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conflicto_horario_id_conflicto_seq OWNED BY public.conflicto_horario.id_conflicto;


--
-- Name: curso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curso (
    id_curso integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    horas_teoria integer DEFAULT 0 NOT NULL,
    horas_laboratorio integer DEFAULT 0 NOT NULL,
    horas_practica integer DEFAULT 0 NOT NULL,
    creditos integer NOT NULL,
    ciclo integer,
    plan_estudios character varying(50),
    prerequisitos text,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: curso_ambiente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curso_ambiente (
    id_curso_ambiente integer NOT NULL,
    id_curso integer NOT NULL,
    id_ambiente integer NOT NULL,
    tipo_clase public.tipo_clase NOT NULL
);


--
-- Name: curso_ambiente_id_curso_ambiente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.curso_ambiente_id_curso_ambiente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: curso_ambiente_id_curso_ambiente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.curso_ambiente_id_curso_ambiente_seq OWNED BY public.curso_ambiente.id_curso_ambiente;


--
-- Name: curso_id_curso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.curso_id_curso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: curso_id_curso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.curso_id_curso_seq OWNED BY public.curso.id_curso;


--
-- Name: dia_no_laborable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dia_no_laborable (
    id_dia_no_laborable integer NOT NULL,
    fecha date NOT NULL,
    descripcion character varying(200) NOT NULL,
    tipo public.tipo_dia_no_laborable NOT NULL,
    afecta_clases boolean DEFAULT true NOT NULL,
    id_periodo integer
);


--
-- Name: dia_no_laborable_id_dia_no_laborable_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dia_no_laborable_id_dia_no_laborable_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dia_no_laborable_id_dia_no_laborable_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dia_no_laborable_id_dia_no_laborable_seq OWNED BY public.dia_no_laborable.id_dia_no_laborable;


--
-- Name: disponibilidad_docente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disponibilidad_docente (
    id_disponibilidad integer NOT NULL,
    id_docente integer NOT NULL,
    id_periodo integer NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio character varying(5) NOT NULL,
    hora_fin character varying(5) NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    es_restriccion boolean DEFAULT false NOT NULL,
    motivo_restriccion character varying(200),
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: disponibilidad_docente_id_disponibilidad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disponibilidad_docente_id_disponibilidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: disponibilidad_docente_id_disponibilidad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disponibilidad_docente_id_disponibilidad_seq OWNED BY public.disponibilidad_docente.id_disponibilidad;


--
-- Name: disponibilidad_docente_registro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disponibilidad_docente_registro (
    id_registro integer NOT NULL,
    id_docente integer NOT NULL,
    id_fase integer NOT NULL,
    matriz_disponibilidad jsonb NOT NULL,
    bloques_preferidos jsonb,
    notas character varying(500),
    completado boolean DEFAULT false NOT NULL,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: disponibilidad_docente_registro_id_registro_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disponibilidad_docente_registro_id_registro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: disponibilidad_docente_registro_id_registro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disponibilidad_docente_registro_id_registro_seq OWNED BY public.disponibilidad_docente_registro.id_registro;


--
-- Name: docente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.docente (
    id_docente integer NOT NULL,
    id_usuario integer,
    codigo_docente character varying(20) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    modalidad public.tipo_modalidad NOT NULL,
    categoria public.tipo_categoria NOT NULL,
    dedicacion public.tipo_dedicacion,
    antiguedad integer DEFAULT 0 NOT NULL,
    fecha_ingreso date,
    correo_electronico character varying(100),
    telefono character varying(20),
    grado_academico character varying(50),
    especialidad character varying(100),
    horas_maximas_semanales integer DEFAULT 40 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL,
    direccion character varying(200),
    disponibilidad text,
    escuela_profesional character varying(150),
    foto_perfil character varying(255),
    perfil_completo boolean DEFAULT false NOT NULL,
    horas_totales_asignadas integer DEFAULT 0 NOT NULL
);


--
-- Name: docente_curso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.docente_curso (
    id_docente_curso integer NOT NULL,
    id_docente integer NOT NULL,
    id_curso integer NOT NULL,
    tipo_clase public.tipo_clase NOT NULL,
    experiencia_anios integer DEFAULT 0,
    prioridad integer DEFAULT 1 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    horas_asignadas integer DEFAULT 0 NOT NULL
);


--
-- Name: docente_curso_id_docente_curso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.docente_curso_id_docente_curso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: docente_curso_id_docente_curso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.docente_curso_id_docente_curso_seq OWNED BY public.docente_curso.id_docente_curso;


--
-- Name: docente_grupo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.docente_grupo (
    id_docente_grupo integer NOT NULL,
    id_docente integer NOT NULL,
    id_grupo integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: docente_grupo_id_docente_grupo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.docente_grupo_id_docente_grupo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: docente_grupo_id_docente_grupo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.docente_grupo_id_docente_grupo_seq OWNED BY public.docente_grupo.id_docente_grupo;


--
-- Name: docente_id_docente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.docente_id_docente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: docente_id_docente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.docente_id_docente_seq OWNED BY public.docente.id_docente;


--
-- Name: fase_disponibilidad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fase_disponibilidad (
    id_fase_disponibilidad integer NOT NULL,
    id_periodo integer NOT NULL,
    estado public.estado_fase_disponibilidad DEFAULT 'no_iniciada'::public.estado_fase_disponibilidad NOT NULL,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone NOT NULL,
    bloques_tiempo character varying(50) DEFAULT '30'::character varying NOT NULL,
    instrucciones text,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: fase_disponibilidad_id_fase_disponibilidad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fase_disponibilidad_id_fase_disponibilidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fase_disponibilidad_id_fase_disponibilidad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fase_disponibilidad_id_fase_disponibilidad_seq OWNED BY public.fase_disponibilidad.id_fase_disponibilidad;


--
-- Name: grupo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grupo (
    id_grupo integer NOT NULL,
    id_curso integer NOT NULL,
    id_periodo integer NOT NULL,
    codigo_grupo character varying(10) NOT NULL,
    capacidad_maxima integer DEFAULT 40 NOT NULL,
    cantidad_matriculados integer DEFAULT 0,
    activo boolean DEFAULT true NOT NULL,
    observaciones text,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: grupo_id_grupo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grupo_id_grupo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grupo_id_grupo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grupo_id_grupo_seq OWNED BY public.grupo.id_grupo;


--
-- Name: historial_citacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial_citacion (
    id_historial integer NOT NULL,
    id_citacion integer NOT NULL,
    accion character varying(50) NOT NULL,
    estado_anterior public.estado_citacion,
    estado_nuevo public.estado_citacion NOT NULL,
    cambios jsonb,
    razon text,
    usuario_id integer,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: historial_citacion_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historial_citacion_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historial_citacion_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historial_citacion_id_historial_seq OWNED BY public.historial_citacion.id_historial;


--
-- Name: historial_notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial_notificaciones (
    id_notificacion integer NOT NULL,
    id_docente integer NOT NULL,
    id_ventana integer,
    tipo_notificacion character varying(50) NOT NULL,
    canal public.canal_notificacion NOT NULL,
    mensaje text NOT NULL,
    estado_envio public.estado_envio DEFAULT 'pendiente'::public.estado_envio NOT NULL,
    fecha_envio timestamp(3) without time zone,
    fecha_entrega timestamp(3) without time zone,
    codigo_respuesta character varying(50),
    respuesta_servidor text,
    intentos integer DEFAULT 1 NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: historial_notificaciones_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historial_notificaciones_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historial_notificaciones_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historial_notificaciones_id_notificacion_seq OWNED BY public.historial_notificaciones.id_notificacion;


--
-- Name: horario_asignado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.horario_asignado (
    id_asignacion integer NOT NULL,
    id_docente integer NOT NULL,
    id_curso integer NOT NULL,
    id_grupo integer NOT NULL,
    tipo_clase public.tipo_clase NOT NULL,
    id_ambiente integer NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio character varying(5) NOT NULL,
    hora_fin character varying(5) NOT NULL,
    id_periodo integer NOT NULL,
    id_ventana integer,
    estado public.estado_horario DEFAULT 'borrador'::public.estado_horario NOT NULL,
    observaciones text,
    creado_por integer,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: horario_asignado_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.horario_asignado_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: horario_asignado_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.horario_asignado_id_asignacion_seq OWNED BY public.horario_asignado.id_asignacion;


--
-- Name: periodo_academico; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.periodo_academico (
    id_periodo integer NOT NULL,
    codigo character varying(10) NOT NULL,
    nombre character varying(100) NOT NULL,
    anio integer NOT NULL,
    semestre integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    fecha_inicio_clases date,
    fecha_fin_clases date,
    activo boolean DEFAULT true NOT NULL,
    estado public.estado_periodo DEFAULT 'planificacion'::public.estado_periodo NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: periodo_academico_id_periodo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.periodo_academico_id_periodo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: periodo_academico_id_periodo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.periodo_academico_id_periodo_seq OWNED BY public.periodo_academico.id_periodo;


--
-- Name: preasignacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preasignacion (
    id_preasignacion integer NOT NULL,
    id_docente integer NOT NULL,
    id_curso integer NOT NULL,
    id_grupo integer NOT NULL,
    tipo_clase public.tipo_clase NOT NULL,
    id_ambiente integer,
    dia_semana integer,
    hora_inicio character varying(5),
    hora_fin character varying(5),
    id_periodo integer NOT NULL,
    estado public.estado_preasignacion DEFAULT 'pendiente'::public.estado_preasignacion NOT NULL,
    observaciones text,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: preasignacion_id_preasignacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.preasignacion_id_preasignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: preasignacion_id_preasignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.preasignacion_id_preasignacion_seq OWNED BY public.preasignacion.id_preasignacion;


--
-- Name: preferencias_notificacion_docente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preferencias_notificacion_docente (
    id_preferencia integer NOT NULL,
    id_docente integer NOT NULL,
    canal public.canal_notificacion NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    datos_contacto jsonb NOT NULL,
    verificado boolean DEFAULT false NOT NULL,
    fecha_verificacion timestamp(3) without time zone,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: preferencias_notificacion_docente_id_preferencia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.preferencias_notificacion_docente_id_preferencia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: preferencias_notificacion_docente_id_preferencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.preferencias_notificacion_docente_id_preferencia_seq OWNED BY public.preferencias_notificacion_docente.id_preferencia;


--
-- Name: restriccion_institucional; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restriccion_institucional (
    id_restriccion integer NOT NULL,
    tipo_restriccion character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    configuracion jsonb NOT NULL,
    id_periodo integer,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: restriccion_institucional_id_restriccion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.restriccion_institucional_id_restriccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: restriccion_institucional_id_restriccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.restriccion_institucional_id_restriccion_seq OWNED BY public.restriccion_institucional.id_restriccion;


--
-- Name: seleccion_temporal_horario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seleccion_temporal_horario (
    id_seleccion integer NOT NULL,
    id_docente integer NOT NULL,
    id_curso integer NOT NULL,
    id_grupo integer NOT NULL,
    tipo_clase public.tipo_clase NOT NULL,
    id_ambiente integer NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio character varying(5) NOT NULL,
    hora_fin character varying(5) NOT NULL,
    id_periodo integer NOT NULL,
    sesion_id character varying(100) NOT NULL,
    fecha_seleccion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_expiracion timestamp(3) without time zone NOT NULL
);


--
-- Name: seleccion_temporal_horario_id_seleccion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seleccion_temporal_horario_id_seleccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seleccion_temporal_horario_id_seleccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seleccion_temporal_horario_id_seleccion_seq OWNED BY public.seleccion_temporal_horario.id_seleccion;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    correo_electronico character varying(100),
    contrasena_hash character varying(255) NOT NULL,
    rol public.tipo_rol NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    ultimo_acceso timestamp(3) without time zone,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp(3) without time zone NOT NULL
);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: ventana_atencion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventana_atencion (
    id_ventana integer NOT NULL,
    id_periodo integer NOT NULL,
    fecha date NOT NULL,
    orden_prioridad integer NOT NULL,
    modalidad public.tipo_modalidad NOT NULL,
    categoria public.tipo_categoria NOT NULL,
    hora_inicio character varying(5) NOT NULL,
    hora_fin character varying(5) NOT NULL,
    intervalo_minutos integer DEFAULT 15 NOT NULL,
    cantidad_docentes integer DEFAULT 0,
    cantidad_atendidos integer DEFAULT 0,
    completado boolean DEFAULT false NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ventana_atencion_id_ventana_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventana_atencion_id_ventana_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventana_atencion_id_ventana_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventana_atencion_id_ventana_seq OWNED BY public.ventana_atencion.id_ventana;


--
-- Name: ambiente id_ambiente; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ambiente ALTER COLUMN id_ambiente SET DEFAULT nextval('public.ambiente_id_ambiente_seq'::regclass);


--
-- Name: auditoria_horario id_auditoria; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_horario ALTER COLUMN id_auditoria SET DEFAULT nextval('public.auditoria_horario_id_auditoria_seq'::regclass);


--
-- Name: citacion_docente id_citacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citacion_docente ALTER COLUMN id_citacion SET DEFAULT nextval('public.citacion_docente_id_citacion_seq'::regclass);


--
-- Name: cola_notificaciones id_cola; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cola_notificaciones ALTER COLUMN id_cola SET DEFAULT nextval('public.cola_notificaciones_id_cola_seq'::regclass);


--
-- Name: configuracion_notificaciones id_configuracion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_notificaciones ALTER COLUMN id_configuracion SET DEFAULT nextval('public.configuracion_notificaciones_id_configuracion_seq'::regclass);


--
-- Name: configuracion_sistema id_configuracion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema ALTER COLUMN id_configuracion SET DEFAULT nextval('public.configuracion_sistema_id_configuracion_seq'::regclass);


--
-- Name: configuracion_turnos_atencion id_configuracion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_turnos_atencion ALTER COLUMN id_configuracion SET DEFAULT nextval('public.configuracion_turnos_atencion_id_configuracion_seq'::regclass);


--
-- Name: conflicto_horario id_conflicto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario ALTER COLUMN id_conflicto SET DEFAULT nextval('public.conflicto_horario_id_conflicto_seq'::regclass);


--
-- Name: curso id_curso; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso ALTER COLUMN id_curso SET DEFAULT nextval('public.curso_id_curso_seq'::regclass);


--
-- Name: curso_ambiente id_curso_ambiente; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_ambiente ALTER COLUMN id_curso_ambiente SET DEFAULT nextval('public.curso_ambiente_id_curso_ambiente_seq'::regclass);


--
-- Name: dia_no_laborable id_dia_no_laborable; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dia_no_laborable ALTER COLUMN id_dia_no_laborable SET DEFAULT nextval('public.dia_no_laborable_id_dia_no_laborable_seq'::regclass);


--
-- Name: disponibilidad_docente id_disponibilidad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente ALTER COLUMN id_disponibilidad SET DEFAULT nextval('public.disponibilidad_docente_id_disponibilidad_seq'::regclass);


--
-- Name: disponibilidad_docente_registro id_registro; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente_registro ALTER COLUMN id_registro SET DEFAULT nextval('public.disponibilidad_docente_registro_id_registro_seq'::regclass);


--
-- Name: docente id_docente; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente ALTER COLUMN id_docente SET DEFAULT nextval('public.docente_id_docente_seq'::regclass);


--
-- Name: docente_curso id_docente_curso; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_curso ALTER COLUMN id_docente_curso SET DEFAULT nextval('public.docente_curso_id_docente_curso_seq'::regclass);


--
-- Name: docente_grupo id_docente_grupo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_grupo ALTER COLUMN id_docente_grupo SET DEFAULT nextval('public.docente_grupo_id_docente_grupo_seq'::regclass);


--
-- Name: fase_disponibilidad id_fase_disponibilidad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fase_disponibilidad ALTER COLUMN id_fase_disponibilidad SET DEFAULT nextval('public.fase_disponibilidad_id_fase_disponibilidad_seq'::regclass);


--
-- Name: grupo id_grupo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo ALTER COLUMN id_grupo SET DEFAULT nextval('public.grupo_id_grupo_seq'::regclass);


--
-- Name: historial_citacion id_historial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_citacion ALTER COLUMN id_historial SET DEFAULT nextval('public.historial_citacion_id_historial_seq'::regclass);


--
-- Name: historial_notificaciones id_notificacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_notificaciones ALTER COLUMN id_notificacion SET DEFAULT nextval('public.historial_notificaciones_id_notificacion_seq'::regclass);


--
-- Name: horario_asignado id_asignacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado ALTER COLUMN id_asignacion SET DEFAULT nextval('public.horario_asignado_id_asignacion_seq'::regclass);


--
-- Name: periodo_academico id_periodo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodo_academico ALTER COLUMN id_periodo SET DEFAULT nextval('public.periodo_academico_id_periodo_seq'::regclass);


--
-- Name: preasignacion id_preasignacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion ALTER COLUMN id_preasignacion SET DEFAULT nextval('public.preasignacion_id_preasignacion_seq'::regclass);


--
-- Name: preferencias_notificacion_docente id_preferencia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion_docente ALTER COLUMN id_preferencia SET DEFAULT nextval('public.preferencias_notificacion_docente_id_preferencia_seq'::regclass);


--
-- Name: restriccion_institucional id_restriccion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restriccion_institucional ALTER COLUMN id_restriccion SET DEFAULT nextval('public.restriccion_institucional_id_restriccion_seq'::regclass);


--
-- Name: seleccion_temporal_horario id_seleccion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario ALTER COLUMN id_seleccion SET DEFAULT nextval('public.seleccion_temporal_horario_id_seleccion_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Name: ventana_atencion id_ventana; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventana_atencion ALTER COLUMN id_ventana SET DEFAULT nextval('public.ventana_atencion_id_ventana_seq'::regclass);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ambiente ambiente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ambiente
    ADD CONSTRAINT ambiente_pkey PRIMARY KEY (id_ambiente);


--
-- Name: auditoria_horario auditoria_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_horario
    ADD CONSTRAINT auditoria_horario_pkey PRIMARY KEY (id_auditoria);


--
-- Name: citacion_docente citacion_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citacion_docente
    ADD CONSTRAINT citacion_docente_pkey PRIMARY KEY (id_citacion);


--
-- Name: cola_notificaciones cola_notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cola_notificaciones
    ADD CONSTRAINT cola_notificaciones_pkey PRIMARY KEY (id_cola);


--
-- Name: configuracion_notificaciones configuracion_notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_notificaciones
    ADD CONSTRAINT configuracion_notificaciones_pkey PRIMARY KEY (id_configuracion);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id_configuracion);


--
-- Name: configuracion_turnos_atencion configuracion_turnos_atencion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_turnos_atencion
    ADD CONSTRAINT configuracion_turnos_atencion_pkey PRIMARY KEY (id_configuracion);


--
-- Name: conflicto_horario conflicto_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_pkey PRIMARY KEY (id_conflicto);


--
-- Name: curso_ambiente curso_ambiente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_ambiente
    ADD CONSTRAINT curso_ambiente_pkey PRIMARY KEY (id_curso_ambiente);


--
-- Name: curso curso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_pkey PRIMARY KEY (id_curso);


--
-- Name: dia_no_laborable dia_no_laborable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dia_no_laborable
    ADD CONSTRAINT dia_no_laborable_pkey PRIMARY KEY (id_dia_no_laborable);


--
-- Name: disponibilidad_docente disponibilidad_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente
    ADD CONSTRAINT disponibilidad_docente_pkey PRIMARY KEY (id_disponibilidad);


--
-- Name: disponibilidad_docente_registro disponibilidad_docente_registro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente_registro
    ADD CONSTRAINT disponibilidad_docente_registro_pkey PRIMARY KEY (id_registro);


--
-- Name: docente_curso docente_curso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_curso
    ADD CONSTRAINT docente_curso_pkey PRIMARY KEY (id_docente_curso);


--
-- Name: docente_grupo docente_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_grupo
    ADD CONSTRAINT docente_grupo_pkey PRIMARY KEY (id_docente_grupo);


--
-- Name: docente docente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_pkey PRIMARY KEY (id_docente);


--
-- Name: fase_disponibilidad fase_disponibilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fase_disponibilidad
    ADD CONSTRAINT fase_disponibilidad_pkey PRIMARY KEY (id_fase_disponibilidad);


--
-- Name: grupo grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_pkey PRIMARY KEY (id_grupo);


--
-- Name: historial_citacion historial_citacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_citacion
    ADD CONSTRAINT historial_citacion_pkey PRIMARY KEY (id_historial);


--
-- Name: historial_notificaciones historial_notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_notificaciones
    ADD CONSTRAINT historial_notificaciones_pkey PRIMARY KEY (id_notificacion);


--
-- Name: horario_asignado horario_asignado_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_pkey PRIMARY KEY (id_asignacion);


--
-- Name: periodo_academico periodo_academico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodo_academico
    ADD CONSTRAINT periodo_academico_pkey PRIMARY KEY (id_periodo);


--
-- Name: preasignacion preasignacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion
    ADD CONSTRAINT preasignacion_pkey PRIMARY KEY (id_preasignacion);


--
-- Name: preferencias_notificacion_docente preferencias_notificacion_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion_docente
    ADD CONSTRAINT preferencias_notificacion_docente_pkey PRIMARY KEY (id_preferencia);


--
-- Name: restriccion_institucional restriccion_institucional_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restriccion_institucional
    ADD CONSTRAINT restriccion_institucional_pkey PRIMARY KEY (id_restriccion);


--
-- Name: seleccion_temporal_horario seleccion_temporal_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario
    ADD CONSTRAINT seleccion_temporal_horario_pkey PRIMARY KEY (id_seleccion);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: ventana_atencion ventana_atencion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventana_atencion
    ADD CONSTRAINT ventana_atencion_pkey PRIMARY KEY (id_ventana);


--
-- Name: ambiente_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ambiente_codigo_key ON public.ambiente USING btree (codigo);


--
-- Name: citacion_docente_estado_notificacion_enviada_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX citacion_docente_estado_notificacion_enviada_idx ON public.citacion_docente USING btree (estado, notificacion_enviada);


--
-- Name: citacion_docente_fecha_citacion_hora_inicio_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX citacion_docente_fecha_citacion_hora_inicio_idx ON public.citacion_docente USING btree (fecha_citacion, hora_inicio);


--
-- Name: citacion_docente_id_docente_id_periodo_id_ventana_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX citacion_docente_id_docente_id_periodo_id_ventana_key ON public.citacion_docente USING btree (id_docente, id_periodo, id_ventana);


--
-- Name: cola_notificaciones_fecha_programada_estado_prioridad_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cola_notificaciones_fecha_programada_estado_prioridad_idx ON public.cola_notificaciones USING btree (fecha_programada, estado, prioridad);


--
-- Name: configuracion_notificaciones_tipo_notificacion_canal_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX configuracion_notificaciones_tipo_notificacion_canal_key ON public.configuracion_notificaciones USING btree (tipo_notificacion, canal);


--
-- Name: configuracion_turnos_atencion_id_ventana_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX configuracion_turnos_atencion_id_ventana_key ON public.configuracion_turnos_atencion USING btree (id_ventana);


--
-- Name: curso_ambiente_id_curso_id_ambiente_tipo_clase_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX curso_ambiente_id_curso_id_ambiente_tipo_clase_key ON public.curso_ambiente USING btree (id_curso, id_ambiente, tipo_clase);


--
-- Name: curso_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX curso_codigo_key ON public.curso USING btree (codigo);


--
-- Name: dia_no_laborable_fecha_id_periodo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX dia_no_laborable_fecha_id_periodo_key ON public.dia_no_laborable USING btree (fecha, id_periodo);


--
-- Name: disponibilidad_docente_id_docente_dia_semana_hora_inicio_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX disponibilidad_docente_id_docente_dia_semana_hora_inicio_id_key ON public.disponibilidad_docente USING btree (id_docente, dia_semana, hora_inicio, id_periodo);


--
-- Name: disponibilidad_docente_registro_id_docente_id_fase_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX disponibilidad_docente_registro_id_docente_id_fase_key ON public.disponibilidad_docente_registro USING btree (id_docente, id_fase);


--
-- Name: docente_codigo_docente_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX docente_codigo_docente_key ON public.docente USING btree (codigo_docente);


--
-- Name: docente_curso_id_docente_id_curso_tipo_clase_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX docente_curso_id_docente_id_curso_tipo_clase_key ON public.docente_curso USING btree (id_docente, id_curso, tipo_clase);


--
-- Name: docente_grupo_id_docente_id_grupo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX docente_grupo_id_docente_id_grupo_key ON public.docente_grupo USING btree (id_docente, id_grupo);


--
-- Name: docente_id_usuario_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX docente_id_usuario_key ON public.docente USING btree (id_usuario);


--
-- Name: fase_disponibilidad_id_periodo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fase_disponibilidad_id_periodo_key ON public.fase_disponibilidad USING btree (id_periodo);


--
-- Name: grupo_id_curso_codigo_grupo_id_periodo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX grupo_id_curso_codigo_grupo_id_periodo_key ON public.grupo USING btree (id_curso, codigo_grupo, id_periodo);


--
-- Name: historial_notificaciones_estado_envio_fecha_creacion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX historial_notificaciones_estado_envio_fecha_creacion_idx ON public.historial_notificaciones USING btree (estado_envio, fecha_creacion);


--
-- Name: historial_notificaciones_id_docente_fecha_creacion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX historial_notificaciones_id_docente_fecha_creacion_idx ON public.historial_notificaciones USING btree (id_docente, fecha_creacion DESC);


--
-- Name: periodo_academico_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX periodo_academico_codigo_key ON public.periodo_academico USING btree (codigo);


--
-- Name: preferencias_notificacion_docente_id_docente_canal_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX preferencias_notificacion_docente_id_docente_canal_key ON public.preferencias_notificacion_docente USING btree (id_docente, canal);


--
-- Name: seleccion_temporal_horario_fecha_expiracion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX seleccion_temporal_horario_fecha_expiracion_idx ON public.seleccion_temporal_horario USING btree (fecha_expiracion);


--
-- Name: seleccion_temporal_horario_sesion_id_dia_semana_hora_inicio_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX seleccion_temporal_horario_sesion_id_dia_semana_hora_inicio_key ON public.seleccion_temporal_horario USING btree (sesion_id, dia_semana, hora_inicio);


--
-- Name: usuario_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuario_codigo_key ON public.usuario USING btree (codigo);


--
-- Name: usuario_correo_electronico_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuario_correo_electronico_key ON public.usuario USING btree (correo_electronico);


--
-- Name: ventana_atencion_id_periodo_orden_prioridad_modalidad_categ_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ventana_atencion_id_periodo_orden_prioridad_modalidad_categ_key ON public.ventana_atencion USING btree (id_periodo, orden_prioridad, modalidad, categoria);


--
-- Name: auditoria_horario auditoria_horario_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_horario
    ADD CONSTRAINT auditoria_horario_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.horario_asignado(id_asignacion) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: auditoria_horario auditoria_horario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_horario
    ADD CONSTRAINT auditoria_horario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: citacion_docente citacion_docente_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citacion_docente
    ADD CONSTRAINT citacion_docente_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: citacion_docente citacion_docente_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citacion_docente
    ADD CONSTRAINT citacion_docente_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: citacion_docente citacion_docente_id_ventana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citacion_docente
    ADD CONSTRAINT citacion_docente_id_ventana_fkey FOREIGN KEY (id_ventana) REFERENCES public.ventana_atencion(id_ventana) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cola_notificaciones cola_notificaciones_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cola_notificaciones
    ADD CONSTRAINT cola_notificaciones_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: configuracion_turnos_atencion configuracion_turnos_atencion_id_ventana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_turnos_atencion
    ADD CONSTRAINT configuracion_turnos_atencion_id_ventana_fkey FOREIGN KEY (id_ventana) REFERENCES public.ventana_atencion(id_ventana) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conflicto_horario conflicto_horario_id_ambiente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_id_ambiente_fkey FOREIGN KEY (id_ambiente) REFERENCES public.ambiente(id_ambiente) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conflicto_horario conflicto_horario_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conflicto_horario conflicto_horario_id_docente_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_id_docente_1_fkey FOREIGN KEY (id_docente_1) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conflicto_horario conflicto_horario_id_docente_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_id_docente_2_fkey FOREIGN KEY (id_docente_2) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conflicto_horario conflicto_horario_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: conflicto_horario conflicto_horario_resuelto_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conflicto_horario
    ADD CONSTRAINT conflicto_horario_resuelto_por_fkey FOREIGN KEY (resuelto_por) REFERENCES public.usuario(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: curso_ambiente curso_ambiente_id_ambiente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_ambiente
    ADD CONSTRAINT curso_ambiente_id_ambiente_fkey FOREIGN KEY (id_ambiente) REFERENCES public.ambiente(id_ambiente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: curso_ambiente curso_ambiente_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_ambiente
    ADD CONSTRAINT curso_ambiente_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dia_no_laborable dia_no_laborable_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dia_no_laborable
    ADD CONSTRAINT dia_no_laborable_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disponibilidad_docente disponibilidad_docente_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente
    ADD CONSTRAINT disponibilidad_docente_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disponibilidad_docente disponibilidad_docente_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente
    ADD CONSTRAINT disponibilidad_docente_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disponibilidad_docente_registro disponibilidad_docente_registro_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente_registro
    ADD CONSTRAINT disponibilidad_docente_registro_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disponibilidad_docente_registro disponibilidad_docente_registro_id_fase_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad_docente_registro
    ADD CONSTRAINT disponibilidad_docente_registro_id_fase_fkey FOREIGN KEY (id_fase) REFERENCES public.fase_disponibilidad(id_fase_disponibilidad) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docente_curso docente_curso_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_curso
    ADD CONSTRAINT docente_curso_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docente_curso docente_curso_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_curso
    ADD CONSTRAINT docente_curso_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docente_grupo docente_grupo_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_grupo
    ADD CONSTRAINT docente_grupo_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docente_grupo docente_grupo_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_grupo
    ADD CONSTRAINT docente_grupo_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupo(id_grupo) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docente docente_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fase_disponibilidad fase_disponibilidad_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fase_disponibilidad
    ADD CONSTRAINT fase_disponibilidad_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grupo grupo_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grupo grupo_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: historial_notificaciones historial_notificaciones_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_notificaciones
    ADD CONSTRAINT historial_notificaciones_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: horario_asignado horario_asignado_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuario(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: horario_asignado horario_asignado_id_ambiente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_id_ambiente_fkey FOREIGN KEY (id_ambiente) REFERENCES public.ambiente(id_ambiente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: horario_asignado horario_asignado_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: horario_asignado horario_asignado_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: horario_asignado horario_asignado_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupo(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: horario_asignado horario_asignado_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: horario_asignado horario_asignado_id_ventana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horario_asignado
    ADD CONSTRAINT horario_asignado_id_ventana_fkey FOREIGN KEY (id_ventana) REFERENCES public.ventana_atencion(id_ventana) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: preasignacion preasignacion_id_ambiente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion
    ADD CONSTRAINT preasignacion_id_ambiente_fkey FOREIGN KEY (id_ambiente) REFERENCES public.ambiente(id_ambiente) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: preasignacion preasignacion_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion
    ADD CONSTRAINT preasignacion_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: preasignacion preasignacion_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion
    ADD CONSTRAINT preasignacion_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: preasignacion preasignacion_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion
    ADD CONSTRAINT preasignacion_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupo(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: preasignacion preasignacion_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preasignacion
    ADD CONSTRAINT preasignacion_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: preferencias_notificacion_docente preferencias_notificacion_docente_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion_docente
    ADD CONSTRAINT preferencias_notificacion_docente_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: restriccion_institucional restriccion_institucional_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restriccion_institucional
    ADD CONSTRAINT restriccion_institucional_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: seleccion_temporal_horario seleccion_temporal_horario_id_ambiente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario
    ADD CONSTRAINT seleccion_temporal_horario_id_ambiente_fkey FOREIGN KEY (id_ambiente) REFERENCES public.ambiente(id_ambiente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: seleccion_temporal_horario seleccion_temporal_horario_id_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario
    ADD CONSTRAINT seleccion_temporal_horario_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: seleccion_temporal_horario seleccion_temporal_horario_id_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario
    ADD CONSTRAINT seleccion_temporal_horario_id_docente_fkey FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: seleccion_temporal_horario seleccion_temporal_horario_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario
    ADD CONSTRAINT seleccion_temporal_horario_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupo(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: seleccion_temporal_horario seleccion_temporal_horario_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seleccion_temporal_horario
    ADD CONSTRAINT seleccion_temporal_horario_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ventana_atencion ventana_atencion_id_periodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventana_atencion
    ADD CONSTRAINT ventana_atencion_id_periodo_fkey FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

