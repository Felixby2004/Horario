'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

// Panel de estadísticas de ventanas
export const PanelEstadisticasVentanas = ({ estadisticas }: any) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-3xl font-bold text-primary-600">
          {estadisticas.totalVentanas}
        </div>
        <div className="text-sm text-gray-600">Total ventanas</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-3xl font-bold text-green-600">
          {estadisticas.ventanasCompletadas}
        </div>
        <div className="text-sm text-gray-600">Completadas</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-3xl font-bold text-yellow-600">
          {estadisticas.ventanasEnProceso}
        </div>
        <div className="text-sm text-gray-600">En proceso</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-3xl font-bold text-gray-600">
          {estadisticas.ventanasPendientes}
        </div>
        <div className="text-sm text-gray-600">Pendientes</div>
      </div>
    </div>
  );
};

// Historial de atenciones
export const HistorialAtenciones = ({ atenciones }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Historial de atenciones</h3>

      <div className="space-y-3">
        {atenciones.map((atencion: any) => (
          <div key={atencion.id} className="border-l-4 border-primary-600 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {atencion.docente.apellidos}, {atencion.docente.nombres}
                </div>
                <div className="text-sm text-gray-600">
                  {atencion.docente.categoria}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {atencion.hora_inicio} - {atencion.hora_fin}
                </div>
                <div className="text-xs text-gray-500">
                  {atencion.duracion} min
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {atenciones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay atenciones registradas
        </div>
      )}
    </div>
  );
};

// Selector de ventana
export const SelectorVentana = ({ ventanas, onSeleccionar, seleccionada }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-3">Seleccionar Ventana</h3>
      
      <div className="space-y-2">
        {ventanas.map((ventana: any) => (
          <button
            key={ventana.id}
            onClick={() => onSeleccionar(ventana)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              seleccionada?.id === ventana.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{ventana.nombre}</div>
                <div className="text-sm text-gray-600">
                  {ventana.fecha_inicio} - {ventana.fecha_fin}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                ventana.estado === 'activa'
                  ? 'bg-green-100 text-green-800'
                  : ventana.estado === 'programada'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {ventana.estado}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Indicador de turno actual
export const IndicadorTurnoActual = ({ turno }: any) => {
  if (!turno) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <div className="text-gray-500">No hay turno en atención</div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 border-2 border-primary-600 p-6 rounded-lg">
      <div className="text-center mb-4">
        <div className="text-sm text-primary-600 font-medium">TURNO ACTUAL</div>
        <div className="text-4xl font-bold text-primary-800 my-2">
          #{turno.numero}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-sm text-gray-600">Docente</div>
          <div className="font-medium">
            {turno.docente.apellidos}, {turno.docente.nombres}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Categoría</div>
          <div className="font-medium capitalize">{turno.docente.categoria}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Hora de inicio</div>
          <div className="font-medium">{turno.hora_inicio}</div>
        </div>
      </div>
    </div>
  );
};

// Próximos turnos
export const ProximosTurnos = ({ turnos }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-3">Próximos turnos</h3>

      <div className="space-y-2">
        {turnos.slice(0, 5).map((turno: any, index: number) => (
          <div
            key={turno.id}
            className="flex items-center gap-3 p-2 border rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">
                {turno.docente.apellidos}, {turno.docente.nombres}
              </div>
              <div className="text-xs text-gray-600">
                {turno.docente.categoria}
              </div>
            </div>
          </div>
        ))}
      </div>

      {turnos.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No hay turnos pendientes
        </div>
      )}
    </div>
  );
};

// Resumen del día
export const ResumenDia = ({ resumen }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Resumen del Día</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-primary-600">
            {resumen.totalAtendidos}
          </div>
          <div className="text-sm text-gray-600">Docentes atendidos</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-green-600">
            {resumen.horariosAsignados}
          </div>
          <div className="text-sm text-gray-600">Horarios asignados</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {resumen.tiempoPromedio}
          </div>
          <div className="text-sm text-gray-600">Tiempo promedio (min)</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-blue-600">
            {resumen.enEspera}
          </div>
          <div className="text-sm text-gray-600">En espera</div>
        </div>
      </div>
    </div>
  );
};
