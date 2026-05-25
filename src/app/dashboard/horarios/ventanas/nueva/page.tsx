'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';

export default function NuevaVentanaPage() {
  const router = useRouter();
  const [periodos, setPeriodos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    id_periodo: '',
    fecha: '',
    orden_prioridad: '1',
    modalidad: 'nombrado',
    categoria: 'principal',
    hora_inicio: '08:00',
    hora_fin: '18:00',
    intervalo_minutos: '15',
    activo: true
  });

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const response = await fetch('/api/periodos');
      const data = await response.json();
      if (data.exito) {
        setPeriodos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando períodos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const response = await fetch('/api/ventanas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id_periodo: parseInt(formData.id_periodo),
          orden_prioridad: parseInt(formData.orden_prioridad),
          intervalo_minutos: parseInt(formData.intervalo_minutos)
        })
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Ventana creada exitosamente');
        router.push('/dashboard/horarios/ventanas');
      } else {
        alert('❌ ' + (data.mensaje || 'Error al crear ventana'));
      }
    } catch (error) {
      alert('❌ Error al crear ventana');
      console.error('Error:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Ventana de Atención</h1>
        <p className="text-gray-600 mt-1">
          Configure una nueva ventana de atención por categoría y modalidad
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Período Académico *
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.id_periodo}
            onChange={(e) => setFormData({ ...formData, id_periodo: e.target.value })}
            required
          >
            <option value="">Seleccione período</option>
            {periodos.map((p: any) => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Modalidad *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.modalidad}
              onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
              required
            >
              <option value="nombrado">Nombrado</option>
              <option value="contratado">Contratado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Categoría *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            >
              <option value="principal">👑 Principal</option>
              <option value="asociado">🥈 Asociado</option>
              <option value="auxiliar">🥉 Auxiliar</option>
              <option value="jefe_practica">📝 Jefe de Práctica</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha *
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Orden de Prioridad *
            </label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-3 py-2"
              value={formData.orden_prioridad}
              onChange={(e) => setFormData({ ...formData, orden_prioridad: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 mt-1">1 = Mayor prioridad</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Hora Inicio *
            </label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Hora Fin *
            </label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Intervalo (min) *
            </label>
            <input
              type="number"
              min="5"
              step="5"
              className="w-full border rounded px-3 py-2"
              value={formData.intervalo_minutos}
              onChange={(e) => setFormData({ ...formData, intervalo_minutos: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            className="mr-2"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
          />
          <label htmlFor="activo" className="text-sm font-medium">
            Ventana activa
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Boton type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear Ventana'}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Sobre las Ventanas</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Modalidad:</strong> Nombrado o Contratado</p>
          <p><strong>Categoría:</strong> Principal, Asociado, Auxiliar, Jefe de Práctica</p>
          <p><strong>Orden:</strong> Define prioridad (1 = más importante)</p>
          <p><strong>Intervalo:</strong> Tiempo entre citas en minutos</p>
        </div>
      </div>
    </div>
  );
}
