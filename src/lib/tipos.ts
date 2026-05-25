// =============================================
// TIPOS GLOBALES DEL SISTEMA
// =============================================

// Tipos de enumeraciones de Prisma exportados
export type {
  TipoRol,
  TipoModalidad,
  TipoCategoria,
  TipoDedicacion,
  TipoClase,
  TipoAmbiente,
  EstadoPeriodo,
  EstadoHorario,
  EstadoPreasignacion,
  TipoConflicto,
  AccionAuditoria,
  CanalNotificacion,
  EstadoEnvio,
  EstadoCola,
  TipoDiaNoLaborable,
} from '@prisma/client';

// =============================================
// INTERFACES DE DATOS
// =============================================

export interface DatosUsuario {
  id_usuario: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string | null;
  rol: string;
  activo: boolean;
}

export interface DatosDocente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  modalidad: string;
  categoria: string;
  antiguedad: number;
  correo_electronico: string | null;
  telefono: string | null;
  activo: boolean;
}

export interface DatosCurso {
  id_curso: number;
  codigo: string;
  nombre: string;
  horas_teoria: number;
  horas_laboratorio: number;
  horas_practica: number;
  creditos: number;
  ciclo: number | null;
  activo: boolean;
}

export interface DatosAmbiente {
  id_ambiente: number;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  piso: string | null;
  pabellon: string | null;
  activo: boolean;
}

export interface DatosGrupo {
  id_grupo: number;
  id_curso: number;
  codigo_grupo: string;
  capacidad_maxima: number;
  cantidad_matriculados: number;
}

// =============================================
// INTERFACES DE HORARIOS
// =============================================

export interface SeleccionCelda {
  sesionId: string;
  docenteId: number;
  cursoId: number;
  grupoId: number;
  tipoClase: 'teoria' | 'laboratorio' | 'practica';
  ambienteId: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  periodoId: number;
}

export interface CeldaHorario {
  dia: number;
  horaInicio: string;
  horaFin: string;
  estado: 'disponible' | 'ocupado' | 'seleccionado_mio' | 'bloqueado_institucional';
  detalle?: string;
}

export interface ResultadoValidacion {
  valido: boolean;
  conflictos: Conflicto[];
  sugerencias?: Sugerencia[];
  tiempoValidacion: number;
}

export interface Conflicto {
  tipo:
    | 'CRUCE_DOCENTE'
    | 'CRUCE_GRUPO'
    | 'OCUPACION_AMBIENTE'
    | 'FUERA_FRANJA'
    | 'EXCESO_HORAS'
    | 'CURSO_NO_ASIGNABLE'
    | 'AMBIENTE_NO_VALIDO'
    | 'HORAS_COMPLETADAS';
  mensaje: string;
  severidad: 'ERROR' | 'ADVERTENCIA';
  detalle?: any;
}

export interface Sugerencia {
  tipo: 'AMBIENTE_ALTERNATIVO' | 'HORARIO_ALTERNATIVO';
  mensaje: string;
  opciones: any[];
}

// =============================================
// INTERFACES DE NOTIFICACIONES
// =============================================

export interface DatosMensaje {
  docenteId: number;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  usernameTelegram?: string;
  chatIdTelegram?: string;
  variables: Record<string, string>;
}

export interface ResultadoEnvio {
  exito: boolean;
  mensajeId?: string;
  codigoRespuesta?: string;
  error?: string;
  fechaEnvio: Date;
}

// =============================================
// INTERFACES DE ESTADÍSTICAS
// =============================================

export interface ResumenPeriodo {
  total_docentes_con_horario: number;
  total_cursos_programados: number;
  total_grupos: number;
  total_ambientes_utilizados: number;
  total_bloques_asignados: number;
  total_horas_asignadas: number;
}

export interface AvanceCategoria {
  modalidad: string;
  categoria: string;
  total_docentes: number;
  docentes_con_horario: number;
  porcentaje_avance: number;
}

export interface OcupacionAmbiente {
  id_ambiente: number;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  bloques_ocupados: number;
  porcentaje_ocupacion: number;
}

export interface EstadisticasDescriptivas {
  promedio_horas_por_docente: number;
  mediana_horas_por_docente: number;
  desviacion_estandar: number;
  minimo_horas: number;
  maximo_horas: number;
  total_horas_periodo: number;
}

// =============================================
// INTERFACES DE VENTANAS DE ATENCIÓN
// =============================================

export interface DocenteEnCola {
  id_docente: number;
  nombres: string;
  apellidos: string;
  modalidad: string;
  categoria: string;
  antiguedad: number;
  estado: 'en_espera' | 'en_atencion' | 'atendido' | 'ausente';
  turno: number;
}

export interface VentanaAtencionDatos {
  id_ventana: number;
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  categoria: string;
  cantidad_docentes: number;
  cantidad_atendidos: number;
  completado: boolean;
}

// =============================================
// INTERFACES DE RESPUESTAS API
// =============================================

export interface RespuestaAPI<T = any> {
  exito: boolean;
  datos?: T;
  mensaje?: string;
  error?: string;
}

export interface RespuestaListaAPI<T = any> {
  exito: boolean;
  datos: T[];
  total: number;
  pagina: number;
  porPagina: number;
}

// =============================================
// TIPOS AUXILIARES
// =============================================

export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6;

export interface FranjaHoraria {
  inicio: string;
  fin: string;
}

export interface OpcionSelector {
  valor: string | number;
  etiqueta: string;
  deshabilitado?: boolean;
}
