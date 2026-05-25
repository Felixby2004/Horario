'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Selector } from '@/components/ui/Selector';
import { TablaDatos } from '@/components/ui/TablaDatos';

// Página de configuración de restricciones
export function ConfiguracionRestriccionesPage() {
  const [restricciones, setRestricciones] = useState<any>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarRestricciones();
  }, []);

  const cargarRestricciones = async () => {
    const response = await fetch('/api/configuracion/restricciones');
    const data = await response.json();
    if (data.exito) setRestricciones(data.datos);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await fetch('/api/configuracion/restricciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restricciones)
      });
      alert('Restricciones guardadas');
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración de Restricciones</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Restricciones de Horario</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Horas mínimas entre clases del mismo docente
              </label>
              <input
                type="number"
                value={restricciones.horas_minimas_entre_clases || 0}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  horas_minimas_entre_clases: parseInt(e.target.value)
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Máximo de horas consecutivas
              </label>
              <input
                type="number"
                value={restricciones.max_horas_consecutivas || 0}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  max_horas_consecutivas: parseInt(e.target.value)
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Horas máximas por día
              </label>
              <input
                type="number"
                value={restricciones.max_horas_por_dia || 0}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  max_horas_por_dia: parseInt(e.target.value)
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Horas máximas por semana
              </label>
              <input
                type="number"
                value={restricciones.max_horas_por_semana || 0}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  max_horas_por_semana: parseInt(e.target.value)
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Restricciones de Ambientes</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={restricciones.permitir_aulas_superpuestas || false}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  permitir_aulas_superpuestas: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span>Permitir aulas superpuestas</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={restricciones.validar_capacidad_ambiente || false}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  validar_capacidad_ambiente: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span>Validar capacidad del ambiente</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={restricciones.requerir_laboratorio_para_practicas || false}
                onChange={(e) => setRestricciones({
                  ...restricciones,
                  requerir_laboratorio_para_practicas: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span>Requerir laboratorio para prácticas</span>
            </label>
          </div>
        </div>

        <Boton onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar Restricciones'}
        </Boton>
      </div>
    </div>
  );
}

// Página de días no laborables
export function DiasNoLaborablesPage() {
  const [dias, setDias] = useState([]);
  const [nuevoDia, setNuevoDia] = useState({ fecha: '', descripcion: '', recurrente: false });

  useEffect(() => {
    cargarDias();
  }, []);

  const cargarDias = async () => {
    const response = await fetch('/api/configuracion/dias-no-laborables');
    const data = await response.json();
    if (data.exito) setDias(data.datos);
  };

  const agregar = async () => {
    await fetch('/api/configuracion/dias-no-laborables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoDia)
    });
    cargarDias();
    setNuevoDia({ fecha: '', descripcion: '', recurrente: false });
  };

  const eliminar = async (id: number) => {
    await fetch(`/api/configuracion/dias-no-laborables/${id}`, {
      method: 'DELETE'
    });
    cargarDias();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Días No Laborables</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Agregar Día No Laborable</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <input
              type="date"
              value={nuevoDia.fecha}
              onChange={(e) => setNuevoDia({ ...nuevoDia, fecha: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <input
              type="text"
              value={nuevoDia.descripcion}
              onChange={(e) => setNuevoDia({ ...nuevoDia, descripcion: e.target.value })}
              placeholder="Ej: Día del Maestro"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={nuevoDia.recurrente}
                onChange={(e) => setNuevoDia({ ...nuevoDia, recurrente: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Recurrente anualmente</span>
            </label>
          </div>
        </div>

        <Boton onClick={agregar}>Agregar</Boton>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Días Registrados</h3>

        <TablaDatos
          columnas={[
            { clave: 'fecha', etiqueta: 'Fecha' },
            { clave: 'descripcion', etiqueta: 'Descripción' },
            { clave: 'recurrente', etiqueta: 'Recurrente' },
            { clave: 'acciones', etiqueta: 'Acciones' }
          ]}
          datos={dias.map((d: any) => ({
            ...d,
            recurrente: d.recurrente ? 'Sí' : 'No',
            acciones: (
              <Boton onClick={() => eliminar(d.id)} variante="danger" tamaño="small">
                Eliminar
              </Boton>
            )
          }))}
        />
      </div>
    </div>
  );
}

// Página de auditoría
export function AuditoriaPage() {
  const [registros, setRegistros] = useState([]);
  const [filtros, setFiltros] = useState({ usuario: '', accion: '', desde: '', hasta: '' });

  useEffect(() => {
    cargarRegistros();
  }, [filtros]);

  const cargarRegistros = async () => {
    const params = new URLSearchParams(filtros as any);
    const response = await fetch(`/api/auditoria?${params}`);
    const data = await response.json();
    if (data.exito) setRegistros(data.datos);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Auditoría del Sistema</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Filtros</h3>

        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Usuario"
            value={filtros.usuario}
            onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
            className="border rounded-lg px-4 py-2"
          />

          <select
            value={filtros.accion}
            onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Todas las acciones</option>
            <option value="crear">Crear</option>
            <option value="editar">Editar</option>
            <option value="eliminar">Eliminar</option>
            <option value="login">Login</option>
          </select>

          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
            className="border rounded-lg px-4 py-2"
          />

          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
            className="border rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <TablaDatos
          columnas={[
            { clave: 'fecha_hora', etiqueta: 'Fecha/Hora' },
            { clave: 'usuario', etiqueta: 'Usuario' },
            { clave: 'accion', etiqueta: 'Acción' },
            { clave: 'tabla', etiqueta: 'Tabla' },
            { clave: 'detalles', etiqueta: 'Detalles' }
          ]}
          datos={registros}
        />
      </div>
    </div>
  );
}
