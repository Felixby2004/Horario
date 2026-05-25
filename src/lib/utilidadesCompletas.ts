// Validadores
export const validadores = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  telefono: (telefono: string): boolean => {
    const regex = /^\+?[0-9]{9,15}$/;
    return regex.test(telefono.replace(/[\s-]/g, ''));
  },

  codigoDocente: (codigo: string): boolean => {
    return /^[A-Z0-9]{4,10}$/.test(codigo);
  },

  codigoCurso: (codigo: string): boolean => {
    return /^[A-Z]{2,4}[0-9]{2,4}$/.test(codigo);
  },

  rango: (valor: number, min: number, max: number): boolean => {
    return valor >= min && valor <= max;
  },

  noVacio: (texto: string): boolean => {
    return texto.trim().length > 0;
  },

  longitudMinima: (texto: string, min: number): boolean => {
    return texto.length >= min;
  },

  soloNumeros: (texto: string): boolean => {
    return /^\d+$/.test(texto);
  },

  soloLetras: (texto: string): boolean => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto);
  }
};

// Formateadores
export const formateadores = {
  fecha: (fecha: Date | string): string => {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  hora: (hora: string): string => {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  },

  fechaHora: (fecha: Date | string): string => {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toLocaleString('es-PE');
  },

  numero: (num: number, decimales = 0): string => {
    return num.toLocaleString('es-PE', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
  },

  moneda: (cantidad: number): string => {
    return `S/ ${cantidad.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  porcentaje: (valor: number, decimales = 0): string => {
    return `${valor.toFixed(decimales)}%`;
  },

  telefono: (telefono: string): string => {
    const cleaned = telefono.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return telefono;
  },

  nombreCompleto: (nombres: string, apellidos: string): string => {
    return `${apellidos}, ${nombres}`;
  },

  iniciales: (nombres: string, apellidos: string): string => {
    const n = nombres.split(' ')[0][0] || '';
    const a = apellidos.split(' ')[0][0] || '';
    return `${n}${a}`.toUpperCase();
  }
};

// Utilidades de tiempo
export const tiempo = {
  calcularDiferencia: (inicio: string, fin: string): number => {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fin.split(':').map(Number);
    return (hf * 60 + mf) - (hi * 60 + mi);
  },

  sumarMinutos: (hora: string, minutos: number): string => {
    const [h, m] = hora.split(':').map(Number);
    const totalMinutos = h * 60 + m + minutos;
    const nuevaHora = Math.floor(totalMinutos / 60) % 24;
    const nuevosMinutos = totalMinutos % 60;
    return `${nuevaHora.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  },

  estaEnRango: (hora: string, inicio: string, fin: string): boolean => {
    return hora >= inicio && hora <= fin;
  },

  obtenerBloqueHorario: (hora: string): number => {
    const [h, m] = hora.split(':').map(Number);
    const minutosTotales = h * 60 + m;
    const minutosInicio = 7 * 60; // 07:00
    return Math.floor((minutosTotales - minutosInicio) / 90);
  }
};

// Utilidades de arrays
export const arrays = {
  agruparPor: <T>(arr: T[], clave: keyof T): Record<string, T[]> => {
    return arr.reduce((acc, item) => {
      const key = String(item[clave]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  },

  ordenarPor: <T>(arr: T[], clave: keyof T, ascendente = true): T[] => {
    return [...arr].sort((a, b) => {
      if (a[clave] < b[clave]) return ascendente ? -1 : 1;
      if (a[clave] > b[clave]) return ascendente ? 1 : -1;
      return 0;
    });
  },

  unicos: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  dividirEnLotes: <T>(arr: T[], tamaño: number): T[][] => {
    const lotes: T[][] = [];
    for (let i = 0; i < arr.length; i += tamaño) {
      lotes.push(arr.slice(i, i + tamaño));
    }
    return lotes;
  }
};

// Utilidades de strings
export const strings = {
  capitalizar: (texto: string): string => {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  },

  capitalizarPalabras: (texto: string): string => {
    return texto.split(' ').map(p => strings.capitalizar(p)).join(' ');
  },

  slug: (texto: string): string => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  truncar: (texto: string, longitud: number): string => {
    if (texto.length <= longitud) return texto;
    return texto.slice(0, longitud) + '...';
  },

  removerAcentos: (texto: string): string => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
};

// Generador de colores
export const colores = {
  aleatorio: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },

  porCategoria: (categoria: string): string => {
    const mapa: Record<string, string> = {
      'principal': '#3b82f6',
      'asociado': '#10b981',
      'auxiliar': '#f59e0b',
      'jefe_practica': '#8b5cf6'
    };
    return mapa[categoria] || '#6b7280';
  },

  porEstado: (estado: string): string => {
    const mapa: Record<string, string> = {
      'pendiente': '#f59e0b',
      'confirmado': '#10b981',
      'publicado': '#3b82f6',
      'cancelado': '#ef4444'
    };
    return mapa[estado] || '#6b7280';
  }
};

// Exportador
export const exportador = {
  aCSV: (datos: any[], columnas: string[]): string => {
    const encabezados = columnas.join(',');
    const filas = datos.map(fila =>
      columnas.map(col => {
        const valor = fila[col];
        return typeof valor === 'string' && valor.includes(',')
          ? `"${valor}"`
          : valor;
      }).join(',')
    );
    return [encabezados, ...filas].join('\n');
  },

  descargarCSV: (datos: any[], columnas: string[], nombreArchivo: string) => {
    const csv = exportador.aCSV(datos, columnas);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}.csv`;
    link.click();
  },

  descargarJSON: (datos: any, nombreArchivo: string) => {
    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}.json`;
    link.click();
  }
};

// Utilidades de almacenamiento local
export const almacenamiento = {
  guardar: (clave: string, valor: any) => {
    localStorage.setItem(clave, JSON.stringify(valor));
  },

  obtener: <T>(clave: string, valorPorDefecto?: T): T | null => {
    const item = localStorage.getItem(clave);
    if (!item) return valorPorDefecto || null;
    try {
      return JSON.parse(item);
    } catch {
      return valorPorDefecto || null;
    }
  },

  eliminar: (clave: string) => {
    localStorage.removeItem(clave);
  },

  limpiar: () => {
    localStorage.clear();
  }
};
