import { useState, useCallback } from 'react';

interface Notificacion {
  id: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
  mensaje: string;
}

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const agregar = useCallback((tipo: Notificacion['tipo'], mensaje: string) => {
    const id = Math.random().toString(36).substring(7);
    const nuevaNotificacion: Notificacion = { id, tipo, mensaje };
    
    setNotificaciones(prev => [...prev, nuevaNotificacion]);

    setTimeout(() => {
      eliminar(id);
    }, 5000);
  }, []);

  const eliminar = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  }, []);

  const exito = useCallback((mensaje: string) => agregar('exito', mensaje), [agregar]);
  const error = useCallback((mensaje: string) => agregar('error', mensaje), [agregar]);
  const info = useCallback((mensaje: string) => agregar('info', mensaje), [agregar]);
  const advertencia = useCallback((mensaje: string) => agregar('advertencia', mensaje), [agregar]);

  return {
    notificaciones,
    exito,
    error,
    info,
    advertencia,
    eliminar
  };
}
