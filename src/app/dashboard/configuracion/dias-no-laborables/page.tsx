'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Selector } from '@/components/ui/Selector';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Modal } from '@/components/ui/Modal';

export default function DiasNoLaborablesPage() {
  const [dias, setDias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [nuevoDia, setNuevoDia] = useState({
    fecha: '',
    descripcion: '',
    tipo: 'feriado',
    recurrente: false
  });

  useEffect(() => {
    cargarDias();
  }, [anioSeleccionado]);

  const cargarDias = async () => {
    const response = await fetch(`/api/configuracion/dias-no-laborables?anio=${anioSeleccionado}`);
    const data = await response.json();
    if (data.exito) {
      setDias(data.datos);
    }
  };

  const handleCrear = async () => {
    const response = await fetch('/api/configuracion/dias-no-laborables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoDia)
    });

    const data = await response.json();
    if (data.exito) {
      setModalAbierto(false);
      cargarDias();
      setNuevoDia({
        fecha: '',
        descripcion: '',
        tipo: 'feriado',
        recurrente: false
      });
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este día no laborable?')) return;

    const response = await fetch(`/api/configuracion/dias-no-laborables?id=${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      cargarDias();
    }
  };

  const columnas = [
    { 
      clave: 'fecha', 
      titulo: 'Fecha',
      renderizar: (fecha: string) => new Date(fecha).toLocaleDateString('es-PE')
    },
    { clave: 'descripcion', titulo: 'Descripción' },
    { clave: 'tipo', titulo: 'Tipo' },
    {
      clave: 'recurrente',
      titulo: 'Recurrente',
      renderizar: (valor: boolean) => valor ? 'Sí' : 'No'
    },
    {
      clave: 'id_dia',
      titulo: 'Acciones',
      renderizar: (id: number) => (
        <Boton
          variante="danger"
          onClick={() => handleEliminar(id)}
          tamaño="sm"
        >
          Eliminar
        </Boton>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Días No Laborables</h1>
        <div className="flex gap-3">
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
            className="border rounded-lg px-4 py-2"
          >
            {[2024, 2025, 2026, 2027].map(anio => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
          <Boton onClick={() => setModalAbierto(true)}>
            Nuevo Día No Laborable
          </Boton>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TablaDatos
          datos={dias}
          columnas={columnas}
          keyField="id_dia"
        />
      </div>

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Nuevo Día No Laborable"
      >
        <div className="space-y-4">
          <CampoTexto
            etiqueta="Fecha"
            type="date"
            value={nuevoDia.fecha}
            onChange={(e) => setNuevoDia({...nuevoDia, fecha: e.target.value})}
            required
          />

          <CampoTexto
            etiqueta="Descripción"
            value={nuevoDia.descripcion}
            onChange={(e) => setNuevoDia({...nuevoDia, descripcion: e.target.value})}
            required
          />

          <Selector
            etiqueta="Tipo"
            value={nuevoDia.tipo}
            onChange={(e) => setNuevoDia({...nuevoDia, tipo: e.target.value})}
            opciones={[
              { valor: 'feriado', etiqueta: 'Feriado' },
              { valor: 'asueto', etiqueta: 'Asueto' },
              { valor: 'otro', etiqueta: 'Otro' }
            ]}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={nuevoDia.recurrente}
              onChange={(e) => setNuevoDia({...nuevoDia, recurrente: e.target.checked})}
              className="w-5 h-5"
            />
            <span>Recurrente (cada año)</span>
          </label>

          <div className="flex gap-3 justify-end mt-6">
            <Boton variante="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={handleCrear}>
              Crear
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
