import { useState, useEffect, useCallback } from 'react';

// Hook de autenticación
export function useAuth() {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const response = await fetch('/api/auth/verificar');
      const data = await response.json();
      if (data.exito) setUsuario(data.usuario);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const login = async (codigo: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, password })
    });
    const data = await response.json();
    if (data.exito) {
      setUsuario(data.usuario);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUsuario(null);
  };

  return { usuario, cargando, login, logout };
}

// Hook de WebSocket
export function useWebSocket(canal: string) {
  const [conectado, setConectado] = useState(false);
  const [mensajes, setMensajes] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/api/websocket?canal=${canal}`);
    
    ws.onopen = () => setConectado(true);
    ws.onclose = () => setConectado(false);
    ws.onmessage = (event) => {
      const mensaje = JSON.parse(event.data);
      setMensajes(prev => [...prev, mensaje]);
    };

    return () => ws.close();
  }, [canal]);

  const enviar = useCallback((mensaje: any) => {
    // Implementación de envío
  }, []);

  return { conectado, mensajes, enviar };
}

// Hook de disponibilidad
export function useDisponibilidad(idPeriodo: number) {
  const [matriz, setMatriz] = useState<any[][]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      const response = await fetch(`/api/horarios/disponibilidad-matriz?periodo=${idPeriodo}`);
      const data = await response.json();
      if (data.exito) setMatriz(data.matriz);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [idPeriodo]);

  return { matriz, cargando, recargar: cargar };
}

// Hook de validación en tiempo real
export function useValidacionTiempoReal(datosSeleccion: any) {
  const [validaciones, setValidaciones] = useState<any[]>([]);
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    if (datosSeleccion) validar();
  }, [datosSeleccion]);

  const validar = async () => {
    setValidando(true);
    try {
      const response = await fetch('/api/horarios/validar-seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosSeleccion)
      });
      const data = await response.json();
      setValidaciones(data.validaciones || []);
    } catch (error) {
      console.error(error);
    } finally {
      setValidando(false);
    }
  };

  return { validaciones, validando, esValido: validaciones.every(v => v.valido) };
}

// Hook de búsqueda global
export function useBusquedaGlobal() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (termino.length > 2) {
      const timer = setTimeout(() => buscar(), 300);
      return () => clearTimeout(timer);
    }
  }, [termino]);

  const buscar = async () => {
    setBuscando(true);
    try {
      const response = await fetch(`/api/buscar?q=${termino}`);
      const data = await response.json();
      setResultados(data.resultados || []);
    } catch (error) {
      console.error(error);
    } finally {
      setBuscando(false);
    }
  };

  return { termino, setTermino, resultados, buscando };
}

// Hook de temporizador
export function useTemporizador(inicial: number = 0) {
  const [segundos, setSegundos] = useState(inicial);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    let intervalo: any = null;
    if (activo) {
      intervalo = setInterval(() => {
        setSegundos(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [activo]);

  const iniciar = () => setActivo(true);
  const pausar = () => setActivo(false);
  const reiniciar = () => {
    setActivo(false);
    setSegundos(0);
  };

  return { segundos, activo, iniciar, pausar, reiniciar };
}
