'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sidebar
export const Sidebar = ({ items }: any) => {
  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary-600">Horarios UNT</h2>
      </div>
      <nav className="px-4">
        {items.map((item: any) => (
          <ItemSidebar key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
};

// Item de Sidebar
export const ItemSidebar = ({ href, icono, texto, activo }: any) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
        activo
          ? 'bg-primary-100 text-primary-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icono}</span>
      <span>{texto}</span>
    </Link>
  );
};

// Barra Superior
export const BarraSuperior = ({ usuario }: any) => {
  return (
    <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1"></div>
        <MenuUsuario usuario={usuario} />
      </div>
    </header>
  );
};

// Menú de Usuario
export const MenuUsuario = ({ usuario }: any) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2"
      >
        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
          {usuario?.nombres?.[0] || 'U'}
        </div>
        <span className="font-medium">{usuario?.nombres || 'Usuario'}</span>
        <span>▼</span>
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
          <Link
            href="/dashboard/perfil"
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Mi Perfil
          </Link>
          <Link
            href="/dashboard/configuracion"
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Configuración
          </Link>
          <hr />
          <button
            onClick={() => {/* logout */}}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

// Breadcrumbs
export const Breadcrumbs = ({ rutas }: any) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600">
      {rutas.map((ruta: any, i: number) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {ruta.href ? (
            <Link href={ruta.href} className="hover:text-primary-600">
              {ruta.texto}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{ruta.texto}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

// Pie de Página
export const PiePagina = () => {
  return (
    <footer className="bg-white border-t py-4 px-6 text-center text-sm text-gray-600">
      <p>© 2025 Universidad Nacional de Trujillo - Escuela de Ingeniería de Sistemas</p>
      <p className="mt-1">Sistema de gestión de horarios v1.0</p>
    </footer>
  );
};

// Navegación Móvil
export const NavegacionMovil = ({ items }: any) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg"
      >
        ☰
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white w-64 h-full p-4">
            <button
              onClick={() => setAbierto(false)}
              className="text-2xl mb-4"
            >
              ✕
            </button>
            {items.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 px-4 hover:bg-gray-100 rounded"
                onClick={() => setAbierto(false)}
              >
                {item.texto}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
