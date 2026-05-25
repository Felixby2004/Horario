'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay sesión
    const user = localStorage.getItem('user');
    
    if (user) {
      const userData = JSON.parse(user);
      // Redirigir según rol
      if (userData.rol === 'docente') {
        router.push('/docente');
      } else {
        router.push('/dashboard');
      }
    } else {
      // No hay sesión, ir al login
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex justify-center py-12"><div className="loader"></div></div>
  );
}
