import { useEffect, useState, useRef } from 'react';

export function useWebSocket(url: string) {
  const [conectado, setConectado] = useState(false);
  const [mensaje, setMensaje] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    conectar();
    return () => desconectar();
  }, [url]);

  const conectar = () => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        console.log('WebSocket conectado');
        setConectado(true);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMensaje(data);
      };

      ws.current.onclose = () => {
        console.log('WebSocket desconectado');
        setConectado(false);
        setTimeout(conectar, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('Error WebSocket:', error);
      };
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
    }
  };

  const desconectar = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  const enviar = (data: any) => {
    if (ws.current && conectado) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return { conectado, mensaje, enviar };
}
