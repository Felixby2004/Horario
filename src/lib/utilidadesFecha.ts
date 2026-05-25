export const utilidadesFecha = {
  formatearFecha: (fecha: Date | string): string => {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return f.toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
  },

  formatearHora: (hora: string): string => {
    return hora.substring(0, 5);
  },

  formatearFechaHora: (fecha: Date | string): string => {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return f.toLocaleString('es-PE', { 
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatearFechaLarga: (fecha: Date | string): string => {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return f.toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatearFechaBD: (fecha: Date | string): string => {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return f.toLocaleDateString('es-PE', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Obtiene la fecha actual en el timezone de Lima
  ahoraLima: (): Date => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
  },

  esMismoDia: (fecha1: Date, fecha2: Date): boolean => {
    return (
      fecha1.getFullYear() === fecha2.getFullYear() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getDate() === fecha2.getDate()
    );
  },

  obtenerDiaSemana: (fecha: Date): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
  },

  agregarDias: (fecha: Date, dias: number): Date => {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  },

  diferenciaHoras: (horaInicio: string, horaFin: string): number => {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    return (h2 * 60 + m2 - h1 * 60 - m1) / 60;
  },

  calcularAntiguedad: (fechaIngreso: Date | string | null): number => {
    if (!fechaIngreso) return 0;
    const fIngreso = typeof fechaIngreso === 'string' ? new Date(fechaIngreso) : fechaIngreso;
    const hoy = new Date();
    let antiguedad = hoy.getFullYear() - fIngreso.getFullYear();
    const m = hoy.getMonth() - fIngreso.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fIngreso.getDate())) {
      antiguedad--;
    }
    return Math.max(0, antiguedad);
  }
};
