'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombres: '',
    apellidos: '',
    correo_electronico: '',
    password: '',
    confirmar_password: '',
    rol: 'docente'
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    // Validaciones
    if (formulario.password !== formulario.confirmar_password) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    if (formulario.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setCargando(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();

      if (data.exito) {
        alert('✅ Usuario registrado exitosamente. Por favor inicie sesión.');
        router.push('/auth/login');
      } else {
        setError(data.mensaje || 'Error al registrar usuario');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">UNT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Crear Nueva Cuenta</h1>
          <p className="text-gray-600 mt-2">Sistema de Horarios - UNT</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Usuario *
              </label>
              <input
                type="text"
                value={formulario.codigo}
                onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: USR001"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Código único para identificación</p>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                value={formulario.rol}
                onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="docente">Docente</option>
                <option value="administrador_sistema">Administrador del Sistema</option>
              </select>
            </div>

            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                value={formulario.nombres}
                onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Carlos"
                required
              />
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={formulario.apellidos}
                onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Pérez García"
                required
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={formulario.correo_electronico}
                onChange={(e) => setFormulario({ ...formulario, correo_electronico: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="correo@unitru.edu.pe"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formulario.password}
                onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            {/* Confirmar Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={formulario.confirmar_password}
                onChange={(e) => setFormulario({ ...formulario, confirmar_password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repetir contraseña"
                required
              />
            </div>
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 mt-6"
          >
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
