'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TablaPaginada } from '@/components/ui/TablaPaginada';
import { ColumnaAntigua } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';
import { formatearTextoVisualOracion } from '@/lib/formatoTexto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();
      if (data.exito) {
        setUsuarios(data.datos || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const toggleActivo = async (id: number, activo: boolean) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !activo })
      });

      const data = await response.json();
      if (data.exito) {
        alert(`Usuario ${!activo ? 'activado' : 'desactivado'} exitosamente`);
        cargarUsuarios();
      }
    } catch (error) {
      alert('Error al actualizar usuario');
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.exito) {
        alert('Usuario eliminado exitosamente');
        cargarUsuarios();
      }
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  const textoBusqueda = busqueda.trim().toLowerCase();
  const usuariosFiltrados = usuarios.filter((u: any) => {
    if (!textoBusqueda) return true;
    const nombre = `${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase();
    const codigo = String(u.codigo || '').toLowerCase();
    const correo = String(u.correo_electronico || '').toLowerCase();
    // Handle rol safely if it's an object
    let rolStr = '';
    if (typeof u.rol === 'string') {
      rolStr = u.rol.replace(/_/g, ' ').toLowerCase();
    } else if (u.rol && typeof u.rol === 'object' && 'nombre' in u.rol) {
      rolStr = String(u.rol.nombre).toLowerCase();
    }
    return (
      nombre.includes(textoBusqueda) ||
      codigo.includes(textoBusqueda) ||
      correo.includes(textoBusqueda) ||
      rolStr.includes(textoBusqueda)
    );
  });

  // Helper function to safely get string values
  const getStringValue = (value: any, defaultValue: string = 'Sin asignar'): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value && typeof value === 'object' && 'nombre' in value) {
      return String(value.nombre);
    }
    return defaultValue;
  };

  const columnas: ColumnaAntigua<any>[] = [
    { campo: 'codigo' as const, encabezado: 'Código' },
    { 
      campo: 'nombres' as const, 
      encabezado: 'Nombre Completo',
      renderizar: (_: any, u: any) => `${u.apellidos || ''}, ${u.nombres || ''}`
    },
    { 
      campo: 'correo_electronico' as const, 
      encabezado: 'Email',
      renderizar: (email: any) => getStringValue(email, '-')
    },
    { 
      campo: 'rol' as const, 
      encabezado: 'Rol',
      renderizar: (rol: any) => {
        const rolName = getStringValue(rol);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {formatearTextoVisualOracion(rolName)}
          </span>
        );
      }
    },
    { 
      campo: 'activo' as const, 
      encabezado: 'Estado',
      renderizar: (activo: any, u: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {u.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    { 
      campo: 'ultimo_acceso' as const, 
      encabezado: 'Último Acceso',
      renderizar: (ultimoAcceso: any) => {
        if (!ultimoAcceso) return 'Nunca';
        try {
          return new Date(ultimoAcceso).toLocaleString();
        } catch {
          return 'Nunca';
        }
      }
    },
    { 
      campo: 'id_usuario' as const, 
      encabezado: 'Acciones',
      renderizar: (_: any, u: any) => (
        <div className="flex gap-2">
          <Boton
            onClick={() => toggleActivo(u.id_usuario, u.activo)}
            tamaño="sm"
            variante={u.activo ? 'secondary' : 'primary'}
          >
            <FontAwesomeIcon icon={faPowerOff} className="w-4 h-4 mr-2" />
            {u.activo ? 'Desactivar' : 'Activar'}
          </Boton>
          <Boton
            onClick={() => eliminar(u.id_usuario)}
            variante="error"
            tamaño="sm"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
            Eliminar
          </Boton>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de usuarios</h1>
        <Boton onClick={() => router.push('/auth/register')}>
          + Nuevo Usuario
        </Boton>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Buscar usuario
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Busca por código, nombre, correo o rol..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Filtra la tabla sin eliminar datos. Útil para ubicar rápidamente un usuario y gestionarlo.
          </p>
        </div>

        {usuarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados.
          </div>
        ) : (
          <TablaPaginada
            columnas={columnas}
            datos={usuariosFiltrados}
            keyField="id_usuario"
          />
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{usuarios.length}</div>
          <div className="text-sm text-gray-600">Total Usuarios</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {usuarios.filter((u: any) => u.activo).length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {usuarios.filter((u: any) => !u.activo).length}
          </div>
          <div className="text-sm text-gray-600">Inactivos</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {usuarios.filter((u: any) => {
              // Check rol safely
              if (typeof u.rol === 'string') return u.rol === 'administrador_sistema';
              if (u.rol && typeof u.rol === 'object' && 'nombre' in u.rol) {
                return u.rol.nombre === 'administrador_sistema' || u.rol.nombre === 'Administrador Sistema';
              }
              return false;
            }).length}
          </div>
          <div className="text-sm text-gray-600">Administradores</div>
        </div>
      </div>
    </div>
  );
}
