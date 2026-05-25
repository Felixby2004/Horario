'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Selector } from '@/components/ui/Selector';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Modal } from '@/components/ui/Modal';

export default function RestriccionesPage() {
  const [restricciones, setRestricciones] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [nuevaRestriccion, setNuevaRestriccion] = useState({
    tipo: 'prohibicion',
    descripcion: '',
    dias_aplicables: [] as string[],
    hora_inicio: '07:00',
    hora_fin: '22:00',
    prioridad: 1
  });

  useEffect(() => {
    cargarRestricciones();
  }, []);

  const cargarRestricciones = async () => {
    try {
      const response = await fetch('/api/configuracion/restricciones');
      const data = await response.json();
      if (data.exito) {
        setRestricciones(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async () => {
    try {
      const response = await fetch('/api/configuracion/restricciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaRestriccion)
      });

      const data = await response.json();
      if (data.exito) {
        setModalAbierto(false);
        cargarRestricciones();
        setNuevaRestriccion({
          tipo: 'prohibicion',
          descripcion: '',
          dias_aplicables: [],
          hora_inicio: '07:00',
          hora_fin: '22:00',
          prioridad: 1
        });
      }
    } catch (error) {
      alert('Error al crear restricción');
    }
  };

  const columnas = [
    { clave: 'tipo', titulo: 'Tipo' },
    { clave: 'descripcion', titulo: 'Descripción' },
    { 
      clave: 'dias_aplicables', 
      titulo: 'Días',
      renderizar: (dias: string[]) => dias?.join(', ') || 'Todos'
    },
    { clave: 'hora_inicio', titulo: 'Hora Inicio' },
    { clave: 'hora_fin', titulo: 'Hora Fin' },
    { clave: 'prioridad', titulo: 'Prioridad' }
  ];

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Restricciones Institucionales</h1>
        <Boton onClick={() => setModalAbierto(true)}>
          Nueva Restricción
        </Boton>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TablaDatos
          datos={restricciones}
          columnas={columnas}
          keyField="id_restriccion"
        />
      </div>

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Nueva Restricción"
      >
        <div className="space-y-4">
          <Selector
            etiqueta="Tipo"
            value={nuevaRestriccion.tipo}
            onChange={(e) => setNuevaRestriccion({...nuevaRestriccion, tipo: e.target.value})}
            opciones={[
              { valor: 'prohibicion', etiqueta: 'Prohibición' },
              { valor: 'preferencia', etiqueta: 'Preferencia' }
            ]}
          />
          
          <CampoTexto
            etiqueta="Descripción"
            value={nuevaRestriccion.descripcion}
            onChange={(e) => setNuevaRestriccion({...nuevaRestriccion, descripcion: e.target.value})}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <CampoTexto
              etiqueta="Hora Inicio"
              type="time"
              value={nuevaRestriccion.hora_inicio}
              onChange={(e) => setNuevaRestriccion({...nuevaRestriccion, hora_inicio: e.target.value})}
            />
            <CampoTexto
              etiqueta="Hora Fin"
              type="time"
              value={nuevaRestriccion.hora_fin}
              onChange={(e) => setNuevaRestriccion({...nuevaRestriccion, hora_fin: e.target.value})}
            />
          </div>

          <CampoTexto
            etiqueta="Prioridad (1-10)"
            type="number"
            min={1}
            max={10}
            value={nuevaRestriccion.prioridad}
            onChange={(e) => setNuevaRestriccion({...nuevaRestriccion, prioridad: parseInt(e.target.value)})}
          />

          <div className="flex gap-3 justify-end mt-6">
            <Boton variante="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={handleCrear}>
              Crear Restricción
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
