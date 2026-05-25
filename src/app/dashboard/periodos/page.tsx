'use client';

import { useState, useEffect } from 'react';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';
import { Selector } from '@/components/ui/Selector';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

interface Periodo {
  id_periodo: number;
  nombre: string;
  anio: number;
  semestre: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<Periodo | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const opcionesEstado = [
    { valor: 'planificacion', etiqueta: 'Planificación' },
    { valor: 'asignacion_horarios', etiqueta: 'Asignación de Horarios' },
    { valor: 'en_curso', etiqueta: 'En Curso' },
    { valor: 'finalizado', etiqueta: 'Finalizado' }
  ];

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const response = await fetch('/api/periodos');
      const data = await response.json();
      if (data.exito) {
        // Verificar y actualizar automáticamente periodos que deben estar finalizados
        const periodosActualizados = await Promise.all(
          (data.datos || []).map(async (periodo: Periodo) => {
            if (periodo.estado !== 'finalizado') {
              const debeFinalizarse = verificarSiDebeFinalizarse(periodo);
              if (debeFinalizarse) {
                // Actualizar automáticamente
                await actualizarEstadoPeriodo(periodo.id_periodo, 'finalizado');
                return { ...periodo, estado: 'finalizado' };
              }
            }
            return periodo;
          })
        );
        setPeriodos(periodosActualizados);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const verificarSiDebeFinalizarse = (periodo: Periodo): boolean => {
    const hoy = new Date();
    const fechaFin = new Date(periodo.fecha_fin);
    
    // Agregar 1 día a la fecha de fin
    const fechaFinMasUnDia = new Date(fechaFin);
    fechaFinMasUnDia.setDate(fechaFinMasUnDia.getDate() + 1);
    
    // Si hoy es mayor o igual a fecha_fin + 1 día, debe estar finalizado
    return hoy > fechaFinMasUnDia;
  };

  const actualizarEstadoPeriodo = async (idPeriodo: number, nuevoEst: string) => {
    try {
      const response = await fetch(`/api/periodos/${idPeriodo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEst })
      });
      
      const data = await response.json();
      return data.exito;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      return false;
    }
  };

  const handleAbrirModalEstado = (periodo: Periodo) => {
    setPeriodoSeleccionado(periodo);
    setNuevoEstado(periodo.estado);
    setModalAbierto(true);
  };

  const handleGuardarEstado = async () => {
    if (!periodoSeleccionado) return;

    // Verificar si está finalizado
    if (periodoSeleccionado.estado === 'finalizado') {
      alert('No se puede cambiar el estado de un período finalizado');
      return;
    }

    setGuardandoEstado(true);
    try {
      const exito = await actualizarEstadoPeriodo(periodoSeleccionado.id_periodo, nuevoEstado);
      if (exito) {
        // Actualizar localmente
        setPeriodos(periodos.map(p => 
          p.id_periodo === periodoSeleccionado.id_periodo 
            ? { ...p, estado: nuevoEstado }
            : p
        ));
        setModalAbierto(false);
        alert('Estado actualizado exitosamente');
      } else {
        alert('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado');
    } finally {
      setGuardandoEstado(false);
    }
  };

  const columnas = [
    { campo: 'nombre' as const, encabezado: 'Período' },
    { campo: 'anio' as const, encabezado: 'Año' },
    { campo: 'semestre' as const, encabezado: 'Semestre' },
    {
      campo: 'estado' as const,
      encabezado: 'Estado',
      renderizar: (estado: string, fila: Periodo) => {
        const colores: Record<string, string> = {
          planificacion: 'bg-yellow-100 text-yellow-800',
          asignacion_horarios: 'bg-blue-100 text-blue-800',
          en_curso: 'bg-green-100 text-green-800',
          finalizado: 'bg-gray-100 text-gray-800'
        };
        
        const esFinalizardo = fila.estado === 'finalizado';
        const etiquetaEstado = opcionesEstado.find(o => o.valor === estado)?.etiqueta || estado;
        
        return (
          <button
            onClick={() => handleAbrirModalEstado(fila)}
            disabled={esFinalizardo}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-opacity ${colores[estado] || ''} ${esFinalizardo ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80 cursor-pointer'}`}
            title={esFinalizardo ? 'No se puede cambiar estado de período finalizado' : 'Click para cambiar estado'}
          >
            {etiquetaEstado}
          </button>
        );
      }
    },
    {
      campo: 'fecha_inicio' as const,
      encabezado: 'Fecha Inicio',
      renderizar: (fecha: string) => new Date(fecha).toLocaleDateString()
    },
    {
      campo: 'fecha_fin' as const,
      encabezado: 'Fecha Fin',
      renderizar: (fecha: string) => new Date(fecha).toLocaleDateString()
    }
  ];

  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  const textoBusqueda = busqueda.trim().toLowerCase();
  const periodosFiltrados = periodos.filter((p: any) => {
    if (!textoBusqueda) return true;
    const nombre = String(p.nombre || '').toLowerCase();
    const codigo = String(p.codigo || '').toLowerCase();
    const estado = String(p.estado || '').toLowerCase();
    const anio = String(p.anio ?? '').toLowerCase();
    const semestre = String(p.semestre ?? '').toLowerCase();
    return (
      nombre.includes(textoBusqueda) ||
      codigo.includes(textoBusqueda) ||
      estado.includes(textoBusqueda) ||
      anio.includes(textoBusqueda) ||
      semestre.includes(textoBusqueda)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Períodos académicos</h1>
          <p className="text-gray-600 mt-1">Gestión de períodos y semestres</p>
        </div>
        <Link href="/dashboard/periodos/nuevo">
          <Boton>➕ Nuevo Período</Boton>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block text-sm font-medium mb-2">Buscar período</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Busca por nombre, código, año, semestre o estado..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Un período define el semestre activo (p. ej. 2026-I) y se usa para agrupar cursos, grupos y horarios.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          💡 Nota: Si la fecha de fin del período + 1 día es anterior a hoy, se marcará automáticamente como Finalizado.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow">
        <TablaDatos datos={periodosFiltrados} columnas={columnas} keyField="id_periodo" />
      </div>

      {/* Modal para cambiar estado */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={`Cambiar Estado - ${periodoSeleccionado?.nombre || ''}`}
        tamaño="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Estado Actual:</strong> {opcionesEstado.find(o => o.valor === periodoSeleccionado?.estado)?.etiqueta}
            </p>
          </div>

          {periodoSeleccionado?.estado === 'finalizado' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                ⚠️ Este período está finalizado y no se puede cambiar su estado.
              </p>
            </div>
          )}

          {periodoSeleccionado?.estado !== 'finalizado' && (
            <>
              <Selector
                etiqueta="Nuevo Estado"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                opciones={opcionesEstado}
              />
            </>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              onClick={() => setModalAbierto(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            {periodoSeleccionado?.estado !== 'finalizado' && (
              <button
                onClick={handleGuardarEstado}
                disabled={guardandoEstado || nuevoEstado === periodoSeleccionado?.estado}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardandoEstado ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
