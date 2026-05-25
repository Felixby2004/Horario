'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const MenuUsuario = () => {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    // Obtener usuario del localStorage
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error('Error parseando usuario:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirigir al login
    router.push('/auth/login');
    router.refresh();
  };

  // Evitar error de hidratación
  if (!montado) {
    return (
      <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          ?
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium text-gray-900">Sin sesión</div>
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-xs text-blue-600 hover:underline"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  const iniciales = `${usuario.nombres?.[0] || ''}${usuario.apellidos?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="relative">
      {/* Botón de usuario */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {iniciales}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium text-gray-900">
            {usuario.nombres} {usuario.apellidos}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {usuario.rol?.replace(/_/g, ' ')}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {abierto && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setAbierto(false)}
          />
          
          {/* Menú */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            {/* Info del usuario */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">
                {usuario.nombres} {usuario.apellidos}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {usuario.correo_electronico || usuario.codigo}
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {usuario.rol?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Opciones */}
            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/dashboard/perfil');
                  setAbierto(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard/configuracion');
                  setAbierto(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
