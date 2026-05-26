'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MenuUsuario } from '@/components/layouts/MenuUsuario';

const menuItems = [
  { titulo: 'Dashboard', icono: '📊', ruta: '/dashboard' },
  { titulo: 'Períodos', icono: '📅', ruta: '/dashboard/periodos' },
  { titulo: 'Ambientes', icono: '🏫', ruta: '/dashboard/ambientes' },
  { titulo: 'Cursos', icono: '📚', ruta: '/dashboard/cursos' },
  { titulo: 'Grupos', icono: '👥', ruta: '/dashboard/grupos' },
  { titulo: 'Docentes', icono: '👨‍🏫', ruta: '/dashboard/docentes' },
  { titulo: 'Disponibilidad', icono: '⏱️', ruta: '/dashboard/disponibilidad' },
  { titulo: 'Ventanas', icono: '🎯', ruta: '/dashboard/horarios/ventanas' },
  { titulo: 'Horarios', icono: '🕐', ruta: '/dashboard/horarios' },
  { titulo: 'Usuarios', icono: '👤', ruta: '/dashboard/usuarios' },
  { titulo: 'Solicitudes', icono: '📋', ruta: '/dashboard/solicitudes' },
  { titulo: 'Reportes', icono: '📄', ruta: '/dashboard/reportes' },
  { titulo: 'Configuración', icono: '⚙️', ruta: '/dashboard/configuracion' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-800">
          <h1 className="text-xl font-bold">Sistema de horarios</h1>
          <p className="text-sm text-primary-300 mt-1">UNT - Sistemas</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {(() => {
            // Buscar SOLO la ruta más específica
            const activeItem = menuItems
              .filter(
                (item) =>
                  pathname === item.ruta ||
                  pathname.startsWith(item.ruta + '/')
              )
              .sort((a, b) => b.ruta.length - a.ruta.length)[0];

            return menuItems.map((item) => {
              const isActive = activeItem?.ruta === item.ruta;

              return (
                <Link
                  key={item.ruta}
                  href={item.ruta}
                  className={`
                    flex items-center gap-3 px-6 py-3 transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-800 border-l-4 border-white text-white font-semibold'
                        : 'hover:bg-primary-800/70 text-gray-300'
                    }
                  `}
                >
                  <span className="text-2xl">{item.icono}</span>
                  <span>{item.titulo}</span>
                </Link>
              );
            });
          })()}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => pathname === item.ruta)?.titulo || 'Dashboard'}
            </h2>
            <MenuUsuario />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
