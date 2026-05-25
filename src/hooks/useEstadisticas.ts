import { useState, useEffect } from 'react';

export function useEstadisticas(idPeriodo: number) {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [idPeriodo]);

  const cargarEstadisticas = async () => {
    setCargando(true);
    setError(null);

    try {
      const response = await fetch(`/api/estadisticas/resumen?periodo=${idPeriodo}`);
      const data = await response.json();

      if (data.exito) {
        setEstadisticas(data.datos);
      } else {
        setError(data.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const recargar = () => {
    cargarEstadisticas();
  };

  return {
    estadisticas,
    cargando,
    error,
    recargar
  };
}
