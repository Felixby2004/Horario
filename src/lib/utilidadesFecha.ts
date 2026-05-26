export const utilidadesFecha = {
  intervalosPorDefecto: [
    { inicio: '07:00', fin: '08:30' },
    { inicio: '08:30', fin: '10:00' },
    { inicio: '10:00', fin: '11:30' },
    { inicio: '11:30', fin: '13:00' },
    { inicio: '13:00', fin: '14:30' },
    { inicio: '14:30', fin: '16:00' },
    { inicio: '16:00', fin: '17:30' },
    { inicio: '17:30', fin: '19:00' },
    { inicio: '19:00', fin: '20:30' },
    { inicio: '20:30', fin: '22:00' }
  ],

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

  // Obtiene la fecha actual en el timezone de Lima (UTC-5) de forma robusta
  ahoraLima: (): Date => {
    const ahora = new Date();
    const UTC_OFFSET_LIMA = -5;
    const utc = ahora.getTime() + (ahora.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * UTC_OFFSET_LIMA));
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
  },

  generarIntervalosHorarios: (horaInicio: string, horaFin: string, duracionMinutos: number) => {
    const duracionValida = Number(duracionMinutos);
    if (!Number.isFinite(duracionValida) || duracionValida <= 0) {
      return utilidadesFecha.intervalosPorDefecto;
    }

    const intervalos = [];
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    
    let actualMinutos = hIni * 60 + mIni;
    const finMinutos = hFin * 60 + mFin;
    
    while (actualMinutos + duracionMinutos <= finMinutos) {
      const hInicioStr = Math.floor(actualMinutos / 60).toString().padStart(2, '0');
      const mInicioStr = (actualMinutos % 60).toString().padStart(2, '0');
      
      const finIntervaloMinutos = actualMinutos + duracionMinutos;
      const hFinStr = Math.floor(finIntervaloMinutos / 60).toString().padStart(2, '0');
      const mFinStr = (finIntervaloMinutos % 60).toString().padStart(2, '0');
      
      intervalos.push({
        inicio: `${hInicioStr}:${mInicioStr}`,
        fin: `${hFinStr}:${mFinStr}`
      });
      
      actualMinutos += duracionMinutos;
    }

    return intervalos.length > 0 ? intervalos : utilidadesFecha.intervalosPorDefecto;
  }
};
