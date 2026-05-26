'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { titulo: 'Inicio', icono: '🏠', ruta: '/docente' },
  { titulo: 'Mi Disponibilidad', icono: '⏱️', ruta: '/docente/disponibilidad' },
  { titulo: 'Mis Citas', icono: '🧾', ruta: '/docente/citaciones' },
  { titulo: 'Seleccionar Horarios', icono: '📅', ruta: '/docente/seleccionar-horarios' },
  { titulo: 'Mis Horarios', icono: '📋', ruta: '/docente/mis-horarios' },
  { titulo: 'Mis Cursos y Grupos', icono: '📚', ruta: '/docente/mis-cursos' },
  { titulo: 'Reportes', icono: '📄', ruta: '/docente/reportes' },
];

function MenuDocente() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth/login');
    router.refresh();
  };

  if (!montado) {
    return <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />;
  }

  if (!usuario) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          ?
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium text-gray-900">Sin sesión</div>
          <div className="text-xs text-blue-600">Iniciar sesión</div>
        </div>
      </button>
    );
  }

  const iniciales = `${usuario.nombres?.[0] || ''}${usuario.apellidos?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="relative">
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

      {abierto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
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

            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/docente');
                  setAbierto(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </button>
            </div>

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
}

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.rol !== 'docente') {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      router.push('/auth/login');
      return;
    }

    setVerificando(false);
  }, [router]);

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando sesión...</div>
      </div>
    );
  }

  const currentTitle = menuItems.find((item) => pathname === item.ruta || pathname?.startsWith(item.ruta + '/'))?.titulo || 'Docente';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-800">
          <h1 className="text-xl font-bold">Sistema de horarios</h1>
          <p className="text-sm text-primary-300 mt-1">UNT - Docente</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.ruta || pathname?.startsWith(item.ruta + '/');
            return (
              <Link
                key={item.ruta}
                href={item.ruta}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive ? 'bg-primary-800 border-l-4 border-white' : 'hover:bg-primary-800'
                }`}
              >
                <span className="text-2xl">{item.icono}</span>
                <span className="font-medium">{item.titulo}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{currentTitle}</h2>
            <MenuDocente />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}