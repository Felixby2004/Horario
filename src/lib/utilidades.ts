import { DIAS_SEMANA } from './constantes';

// =============================================
// UTILIDADES DE FECHA Y HORA
// =============================================

/**
 * Formatear fecha a string legible
 */
export function formatearFecha(fecha: Date | string): string {
  const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return f.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatear fecha corta
 */
export function formatearFechaCorta(fecha: Date | string): string {
  const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return f.toLocaleDateString('es-PE');
}

/**
 * Formatear hora
 */
export function formatearHora(hora: string): string {
  return hora.substring(0, 5);
}

/**
 * Obtener nombre del día de la semana
 */
export function obtenerNombreDia(diaSemana: number): string {
  return DIAS_SEMANA[diaSemana - 1] || '';
}

/**
 * Calcular duración entre dos horas
 */
export function calcularDuracion(horaInicio: string, horaFin: string): number {
  const [hi, mi] = horaInicio.split(':').map(Number);
  const [hf, mf] = horaFin.split(':').map(Number);
  return (hf - hi) + (mf - mi) / 60;
}

/**
 * Generar franjas horarias
 */
export function generarFranjas(
  inicio: string,
  fin: string,
  intervaloMin: number
): Array<{ inicio: string; fin: string }> {
  const franjas = [];
  let [hora, min] = inicio.split(':').map(Number);
  const [horaFin] = fin.split(':').map(Number);

  while (hora < horaFin) {
    const siguiente = min + intervaloMin >= 60
      ? { h: hora + 1, m: (min + intervaloMin) % 60 }
      : { h: hora, m: min + intervaloMin };

    franjas.push({
      inicio: `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      fin: `${String(siguiente.h).padStart(2, '0')}:${String(siguiente.m).padStart(2, '0')}`,
    });

    hora = siguiente.h;
    min = siguiente.m;
  }

  return franjas;
}

// =============================================
// UTILIDADES DE TEXTO
// =============================================

/**
 * Capitalizar primera letra
 */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Convertir a slug (URL amigable)
 */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncar texto
 */
export function truncar(texto: string, longitudMaxima: number): string {
  if (texto.length <= longitudMaxima) return texto;
  return texto.substring(0, longitudMaxima) + '...';
}

/**
 * Formatear nombre completo
 */
export function formatearNombreCompleto(nombres: string, apellidos: string): string {
  return `${apellidos}, ${nombres}`;
}

// =============================================
// UTILIDADES DE VALIDACIÓN
// =============================================

/**
 * Validar email
 */
export function esEmailValido(email: string): boolean {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(email);
}

/**
 * Validar teléfono peruano
 */
export function esTelefonoValido(telefono: string): boolean {
  const patron = /^(\+51)?[9]\d{8}$/;
  return patron.test(telefono.replace(/\s/g, ''));
}

/**
 * Validar hora
 */
export function esHoraValida(hora: string): boolean {
  const patron = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return patron.test(hora);
}

// =============================================
// UTILIDADES DE NÚMERO
// =============================================

/**
 * Formatear número con separador de miles
 */
export function formatearNumero(numero: number): string {
  return numero.toLocaleString('es-PE');
}

/**
 * Redondear a decimales
 */
export function redondear(numero: number, decimales: number = 2): number {
  return Math.round(numero * Math.pow(10, decimales)) / Math.pow(10, decimales);
}

/**
 * Calcular porcentaje
 */
export function calcularPorcentaje(parte: number, total: number): number {
  if (total === 0) return 0;
  return redondear((parte / total) * 100, 1);
}

// =============================================
// UTILIDADES DE ARRAY
// =============================================

/**
 * Agrupar array por propiedad
 */
export function agruparPor<T>(array: T[], propiedad: keyof T): Record<string, T[]> {
  return array.reduce((grupos, item) => {
    const clave = String(item[propiedad]);
    if (!grupos[clave]) {
      grupos[clave] = [];
    }
    grupos[clave].push(item);
    return grupos;
  }, {} as Record<string, T[]>);
}

/**
 * Ordenar array por múltiples criterios
 */
export function ordenarPor<T>(
  array: T[],
  criterios: Array<{
    propiedad: keyof T;
    direccion?: 'asc' | 'desc';
  }>
): T[] {
  return [...array].sort((a, b) => {
    for (const criterio of criterios) {
      const valorA = a[criterio.propiedad];
      const valorB = b[criterio.propiedad];
      const direccion = criterio.direccion === 'desc' ? -1 : 1;

      if (valorA < valorB) return -1 * direccion;
      if (valorA > valorB) return 1 * direccion;
    }
    return 0;
  });
}

/**
 * Eliminar duplicados de array
 */
export function eliminarDuplicados<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// =============================================
// UTILIDADES DE OBJETO
// =============================================

/**
 * Omitir propiedades de un objeto
 */
export function omitir<T extends object, K extends keyof T>(
  objeto: T,
  ...propiedades: K[]
): Omit<T, K> {
  const resultado = { ...objeto };
  for (const propiedad of propiedades) {
    delete resultado[propiedad];
  }
  return resultado;
}

/**
 * Seleccionar propiedades de un objeto
 */
export function seleccionar<T extends object, K extends keyof T>(
  objeto: T,
  ...propiedades: K[]
): Pick<T, K> {
  const resultado = {} as Pick<T, K>;
  for (const propiedad of propiedades) {
    if (propiedad in objeto) {
      resultado[propiedad] = objeto[propiedad];
    }
  }
  return resultado;
}

// =============================================
// UTILIDADES DE CLASE CSS
// =============================================

/**
 * Combinar clases CSS (similar a clsx)
 */
export function cn(...clases: (string | undefined | null | false)[]): string {
  return clases.filter(Boolean).join(' ');
}

// =============================================
// UTILIDADES DE COLOR
// =============================================

/**
 * Generar color basado en texto
 */
export function generarColorDesdeTexto(texto: string): string {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colores = [
    '#1976d2', '#388e3c', '#d32f2f', '#f57c00',
    '#7b1fa2', '#0097a7', '#689f38', '#c2185b',
  ];
  
  return colores[Math.abs(hash) % colores.length];
}

// =============================================
// UTILIDADES DE DESCARGA
// =============================================

/**
 * Descargar archivo desde el navegador
 */
export function descargarArchivo(contenido: Blob | string, nombreArchivo: string, tipo?: string) {
  const blob = typeof contenido === 'string'
    ? new Blob([contenido], { type: tipo || 'text/plain' })
    : contenido;

  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  window.URL.revokeObjectURL(url);
}

// =============================================
// UTILIDADES DE DELAY
// =============================================

/**
 * Delay (esperar X milisegundos)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================
// UTILIDADES DE DEBOUNCE
// =============================================

/**
 * Debounce de función
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  espera: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), espera);
  };
}
