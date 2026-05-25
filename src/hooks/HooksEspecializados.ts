import { useState, useEffect, useCallback } from 'react';

// Hook de sesión
export function useSesion() {
  const [sesionActiva, setSesionActiva] = useState(false);
  const [ultimaActividad, setUltimaActividad] = useState(Date.now());

  useEffect(() => {
    const verificar = setInterval(() => {
      const tiempoInactivo = Date.now() - ultimaActividad;
      if (tiempoInactivo > 30 * 60 * 1000) { // 30 minutos
        setSesionActiva(false);
        alert('Sesión expirada por inactividad');
        window.location.href = '/auth/login';
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(verificar);
  }, [ultimaActividad]);

  const actualizarActividad = useCallback(() => {
    setUltimaActividad(Date.now());
    setSesionActiva(true);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', actualizarActividad);
    window.addEventListener('keypress', actualizarActividad);

    return () => {
      window.removeEventListener('mousemove', actualizarActividad);
      window.removeEventListener('keypress', actualizarActividad);
    };
  }, [actualizarActividad]);

  return { sesionActiva, ultimaActividad };
}

// Hook de disponibilidad de aulas
export function useDisponibilidadAulas(idPeriodo: number, filtros?: any) {
  const [aulas, setAulas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        periodo: idPeriodo.toString(),
        tipo: 'aula',
        ...filtros
      });

      const response = await fetch(`/api/horarios/disponibilidad-aulas?${params}`);
      const data = await response.json();
      if (data.exito) {
        setAulas(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [idPeriodo, JSON.stringify(filtros)]);

  return { aulas, cargando, recargar: cargar };
}

// Hook de disponibilidad de laboratorios
export function useDisponibilidadLaboratorios(idPeriodo: number) {
  const [laboratorios, setLaboratorios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarLaboratorios();
  }, [idPeriodo]);

  const cargarLaboratorios = async () => {
    setCargando(true);
    try {
      const response = await fetch(`/api/horarios/disponibilidad-laboratorios?periodo=${idPeriodo}`);
      const data = await response.json();
      if (data.exito) {
        setLaboratorios(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  return { laboratorios, cargando, recargar: cargarLaboratorios };
}

// Hook de selección de horario
export function useSeleccionHorario() {
  const [seleccion, setSeleccion] = useState<any>(null);
  const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<Set<string>>(new Set());

  const seleccionarCelda = useCallback((dia: string, bloque: number) => {
    const clave = `${dia}-${bloque}`;
    const nuevasCeldas = new Set(celdasSeleccionadas);
    
    if (nuevasCeldas.has(clave)) {
      nuevasCeldas.delete(clave);
    } else {
      nuevasCeldas.add(clave);
    }

    setCeldasSeleccionadas(nuevasCeldas);
  }, [celdasSeleccionadas]);

  const limpiarSeleccion = useCallback(() => {
    setSeleccion(null);
    setCeldasSeleccionadas(new Set());
  }, []);

  return {
    seleccion,
    celdasSeleccionadas,
    seleccionarCelda,
    limpiarSeleccion,
    setSeleccion
  };
}

// Hook de preferencias de notificación
export function usePreferenciasNotificacion(idDocente: number) {
  const [preferencias, setPreferencias] = useState({
    correo: true,
    whatsapp: false,
    telegram: false
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPreferencias();
  }, [idDocente]);

  const cargarPreferencias = async () => {
    try {
      const response = await fetch(`/api/docentes/${idDocente}/preferencias-notificacion`);
      const data = await response.json();
      if (data.exito) {
        setPreferencias(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardar = async (nuevasPreferencias: any) => {
    try {
      const response = await fetch(`/api/docentes/${idDocente}/preferencias-notificacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevasPreferencias)
      });

      if (response.ok) {
        setPreferencias(nuevasPreferencias);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  return { preferencias, cargando, guardar };
}

// Hook de ventana de atención
export function useVentanaAtencion(idVentana: number) {
  const [ventana, setVentana] = useState<any>(null);
  const [docenteActual, setDocenteActual] = useState<any>(null);
  const [cola, setCola] = useState<any[]>([]);

  useEffect(() => {
    cargarVentana();
    const intervalo = setInterval(cargarVentana, 5000);
    return () => clearInterval(intervalo);
  }, [idVentana]);

  const cargarVentana = async () => {
    try {
      const response = await fetch(`/api/ventanas-atencion/${idVentana}`);
      const data = await response.json();
      if (data.exito) {
        setVentana(data.datos);
      }

      const colResponse = await fetch(`/api/ventanas-atencion/${idVentana}/cola`);
      const colaData = await colResponse.json();
      if (colaData.exito) {
        setCola(colaData.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const llamarSiguiente = async () => {
    try {
      const response = await fetch(`/api/ventanas-atencion/${idVentana}/siguiente-docente`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.exito) {
        setDocenteActual(data.docente);
        cargarVentana();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return { ventana, docenteActual, cola, llamarSiguiente };
}

// Hook de cola de docentes
export function useColaDocentes(idVentana: number) {
  const [cola, setCola] = useState<any[]>([]);

  useEffect(() => {
    cargarCola();
  }, [idVentana]);

  const cargarCola = async () => {
    const response = await fetch(`/api/ventanas-atencion/${idVentana}/cola`);
    const data = await response.json();
    if (data.exito) {
      setCola(data.datos);
    }
  };

  return { cola, recargar: cargarCola };
}

// Hook de reportes
export function useReportes() {
  const [generando, setGenerando] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const generar = async (tipo: string, parametros: any) => {
    setGenerando(true);
    setProgreso(0);

    try {
      const response = await fetch('/api/reportes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, parametros })
      });

      const data = await response.json();
      
      if (data.exito) {
        setProgreso(100);
        return data.url;
      }
      
      return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setGenerando(false);
    }
  };

  return { generando, progreso, generar };
}

// Hook de filtros de tabla
export function useFiltrosTabla(datosIniciales: any[]) {
  const [datos, setDatos] = useState(datosIniciales);
  const [filtros, setFiltros] = useState({});

  const aplicarFiltros = useCallback((nuevosFiltros: any) => {
    setFiltros(nuevosFiltros);
    
    let resultado = [...datosIniciales];
    
    Object.entries(nuevosFiltros).forEach(([campo, valor]) => {
      if (valor) {
        resultado = resultado.filter(item => 
          String(item[campo]).toLowerCase().includes(String(valor).toLowerCase())
        );
      }
    });

    setDatos(resultado);
  }, [datosIniciales]);

  return { datos, filtros, aplicarFiltros };
}

// Hook de sonido
export function useSonido(ruta: string) {
  const reproducir = useCallback(() => {
    const audio = new Audio(ruta);
    audio.play().catch(error => console.error('Error reproduciendo sonido:', error));
  }, [ruta]);

  return { reproducir };
}
