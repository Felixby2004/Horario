// Utilidades para generación de reportes
export const tiposReporte = {
  AULA: 'aula',
  LABORATORIO: 'laboratorio',
  DOCENTE_HORARIO: 'docente_horario',
  DOCENTE_CARGA: 'docente_carga',
  GESTION: 'gestion'
};

export const formatosReporte = {
  PDF: 'pdf',
  EXCEL: 'excel'
};

export const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export function obtenerNombreDia(numero: number): string {
  return diasSemana[numero - 1] || 'Desconocido';
}

export function calcularHoras(horaInicio: string, horaFin: string): number {
  const [horaI, minI] = horaInicio.split(':').map(Number);
  const [horaF, minF] = horaFin.split(':').map(Number);
  const minutos = (horaF * 60 + minF) - (horaI * 60 + minI);
  return minutos / 60;
}

export function formatearHoras(horas: number): string {
  const horasEnteras = Math.floor(horas);
  const minutos = Math.round((horas - horasEnteras) * 60);
  
  if (minutos === 0) {
    return `${horasEnteras} h`;
  }
  return `${horasEnteras}h ${minutos}m`;
}
