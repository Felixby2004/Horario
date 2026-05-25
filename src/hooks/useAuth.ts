import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id_usuario: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  rol: string;
  correo_electronico: string;
}

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      const token = localStorage.getItem('auth_token');
      
      if (usuarioStr && token) {
        setUsuario(JSON.parse(usuarioStr));
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('auth_token');
    router.push('/auth/login');
  };

  return { usuario, cargando, cerrarSesion };
}
