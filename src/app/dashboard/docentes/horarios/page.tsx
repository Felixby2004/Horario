'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';

interface Horario {
  id_asignacion: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: string;
  estado: string;
  curso: {
    codigo: string;
    nombre: string;
  };
  grupo: {
    codigo_grupo: string;
  };
  ambiente: {
    nombre: string;
  };
}

interface Docente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  modalidad: string;
  categoria: string;
}

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' }
];

export default function MisHorariosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_docente = searchParams.get('id_docente');

  const [docente, setDocente] = useState<Docente | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState<'tabla' | 'calendario'>('tabla');

  useEffect(() => {
    if (id_docente) {
      cargarDatos();
    }
  }, [id_docente]);

  const cargarDatos = async () => {
    try {
      const [resDocente, resHorarios] = await Promise.all([
        fetch(`/api/docentes/${id_docente}`),
        fetch('/api/horarios')
      ]);

      const [dataDocente, dataHorarios] = await Promise.all([
        resDocente.json(),
        resHorarios.json()
      ]);

      if (dataDocente.exito) {
        setDocente(dataDocente.datos);
      }

      if (dataHorarios.exito) {
        // Filtrar horarios del docente actual
        const horariosDocente = (dataHorarios.datos || []).filter(
          (h: any) => h.id_docente === parseInt(id_docente!)
        );
        setHorarios(horariosDocente);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const horariosAgrupados = DIAS_SEMANA.map(dia => ({
    ...dia,
    horarios: horarios.filter(h => h.dia_semana === dia.id).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  }));

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  if (!docente) {
    return <div className="p-6">Docente no encontrado</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mis horarios</h1>
          <p className="text-gray-600 mt-1">
            {docente.nombres} {docente.apellidos}
          </p>
        </div>
        <div className="flex gap-2">
          <Boton onClick={() => router.push(`/dashboard/docentes/ventanas?id_docente=${id_docente}`)}>
            ➕ Añadir Horario
          </Boton>
          <Boton
            variante="secondary"
            onClick={() => router.push('/dashboard/docentes')}
          >
            Volver
          </Boton>
        </div>
      </div>

      {/* Controles de vista */}
      <div className="flex gap-2">
        <button
          onClick={() => setVistaActual('tabla')}
          className={`px-4 py-2 rounded-lg ${
            vistaActual === 'tabla'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📋 Vista Tabla
        </button>
        <button
          onClick={() => setVistaActual('calendario')}
          className={`px-4 py-2 rounded-lg ${
            vistaActual === 'calendario'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📅 Vista Calendario
        </button>
      </div>

      {horarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No tienes horarios asignados aún.</p>
          <Boton onClick={() => router.push(`/dashboard/docentes/ventanas?id_docente=${id_docente}`)}>
            Acceder a Ventanas de Atención
          </Boton>
        </div>
      ) : (
        <>
          {vistaActual === 'tabla' ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">DÍA</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">HORA</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">CURSO</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">GRUPO</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">AMBIENTE</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">TIPO</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario.id_asignacion} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {DIAS_SEMANA.find(d => d.id === horario.dia_semana)?.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {horario.hora_inicio} - {horario.hora_fin}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-semibold">{horario.curso.codigo}</div>
                        <div className="text-gray-600">{horario.curso.nombre}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {horario.grupo.codigo_grupo}
                      </td>
                      <td className="px-4 py-3 text-sm">{horario.ambiente.nombre}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          horario.tipo_clase === 'teoría' ? 'bg-blue-100 text-blue-800' :
                          horario.tipo_clase === 'práctica' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {horario.tipo_clase}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          horario.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                          horario.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {horario.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {horariosAgrupados.map(dia => (
                <div key={dia.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold text-lg mb-3 text-blue-600">{dia.nombre}</h3>
                  {dia.horarios.length === 0 ? (
                    <p className="text-gray-500 text-sm">Sin horarios</p>
                  ) : (
                    <div className="space-y-2">
                      {dia.horarios.map(horario => (
                        <div key={horario.id_asignacion} className="border-l-4 border-blue-500 pl-3 py-2">
                          <div className="font-semibold text-sm">
                            {horario.hora_inicio} - {horario.hora_fin}
                          </div>
                          <div className="text-sm text-gray-600">
                            {horario.curso.codigo} Grupo {horario.grupo.codigo_grupo}
                          </div>
                          <div className="text-xs text-gray-500">
                            {horario.ambiente.nombre}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          💡 <strong>Nota:</strong> Los cambios en tu horario se procesarán de acuerdo a la ventana de atención asignada.
        </p>
      </div>
    </div>
  );
}
