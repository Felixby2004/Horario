'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

interface Usuario {
  id_usuario: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  correo_electronico?: string;
  rol: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [exito, setExito] = useState(false);

  // Formulario
  const [formulario, setFormulario] = useState({
    nombres: '',
    apellidos: '',
    correo_electronico: '',
    contrasena: '',
    contrasena_confirmacion: ''
  });

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = () => {
    try {
      const usuarioGuardado = localStorage.getItem('user');
      if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);
        setFormulario({
          nombres: user.nombres || '',
          apellidos: user.apellidos || '',
          correo_electronico: user.correo_electronico || '',
          contrasena: '',
          contrasena_confirmacion: ''
        });
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.nombres.trim()) {
      nuevosErrores.nombres = 'El nombre es requerido';
    }
    if (!formulario.apellidos.trim()) {
      nuevosErrores.apellidos = 'El apellido es requerido';
    }

    // Validar contraseña si se intenta cambiar
    if (formulario.contrasena || formulario.contrasena_confirmacion) {
      if (formulario.contrasena.length < 6) {
        nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (formulario.contrasena !== formulario.contrasena_confirmacion) {
        nuevosErrores.contrasena_confirmacion = 'Las contraseñas no coinciden';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario() || !usuario) return;

    setGuardando(true);
    setExito(false);

    try {
      const datosActualizar: any = {
        nombres: formulario.nombres,
        apellidos: formulario.apellidos
      };

      if (formulario.correo_electronico) {
        datosActualizar.correo_electronico = formulario.correo_electronico;
      }

      if (formulario.contrasena) {
        datosActualizar.contrasena = formulario.contrasena;
      }

      const response = await fetch(`/api/usuarios/${usuario.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizar)
      });

      const data = await response.json();

      if (data.exito) {
        // Actualizar localStorage con los nuevos datos
        const usuarioActualizado = {
          ...usuario,
          nombres: formulario.nombres,
          apellidos: formulario.apellidos,
          correo_electronico: formulario.correo_electronico || usuario.correo_electronico
        };
        localStorage.setItem('user', JSON.stringify(usuarioActualizado));

        setExito(true);
        // Limpiar campos de contraseña
        setFormulario(prev => ({
          ...prev,
          contrasena: '',
          contrasena_confirmacion: ''
        }));

        // Mostrar mensaje de éxito por 3 segundos
        setTimeout(() => setExito(false), 3000);
      } else {
        setErrores({ general: data.mensaje || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrores({ general: 'Error al guardar los cambios' });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: No se pudo cargar la información del usuario
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Actualiza tu información personal</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Código:</strong> {usuario.codigo}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Rol:</strong> {usuario.rol?.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
            </div>

            {/* Nombres */}
            <CampoTexto
              etiqueta="Nombres"
              type="text"
              required
              value={formulario.nombres}
              onChange={(e) => {
                setFormulario(prev => ({ ...prev, nombres: e.target.value }));
                if (errores.nombres) setErrores(prev => ({ ...prev, nombres: '' }));
              }}
              error={errores.nombres}
              placeholder="Ingresa tus nombres"
            />

            {/* Apellidos */}
            <CampoTexto
              etiqueta="Apellidos"
              type="text"
              required
              value={formulario.apellidos}
              onChange={(e) => {
                setFormulario(prev => ({ ...prev, apellidos: e.target.value }));
                if (errores.apellidos) setErrores(prev => ({ ...prev, apellidos: '' }));
              }}
              error={errores.apellidos}
              placeholder="Ingresa tus apellidos"
            />

            {/* Correo */}
            <div className="md:col-span-2">
              <CampoTexto
                etiqueta="Correo Electrónico"
                type="email"
                value={formulario.correo_electronico}
                onChange={(e) => setFormulario(prev => ({ ...prev, correo_electronico: e.target.value }))}
                placeholder="correo@ejemplo.com"
                ayuda="Puedes dejar vacío si no deseas actualizar tu correo"
              />
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h2>
            <p className="text-sm text-gray-600 mb-4">
              Completa estos campos solo si deseas cambiar tu contraseña
            </p>

            <div className="space-y-4">
              <CampoTexto
                etiqueta="Nueva Contraseña"
                type="password"
                value={formulario.contrasena}
                onChange={(e) => {
                  setFormulario(prev => ({ ...prev, contrasena: e.target.value }));
                  if (errores.contrasena) setErrores(prev => ({ ...prev, contrasena: '' }));
                }}
                error={errores.contrasena}
                placeholder="Ingresa una nueva contraseña"
                ayuda="Mínimo 6 caracteres"
              />

              <CampoTexto
                etiqueta="Confirmar Contraseña"
                type="password"
                value={formulario.contrasena_confirmacion}
                onChange={(e) => {
                  setFormulario(prev => ({ ...prev, contrasena_confirmacion: e.target.value }));
                  if (errores.contrasena_confirmacion) setErrores(prev => ({ ...prev, contrasena_confirmacion: '' }));
                }}
                error={errores.contrasena_confirmacion}
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>

          {/* Mensajes */}
          {exito && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✓ Perfil actualizado exitosamente
            </div>
          )}

          {errores.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errores.general}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Boton
              type="submit"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
            </Boton>
            <Boton
              type="button"
              variante="secondary"
              onClick={() => router.back()}
            >
              Cancelar
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
