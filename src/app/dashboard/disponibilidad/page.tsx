'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Alerta } from '@/components/ui/Alerta';
import { Modal } from '@/components/ui/Modal';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

interface FaseInfo {
  id_fase_disponibilidad: number;
  id_periodo: number;
  estado: 'no_iniciada' | 'abierta' | 'cerrada' | 'procesada';
  fecha_inicio: string;
  fecha_fin: string;
  bloques_tiempo: string;
  instrucciones?: string;
  periodo?: {
    nombre: string;
    codigo: string;
  };
}

interface Periodo {
  id_periodo: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}

interface Estadisticas {
  totalDocentes: number;
  docentesCompletados: number;
  docentesPendientes: number;
  porcentajeCompletacion: string;
}

export default function DisponibilidadAdminPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [fase, setFase] = useState<FaseInfo | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  
  // Formulario para nueva fase
  const [formNueva, setFormNueva] = useState({
    fechaInicio: '',
    fechaFin: '',
    bloquesTiempo: '30',
    instrucciones: ''
  });

  // Formulario para editar fase
  const [formEditar, setFormEditar] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    instrucciones: ''
  });

  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoSeleccionado) {
      cargarFase(periodoSeleccionado);
    }
  }, [periodoSeleccionado]);

  const cargarPeriodos = async () => {
    try {
      const res = await fetch('/api/periodos');
      const data = await res.json();
      if (data.exito) {
        setPeriodos(data.datos || []);
        const activo = data.datos?.find((p: any) => p.activo);
        if (activo) setPeriodoSeleccionado(activo.id_periodo);
        else if (data.datos?.length > 0) setPeriodoSeleccionado(data.datos[0].id_periodo);
      }
    } catch (err) {
      setError('Error al cargar períodos');
    } finally {
      setCargando(false);
    }
  };

  const cargarFase = async (idPeriodo: number) => {
    setCargando(true);
    setFase(null);
    setEstadisticas(null);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/disponibilidad/fase?idPeriodo=${idPeriodo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFase(data);
        
        // Cargar estadísticas
        const resStats = await fetch(`/api/disponibilidad/procesar?idFase=${data.id_fase_disponibilidad}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setEstadisticas(dataStats.estadisticas);
        }
      } else if (res.status === 404) {
        // No hay fase para este período
        setFase(null);
      } else {
        setError('Error al cargar la fase de disponibilidad');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleCrearFase = async () => {
    if (!periodoSeleccionado) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/disponibilidad/fase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idPeriodo: periodoSeleccionado,
          ...formNueva
        })
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarFase(periodoSeleccionado);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear la fase');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleActualizarFase = async () => {
    if (!fase) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/disponibilidad/fase', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idFase: fase.id_fase_disponibilidad,
          ...formEditar
        })
      });

      if (res.ok) {
        setModalEditarAbierto(false);
        cargarFase(periodoSeleccionado!);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar la fase');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleProcesar = async () => {
    if (!fase) return;
    if (!confirm('¿Está seguro de procesar la disponibilidad? Esto cerrará la fase y permitirá generar citaciones.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/disponibilidad/procesar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idFase: fase.id_fase_disponibilidad })
      });

      if (res.ok) {
        alert('Disponibilidad procesada exitosamente');
        cargarFase(periodoSeleccionado!);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al procesar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const abrirEditar = () => {
    if (!fase) return;
    setFormEditar({
      fechaInicio: fase.fecha_inicio.substring(0, 16),
      fechaFin: fase.fecha_fin.substring(0, 16),
      estado: fase.estado,
      instrucciones: fase.instrucciones || ''
    });
    setModalEditarAbierto(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⏱️ Fase de Disponibilidad</h1>
          <p className="text-gray-600">Configure el periodo en que los docentes registran su disponibilidad</p>
        </div>
      </div>

      {/* Selector de periodo */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="w-64">
          <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Período Académico</label>
          <select
            value={periodoSeleccionado || ''}
            onChange={(e) => setPeriodoSeleccionado(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {periodos.map(p => (
              <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-12 text-gray-500">Cargando información de la fase...</div>
      ) : !fase ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center space-y-4">
          <div className="text-5xl">⏳</div>
          <h2 className="text-xl font-bold text-gray-800">No hay fase configurada</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Aún no se ha creado una fase de disponibilidad para este período académico. 
            Los docentes no pueden registrar su disponibilidad hasta que se cree una.
          </p>
          <Boton onClick={() => setModalAbierto(true)}>Crear Nueva Fase</Boton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Detalles de la Fase */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-800">Configuración de la Fase</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  fase.estado === 'abierta' ? 'bg-green-100 text-green-700' :
                  fase.estado === 'no_iniciada' ? 'bg-gray-100 text-gray-700' :
                  fase.estado === 'cerrada' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {fase.estado.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Fecha Inicio</p>
                  <p className="font-semibold">{utilidadesFecha.formatearFechaHora(fase.fecha_inicio)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha Límite (Fin)</p>
                  <p className="font-semibold text-red-600">{utilidadesFecha.formatearFechaHora(fase.fecha_fin)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bloques de Tiempo</p>
                  <p className="font-semibold">{fase.bloques_tiempo} minutos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Instrucciones</p>
                  <p className="text-sm italic text-gray-600">{fase.instrucciones || 'Sin instrucciones'}</p>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <Boton onClick={abrirEditar} variante="secundario">Editar Configuración</Boton>
                {fase.estado === 'cerrada' && (
                  <Boton onClick={handleProcesar}>Procesar y Generar Citaciones</Boton>
                )}
              </div>
            </div>

            {/* Estadísticas de Progreso */}
            {estadisticas && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Progreso de Registro</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
                    <p className="text-sm text-indigo-600 font-semibold">Total Docentes</p>
                    <p className="text-2xl font-bold text-indigo-900">{estadisticas.totalDocentes}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                    <p className="text-sm text-green-600 font-semibold">Completados</p>
                    <p className="text-2xl font-bold text-green-900">{estadisticas.docentesCompletados}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center">
                    <p className="text-sm text-amber-600 font-semibold">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-900">{estadisticas.docentesPendientes}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Porcentaje de Avance</span>
                    <span>{estadisticas.porcentajeCompletacion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-500" 
                      style={{ width: `${estadisticas.porcentajeCompletacion}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips y Ayuda */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                💡 Guía de Proceso
              </h4>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li><strong>Habilitar:</strong> Cambie el estado a "Abierta" para que los docentes vean el formulario.</li>
                <li><strong>Cerrar:</strong> Una vez cumplida la fecha límite, cambie a "Cerrada" para bloquear nuevos registros.</li>
                <li><strong>Procesar:</strong> Genera los turnos de atención basados en prioridad (Modalidad, Categoría, Antigüedad).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Fase */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Crear Nueva Fase de Disponibilidad"
      >
        <div className="space-y-4 p-4">
          <CampoTexto
            etiqueta="Fecha de Inicio"
            type="datetime-local"
            value={formNueva.fechaInicio}
            onChange={(e) => setFormNueva({...formNueva, fechaInicio: e.target.value})}
          />
          <CampoTexto
            etiqueta="Fecha Límite (Fin)"
            type="datetime-local"
            value={formNueva.fechaFin}
            onChange={(e) => setFormNueva({...formNueva, fechaFin: e.target.value})}
          />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Bloques de Tiempo (minutos)</label>
            <select
              value={formNueva.bloquesTiempo}
              onChange={(e) => setFormNueva({...formNueva, bloquesTiempo: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Instrucciones para Docentes</label>
            <textarea
              value={formNueva.instrucciones}
              onChange={(e) => setFormNueva({...formNueva, instrucciones: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
              placeholder="Ej: Registre su disponibilidad antes del inicio del ciclo..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="secundario" onClick={() => setModalAbierto(false)}>Cancelar</Boton>
            <Boton onClick={handleCrearFase}>Crear Fase</Boton>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Fase */}
      <Modal
        abierto={modalEditarAbierto}
        alCerrar={() => setModalEditarAbierto(false)}
        titulo="Editar Fase de Disponibilidad"
      >
        <div className="space-y-4 p-4">
          <CampoTexto
            etiqueta="Fecha de Inicio"
            type="datetime-local"
            value={formEditar.fechaInicio}
            onChange={(e) => setFormEditar({...formEditar, fechaInicio: e.target.value})}
          />
          <CampoTexto
            etiqueta="Fecha Límite (Fin)"
            type="datetime-local"
            value={formEditar.fechaFin}
            onChange={(e) => setFormEditar({...formEditar, fechaFin: e.target.value})}
          />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Estado de la Fase</label>
            <select
              value={formEditar.estado}
              onChange={(e) => setFormEditar({...formEditar, estado: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="no_iniciada">No Iniciada (Oculta)</option>
              <option value="abierta">Abierta (Visible para Docentes)</option>
              <option value="cerrada">Cerrada (Solo Lectura)</option>
              <option value="procesada">Procesada (Finalizada)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Instrucciones</label>
            <textarea
              value={formEditar.instrucciones}
              onChange={(e) => setFormEditar({...formEditar, instrucciones: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="secundario" onClick={() => setModalEditarAbierto(false)}>Cancelar</Boton>
            <Boton onClick={handleActualizarFase}>Guardar Cambios</Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
