
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UsuarioScalarFieldEnum = {
  id_usuario: 'id_usuario',
  codigo: 'codigo',
  nombres: 'nombres',
  apellidos: 'apellidos',
  correo_electronico: 'correo_electronico',
  contrasena_hash: 'contrasena_hash',
  rol: 'rol',
  activo: 'activo',
  ultimo_acceso: 'ultimo_acceso',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.PeriodoAcademicoScalarFieldEnum = {
  id_periodo: 'id_periodo',
  codigo: 'codigo',
  nombre: 'nombre',
  anio: 'anio',
  semestre: 'semestre',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  fecha_inicio_clases: 'fecha_inicio_clases',
  fecha_fin_clases: 'fecha_fin_clases',
  activo: 'activo',
  estado: 'estado',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.DocenteScalarFieldEnum = {
  id_docente: 'id_docente',
  id_usuario: 'id_usuario',
  codigo_docente: 'codigo_docente',
  nombres: 'nombres',
  apellidos: 'apellidos',
  modalidad: 'modalidad',
  categoria: 'categoria',
  dedicacion: 'dedicacion',
  antiguedad: 'antiguedad',
  fecha_ingreso: 'fecha_ingreso',
  correo_electronico: 'correo_electronico',
  telefono: 'telefono',
  grado_academico: 'grado_academico',
  especialidad: 'especialidad',
  horas_maximas_semanales: 'horas_maximas_semanales',
  activo: 'activo',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion',
  direccion: 'direccion',
  disponibilidad: 'disponibilidad',
  escuela_profesional: 'escuela_profesional',
  foto_perfil: 'foto_perfil',
  perfil_completo: 'perfil_completo',
  horas_totales_asignadas: 'horas_totales_asignadas'
};

exports.Prisma.CursoScalarFieldEnum = {
  id_curso: 'id_curso',
  codigo: 'codigo',
  nombre: 'nombre',
  horas_teoria: 'horas_teoria',
  horas_laboratorio: 'horas_laboratorio',
  horas_practica: 'horas_practica',
  creditos: 'creditos',
  ciclo: 'ciclo',
  plan_estudios: 'plan_estudios',
  prerequisitos: 'prerequisitos',
  activo: 'activo',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.DocenteCursoScalarFieldEnum = {
  id_docente_curso: 'id_docente_curso',
  id_docente: 'id_docente',
  id_curso: 'id_curso',
  tipo_clase: 'tipo_clase',
  experiencia_anios: 'experiencia_anios',
  prioridad: 'prioridad',
  activo: 'activo',
  fecha_asignacion: 'fecha_asignacion',
  horas_asignadas: 'horas_asignadas'
};

exports.Prisma.DocenteGrupoScalarFieldEnum = {
  id_docente_grupo: 'id_docente_grupo',
  id_docente: 'id_docente',
  id_grupo: 'id_grupo',
  activo: 'activo',
  fecha_asignacion: 'fecha_asignacion'
};

exports.Prisma.GrupoScalarFieldEnum = {
  id_grupo: 'id_grupo',
  id_curso: 'id_curso',
  id_periodo: 'id_periodo',
  codigo_grupo: 'codigo_grupo',
  capacidad_maxima: 'capacidad_maxima',
  cantidad_matriculados: 'cantidad_matriculados',
  activo: 'activo',
  observaciones: 'observaciones',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.AmbienteScalarFieldEnum = {
  id_ambiente: 'id_ambiente',
  codigo: 'codigo',
  nombre: 'nombre',
  tipo: 'tipo',
  capacidad: 'capacidad',
  piso: 'piso',
  pabellon: 'pabellon',
  equipamiento: 'equipamiento',
  caracteristicas: 'caracteristicas',
  activo: 'activo',
  requiere_mantenimiento: 'requiere_mantenimiento',
  observaciones: 'observaciones',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.CursoAmbienteScalarFieldEnum = {
  id_curso_ambiente: 'id_curso_ambiente',
  id_curso: 'id_curso',
  id_ambiente: 'id_ambiente',
  tipo_clase: 'tipo_clase'
};

exports.Prisma.VentanaAtencionScalarFieldEnum = {
  id_ventana: 'id_ventana',
  id_periodo: 'id_periodo',
  fecha: 'fecha',
  orden_prioridad: 'orden_prioridad',
  modalidad: 'modalidad',
  categoria: 'categoria',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  intervalo_minutos: 'intervalo_minutos',
  cantidad_docentes: 'cantidad_docentes',
  cantidad_atendidos: 'cantidad_atendidos',
  completado: 'completado',
  activo: 'activo',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.HorarioAsignadoScalarFieldEnum = {
  id_asignacion: 'id_asignacion',
  id_docente: 'id_docente',
  id_curso: 'id_curso',
  id_grupo: 'id_grupo',
  tipo_clase: 'tipo_clase',
  id_ambiente: 'id_ambiente',
  dia_semana: 'dia_semana',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  id_periodo: 'id_periodo',
  id_ventana: 'id_ventana',
  estado: 'estado',
  observaciones: 'observaciones',
  creado_por: 'creado_por',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.SeleccionTemporalHorarioScalarFieldEnum = {
  id_seleccion: 'id_seleccion',
  id_docente: 'id_docente',
  id_curso: 'id_curso',
  id_grupo: 'id_grupo',
  tipo_clase: 'tipo_clase',
  id_ambiente: 'id_ambiente',
  dia_semana: 'dia_semana',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  id_periodo: 'id_periodo',
  sesion_id: 'sesion_id',
  fecha_seleccion: 'fecha_seleccion',
  fecha_expiracion: 'fecha_expiracion'
};

exports.Prisma.DisponibilidadDocenteScalarFieldEnum = {
  id_disponibilidad: 'id_disponibilidad',
  id_docente: 'id_docente',
  id_periodo: 'id_periodo',
  dia_semana: 'dia_semana',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  disponible: 'disponible',
  es_restriccion: 'es_restriccion',
  motivo_restriccion: 'motivo_restriccion',
  fecha_registro: 'fecha_registro'
};

exports.Prisma.RestriccionInstitucionalScalarFieldEnum = {
  id_restriccion: 'id_restriccion',
  tipo_restriccion: 'tipo_restriccion',
  nombre: 'nombre',
  configuracion: 'configuracion',
  id_periodo: 'id_periodo',
  activo: 'activo',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.DiaNoLaborableScalarFieldEnum = {
  id_dia_no_laborable: 'id_dia_no_laborable',
  fecha: 'fecha',
  descripcion: 'descripcion',
  tipo: 'tipo',
  afecta_clases: 'afecta_clases',
  id_periodo: 'id_periodo'
};

exports.Prisma.PreasignacionScalarFieldEnum = {
  id_preasignacion: 'id_preasignacion',
  id_docente: 'id_docente',
  id_curso: 'id_curso',
  id_grupo: 'id_grupo',
  tipo_clase: 'tipo_clase',
  id_ambiente: 'id_ambiente',
  dia_semana: 'dia_semana',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  id_periodo: 'id_periodo',
  estado: 'estado',
  observaciones: 'observaciones',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.ConflictoHorarioScalarFieldEnum = {
  id_conflicto: 'id_conflicto',
  id_periodo: 'id_periodo',
  tipo_conflicto: 'tipo_conflicto',
  descripcion: 'descripcion',
  id_docente_1: 'id_docente_1',
  id_docente_2: 'id_docente_2',
  id_curso: 'id_curso',
  id_ambiente: 'id_ambiente',
  dia_semana: 'dia_semana',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  resuelto: 'resuelto',
  fecha_deteccion: 'fecha_deteccion',
  fecha_resolucion: 'fecha_resolucion',
  resuelto_por: 'resuelto_por'
};

exports.Prisma.AuditoriaHorarioScalarFieldEnum = {
  id_auditoria: 'id_auditoria',
  id_asignacion: 'id_asignacion',
  accion: 'accion',
  usuario_id: 'usuario_id',
  datos_anteriores: 'datos_anteriores',
  datos_nuevos: 'datos_nuevos',
  direccion_ip: 'direccion_ip',
  motivo: 'motivo',
  fecha_registro: 'fecha_registro'
};

exports.Prisma.ConfiguracionNotificacionesScalarFieldEnum = {
  id_configuracion: 'id_configuracion',
  tipo_notificacion: 'tipo_notificacion',
  canal: 'canal',
  activo: 'activo',
  plantilla_mensaje: 'plantilla_mensaje',
  hora_envio: 'hora_envio',
  dias_antelacion: 'dias_antelacion',
  minutos_antelacion: 'minutos_antelacion',
  configuracion_adicional: 'configuracion_adicional',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.PreferenciasNotificacionDocenteScalarFieldEnum = {
  id_preferencia: 'id_preferencia',
  id_docente: 'id_docente',
  canal: 'canal',
  activo: 'activo',
  datos_contacto: 'datos_contacto',
  verificado: 'verificado',
  fecha_verificacion: 'fecha_verificacion',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.HistorialNotificacionesScalarFieldEnum = {
  id_notificacion: 'id_notificacion',
  id_docente: 'id_docente',
  id_ventana: 'id_ventana',
  tipo_notificacion: 'tipo_notificacion',
  canal: 'canal',
  mensaje: 'mensaje',
  estado_envio: 'estado_envio',
  fecha_envio: 'fecha_envio',
  fecha_entrega: 'fecha_entrega',
  codigo_respuesta: 'codigo_respuesta',
  respuesta_servidor: 'respuesta_servidor',
  intentos: 'intentos',
  fecha_creacion: 'fecha_creacion'
};

exports.Prisma.ColaNotificacionesScalarFieldEnum = {
  id_cola: 'id_cola',
  id_docente: 'id_docente',
  tipo_notificacion: 'tipo_notificacion',
  canal: 'canal',
  datos_mensaje: 'datos_mensaje',
  fecha_programada: 'fecha_programada',
  prioridad: 'prioridad',
  estado: 'estado',
  intentos: 'intentos',
  maximo_intentos: 'maximo_intentos',
  fecha_creacion: 'fecha_creacion',
  fecha_procesamiento: 'fecha_procesamiento'
};

exports.Prisma.FaseDisponibilidadScalarFieldEnum = {
  id_fase_disponibilidad: 'id_fase_disponibilidad',
  id_periodo: 'id_periodo',
  estado: 'estado',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  bloques_tiempo: 'bloques_tiempo',
  instrucciones: 'instrucciones',
  activo: 'activo',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.DisponibilidadDocenteRegistroScalarFieldEnum = {
  id_registro: 'id_registro',
  id_docente: 'id_docente',
  id_fase: 'id_fase',
  matriz_disponibilidad: 'matriz_disponibilidad',
  bloques_preferidos: 'bloques_preferidos',
  notas: 'notas',
  completado: 'completado',
  fecha_registro: 'fecha_registro',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.CitacionDocenteScalarFieldEnum = {
  id_citacion: 'id_citacion',
  id_docente: 'id_docente',
  id_periodo: 'id_periodo',
  id_ventana: 'id_ventana',
  fecha_citacion: 'fecha_citacion',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  numero_orden_turno: 'numero_orden_turno',
  estado: 'estado',
  confirmado_docente: 'confirmado_docente',
  fecha_confirmacion: 'fecha_confirmacion',
  razon_rechazo: 'razon_rechazo',
  observaciones: 'observaciones',
  notificacion_enviada: 'notificacion_enviada',
  recordatorio_enviado: 'recordatorio_enviado',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.ConfiguracionTurnosAtencionScalarFieldEnum = {
  id_configuracion: 'id_configuracion',
  id_ventana: 'id_ventana',
  minutos_por_turno: 'minutos_por_turno',
  cantidad_turnos: 'cantidad_turnos',
  permitir_reprogramacion: 'permitir_reprogramacion',
  dias_previos_minimo: 'dias_previos_minimo',
  activo: 'activo',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.HistorialCitacionScalarFieldEnum = {
  id_historial: 'id_historial',
  id_citacion: 'id_citacion',
  accion: 'accion',
  estado_anterior: 'estado_anterior',
  estado_nuevo: 'estado_nuevo',
  cambios: 'cambios',
  razon: 'razon',
  usuario_id: 'usuario_id',
  fecha_registro: 'fecha_registro'
};

exports.Prisma.ConfiguracionSistemaScalarFieldEnum = {
  id_configuracion: 'id_configuracion',
  bloques_horarios: 'bloques_horarios',
  duracion_bloque: 'duracion_bloque',
  hora_inicio: 'hora_inicio',
  hora_fin: 'hora_fin',
  max_horas_docente: 'max_horas_docente',
  min_horas_entre_clases: 'min_horas_entre_clases',
  permitir_clases_seguidas: 'permitir_clases_seguidas',
  validar_capacidad_ambiente: 'validar_capacidad_ambiente',
  fecha_creacion: 'fecha_creacion',
  fecha_actualizacion: 'fecha_actualizacion'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.TipoRol = exports.$Enums.TipoRol = {
  administrador_sistema: 'administrador_sistema',
  director_escuela: 'director_escuela',
  coordinador_academico: 'coordinador_academico',
  operador_horarios: 'operador_horarios',
  docente: 'docente'
};

exports.EstadoPeriodo = exports.$Enums.EstadoPeriodo = {
  planificacion: 'planificacion',
  asignacion_horarios: 'asignacion_horarios',
  en_curso: 'en_curso',
  finalizado: 'finalizado'
};

exports.TipoModalidad = exports.$Enums.TipoModalidad = {
  nombrado: 'nombrado',
  contratado: 'contratado'
};

exports.TipoCategoria = exports.$Enums.TipoCategoria = {
  principal: 'principal',
  asociado: 'asociado',
  auxiliar: 'auxiliar',
  jefe_practica: 'jefe_practica'
};

exports.TipoDedicacion = exports.$Enums.TipoDedicacion = {
  tiempo_completo: 'tiempo_completo',
  tiempo_parcial: 'tiempo_parcial',
  por_horas: 'por_horas'
};

exports.TipoClase = exports.$Enums.TipoClase = {
  teoria: 'teoria',
  laboratorio: 'laboratorio',
  practica: 'practica'
};

exports.TipoAmbiente = exports.$Enums.TipoAmbiente = {
  aula: 'aula',
  laboratorio: 'laboratorio',
  auditorio: 'auditorio',
  sala_reuniones: 'sala_reuniones'
};

exports.EstadoHorario = exports.$Enums.EstadoHorario = {
  borrador: 'borrador',
  solicitado: 'solicitado',
  aprobado: 'aprobado',
  confirmado: 'confirmado',
  publicado: 'publicado',
  modificado: 'modificado',
  cancelado: 'cancelado'
};

exports.TipoDiaNoLaborable = exports.$Enums.TipoDiaNoLaborable = {
  feriado_nacional: 'feriado_nacional',
  feriado_local: 'feriado_local',
  mantenimiento: 'mantenimiento',
  institucional: 'institucional',
  duelo: 'duelo'
};

exports.EstadoPreasignacion = exports.$Enums.EstadoPreasignacion = {
  pendiente: 'pendiente',
  confirmada: 'confirmada',
  cancelada: 'cancelada'
};

exports.TipoConflicto = exports.$Enums.TipoConflicto = {
  cruce_docente: 'cruce_docente',
  cruce_grupo: 'cruce_grupo',
  cruce_ambiente: 'cruce_ambiente',
  exceso_horas_docente: 'exceso_horas_docente',
  ambiente_no_disponible: 'ambiente_no_disponible',
  fuera_franja: 'fuera_franja'
};

exports.AccionAuditoria = exports.$Enums.AccionAuditoria = {
  crear: 'crear',
  modificar: 'modificar',
  eliminar: 'eliminar',
  confirmar: 'confirmar',
  publicar: 'publicar',
  cancelar: 'cancelar',
  reasignar: 'reasignar'
};

exports.CanalNotificacion = exports.$Enums.CanalNotificacion = {
  correo: 'correo',
  whatsapp: 'whatsapp',
  telegram: 'telegram'
};

exports.EstadoEnvio = exports.$Enums.EstadoEnvio = {
  pendiente: 'pendiente',
  enviado: 'enviado',
  entregado: 'entregado',
  leido: 'leido',
  fallido: 'fallido',
  rebotado: 'rebotado'
};

exports.EstadoCola = exports.$Enums.EstadoCola = {
  pendiente: 'pendiente',
  procesando: 'procesando',
  completado: 'completado',
  fallido: 'fallido'
};

exports.EstadoFaseDisponibilidad = exports.$Enums.EstadoFaseDisponibilidad = {
  no_iniciada: 'no_iniciada',
  abierta: 'abierta',
  cerrada: 'cerrada',
  procesada: 'procesada'
};

exports.EstadoCitacion = exports.$Enums.EstadoCitacion = {
  programada: 'programada',
  confirmada_docente: 'confirmada_docente',
  rechazada: 'rechazada',
  completada: 'completada',
  cancelada: 'cancelada'
};

exports.Prisma.ModelName = {
  Usuario: 'Usuario',
  PeriodoAcademico: 'PeriodoAcademico',
  Docente: 'Docente',
  Curso: 'Curso',
  DocenteCurso: 'DocenteCurso',
  DocenteGrupo: 'DocenteGrupo',
  Grupo: 'Grupo',
  Ambiente: 'Ambiente',
  CursoAmbiente: 'CursoAmbiente',
  VentanaAtencion: 'VentanaAtencion',
  HorarioAsignado: 'HorarioAsignado',
  SeleccionTemporalHorario: 'SeleccionTemporalHorario',
  DisponibilidadDocente: 'DisponibilidadDocente',
  RestriccionInstitucional: 'RestriccionInstitucional',
  DiaNoLaborable: 'DiaNoLaborable',
  Preasignacion: 'Preasignacion',
  ConflictoHorario: 'ConflictoHorario',
  AuditoriaHorario: 'AuditoriaHorario',
  ConfiguracionNotificaciones: 'ConfiguracionNotificaciones',
  PreferenciasNotificacionDocente: 'PreferenciasNotificacionDocente',
  HistorialNotificaciones: 'HistorialNotificaciones',
  ColaNotificaciones: 'ColaNotificaciones',
  FaseDisponibilidad: 'FaseDisponibilidad',
  DisponibilidadDocenteRegistro: 'DisponibilidadDocenteRegistro',
  CitacionDocente: 'CitacionDocente',
  ConfiguracionTurnosAtencion: 'ConfiguracionTurnosAtencion',
  HistorialCitacion: 'HistorialCitacion',
  ConfiguracionSistema: 'ConfiguracionSistema'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
