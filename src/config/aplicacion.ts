export const configuracionAplicacion = {
  nombre: 'Sistema de Gestión de Horarios - UNT',
  version: '1.0.0',
  universidad: 'Universidad Nacional de Trujillo',
  escuela: 'Escuela de Ingeniería de Sistemas',
  
  horarios: {
    bloquesHorarios: 10,
    diasLaborables: 5,
    horaInicio: '07:00',
    horaFin: '22:00',
    duracionBloque: 90, // minutos
  },

  validacion: {
    tiempoExpiracionSeleccion: 300, // 5 minutos en segundos
    maximoHorasPorDocente: 40,
    minimoHorasEntreClases: 0,
  },

  notificaciones: {
    horasAnticipacionRecordatorio: 24,
    minutosAnticipacionAlerta: 15,
    reintentos: 3,
    tiempoEntreReintentos: 60, // segundos
  },

  cache: {
    ttlEstadisticas: 300, // 5 minutos
    ttlDisponibilidad: 60, // 1 minuto
  },

  paginacion: {
    itemsPorPagina: 20,
    maximoItems: 100,
  },

  auth: {
    expiracionToken: '8h',
    longitudMinimaPassword: 8,
  }
};
