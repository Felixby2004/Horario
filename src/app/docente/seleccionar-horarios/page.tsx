'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { ModalConsultaAmbientes } from '@/components/horarios/ModalConsultaAmbientes';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function SeleccionarHorariosPage() {
  const [horas, setHoras] = useState<{ inicio: string, fin: string }[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [horariosExistentes, setHorariosExistentes] = useState<any[]>([]);
  
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [cicloSeleccionado, setCicloSeleccionado] = useState('');
  const [ciclosDisponibles, setCiclosDisponibles] = useState<number[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState('');
  const [tipoClase, setTipoClase] = useState('teoria');
  
  const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [ventanaEstado, setVentanaEstado] = useState<string | null>(null);
  const [ventanaMensaje, setVentanaMensaje] = useState<string | null>(null);
  const [ventanaDebug, setVentanaDebug] = useState<any>(null);
  const [citacionInfo, setCitacionInfo] = useState<any>(null);
  const [isSlotActive, setIsSlotActive] = useState<boolean>(false);
  const [consultaTipo, setConsultaTipo] = useState<'aula' | 'laboratorio' | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUsuario(JSON.parse(userData));
      cargarDatos();
    }
  }, []);

  useEffect(() => {
    const fetchVentana = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const usuarioObj = JSON.parse(userData);
      try {
        const res = await fetch(`/api/docente/ventana-actual?id_docente=${usuarioObj.id_docente}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.exito) {
          setVentanaEstado(data.datos.estado || null);
          setCitacionInfo(data.datos.es_citacion_individual ? data.datos : null);
          setVentanaMensaje(null);
          setVentanaDebug(null);
        } else {
          setVentanaEstado(null);
          setCitacionInfo(null);
          // Si hay un mensaje detallado en la API, lo usamos
          setVentanaMensaje(data.mensaje || 'No hay ventana configurada');
          setVentanaDebug(data.debug || null);
        }
      } catch (err) {
        setVentanaEstado(null);
        setCitacionInfo(null);
        setVentanaMensaje('Error verificando ventana');
        setVentanaDebug(null);
      }
    };

    fetchVentana();
    const intervalo = setInterval(fetchVentana, 10000);
    return () => clearInterval(intervalo);
  }, []);

  // Calcular si el turno asignado está activo (solo si hay citación individual)
  useEffect(() => {
    let mounted = true;
    const calcular = () => {
      if (!citacionInfo) {
        if (mounted) setIsSlotActive(false);
        return;
      }

      // Usar la ventana exacta asignada en la citación (hora_inicio/hora_fin)
      // Las fechas en la BD vienen como Date UTC midnight para el día. Construimos
      // los instantes en Lima añadiendo el offset '-05:00' explícito.
      const fechaStr = String(citacionInfo.fecha).split('T')[0];
      const hIniStr = String(citacionInfo.hora_inicio).padStart(5, '0');
      const hFinStr = String(citacionInfo.hora_fin).padStart(5, '0');

      // Formato ISO con offset de Lima (UTC-05:00)
      const slotStart = new Date(`${fechaStr}T${hIniStr}:00-05:00`);
      let slotEnd = new Date(`${fechaStr}T${hFinStr}:00-05:00`);

      // Si el fin es menor o igual que el inicio, es al día siguiente
      if (slotEnd.getTime() <= slotStart.getTime()) {
        slotEnd = new Date(slotEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      const ahoraLima = utilidadesFecha.ahoraLima();

      const activo = ahoraLima >= slotStart && ahoraLima <= slotEnd;
      if (mounted) setIsSlotActive(activo);
    };

    calcular();
    const t = setInterval(calcular, 10000);
    return () => { mounted = false; clearInterval(t); };
  }, [citacionInfo]);

  useEffect(() => {
    if (periodoSeleccionado) {
      determinarCiclos();
      cargarHorarios();
    }
  }, [periodoSeleccionado]);

  useEffect(() => {
    if (periodoSeleccionado && cicloSeleccionado) {
      cargarCursosDocente();
    }
  }, [periodoSeleccionado, cicloSeleccionado]);

  useEffect(() => {
    if (cursoSeleccionado && periodoSeleccionado) {
      cargarGrupos();
    }
  }, [cursoSeleccionado, periodoSeleccionado]);

  const cargarDatos = async () => {
    try {
      const [resPeriodos, resAmbientes, resConfig] = await Promise.all([
        fetch('/api/periodos'),
        fetch('/api/ambientes'),
        fetch('/api/configuracion')
      ]);

      const [dataPeriodos, dataAmbientes, dataConfig] = await Promise.all([
        resPeriodos.json(),
        resAmbientes.json(),
        resConfig.json()
      ]);

      if (dataConfig.exito && dataConfig.datos) {
        setConfig(dataConfig.datos);
        const nuevosIntervalos = utilidadesFecha.generarIntervalosHorarios(
          dataConfig.datos.hora_inicio,
          dataConfig.datos.hora_fin,
          dataConfig.datos.duracion_bloque
        );
        setHoras(nuevosIntervalos);
      } else {
        // Fallback
        setHoras([
          { inicio: '07:00', fin: '08:30' },
          { inicio: '08:30', fin: '10:00' },
          { inicio: '10:00', fin: '11:30' },
          { inicio: '11:30', fin: '13:00' },
          { inicio: '13:00', fin: '14:30' },
          { inicio: '14:30', fin: '16:00' },
          { inicio: '16:00', fin: '17:30' },
          { inicio: '17:30', fin: '19:00' },
          { inicio: '19:00', fin: '20:30' },
          { inicio: '20:30', fin: '22:00' }
        ]);
      }

      if (dataPeriodos.exito) {
        // Filtrar periodos que NO estén finalizados
        const periodosActivos = (dataPeriodos.datos || []).filter(
          (p: any) => p.estado !== 'finalizado'
        );
        setPeriodos(periodosActivos);
      }
      if (dataAmbientes.exito) setAmbientes(dataAmbientes.datos || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const determinarCiclos = async () => {
    const periodo = periodos.find((p: any) => p.id_periodo === parseInt(periodoSeleccionado));
    if (!periodo) return;

    let ciclos: number[] = [];
    if (periodo.codigo.endsWith('-I')) {
      ciclos = [1, 3, 5, 7, 9];
    } else if (periodo.codigo.endsWith('-II')) {
      ciclos = [2, 4, 6, 8, 10];
    } else {
      ciclos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    setCiclosDisponibles(ciclos);
    setCicloSeleccionado('');
  };

  const cargarCursosDocente = async () => {
    if (!cicloSeleccionado) return;

    try {
      // Cargar TODOS los cursos del ciclo seleccionado
      // Un docente puede enseñar cualquier curso
      const response = await fetch(`/api/cursos?ciclo=${cicloSeleccionado}`);
      const data = await response.json();
      if (data.exito) {
        setCursos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    }
  };

  const cargarGrupos = async () => {
    try {
      const response = await fetch(`/api/grupos?curso=${cursoSeleccionado}&periodo=${periodoSeleccionado}`);
      const data = await response.json();
      if (data.exito) {
        setGrupos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  };

  const cargarHorarios = async () => {
    try {
      const response = await fetch(`/api/horarios?periodo=${periodoSeleccionado}`);
      const data = await response.json();
      if (data.exito) {
        setHorariosExistentes(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
    }
  };

  const getCeldaKey = (diaIndex: number, horaIndex: number) => {
    return `${diaIndex}-${horaIndex}`;
  };

  const obtenerHorasLimite = () => {
    const cursoActual = cursos.find((c: any) => c.id_curso === parseInt(cursoSeleccionado));
    if (!cursoActual) return 0;

    if (tipoClase === 'teoria') return cursoActual.horas_teoria || 0;
    if (tipoClase === 'laboratorio') return cursoActual.horas_laboratorio || 0;
    if (tipoClase === 'practica') return cursoActual.horas_practica || 0;
    return 0;
  };

  const obtenerHorasYaAprobadas = () => {
    if (!usuario || !cursoSeleccionado || !periodoSeleccionado) return 0;
    const idCurso = parseInt(cursoSeleccionado);
    const estadosAprobados = new Set(['aprobado', 'confirmado', 'publicado']);

    return horariosExistentes.filter((h: any) => {
      return (
        h.id_docente === usuario.id_docente &&
        h.id_periodo === parseInt(periodoSeleccionado) &&
        h.id_curso === idCurso &&
        h.tipo_clase === tipoClase &&
        estadosAprobados.has(h.estado)
      );
    }).length;
  };

  const obtenerHorarios = (diaIndex: number, horaIndex: number) => {
    if (!cicloSeleccionado) return [];
    
    return horariosExistentes.filter(h => 
      h.dia_semana === diaIndex && 
      h.hora_inicio === horas[horaIndex].inicio &&
      h.curso?.ciclo === parseInt(cicloSeleccionado) &&
      h.estado !== 'cancelado'
    );
  };

  const handleCeldaClick = (diaIndex: number, horaIndex: number, horariosBloque: any[]) => {
    if (horariosBloque.length > 0) {
      const tieneTeoria = horariosBloque.some(h => h.tipo_clase === 'teoria');
      const numLabPractica = horariosBloque.filter(h => 
        h.tipo_clase === 'laboratorio' || h.tipo_clase === 'practica'
      ).length;

      // REGLA DE OCUPACIÓN:
      // 1. Si hay teoría -> BLOQUEADO
      // 2. Si hay 2 o más laboratorios/prácticas -> BLOQUEADO
      // 3. Si hay 1 laboratorio y queremos poner teoría -> BLOQUEADO
      if (tieneTeoria || numLabPractica >= 2 || (numLabPractica === 1 && tipoClase === 'teoria')) {
        setError('Este bloque ya está ocupado');
        return;
      }
    }

    if (!validarSeleccion()) {
      setError('Selecciona: Período, Ciclo, Curso, Grupo y Ambiente');
      return;
    }

    setError('');
    const key = getCeldaKey(diaIndex, horaIndex);
    const nuevas = new Set(celdasSeleccionadas);

    const horasLimite = obtenerHorasLimite();
    const duracionBloqueHoras = (config?.duracion_bloque || 90) / 60;
    const horasAprobadas = obtenerHorasYaAprobadas() * duracionBloqueHoras;
    const horasDisponibles = Math.max(0, horasLimite - horasAprobadas);
    const bloquesDisponibles = Math.floor(horasDisponibles / duracionBloqueHoras);

    // Si intenta agregar una celda que ya existe, solo eliminarla
    if (nuevas.has(key)) {
      nuevas.delete(key);
    } else {
      // Si intenta agregar nueva celda, validar límite
      if (bloquesDisponibles <= 0) {
        setError(`❌ ${tipoClase.charAt(0).toUpperCase() + tipoClase.slice(1)}: Ya tienes completas las ${horasLimite} horas (cada bloque es de ${config?.duracion_bloque || 90} min)`);
        return;
      }

      if (nuevas.size >= bloquesDisponibles) {
        setError(
          `❌ ${tipoClase.charAt(0).toUpperCase() + tipoClase.slice(1)}: Solo puedes solicitar ${bloquesDisponibles} bloque(s) más (límite: ${horasLimite}h, asignadas: ${horasAprobadas}h)`
        );
        return;
      }
      nuevas.add(key);
    }
    
    setCeldasSeleccionadas(nuevas);
  };

  const validarSeleccion = () => {
    return periodoSeleccionado && cicloSeleccionado && cursoSeleccionado && 
           grupoSeleccionado && ambienteSeleccionado;
  };

  const solicitarHorarios = async () => {
    if (celdasSeleccionadas.size === 0) return;

    setError('');
    let exitosos = 0;
    let errores = 0;

    for (const key of celdasSeleccionadas) {
      const [diaStr, horaStr] = key.split('-');
      const diaIndex = parseInt(diaStr);
      const horaIndex = parseInt(horaStr);

      const solicitud = {
        dia_semana: diaIndex,
        hora_inicio: horas[horaIndex].inicio,
        hora_fin: horas[horaIndex].fin,
        id_periodo: parseInt(periodoSeleccionado),
        id_docente: usuario.id_docente,
        id_curso: parseInt(cursoSeleccionado),
        id_grupo: parseInt(grupoSeleccionado),
        id_ambiente: parseInt(ambienteSeleccionado),
        tipo_clase: tipoClase,
        estado: 'solicitado'
      };

      console.log('Enviando solicitud:', solicitud);

      try {
        const response = await fetch('/api/horarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitud)
        });

        const data = await response.json();
        if (data.exito) {
          exitosos++;
        } else {
          errores++;
          setError(data.mensaje);
        }
      } catch (error) {
        errores++;
      }
    }

    if (exitosos > 0) {
      alert(`✅ ${exitosos} solicitud(es) enviada(s)${errores > 0 ? ` (${errores} con error)` : ''}`);
      setCeldasSeleccionadas(new Set());
      cargarHorarios();
    }
  };

  const esCeldaSeleccionada = (diaIndex: number, horaIndex: number) => {
    return celdasSeleccionadas.has(getCeldaKey(diaIndex, horaIndex));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Seleccionar mis horarios</h1>
            <p className="text-gray-600">Selecciona los bloques horarios para tus cursos</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConsultaTipo('aula')}
              className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 border border-blue-200 transition-colors text-sm font-medium"
              title="Consultar disponibilidad de Aulas"
            >
              🏫 Aulas
            </button>
            <button
              type="button"
              onClick={() => setConsultaTipo('laboratorio')}
              className="bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 border border-purple-200 transition-colors text-sm font-medium"
              title="Consultar disponibilidad de Laboratorios"
            >
              🔬 Laboratorios
            </button>
          </div>
        </div>


      {consultaTipo && (
        <ModalConsultaAmbientes
          abierto={!!consultaTipo}
          alCerrar={() => setConsultaTipo(null)}
          tipo={consultaTipo}
          ambientes={ambientes}
          horarios={horariosExistentes}
          horas={horas.map((h) => h.inicio)}
        />
      )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span>📋</span> Datos de asignación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Período *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={periodoSeleccionado}
                onChange={(e) => {
                  setPeriodoSeleccionado(e.target.value);
                  setCicloSeleccionado('');
                  setCursoSeleccionado('');
                }}
              >
                <option value="">Seleccione período</option>
                {periodos.map((p: any) => (
                  <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ciclo *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={cicloSeleccionado}
                onChange={(e) => {
                  setCicloSeleccionado(e.target.value);
                  setCursoSeleccionado('');
                }}
                disabled={!periodoSeleccionado}
              >
                <option value="">Seleccione ciclo</option>
                {ciclosDisponibles.map(c => (
                  <option key={c} value={c}>Ciclo {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Curso *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={cursoSeleccionado}
                onChange={(e) => {
                  setCursoSeleccionado(e.target.value);
                  setGrupoSeleccionado('');
                }}
                disabled={!cicloSeleccionado}
              >
                <option value="">Seleccione curso</option>
                {cursos.map((c: any) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.codigo} - {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grupo *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                disabled={!cursoSeleccionado}
              >
                <option value="">Seleccione grupo</option>
                {grupos.map((g: any) => (
                  <option key={g.id_grupo} value={g.id_grupo}>
                    Grupo {g.codigo_grupo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ambiente *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={ambienteSeleccionado}
                onChange={(e) => setAmbienteSeleccionado(e.target.value)}
              >
                <option value="">Seleccione ambiente</option>
                {ambientes.map((a: any) => (
                  <option key={a.id_ambiente} value={a.id_ambiente}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={tipoClase}
                onChange={(e) => setTipoClase(e.target.value)}
              >
                <option value="teoria">Teoría</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="practica">Práctica</option>
              </select>
            </div>
          </div>
        </div>

        {celdasSeleccionadas.size > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg flex justify-between items-center">
            <span className="text-yellow-800 font-medium">
              ⏳ {celdasSeleccionadas.size} bloque(s) seleccionado(s) - Pendiente de aprobación
            </span>
            <div className="flex gap-2">
              <Boton onClick={solicitarHorarios} disabled={citacionInfo ? !isSlotActive : ventanaEstado !== 'activa'}>
                ✅ Solicitar ({celdasSeleccionadas.size})
              </Boton>
              <Boton variante="secondary" onClick={() => setCeldasSeleccionadas(new Set())}>
                Limpiar
              </Boton>
            </div>
          </div>
        )}

        {ventanaEstado === 'activa' && (
          <div className={`${isSlotActive || !citacionInfo ? 'bg-green-100 border-green-500' : 'bg-amber-100 border-amber-500'} border-l-4 p-4 mb-4 rounded shadow-sm transition-colors duration-500`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{isSlotActive || !citacionInfo ? '✅' : '⏳'}</span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-bold ${isSlotActive || !citacionInfo ? 'text-green-800' : 'text-amber-800'}`}>
                  {isSlotActive || !citacionInfo ? '¡Ventana de Atención Activa!' : '¡Espera tu turno!'}
                </p>
                <div className={`text-xs ${isSlotActive || !citacionInfo ? 'text-green-700' : 'text-amber-700'}`}>
                  <div>
                    {isSlotActive || !citacionInfo 
                      ? 'Usted se encuentra en su horario permitido para seleccionar cursos y grupos.' 
                      : 'La ventana general está abierta, pero su slot individual aún no comienza o ya terminó.'}
                    {citacionInfo && ` (Turno #${citacionInfo.numero_orden_turno}: ${citacionInfo.hora_inicio} - ${citacionInfo.hora_fin})`}
                  </div>
                  {citacionInfo && (
                    <div className="text-sm mt-1">
                      <strong>Tu ventana asignada:</strong> {citacionInfo.hora_inicio} - {citacionInfo.hora_fin}
                    </div>
                  )}
                  {citacionInfo && (
                    <div className="text-xs mt-1 font-semibold">
                      Estado del turno: {isSlotActive ? <span className="text-green-700 font-black">● ACTIVO AHORA</span> : <span className="text-amber-600">● ESPERANDO / FINALIZADO</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {ventanaEstado !== 'activa' && (
          <div className="text-sm text-red-600 mt-2 p-4 bg-red-50 border border-red-200 rounded-lg whitespace-pre-line shadow-sm">
            <span className="font-bold block mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Aviso de Disponibilidad:
            </span>
            
            {citacionInfo ? (
              <div className="space-y-2">
                <p>Usted tiene una citación programada para la selección de horarios:</p>
                <div className="bg-white/50 p-3 rounded-md border border-red-100 flex flex-wrap gap-4 text-gray-800 font-medium">
                  <div>📅 Fecha: <span className="text-indigo-600">{utilidadesFecha.formatearFechaBD(citacionInfo.fecha)}</span></div>
                  <div>🕒 Hora: <span className="text-indigo-600">{citacionInfo.hora_inicio} - {citacionInfo.hora_fin}</span></div>
                  <div>🔢 Turno: <span className="text-indigo-600">#{citacionInfo.numero_orden_turno}</span></div>
                </div>
                <p className="text-xs text-red-500 font-semibold mt-2">
                  * El botón de solicitud se habilitará únicamente durante su ventana asignada ({citacionInfo.hora_inicio} - {citacionInfo.hora_fin}).
                </p>
              </div>
            ) : (
              <p>{ventanaMensaje || 'No puede solicitar horarios: no hay ventana activa para su categoría/modo.'}</p>
            )}
            
          </div>
        )}

        {cicloSeleccionado && (
          <div className="bg-white p-6 rounded-lg shadow overflow-x-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Matriz de Horarios - Ciclo {cicloSeleccionado}
              </h3>
              {cursoSeleccionado && (
                <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded">
                  {(() => {
                    const limite = obtenerHorasLimite();
                    const duracionBloqueHoras = (config?.duracion_bloque || 90) / 60;
                    const aprobadasHoras = obtenerHorasYaAprobadas() * duracionBloqueHoras;
                    const disponiblesBloques = Math.floor(Math.max(0, limite - aprobadasHoras) / duracionBloqueHoras);
                    return (
                      <>
                        Límite:
                        <span className="ml-2 text-yellow-600 font-bold">{limite} horas</span>
                        <span className="ml-3 text-green-700 font-semibold">Aprobadas: {aprobadasHoras}h</span>
                        <span className="ml-3 text-blue-700 font-semibold">Disponibles: {disponiblesBloques} bloque(s)</span>
                        <span className="ml-3 text-gray-600">({celdasSeleccionadas.size} seleccionadas)</span>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100">Hora</th>
                  {DIAS.map(dia => (
                    <th key={dia} className="border p-2 bg-gray-100 min-w-[150px]">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map((hora, horaIndex) => (
                  <tr key={horaIndex}>
                    <td className="border p-2 text-sm font-medium bg-gray-50">
                      {hora.inicio}<br/>{hora.fin}
                    </td>
                    {DIAS.map((_dia, diaIndex) => {
                      const horariosBloque = obtenerHorarios(diaIndex, horaIndex);
                      const esSeleccionada = esCeldaSeleccionada(diaIndex, horaIndex);

                      const tieneTeoria = horariosBloque.some(h => h.tipo_clase === 'teoria');
                      const numLabPractica = horariosBloque.filter(h => 
                        h.tipo_clase === 'laboratorio' || h.tipo_clase === 'practica'
                      ).length;

                      // REGLA DE OCUPACIÓN:
                      // 1. Si hay teoría -> BLOQUEADO (Rojo)
                      // 2. Si hay 2 o más laboratorios/prácticas -> BLOQUEADO (Rojo)
                      // 3. Si hay 1 laboratorio y queremos poner teoría -> BLOQUEADO (Rojo)
                      // 4. Si hay 1 laboratorio y queremos poner otro laboratorio -> DISPONIBLE (Azul)
                      
                      let ocupado = false;
                      if (tieneTeoria) ocupado = true;
                      else if (numLabPractica >= 2) ocupado = true;
                      else if (numLabPractica === 1 && tipoClase === 'teoria') ocupado = true;

                      const disponibleParaMas = !ocupado && numLabPractica === 1 && tipoClase !== 'teoria';

                      return (
                        <td
                          key={`${diaIndex}-${horaIndex}`}
                          className={`border p-1 cursor-pointer transition-colors min-w-[150px] ${
                            ocupado 
                              ? 'bg-red-50 cursor-not-allowed' 
                              : esSeleccionada
                                ? 'bg-yellow-200 ring-2 ring-yellow-400'
                                : disponibleParaMas
                                  ? 'bg-blue-50 hover:bg-blue-100'
                                  : 'bg-white hover:bg-blue-50'
                          }`}
                          onClick={() => handleCeldaClick(diaIndex, horaIndex, horariosBloque)}
                        >
                          {horariosBloque.length > 0 ? (
                            <div className="flex h-full gap-1">
                              {horariosBloque.map((h, i) => (
                                <div key={i} className="flex-1 text-[9px] bg-white border border-gray-200 rounded p-1 leading-tight shadow-sm">
                                  <div className={`font-bold uppercase ${
                                    h.tipo_clase === 'teoria' ? 'text-green-700' : 'text-purple-700'
                                  }`}>
                                    {h.tipo_clase}
                                  </div>
                                  <div className="font-semibold text-gray-800">{h.curso?.codigo}</div>
                                  <div className="text-gray-500 truncate">{h.ambiente?.nombre}</div>
                                </div>
                              ))}
                              {disponibleParaMas && !esSeleccionada && (
                                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-blue-200 rounded text-blue-400 text-lg">
                                  +
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-300 py-4">
                              {esSeleccionada ? '✓' : '+'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Leyenda de colores */}
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 space-y-2">
              <p className="font-semibold text-sm text-gray-700">Leyenda:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                  <span className="text-sm">Seleccionado (⏳ Pendiente aprobación)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded"></div>
                  <span className="text-sm">Ocupado (No disponible)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
                  <span className="text-sm">Disponible</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
