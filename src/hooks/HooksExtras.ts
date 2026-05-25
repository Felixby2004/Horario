import { useState, useEffect, useCallback } from 'react';

// Hook para drag and drop
export const useDragAndDrop = () => {
  const [arrastrando, setArrastrando] = useState(false);
  const [elemento, setElemento] = useState<any>(null);

  const iniciarArrastre = (item: any) => {
    setArrastrando(true);
    setElemento(item);
  };

  const finalizarArrastre = () => {
    setArrastrando(false);
    setElemento(null);
  };

  return {
    arrastrando,
    elemento,
    iniciarArrastre,
    finalizarArrastre
  };
};

// Hook para geolocalización
export const useGeolocalizacion = () => {
  const [ubicacion, setUbicacion] = useState<{
    latitud: number | null;
    longitud: number | null;
    error: string | null;
  }>({
    latitud: null,
    longitud: null,
    error: null
  });

  const obtener = () => {
    if (!navigator.geolocation) {
      setUbicacion(prev => ({ ...prev, error: 'Geolocalización no soportada' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacion({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          error: null
        });
      },
      (error) => {
        setUbicacion(prev => ({ ...prev, error: error.message }));
      }
    );
  };

  return { ...ubicacion, obtener };
};

// Hook para scroll infinito
export const useScrollInfinito = (callback: () => void, cargando: boolean) => {
  useEffect(() => {
    const handleScroll = () => {
      if (cargando) return;

      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, cargando]);
};

// Hook para detección de dispositivo
export const useDispositivo = () => {
  const [dispositivo, setDispositivo] = useState({
    esMovil: false,
    esTablet: false,
    esEscritorio: false
  });

  useEffect(() => {
    const verificar = () => {
      const ancho = window.innerWidth;
      setDispositivo({
        esMovil: ancho < 768,
        esTablet: ancho >= 768 && ancho < 1024,
        esEscritorio: ancho >= 1024
      });
    };

    verificar();
    window.addEventListener('resize', verificar);
    return () => window.removeEventListener('resize', verificar);
  }, []);

  return dispositivo;
};

// Hook para historial de acciones (undo/redo)
export const useHistorial = <T>(estadoInicial: T) => {
  const [estado, setEstado] = useState(estadoInicial);
  const [historial, setHistorial] = useState<T[]>([estadoInicial]);
  const [indice, setIndice] = useState(0);

  const establecer = (nuevoEstado: T) => {
    const nuevoHistorial = historial.slice(0, indice + 1);
    nuevoHistorial.push(nuevoEstado);
    setHistorial(nuevoHistorial);
    setIndice(nuevoHistorial.length - 1);
    setEstado(nuevoEstado);
  };

  const deshacer = () => {
    if (indice > 0) {
      setIndice(indice - 1);
      setEstado(historial[indice - 1]);
    }
  };

  const rehacer = () => {
    if (indice < historial.length - 1) {
      setIndice(indice + 1);
      setEstado(historial[indice + 1]);
    }
  };

  return {
    estado,
    establecer,
    deshacer,
    rehacer,
    puedeDeshacer: indice > 0,
    puedeRehacer: indice < historial.length - 1
  };
};

// Hook para confirmación antes de salir
export const useConfirmacionSalida = (activo: boolean, mensaje: string) => {
  useEffect(() => {
    if (!activo) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = mensaje;
      return mensaje;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activo, mensaje]);
};

// Hook para intervalo
export const useIntervalo = (callback: () => void, delay: number | null) => {
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
};

// Hook para online/offline
export const useConexion = () => {
  const [enLinea, setEnLinea] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setEnLinea(true);
    const handleOffline = () => setEnLinea(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return enLinea;
};
