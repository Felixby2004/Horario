'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formulario, setFormulario] = useState({
    codigo: '',
    password: ''
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();

      if (data.exito) {
        // Guardar sesión en localStorage
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('token', data.token);
        // Compatibilidad: algunas partes del cliente usan 'auth_token'
        localStorage.setItem('auth_token', data.token);
        // Compatibilidad: algunas partes esperan 'usuario'
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        // Redirigir según el rol del usuario
        if (data.usuario.rol === 'docente') {
          router.push('/docente');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        setError(data.mensaje || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">UNT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Sistema de horarios</h1>
          <p className="text-gray-600 mt-2">Universidad Nacional de Trujillo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={formulario.codigo}
              onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese su usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formulario.password}
              onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800 font-medium mb-2">Datos de prueba:</p>
          <p className="text-xs text-blue-700">Usuario: <strong>admin</strong></p>
          <p className="text-xs text-blue-700">Contraseña: <strong>admin123</strong></p>
        </div>

        {/* Link a registro */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
