'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUserCircle,
  faCalendarCheck,
  faCalendarPlus,
  faCalendarDays,
  faClipboardList,
  faBookOpen,
  faBook,
  faChartBar,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { ChatBot } from '@/components/chatbot/ChatBot';
import { formatearTextoVisualOracion } from '@/lib/formatoTexto';

const menuSections = [
  {
    title: 'Principal',
    items: [
      { texto: 'Inicio', icon: faHome, href: '/docente' },
      { texto: 'Mi Perfil', icon: faUserCircle, href: '/docente/perfil' },
      { texto: 'Mis Cursos y Grupos', icon: faBookOpen, href: '/docente/mis-cursos' },
      { texto: 'Mi Carga Académica', icon: faChartBar, href: '/docente/carga-academica' },
      { texto: 'Plan de Estudios', icon: faBook, href: '/docente/plan-estudios' },
    ],
  },
  {
    title: 'Horarios',
    items: [
      { texto: 'Mi Disponibilidad', icon: faCalendarCheck, href: '/docente/disponibilidad' },
      { texto: 'Seleccionar Horarios', icon: faCalendarPlus, href: '/docente/seleccionar-horarios' },
      { texto: 'Mis Horarios', icon: faClipboardList, href: '/docente/mis-horarios' },
      { texto: 'Mis Citas', icon: faCalendarDays, href: '/docente/citaciones' },
      { texto: 'Reportes', icon: faFileLines, href: '/docente/reportes' },
    ],
  },
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
          <div className="text-xs text-gray-500">
            {formatearTextoVisualOracion(usuario.rol)}
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {formatearTextoVisualOracion(usuario.rol)}
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
              <button
                onClick={() => {
                  router.push('/docente/perfil');
                  setAbierto(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const currentTitle = menuSections
    .flatMap((section) => section.items)
    .find((item) => pathname === item.href || pathname?.startsWith(item.href + '/'))
    ?.texto || 'Docente';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Collapsible */}
      <>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 bg-primary-900 text-white p-3 rounded-xl shadow-lg"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        )}

        <aside className={`hidden md:flex ${collapsed ? 'w-20' : 'w-64'} bg-primary-900 text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 flex-col z-30`}>
          <div className={`p-4 border-b border-primary-800 flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {collapsed ? (
              <img src="/logo.png" alt="Logo UNT" className="w-10 h-10 object-contain flex-shrink-0 rounded-lg bg-white/10 p-1" />
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <img src="/logo.png" alt="Logo UNT" className="w-10 h-10 object-contain flex-shrink-0 rounded-lg bg-white/10 p-1" />
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-tight">Sistema de horarios</h1>
                  <p className="text-xs text-primary-300 mt-0.5 truncate">UNT - Docente</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-primary-800 transition-colors flex-shrink-0"
              title={collapsed ? 'Expandir' : 'Contraer'}
            >
              {collapsed ? <span className="text-xl">☰</span> : <span className="text-xl">◀</span>}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-4">
                {!collapsed && (
                  <div className="px-5 py-2 text-xs uppercase tracking-wide text-primary-300">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-800 text-white font-semibold shadow-inner ring-1 ring-white/10'
                          : 'hover:bg-primary-800/70 text-gray-300'
                      } ${collapsed ? 'justify-center mx-1' : 'mx-2'}`}
                      title={collapsed ? item.texto : ''}
                    >
                      <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                      {!collapsed && <span className="truncate font-medium">{item.texto}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <aside
          className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-primary-900 text-white overflow-y-auto transition-transform duration-300 flex flex-col ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-primary-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="Logo UNT" className="w-10 h-10 object-contain flex-shrink-0 rounded-lg bg-white/10 p-1" />
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight">Sistema de horarios</h1>
                <p className="text-xs text-primary-300 mt-0.5 truncate">UNT - Docente</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-primary-800 transition-colors flex-shrink-0"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-4">
                <div className="px-4 py-2 text-xs uppercase tracking-wide text-primary-300">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-800 text-white font-semibold shadow-inner ring-1 ring-white/10'
                          : 'hover:bg-primary-800/70 text-gray-300'
                      }`}
                    >
                      <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                      <span className="truncate font-medium">{item.texto}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
      </>

      <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
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
      <ChatBot />
    </div>
  );
}
