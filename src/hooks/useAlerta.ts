import { useState, useCallback } from 'react';

interface ConfigAlerta {
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo?: string;
  mensaje: string;
  duracion?: number;
}

export function useAlerta() {
  const [alerta, setAlerta] = useState<ConfigAlerta | null>(null);

  const mostrar = useCallback((config: ConfigAlerta) => {
    setAlerta(config);
    
    if (config.duracion !== 0) {
      setTimeout(() => {
        setAlerta(null);
      }, config.duracion || 5000);
    }
  }, []);

  const cerrar = useCallback(() => {
    setAlerta(null);
  }, []);

  const exito = useCallback((mensaje: string, titulo?: string) => {
    mostrar({ tipo: 'success', mensaje, titulo });
  }, [mostrar]);

  const error = useCallback((mensaje: string, titulo?: string) => {
    mostrar({ tipo: 'error', mensaje, titulo });
  }, [mostrar]);

  const advertencia = useCallback((mensaje: string, titulo?: string) => {
    mostrar({ tipo: 'warning', mensaje, titulo });
  }, [mostrar]);

  const info = useCallback((mensaje: string, titulo?: string) => {
    mostrar({ tipo: 'info', mensaje, titulo });
  }, [mostrar]);

  return {
    alerta,
    mostrar,
    cerrar,
    exito,
    error,
    advertencia,
    info
  };
}
