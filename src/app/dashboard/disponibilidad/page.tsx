'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Alerta } from '@/components/ui/Alerta';
import { Modal } from '@/components/ui/Modal';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { utilidadesFecha } from '@/lib/utilidadesFecha';
import { Calendar, Clock, Timer, FileText, Settings, Edit3, Play, Users, CheckCircle2, AlertCircle } from 'lucide-react';

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
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Configuración de la Fase
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  fase.estado === 'abierta' ? 'bg-green-50 text-green-600 border border-green-200' :
                  fase.estado === 'no_iniciada' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                  fase.estado === 'cerrada' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {fase.estado.replace('_', ' ')}
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {utilidadesFecha.formatearFechaHora(fase.fecha_inicio)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite (Fin)</p>
                        <p className="text-sm font-bold text-red-600 mt-0.5">
                          {utilidadesFecha.formatearFechaHora(fase.fecha_fin)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Timer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bloques de Tiempo</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {fase.bloques_tiempo} minutos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Instrucciones</p>
                        <p className="text-sm text-gray-600 mt-0.5 italic leading-relaxed">
                          {fase.instrucciones || 'Sin instrucciones adicionales'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                  <button 
                    onClick={abrirEditar}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Configuración
                  </button>
                  {fase.estado === 'cerrada' && (
                    <Boton onClick={handleProcesar} className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Procesar y Generar Citaciones
                    </Boton>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas de Progreso */}
            {estadisticas && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Progreso de Registro
                  </h3>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 group hover:bg-indigo-50 transition-colors">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Total Docentes</p>
                      <p className="text-3xl font-black text-indigo-900">{estadisticas.totalDocentes}</p>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 group hover:bg-green-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Completados</p>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-3xl font-black text-green-900">{estadisticas.docentesCompletados}</p>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 group hover:bg-amber-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Pendientes</p>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-3xl font-black text-amber-900">{estadisticas.docentesPendientes}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Porcentaje de Avance</p>
                        <p className="text-2xl font-black text-gray-900">{estadisticas.porcentajeCompletacion}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 border border-gray-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                          Number(estadisticas.porcentajeCompletacion) === 100 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                        style={{ width: `${estadisticas.porcentajeCompletacion}%` }}
                      />
                    </div>
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
