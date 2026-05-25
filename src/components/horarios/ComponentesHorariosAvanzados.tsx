'use client';

import { useState } from 'react';

// Vista de horario por docente
export const VistaHorarioDocente = ({ horarios, docente }: any) => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Horario: {docente?.apellidos}, {docente?.nombres}
        </h3>
        <p className="text-sm text-gray-600">
          {docente?.categoria} - {docente?.modalidad}
        </p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">Día</th>
            <th className="border p-2 bg-gray-100">Hora</th>
            <th className="border p-2 bg-gray-100">Curso</th>
            <th className="border p-2 bg-gray-100">Grupo</th>
            <th className="border p-2 bg-gray-100">Ambiente</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map((h: any) => (
            <tr key={h.id_horario}>
              <td className="border p-2">{h.dia_semana}</td>
              <td className="border p-2">{h.hora_inicio} - {h.hora_fin}</td>
              <td className="border p-2">{h.curso?.nombre}</td>
              <td className="border p-2">Grupo {h.grupo?.numero_grupo}</td>
              <td className="border p-2">{h.ambiente?.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {horarios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay horarios asignados
        </div>
      )}
    </div>
  );
};

// Vista de horario por laboratorio
export const VistaHorarioLaboratorio = ({ horarios, laboratorio }: any) => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const bloques = Array.from({ length: 10 }, (_, i) => i);

  const obtenerHorario = (dia: string, bloque: number) => {
    const horaInicio = `${7 + Math.floor(bloque * 1.5)}:${(bloque % 2) * 30 === 0 ? '00' : '30'}`;
    return horarios.find((h: any) => h.dia_semana === dia.toLowerCase() && h.hora_inicio === horaInicio);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{laboratorio?.nombre}</h3>
        <p className="text-sm text-gray-600">
          Capacidad: {laboratorio?.capacidad} estudiantes
        </p>
      </div>

      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 sticky left-0">Hora</th>
            {dias.map(dia => (
              <th key={dia} className="border p-2 bg-gray-100 min-w-[150px]">
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloques.map(bloque => {
            const horaInicio = `${7 + Math.floor(bloque * 1.5)}:${(bloque % 2) * 30 === 0 ? '00' : '30'}`;
            const horaFin = `${7 + Math.floor((bloque + 1) * 1.5)}:${((bloque + 1) % 2) * 30 === 0 ? '00' : '30'}`;

            return (
              <tr key={bloque}>
                <td className="border p-2 font-medium sticky left-0 bg-white">
                  {horaInicio} - {horaFin}
                </td>
                {dias.map(dia => {
                  const horario = obtenerHorario(dia, bloque);
                  return (
                    <td
                      key={`${dia}-${bloque}`}
                      className={`border p-2 ${horario ? 'bg-blue-50' : ''}`}
                    >
                      {horario && (
                        <div className="text-sm">
                          <div className="font-medium">{horario.curso?.codigo_curso}</div>
                          <div className="text-gray-600">{horario.docente?.apellidos}</div>
                          <div className="text-xs text-gray-500">G{horario.grupo?.numero_grupo}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Vista de horario por grupo
export const VistaHorarioGrupo = ({ horarios, grupo, curso }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {curso?.nombre} - Grupo {grupo?.numero_grupo}
        </h3>
        <p className="text-sm text-gray-600">
          Docente: {grupo?.docente?.apellidos}, {grupo?.docente?.nombres}
        </p>
      </div>

      <div className="space-y-3">
        {horarios.map((h: any) => (
          <div key={h.id_horario} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {h.dia_semana.charAt(0).toUpperCase() + h.dia_semana.slice(1)}
                </div>
                <div className="text-sm text-gray-600">
                  {h.hora_inicio} - {h.hora_fin}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{h.ambiente?.nombre}</div>
                <div className="text-sm text-gray-600">{h.ambiente?.tipo}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {horarios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay horarios asignados
        </div>
      )}
    </div>
  );
};

// Matriz de disponibilidad de aulas
export const MatrizDisponibilidadAulas = ({ aulas, onSeleccionar }: any) => {
  const dias = ['L', 'M', 'X', 'J', 'V'];
  const bloques = Array.from({ length: 10 }, (_, i) => `B${i + 1}`);

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <h3 className="font-semibold mb-4">Disponibilidad de Aulas</h3>
      
      <div className="space-y-4">
        {aulas.map((aula: any) => (
          <div key={aula.id} className="border rounded-lg p-3">
            <div className="font-medium mb-2">{aula.nombre}</div>
            <div className="grid grid-cols-11 gap-1">
              <div></div>
              {dias.map(dia => (
                <div key={dia} className="text-xs text-center font-medium">
                  {dia}
                </div>
              ))}
              
              {bloques.map((bloque, i) => (
                <React.Fragment key={bloque}>
                  <div className="text-xs font-medium">{bloque}</div>
                  {dias.map((dia, j) => {
                    const ocupado = aula.ocupacion?.[i]?.[j];
                    return (
                      <div
                        key={`${dia}-${bloque}`}
                        onClick={() => !ocupado && onSeleccionar?.(aula.id, dia, i)}
                        className={`h-6 rounded cursor-pointer ${
                          ocupado
                            ? 'bg-red-300'
                            : 'bg-green-200 hover:bg-green-300'
                        }`}
                        title={ocupado ? 'Ocupado' : 'Disponible'}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Matriz de disponibilidad de laboratorios
export const MatrizDisponibilidadLaboratorios = ({ laboratorios }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">Disponibilidad de Laboratorios</h3>
      
      <div className="space-y-3">
        {laboratorios.map((lab: any) => (
          <div key={lab.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{lab.nombre}</div>
              <div className="text-sm text-gray-600">
                Ocupación: {lab.porcentajeOcupacion}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  lab.porcentajeOcupacion > 80 ? 'bg-red-500' :
                  lab.porcentajeOcupacion > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${lab.porcentajeOcupacion}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Lista de cursos asignados
export const ListaCursosAsignados = ({ cursos }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">Cursos Asignados</h3>
      
      <div className="space-y-2">
        {cursos.map((curso: any) => (
          <div key={curso.id} className="border-l-4 border-primary-600 pl-3 py-2">
            <div className="font-medium">{curso.nombre}</div>
            <div className="text-sm text-gray-600">
              {curso.horas_asignadas}h de {curso.horas_requeridas}h
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-primary-600 h-1.5 rounded-full"
                style={{ width: `${(curso.horas_asignadas / curso.horas_requeridas) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {cursos.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay cursos asignados
        </div>
      )}
    </div>
  );
};

// Panel de sugerencias
export const PanelSugerencias = ({ sugerencias }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">💡 Sugerencias</h3>
      
      <div className="space-y-3">
        {sugerencias.map((sug: any, i: number) => (
          <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="font-medium text-blue-900">{sug.titulo}</div>
            <div className="text-sm text-blue-700 mt-1">{sug.descripcion}</div>
          </div>
        ))}
      </div>

      {sugerencias.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay sugerencias disponibles
        </div>
      )}
    </div>
  );
};

// Confirmación de horario
export const ConfirmacionHorario = ({ horario, onConfirmar, onCancelar }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Confirmar Asignación</h3>
      
      <div className="space-y-3 mb-6">
        <div>
          <span className="text-sm text-gray-600">Curso:</span>
          <div className="font-medium">{horario.curso}</div>
        </div>
        <div>
          <span className="text-sm text-gray-600">Docente:</span>
          <div className="font-medium">{horario.docente}</div>
        </div>
        <div>
          <span className="text-sm text-gray-600">Horario:</span>
          <div className="font-medium">
            {horario.dia} {horario.horaInicio} - {horario.horaFin}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-600">Ambiente:</span>
          <div className="font-medium">{horario.ambiente}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirmar}
          className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
        >
          Confirmar
        </button>
        <button
          onClick={onCancelar}
          className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

import React from 'react';
