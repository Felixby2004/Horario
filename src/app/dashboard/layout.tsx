'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faCalendarDays,
  faBuildingColumns,
  faBookOpen,
  faUsers,
  faChalkboardTeacher,
  faClipboardList,
  faBook,
  faCalendarCheck,
  faWindowMaximize,
  faClock,
  faUser,
  faInbox,
  faFileLines,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import { MenuUsuario } from '@/components/layouts/MenuUsuario';
import { ChatBot } from '@/components/chatbot/ChatBot';

const menuSections = [
  {
    title: 'General',
    items: [
      { texto: 'Dashboard', icon: faGauge, href: '/dashboard' },
      { texto: 'Períodos', icon: faCalendarDays, href: '/dashboard/periodos' },
      { texto: 'Configuración', icon: faCog, href: '/dashboard/configuracion' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { texto: 'Ambientes', icon: faBuildingColumns, href: '/dashboard/ambientes' },
      { texto: 'Cursos', icon: faBookOpen, href: '/dashboard/cursos' },
      { texto: 'Grupos', icon: faUsers, href: '/dashboard/grupos' },
      { texto: 'Docentes', icon: faChalkboardTeacher, href: '/dashboard/docentes' },
      { texto: 'Usuarios', icon: faUser, href: '/dashboard/usuarios' },
    ],
  },
  {
    title: 'Académico',
    items: [
      { texto: 'Carga Académica', icon: faClipboardList, href: '/dashboard/carga-academica' },
      { texto: 'Plan de Estudios', icon: faBook, href: '/dashboard/plan-estudios' },
      { texto: 'Disponibilidad', icon: faCalendarCheck, href: '/dashboard/disponibilidad' },
      { texto: 'Horarios', icon: faClock, href: '/dashboard/horarios' },
      { texto: 'Ventanas', icon: faWindowMaximize, href: '/dashboard/horarios/ventanas' },
      { texto: 'Solicitudes', icon: faInbox, href: '/dashboard/solicitudes' },
      { texto: 'Reportes', icon: faFileLines, href: '/dashboard/reportes' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar sesión
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      // No hay sesión, redirigir al login
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userData);
    
    // Si es docente, no debería estar aquí
    if (user.rol === 'docente') {
      router.push('/docente');
      return;
    }

    setUsuario(user);
    setVerificando(false);
  }, [router]);

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando sesión...</div>
      </div>
    );
  }

  // Preparar items con estado activo
  const menuItemsWithActive = menuSections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      activo: pathname === item.href || pathname.startsWith(item.href + '/'),
    }))
  );

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
                  <p className="text-xs text-primary-300 mt-0.5 truncate">UNT - Sistemas</p>
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
                      {!collapsed && <span className="truncate">{item.texto}</span>}
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
                <p className="text-xs text-primary-300 mt-0.5 truncate">UNT - Sistemas</p>
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
        </aside>
      </>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="bg-white shadow-sm px-8 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItemsWithActive.find(item => item.activo)?.texto || 'Dashboard'}
            </h2>
            <MenuUsuario />
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
