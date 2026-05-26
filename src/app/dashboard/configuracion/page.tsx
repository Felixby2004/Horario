'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pestanas } from '@/components/ui/Pestanas';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';
import { Settings, ShieldCheck, Layout, Clock, Calendar, Database, Info, Lightbulb, Save, AlertTriangle, CheckCircle2, Users } from 'lucide-react';

export default function ConfiguracionPage() {
  const router = useRouter();
  const [config, setConfig] = useState({
    bloques_horarios: 10,
    duracion_bloque: 90,
    hora_inicio: '07:00',
    hora_fin: '22:00',
    max_horas_docente: 40,
    min_horas_entre_clases: 0,
    permitir_clases_seguidas: true,
    validar_capacidad_ambiente: true
  });
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipo_mensaje, setTipoMensaje] = useState<'exito' | 'error' | ''>('');

  // Cargar configuración al iniciar
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/configuracion');
      const data = await res.json();
      
      if (data.exito && data.datos) {
        setConfig(data.datos);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracion = async (seccion: string) => {
    try {
      setGuardando(true);
      setMensaje('');
      
      const res = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await res.json();
      
      if (data.exito) {
        setMensaje(`✅ Configuración de ${seccion} guardada exitosamente`);
        setTipoMensaje('exito');
        window.dispatchEvent(new Event('configuracion-updated'));
        router.refresh();
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje(`❌ Error: ${data.error || 'No se pudo guardar'}`);
        setTipoMensaje('error');
      }
    } catch (error: any) {
      setMensaje(`❌ Error: ${error.message}`);
      setTipoMensaje('error');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const ventanaHoraria = `${config.hora_inicio} - ${config.hora_fin}`;
  const resumenGeneral = [
    { etiqueta: 'Bloques por día', valor: config.bloques_horarios },
    { etiqueta: 'Duración bloque', valor: `${config.duracion_bloque} min` },
    { etiqueta: 'Ventana horaria', valor: ventanaHoraria },
    { etiqueta: 'Validaciones activas', valor: `${[config.permitir_clases_seguidas, config.validar_capacidad_ambiente].filter(Boolean).length}/2` }
  ];

  const pestanas = [
    {
      id: 'general',
      titulo: (
        <div className="flex items-center gap-2 px-2 py-1">
          <Layout className="w-4 h-4" />
          <span>General</span>
        </div>
      ),
      contenido: (
        <div className="p-8 space-y-10">
          <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-6 flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight mb-1">Configuración General de Horarios</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Define la ventana horaria y los bloques maestros que el sistema utilizará para la generación y validación de horarios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 items-start">
            <div className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Estructura de Tiempo</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CampoTexto
                    etiqueta="Bloques por día"
                    type="number"
                    value={config.bloques_horarios}
                    onChange={(e) => setConfig({...config, bloques_horarios: parseInt(e.target.value) || 0})}
                  />
                  <CampoTexto
                    etiqueta="Duración bloque (minutos)"
                    type="number"
                    value={config.duracion_bloque}
                    onChange={(e) => setConfig({...config, duracion_bloque: parseInt(e.target.value) || 0})}
                  />
                  <CampoTexto
                    etiqueta="Hora de inicio de clases"
                    type="time"
                    value={config.hora_inicio}
                    onChange={(e) => setConfig({...config, hora_inicio: e.target.value})}
                  />
                  <CampoTexto
                    etiqueta="Hora de fin de clases"
                    type="time"
                    value={config.hora_fin}
                    onChange={(e) => setConfig({...config, hora_fin: e.target.value})}
                  />
                </div>
              </section>

              <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 leading-relaxed">
                  <strong>Recomendación:</strong> Una duración de 90 minutos es el estándar para la mayoría de cursos universitarios. Cambiar este valor afectará cómo se visualizan los horarios.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => guardarConfiguracion('General')}
                  disabled={guardando}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 w-full md:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {guardando ? 'Guardando cambios...' : 'GUARDAR CONFIGURACIÓN GENERAL'}
                </button>
              </div>
            </div>

            <aside className="space-y-8">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 p-6">
                <h4 className="font-black text-gray-800 uppercase tracking-tight text-sm mb-6 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Resumen de Sistema
                </h4>
                <div className="space-y-4">
                  {resumenGeneral.map((item) => (
                    <div key={item.etiqueta} className="p-4 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-500 transition-colors">{item.etiqueta}</p>
                      <p className="font-black text-gray-800 mt-1 text-lg tracking-tight">{item.valor}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Soporte para IA</p>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Estos valores son críticos para el algoritmo de generación automática. El sistema recalcula la malla de colisiones cada vez que se actualizan estos parámetros.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )
    },
    {
      id: 'validaciones',
      titulo: (
        <div className="flex items-center gap-2 px-2 py-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Validaciones</span>
        </div>
      ),
      contenido: (
        <div className="p-8 space-y-10">
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-6 flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight mb-1">Configuración de Validaciones</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Establece las reglas de negocio y restricciones que el sistema debe validar para evitar conflictos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Users className="w-4 h-4 text-gray-400" />
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Límites de Carga</h4>
                </div>
                <div className="space-y-6">
                  <CampoTexto
                    etiqueta="Máximo horas por docente por semana"
                    type="number"
                    value={config.max_horas_docente}
                    onChange={(e) => setConfig({...config, max_horas_docente: parseInt(e.target.value) || 0})}
                  />
                  
                  <CampoTexto
                    etiqueta="Mínimo descanso entre clases (minutos)"
                    type="number"
                    value={config.min_horas_entre_clases}
                    onChange={(e) => setConfig({...config, min_horas_entre_clases: parseInt(e.target.value) || 0})}
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Reglas Automáticas</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <label className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${config.permitir_clases_seguidas ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                      {config.permitir_clases_seguidas && <CheckCircle2 className="w-4 h-4 text-white" />}
                      <input 
                        type="checkbox" 
                        checked={config.permitir_clases_seguidas}
                        onChange={(e) => setConfig({...config, permitir_clases_seguidas: e.target.checked})}
                        className="sr-only"
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-gray-800 tracking-tight">Permitir clases seguidas</span>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Sin bloques de descanso obligatorios</span>
                    </div>
                  </label>
                  
                  <label className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${config.validar_capacidad_ambiente ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                      {config.validar_capacidad_ambiente && <CheckCircle2 className="w-4 h-4 text-white" />}
                      <input 
                        type="checkbox" 
                        checked={config.validar_capacidad_ambiente}
                        onChange={(e) => setConfig({...config, validar_capacidad_ambiente: e.target.checked})}
                        className="sr-only"
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-gray-800 tracking-tight">Validar capacidad del ambiente</span>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Cruzar con cantidad de alumnos matriculados</span>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Advertencia de Rigidez</p>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Aumentar las restricciones puede dificultar que el algoritmo encuentre una solución válida. Úselas con moderación durante la fase inicial de planificación.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => guardarConfiguracion('Validaciones')}
                  disabled={guardando}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 w-full"
                >
                  <Save className="w-4 h-4" />
                  {guardando ? 'Guardando...' : 'GUARDAR REGLAS DE VALIDACIÓN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-10 px-6 md:px-10 lg:px-16 max-w-[1600px] mx-auto py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Configuración del sistema</h1>
          </div>
          <p className="text-gray-500 font-medium text-lg ml-1">Controla los parámetros maestros y reglas de negocio del ecosistema de horarios.</p>
        </div>
      </header>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-6 rounded-2xl border-l-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
          tipo_mensaje === 'exito' 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          <div className="flex items-center gap-3 font-black tracking-tight">
            {tipo_mensaje === 'exito' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {mensaje}
          </div>
        </div>
      )}

      {/* Contenedor de pestañas */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <Pestanas pestanas={pestanas} />
      </div>

      {/* Guía de Uso */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-indigo-50/30 border border-indigo-100 rounded-3xl p-8 flex items-start gap-6">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-indigo-50">
            <Info className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Centro de Ayuda Administrativa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-sm font-black text-indigo-600 tracking-tight">Panel General</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Define la infraestructura temporal (bloques, duración, horarios base) que rige todo el semestre académico.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-indigo-600 tracking-tight">Panel de Validaciones</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Establece los límites éticos y físicos para docentes y ambientes, garantizando un horario equitativo y sin cruces.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-3xl p-8 flex flex-col justify-center text-center space-y-2">
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Versión del Núcleo</p>
          <p className="text-white text-2xl font-black tracking-tighter">v2.4.0-Stable</p>
          <p className="text-gray-500 text-[10px] font-bold">Última actualización: Hoy</p>
        </div>
      </footer>
    </div>
  );
}
