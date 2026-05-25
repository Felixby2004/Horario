'use client';

// Barra de progreso
export const BarraProgreso = ({ porcentaje, color = 'primary' }: any) => {
  const colores = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all ${colores[color]}`}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
};

// Indicador KPI
export const IndicadorKPI = ({ titulo, valor, icono, cambio, tendencia }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{titulo}</p>
          <p className="text-3xl font-bold mt-2">{valor}</p>
          {cambio && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              tendencia === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{tendencia === 'up' ? '↑' : '↓'}</span>
              <span>{cambio}</span>
            </div>
          )}
        </div>
        <div className="text-4xl">{icono}</div>
      </div>
    </div>
  );
};

// Tarjeta de estadística
export const TarjetaEstadistica = ({ titulo, valor, descripcion, color }: any) => {
  const colores = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colores[color] || colores.blue}`}>
      <div className="text-sm font-medium opacity-80 mb-2">{titulo}</div>
      <div className="text-3xl font-bold mb-1">{valor}</div>
      {descripcion && (
        <div className="text-sm opacity-75">{descripcion}</div>
      )}
    </div>
  );
};

// Pantalla de carga
export const PantallaCarga = ({ mensaje = 'Cargando...' }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium">{mensaje}</p>
      </div>
    </div>
  );
};

// Confirmación de diálogo
export const ConfirmacionDialogo = ({ abierto, titulo, mensaje, onConfirmar, onCancelar }: any) => {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
        <p className="text-gray-600 mb-6">{mensaje}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancelar}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Notificación Toast
export const NotificacionToast = ({ tipo, mensaje, visible, onCerrar }: any) => {
  if (!visible) return null;

  const estilos = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const iconos = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${estilos[tipo]} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <span className="text-2xl">{iconos[tipo]}</span>
        <span className="flex-1">{mensaje}</span>
        <button
          onClick={onCerrar}
          className="text-white hover:opacity-75"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Modal de confirmación
export const ModalConfirmacion = ({ abierto, titulo, mensaje, onConfirmar, onCancelar, tipo = 'warning' }: any) => {
  if (!abierto) return null;

  const colores = {
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start gap-4">
          <div className={`text-4xl ${colores[tipo]}`}>
            {tipo === 'danger' ? '⚠️' : tipo === 'warning' ? '❓' : 'ℹ️'}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
            <p className="text-gray-600">{mensaje}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancelar}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`px-4 py-2 rounded-lg text-white ${
              tipo === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Combo de Ambiente
export const ComboAmbiente = ({ value, onChange, tipo }: any) => {
  const [ambientes, setAmbientes] = useState([]);

  useState(() => {
    cargarAmbientes();
  }, [tipo]);

  const cargarAmbientes = async () => {
    const url = tipo ? `/api/ambientes?tipo=${tipo}` : '/api/ambientes';
    const response = await fetch(url);
    const data = await response.json();
    if (data.exito) setAmbientes(data.datos);
  };

  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg px-4 py-2"
    >
      <option value="">Seleccione un ambiente</option>
      {ambientes.map((a: any) => (
        <option key={a.id_ambiente} value={a.id_ambiente}>
          {a.nombre} ({a.tipo})
        </option>
      ))}
    </select>
  );
};

// Combo de Curso
export const ComboCurso = ({ value, onChange }: any) => {
  const [cursos, setCursos] = useState([]);

  useState(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    const response = await fetch('/api/cursos');
    const data = await response.json();
    if (data.exito) setCursos(data.datos);
  };

  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg px-4 py-2"
    >
      <option value="">Seleccione un curso</option>
      {cursos.map((c: any) => (
        <option key={c.id_curso} value={c.id_curso}>
          {c.codigo_curso} - {c.nombre}
        </option>
      ))}
    </select>
  );
};

// Combo de Docente
export const ComboDocente = ({ value, onChange, categoria }: any) => {
  const [docentes, setDocentes] = useState([]);

  useState(() => {
    cargarDocentes();
  }, [categoria]);

  const cargarDocentes = async () => {
    const url = categoria ? `/api/docentes/por-categoria?categoria=${categoria}` : '/api/docentes';
    const response = await fetch(url);
    const data = await response.json();
    if (data.exito) setDocentes(data.datos);
  };

  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg px-4 py-2"
    >
      <option value="">Seleccione un docente</option>
      {docentes.map((d: any) => (
        <option key={d.id_docente} value={d.id_docente}>
          {d.apellidos}, {d.nombres} ({d.categoria})
        </option>
      ))}
    </select>
  );
};

import { useState } from 'react';
