// =============================================
// CONSTANTES DEL SISTEMA
// =============================================

// Horarios
export const FRANJA_INICIO = '07:00';
export const FRANJA_FIN = '22:00';
export const HORA_ALMUERZO_INICIO = '12:00';
export const HORA_ALMUERZO_FIN = '13:00';
export const MAX_HORAS_DIARIAS_DOCENTE = 8;
export const INTERVALO_BLOQUES_MINUTOS = 60;

// Días de la semana
export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DIAS_SEMANA_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Modalidades
export const MODALIDADES = {
  nombrado: 'Nombrado',
  contratado: 'Contratado',
};

// Categorías
export const CATEGORIAS = {
  principal: 'Principal',
  asociado: 'Asociado',
  auxiliar: 'Auxiliar',
  jefe_practica: 'Jefe de Práctica',
};

// Tipos de clase
export const TIPOS_CLASE = {
  teoria: 'Teoría',
  laboratorio: 'Laboratorio',
  practica: 'Práctica',
};

// Tipos de ambiente
export const TIPOS_AMBIENTE = {
  aula: 'Aula',
  laboratorio: 'Laboratorio',
  auditorio: 'Auditorio',
  sala_reuniones: 'Sala de Reuniones',
};

// Estados de horario
export const ESTADOS_HORARIO = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  publicado: 'Publicado',
  modificado: 'Modificado',
  cancelado: 'Cancelado',
};

// Roles de usuario
export const ROLES = {
  administrador_sistema: 'Administrador del Sistema',
  director_escuela: 'Director de Escuela',
  coordinador_academico: 'Coordinador Académico',
  operador_horarios: 'Operador de Horarios',
  docente: 'Docente',
};

// Canales de notificación
export const CANALES_NOTIFICACION = {
  correo: 'Correo Electrónico',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

// Estados de envío
export const ESTADOS_ENVIO = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  entregado: 'Entregado',
  leido: 'Leído',
  fallido: 'Fallido',
  rebotado: 'Rebotado',
};

// Tipos de conflicto
export const TIPOS_CONFLICTO = {
  CRUCE_DOCENTE: 'Cruce de Horario del Docente',
  CRUCE_GRUPO: 'Cruce de Horario del Grupo',
  OCUPACION_AMBIENTE: 'Ambiente Ocupado',
  FUERA_FRANJA: 'Fuera de Franja Horaria',
  EXCESO_HORAS: 'Exceso de Horas Diarias',
  CURSO_NO_ASIGNABLE: 'Curso No Asignable',
  AMBIENTE_NO_VALIDO: 'Ambiente No Válido',
  HORAS_COMPLETADAS: 'Horas del Curso Completadas',
};

// Colores para estados
export const COLORES_ESTADO = {
  disponible: '#4caf50',
  ocupado: '#f44336',
  seleccionado_mio: '#2196f3',
  bloqueado_institucional: '#ff9800',
};

// Límites de paginación
export const ITEMS_POR_PAGINA = 10;
export const MAX_ITEMS_POR_PAGINA = 100;

// Tiempos de expiración (en minutos)
export const TIEMPO_EXPIRACION_SELECCION_TEMPORAL = 30;
export const TIEMPO_EXPIRACION_SESION = 480; // 8 horas

// Intentos de reintento
export const MAX_INTENTOS_NOTIFICACION = 3;

// Prioridades
export const PRIORIDADES_NOTIFICACION = {
  CRITICA: 1,
  ALTA: 2,
  MEDIA: 5,
  BAJA: 10,
};

// Configuración de validación
export const CONFIG_VALIDACION = {
  MIN_ANTIGUEDAD: 0,
  MAX_ANTIGUEDAD: 50,
  MIN_CREDITOS: 1,
  MAX_CREDITOS: 8,
  MIN_CAPACIDAD_AULA: 10,
  MAX_CAPACIDAD_AULA: 200,
};

// Mensajes de validación
export const MENSAJES_VALIDACION = {
  CAMPO_REQUERIDO: 'Este campo es requerido',
  EMAIL_INVALIDO: 'Correo electrónico no válido',
  TELEFONO_INVALIDO: 'Número de teléfono no válido',
  CONTRASENA_DEBIL: 'La contraseña debe tener al menos 8 caracteres',
  FECHA_INVALIDA: 'Fecha no válida',
  HORA_INVALIDA: 'Hora no válida',
};

// Patrones de validación
export const PATRONES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONO_PERU: /^(\+51)?[9]\d{8}$/,
  CODIGO_DOCENTE: /^DOC-\d{3,4}$/,
  CODIGO_CURSO: /^[A-Z]{3}-\d{3}$/,
};

// Información institucional
export const INFO_INSTITUCION = {
  NOMBRE_UNIVERSIDAD: 'Universidad Nacional de Trujillo',
  NOMBRE_ESCUELA: 'Escuela de Ingeniería de Sistemas',
  NOMBRE_FACULTAD: 'Facultad de Ingeniería',
  TELEFONO: '(044) 123456',
  EMAIL: 'sistemas@unitru.edu.pe',
  DIRECCION: 'Av. Juan Pablo II s/n, Trujillo, Perú',
  SITIO_WEB: 'https://www.unitru.edu.pe',
};

// Rutas de navegación
export const RUTAS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/auth/login',
  PERIODOS: '/dashboard/periodos',
  DOCENTES: '/dashboard/docentes',
  CURSOS: '/dashboard/cursos',
  AMBIENTES: '/dashboard/ambientes',
  HORARIOS: '/dashboard/horarios',
  HORARIOS_SELECCION: '/dashboard/horarios/seleccion',
  VENTANAS: '/dashboard/horarios/ventanas',
  REPORTES: '/dashboard/reportes',
  NOTIFICACIONES: '/dashboard/notificaciones',
  CONFIGURACION: '/dashboard/configuracion',
};

// Estados de carga
export const ESTADOS_CARGA = {
  INACTIVO: 'inactivo',
  CARGANDO: 'cargando',
  EXITO: 'exito',
  ERROR: 'error',
};
