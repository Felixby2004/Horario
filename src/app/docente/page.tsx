'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocenteHomePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    
    const user = JSON.parse(userData);
    setUsuario(user);
    setCargando(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12"><div className="loader"></div></div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de docente</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido, {usuario?.nombres} {usuario?.apellidos}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Código</p>
          <p className="text-2xl font-bold mt-2">{usuario?.codigo}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-emerald-100 text-sm font-medium">Correo</p>
          <p className="text-lg font-semibold mt-2 break-words">{usuario?.correo_electronico || 'No registrado'}</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-violet-100 text-sm font-medium">Rol</p>
          <p className="text-2xl font-bold mt-2 capitalize">{usuario?.rol}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Acciones Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/docente/disponibilidad')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">📆</div>
            <div className="font-semibold text-gray-900">Mi Disponibilidad</div>
            <div className="text-sm text-gray-600 mt-1">
              Registra los horarios en que puedes dictar clases
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/citaciones')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">🗓️</div>
            <div className="font-semibold text-gray-900">Mis Citaciones</div>
            <div className="text-sm text-gray-600 mt-1">
              Confirma tu turno para la asignación de horarios
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/seleccionar-horarios')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">📅</div>
            <div className="font-semibold text-gray-900">Seleccionar Horarios</div>
            <div className="text-sm text-gray-600 mt-1">
              Solicita tus horarios según tu ventana de atención
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/mis-horarios')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-semibold text-gray-900">Mis Horarios</div>
            <div className="text-sm text-gray-600 mt-1">
              Ver estado de tus solicitudes
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/mis-cursos')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="font-semibold text-gray-900">Mis Cursos</div>
            <div className="text-sm text-gray-600 mt-1">
              Ver cursos asignados
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/reportes')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="text-3xl mb-2">📄</div>
            <div className="font-semibold text-gray-900">Reportes</div>
            <div className="text-sm text-gray-600 mt-1">
              Consulta reportes de tus horarios
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-400">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Información Importante</h3>
        <ul className="text-gray-600 space-y-2 text-sm">
          <li>• <strong>Paso 1:</strong> Registra tu disponibilidad de horarios en <strong>"Mi Disponibilidad"</strong> cuando el coordinador abra la fase.</li>
          <li>• <strong>Paso 2:</strong> Recibirás una citación en <strong>"Mis Citaciones"</strong> con tu turno de atención (bloques de 15 minutos), ordenado por categoría y antigüedad.</li>
          <li>• <strong>Paso 3:</strong> Durante tu ventana de atención, selecciona tus horarios en <strong>"Seleccionar Horarios"</strong>.</li>
          <li>• Las solicitudes deben ser aprobadas por el administrador. Puedes revisar el estado en <strong>"Mis Horarios"</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
