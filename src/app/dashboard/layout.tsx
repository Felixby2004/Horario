'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MenuUsuario } from '@/components/layouts/MenuUsuario';
import { ChatBot } from '@/components/chatbot/ChatBot';

const menuItems = [
  { texto: 'Dashboard', icono: '📊', href: '/dashboard' },
  { texto: 'Períodos', icono: '📅', href: '/dashboard/periodos' },
  { texto: 'Ambientes', icono: '🏫', href: '/dashboard/ambientes' },
  { texto: 'Cursos', icono: '📚', href: '/dashboard/cursos' },
  { texto: 'Grupos', icono: '👥', href: '/dashboard/grupos' },
  { texto: 'Docentes', icono: '👨‍🏫', href: '/dashboard/docentes' },
  { texto: 'Carga Académica', icono: '📋', href: '/dashboard/carga-academica' },
  { texto: 'Plan de Estudios', icono: '📖', href: '/dashboard/plan-estudios' },
  { texto: 'Disponibilidad', icono: '⏱️', href: '/dashboard/disponibilidad' },
  { texto: 'Ventanas', icono: '🎯', href: '/dashboard/horarios/ventanas' },
  { texto: 'Horarios', icono: '🕐', href: '/dashboard/horarios' },
  { texto: 'Usuarios', icono: '👤', href: '/dashboard/usuarios' },
  { texto: 'Solicitudes', icono: '📋', href: '/dashboard/solicitudes' },
  { texto: 'Reportes', icono: '📄', href: '/dashboard/reportes' },
  { texto: 'Configuración', icono: '⚙️', href: '/dashboard/configuracion' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

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
  const menuItemsWithActive = menuItems.map((item) => ({
    ...item,
    activo: pathname === item.href || pathname.startsWith(item.href + '/'),
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Collapsible */}
      <>
        <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-primary-900 text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 flex flex-col z-30`}>
          <div className={`p-4 border-b border-primary-800 flex items-center gap-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {collapsed ? (
              <h2 className="text-xl font-bold">UNT</h2>
            ) : (
              <>
                <div>
                  <h1 className="text-xl font-bold">Sistema de horarios</h1>
                  <p className="text-sm text-primary-300 mt-1">UNT - Sistemas</p>
                </div>
              </>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-primary-800 transition-colors flex-shrink-0"
              title={collapsed ? 'Expandir' : 'Contraer'}
            >
              {collapsed ? (
                <span className="text-xl">☰</span>
              ) : (
                <span className="text-xl">◀</span>
              )}
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-2">
            {menuItemsWithActive.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 transition-all duration-200 ${
                  item.activo
                    ? 'bg-primary-800 border-l-4 border-white text-white font-semibold'
                    : 'hover:bg-primary-800/70 text-gray-300'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.texto : ''}
              >
                <span className="text-xl flex-shrink-0">{item.icono}</span>
                {!collapsed && <span className="truncate">{item.texto}</span>}
              </Link>
            ))}
          </nav>
        </aside>
        
        {/* Toggle Button for Mobile */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="md:hidden fixed top-4 left-4 z-40 bg-primary-600 text-white p-3 rounded-lg shadow-lg"
        >
          ☰
        </button>
      </>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-white shadow-sm px-8 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => pathname === item.href)?.texto || 'Dashboard'}
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
