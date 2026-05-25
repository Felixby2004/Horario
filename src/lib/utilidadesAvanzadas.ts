// Validadores
export const validadores = {
  correo: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  telefono: (telefono: string): boolean => {
    const regex = /^\+?51?\s?9\d{8}$/;
    return regex.test(telefono.replace(/\s/g, ''));
  },

  codigoDocente: (codigo: string): boolean => {
    return /^\d{6,10}$/.test(codigo);
  },

  password: (password: string): boolean => {
    return password.length >= 8;
  },

  rango: (valor: number, min: number, max: number): boolean => {
    return valor >= min && valor <= max;
  },

  horaValida: (hora: string): boolean => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(hora);
  },

  conflictoHorario: (
    inicio1: string,
    fin1: string,
    inicio2: string,
    fin2: string
  ): boolean => {
    return inicio1 < fin2 && inicio2 < fin1;
  }
};

// Formateadores
export const formateadores = {
  moneda: (valor: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  },

  numero: (valor: number, decimales: number = 2): string => {
    return valor.toFixed(decimales);
  },

  porcentaje: (valor: number): string => {
    return `${(valor * 100).toFixed(1)}%`;
  },

  nombreCompleto: (nombres: string, apellidos: string): string => {
    return `${apellidos}, ${nombres}`;
  },

  telefono: (telefono: string): string => {
    const limpio = telefono.replace(/\D/g, '');
    if (limpio.startsWith('51')) {
      return `+51 ${limpio.substring(2, 5)} ${limpio.substring(5, 8)} ${limpio.substring(8)}`;
    }
    return `${limpio.substring(0, 3)} ${limpio.substring(3, 6)} ${limpio.substring(6)}`;
  },

  duracion: (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  },

  rangoHorario: (inicio: string, fin: string): string => {
    return `${inicio.substring(0, 5)} - ${fin.substring(0, 5)}`;
  }
};

// Generador de colores
export const generadorColor = {
  porDocente: (idDocente: number): string => {
    const colores = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
    ];
    return colores[idDocente % colores.length];
  },

  porCategoria: (categoria: string): string => {
    const mapa: Record<string, string> = {
      'principal': '#10B981',
      'asociado': '#3B82F6',
      'auxiliar': '#F59E0B',
      'contratado': '#6B7280',
      'jefe_practica': '#8B5CF6'
    };
    return mapa[categoria] || '#6B7280';
  },

  porTipo: (tipo: string): string => {
    const mapa: Record<string, string> = {
      'aula': '#3B82F6',
      'laboratorio': '#10B981',
      'auditorio': '#F59E0B',
      'taller': '#8B5CF6'
    };
    return mapa[tipo] || '#6B7280';
  }
};

// Exportador a Excel
export const exportadorExcel = {
  descargar: async (datos: any[], nombreArchivo: string) => {
    // Implementación básica
    const csv = convertirACSV(datos);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}.csv`;
    link.click();
  }
};

function convertirACSV(datos: any[]): string {
  if (datos.length === 0) return '';
  
  const headers = Object.keys(datos[0]).join(',');
  const filas = datos.map(fila => 
    Object.values(fila).map(v => `"${v}"`).join(',')
  );
  
  return [headers, ...filas].join('\n');
}
