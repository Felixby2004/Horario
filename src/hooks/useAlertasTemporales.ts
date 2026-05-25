import { useState, useCallback } from 'react';

export interface Alerta {
  id: string;
  tipo: 'exito' | 'error' | 'advertencia' | 'info';
  titulo: string;
  mensaje: string;
  duracion?: number;
}

export function useAlertasTemporales() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const mostrarAlerta = useCallback((
    tipo: Alerta['tipo'],
    titulo: string,
    mensaje: string,
    duracion: number = 4000
  ) => {
    const id = Date.now().toString();
    const alerta: Alerta = { id, tipo, titulo, mensaje, duracion };

    setAlertas((prev) => [...prev, alerta]);

    if (duracion > 0) {
      const timeout = setTimeout(() => {
        setAlertas((prev) => prev.filter((a) => a.id !== id));
      }, duracion);

      return () => clearTimeout(timeout);
    }
  }, []);

  const eliminarAlerta = useCallback((id: string) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const exito = (titulo: string, mensaje: string, duracion?: number) => {
    mostrarAlerta('exito', titulo, mensaje, duracion);
  };

  const error = (titulo: string, mensaje: string, duracion?: number) => {
    mostrarAlerta('error', titulo, mensaje, duracion);
  };

  const advertencia = (titulo: string, mensaje: string, duracion?: number) => {
    mostrarAlerta('advertencia', titulo, mensaje, duracion);
  };

  const info = (titulo: string, mensaje: string, duracion?: number) => {
    mostrarAlerta('info', titulo, mensaje, duracion);
  };

  return {
    alertas,
    mostrarAlerta,
    eliminarAlerta,
    exito,
    error,
    advertencia,
    info
  };
}
