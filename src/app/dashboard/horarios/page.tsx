'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { ModalConsultaAmbientes } from '@/components/horarios/ModalConsultaAmbientes';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Function to clear horarios form data from localStorage
const clearHorariosFormStorage = () => {
  localStorage.removeItem('horarios-periodo');
  localStorage.removeItem('horarios-ciclo');
  localStorage.removeItem('horarios-ciclos-disponibles');
  localStorage.removeItem('horarios-docente');
  localStorage.removeItem('horarios-curso');
  localStorage.removeItem('horarios-grupo');
  localStorage.removeItem('horarios-ambiente');
  localStorage.removeItem('horarios-tipo-clase');
  localStorage.removeItem('horarios-celdas');
};

export default function HorariosPage() {
  const router = useRouter();
  
  // Effect to listen for internal navigation to clear form
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Listen to all history changes
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    const currentPathname = window.location.pathname;
    
    const handleHistoryChange = (newPath: string | URL | null) => {
      // Clear form storage only when navigating to different page
      let newPathname = '';
      if (newPath instanceof URL) {
        newPathname = newPath.pathname;
      } else if (typeof newPath === 'string') {
        try {
          const url = new URL(newPath, window.location.origin);
          newPathname = url.pathname;
        } catch {
          newPathname = newPath;
        }
      }
      
      if (newPathname && newPathname !== currentPathname) {
        clearHorariosFormStorage();
      }
    };
    
    const handlePopState = () => {
      // Clear form storage when using back/forward button to different page
      if (window.location.pathname !== currentPathname) {
        clearHorariosFormStorage();
      }
    };

    window.history.pushState = function(...args) {
      handleHistoryChange(args[2] ?? null);
      originalPushState(...args);
    };
    
    window.history.replaceState = function(...args) {
      handleHistoryChange(args[2] ?? null);
      originalReplaceState(...args);
    };
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      // Restore original history functions and remove listener
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const [horas, setHoras] = useState<{ inicio: string, fin: string }[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  
  // Initialize state from localStorage if available
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-periodo') || '';
    }
    return '';
  });
  const [cicloSeleccionado, setCicloSeleccionado] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-ciclo') || '';
    }
    return '';
  });
  const [ciclosDisponibles, setCiclosDisponibles] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('horarios-ciclos-disponibles');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-docente') || '';
    }
    return '';
  });
  const [cursoSeleccionado, setCursoSeleccionado] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-curso') || '';
    }
    return '';
  });
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-grupo') || '';
    }
    return '';
  });
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-ambiente') || '';
    }
    return '';
  });
  const [tipoClase, setTipoClase] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('horarios-tipo-clase') || 'teoria';
    }
    return 'teoria';
  });
  
  const [horarios, setHorarios] = useState<any[]>([]);
  const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('horarios-celdas');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [horarioAEliminar, setHorarioAEliminar] = useState<any>(null);
  const [horariosParaEliminar, setHorariosParaEliminar] = useState<any[]>([]);
  const [consultaTipo, setConsultaTipo] = useState<'aula' | 'laboratorio' | null>(null);

  // Effect to save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('horarios-periodo', periodoSeleccionado);
    localStorage.setItem('horarios-ciclo', cicloSeleccionado);
    localStorage.setItem('horarios-ciclos-disponibles', JSON.stringify(ciclosDisponibles));
    localStorage.setItem('horarios-docente', docenteSeleccionado);
    localStorage.setItem('horarios-curso', cursoSeleccionado);
    localStorage.setItem('horarios-grupo', grupoSeleccionado);
    localStorage.setItem('horarios-ambiente', ambienteSeleccionado);
    localStorage.setItem('horarios-tipo-clase', tipoClase);
    localStorage.setItem('horarios-celdas', JSON.stringify([...celdasSeleccionadas]));
  }, [
    periodoSeleccionado,
    cicloSeleccionado,
    ciclosDisponibles,
    docenteSeleccionado,
    cursoSeleccionado,
    grupoSeleccionado,
    ambienteSeleccionado,
    tipoClase,
    celdasSeleccionadas
  ]);

  const obtenerHorasLimite = () => {
    const cursoActual = cursos.find((c: any) => c.id_curso === parseInt(cursoSeleccionado));
    if (!cursoActual) return 0;

    if (tipoClase === 'teoria') return cursoActual.horas_teoria || 0;
    if (tipoClase === 'laboratorio') return cursoActual.horas_laboratorio || 0;
    if (tipoClase === 'practica') return cursoActual.horas_practica || 0;
    return 0;
  };

  const obtenerHorasYaAsignadas = () => {
    if (!cursoSeleccionado || !periodoSeleccionado) return 0;

    const idCurso = parseInt(cursoSeleccionado);

    return horarios.filter((h: any) => {
      return (
        h.id_periodo === parseInt(periodoSeleccionado) &&
        h.id_curso === idCurso &&
        h.tipo_clase === tipoClase &&
        h.estado !== 'cancelado'
      );
    }).length;
  };

  const obtenerHorasDisponibles = () => {
    return Math.max(0, obtenerHorasLimite() - obtenerHorasYaAsignadas() - celdasSeleccionadas.size);
  };

  const cargarDatosIniciales = useCallback(async () => {
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
        // Fallback si no hay config
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
        const periodosActivos = (dataPeriodos.datos || []).filter(
          (p: any) => String(p.estado).toLowerCase() !== 'finalizado'
        );
        setPeriodos(periodosActivos);
      }
      if (dataAmbientes.exito) setAmbientes(dataAmbientes.datos || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, []);

  const cargarDocentes = useCallback(async () => {
    try {
      let url = '/api/docentes';
      if (cicloSeleccionado) {
        url += `?ciclo=${cicloSeleccionado}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.exito) setDocentes(data.datos || []);
    } catch (error) {
      console.error('Error cargando docentes:', error);
    }
  }, [cicloSeleccionado]);

  const determinarCiclos = useCallback(async () => {
    try {
      const periodo = periodos.find((p: any) => p.id_periodo === parseInt(periodoSeleccionado));
      if (!periodo) return;

      let ciclos: number[] = [];
      
      if (periodo.codigo.endsWith('-I')) {
        // Primer semestre: ciclos impares
        ciclos = [1, 3, 5, 7, 9];
      } else if (periodo.codigo.endsWith('-II')) {
        // Segundo semestre: ciclos pares
        ciclos = [2, 4, 6, 8, 10];
      } else {
        // Extraordinario: todos los ciclos
        ciclos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      }

      setCiclosDisponibles(ciclos);
      
      // Only reset ciclo if the saved one isn't in the new list
      const savedCiclo = localStorage.getItem('horarios-ciclo');
      const savedCicloNum = savedCiclo ? parseInt(savedCiclo) : null;
      if (!savedCicloNum || !ciclos.includes(savedCicloNum)) {
        setCicloSeleccionado('');
        setCursos([]);
      }
    } catch (error) {
      console.error('Error determinando ciclos:', error);
    }
  }, [periodos, periodoSeleccionado]);

  const cargarCursos = useCallback(async () => {
    if (!cicloSeleccionado) return;
    
    try {
      let url = `/api/cursos?ciclo=${cicloSeleccionado}`;
      if (docenteSeleccionado) {
        url += `&id_docente=${docenteSeleccionado}`;
      }
      if (periodoSeleccionado) {
        url += `&periodo=${periodoSeleccionado}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.exito) {
        setCursos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    }
  }, [cicloSeleccionado, docenteSeleccionado, periodoSeleccionado]);

  const cargarGrupos = useCallback(async () => {
    try {
      let url = `/api/grupos?curso=${cursoSeleccionado}&periodo=${periodoSeleccionado}`;
      if (docenteSeleccionado) {
        url += `&id_docente=${docenteSeleccionado}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.exito) {
        setGrupos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  }, [cursoSeleccionado, periodoSeleccionado, docenteSeleccionado]);

  const cargarHorarios = useCallback(async () => {
    try {
      const response = await fetch(`/api/horarios?periodo=${periodoSeleccionado}`);
      const data = await response.json();
      if (data.exito) {
        setHorarios(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
    }
  }, [periodoSeleccionado]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  useEffect(() => {
    const recargarConfiguracion = () => {
      cargarDatosIniciales();
    };

    window.addEventListener('focus', recargarConfiguracion);
    window.addEventListener('configuracion-updated', recargarConfiguracion as EventListener);

    return () => {
      window.removeEventListener('focus', recargarConfiguracion);
      window.removeEventListener('configuracion-updated', recargarConfiguracion as EventListener);
    };
  }, [cargarDatosIniciales]);

  useEffect(() => {
    if (periodoSeleccionado) {
      determinarCiclos();
      cargarHorarios();
    }
  }, [periodoSeleccionado, determinarCiclos, cargarHorarios]);

  useEffect(() => {
    if (cicloSeleccionado) {
      cargarDocentes();
    } else {
      setDocentes([]); // Clear docentes if no ciclo selected
    }
  }, [cicloSeleccionado, cargarDocentes]);

  useEffect(() => {
    if (periodoSeleccionado && cicloSeleccionado && docenteSeleccionado) {
      cargarCursos();
    }
  }, [periodoSeleccionado, cicloSeleccionado, docenteSeleccionado, cargarCursos]);

  useEffect(() => {
    if (cursoSeleccionado && periodoSeleccionado) {
      cargarGrupos();
    }
  }, [cursoSeleccionado, periodoSeleccionado, cargarGrupos]);
  
  // Nuevo efecto para cargar cursos cuando docente cambia
  useEffect(() => {
    if (periodoSeleccionado && cicloSeleccionado && docenteSeleccionado) {
      cargarCursos();
    }
  }, [docenteSeleccionado, periodoSeleccionado, cicloSeleccionado, cargarCursos]);
  
  // Nuevo efecto para cargar grupos cuando docente cambia
  useEffect(() => {
    if (periodoSeleccionado && cursoSeleccionado && docenteSeleccionado) {
      cargarGrupos();
    }
  }, [docenteSeleccionado, periodoSeleccionado, cursoSeleccionado, cargarGrupos]);

  const getCeldaKey = (diaIndex: number, horaIndex: number) => {
    return `${diaIndex}-${horaIndex}`;
  };

  const handleCeldaClick = (diaIndex: number, horaIndex: number, horariosBloque: any[]) => {
    if (horariosBloque.length > 0) {
      // Verificar si se puede agregar un segundo horario
      const primerHorario = horariosBloque[0];
      const esLabOPractica = primerHorario.tipo_clase === 'laboratorio' || primerHorario.tipo_clase === 'practica';
      
      // Si hay 1 horario de lab/práctica, permitir agregar segundo
      if (horariosBloque.length === 1 && esLabOPractica) {
        // Verificar si el usuario ha seleccionado los datos para agregar
        if (!validarSeleccion()) {
          // Si no ha seleccionado datos, mostrar opción de eliminar
          setHorarioAEliminar(horariosBloque[0]);
          return;
        }
        
        // Si tiene datos seleccionados, permitir agregar como celda vacía
        // (caerá en la lógica de abajo)
      } else {
        // Si es teoría o ya hay 2 horarios, solo eliminar
        if (horariosBloque.length === 1) {
          setHorarioAEliminar(horariosBloque[0]);
        } else {
          setHorariosParaEliminar(horariosBloque);
        }
        return;
      }
    }

    if (!validarSeleccion()) {
      setError('Por favor seleccione: Período, Ciclo, Docente, Curso, Grupo y Ambiente');
      return;
    }

    setError('');
    const key = getCeldaKey(diaIndex, horaIndex);
    const nuevasSeleccionadas = new Set(celdasSeleccionadas);
    const horasLimite = obtenerHorasLimite();
    const horasAsignadas = obtenerHorasYaAsignadas();
    const horasDisponibles = Math.max(0, horasLimite - horasAsignadas);
    
    if (nuevasSeleccionadas.has(key)) {
      nuevasSeleccionadas.delete(key);
    } else {
      if (horasDisponibles <= 0) {
        setError(`❌ ${tipoClase.charAt(0).toUpperCase() + tipoClase.slice(1)}: Ya completaste las ${horasLimite} horas de este curso`);
        return;
      }

      if (nuevasSeleccionadas.size >= horasDisponibles) {
        setError(
          `❌ ${tipoClase.charAt(0).toUpperCase() + tipoClase.slice(1)}: Solo puedes asignar ${horasDisponibles} bloque(s) más para este curso`
        );
        return;
      }

      nuevasSeleccionadas.add(key);
    }
    
    setCeldasSeleccionadas(nuevasSeleccionadas);
    setModoSeleccion(nuevasSeleccionadas.size > 0);
  };

  const [eliminarError, setEliminarError] = useState('');

  const eliminarHorario = async () => {
    if (!horarioAEliminar) return;
    
    setEliminarError('');

    try {
      const response = await fetch(`/api/horarios/${horarioAEliminar.id_asignacion}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.exito) {
        // Cerrar modal primero
        setHorarioAEliminar(null);
        // Update local state by removing the deleted horario
        setHorarios(prev => prev.filter(h => h.id_asignacion !== horarioAEliminar.id_asignacion));
        // Mostrar mensaje detallado de éxito
        setSuccess(
          `✅ Horario eliminado exitosamente:\n` +
          `${horarioAEliminar.curso?.nombre} (${horarioAEliminar.curso?.codigo})\n` +
          `${DIAS[horarioAEliminar.dia_semana]} ${horarioAEliminar.hora_inicio} - ${horarioAEliminar.hora_fin}`
        );
        setTimeout(() => setSuccess(''), 5000);
      } else {
        // NO cerrar modal - mostrar error en modal para reintentar
        setEliminarError(data.mensaje || 'Error al eliminar horario');
      }
    } catch (error) {
      // NO cerrar modal - mostrar error para reintentar
      setEliminarError('Error al conectar con el servidor. Verifica tu conexión.');
      console.error('Error:', error);
    }
  };

  const validarSeleccion = () => {
    return periodoSeleccionado && cicloSeleccionado && docenteSeleccionado && 
           cursoSeleccionado && grupoSeleccionado && ambienteSeleccionado;
  };

  const confirmarAsignacion = async () => {
    if (celdasSeleccionadas.size === 0) return;

    const horasLimite = obtenerHorasLimite();
    const horasAsignadas = obtenerHorasYaAsignadas();
    const horasDisponibles = Math.max(0, horasLimite - horasAsignadas);

    if (horasDisponibles <= 0) {
      setError(`❌ ${tipoClase.charAt(0).toUpperCase() + tipoClase.slice(1)}: Ya completaste las ${horasLimite} horas de este curso`);
      return;
    }

    if (celdasSeleccionadas.size > horasDisponibles) {
      setError(
        `❌ ${tipoClase.charAt(0).toUpperCase() + tipoClase.slice(1)}: Solo puedes confirmar ${horasDisponibles} bloque(s) más para este curso`
      );
      return;
    }

    setError('');
    let exitosos = 0;
    let errores = 0;

    for (const key of celdasSeleccionadas) {
      const [diaStr, horaStr] = key.split('-');
      const diaIndex = parseInt(diaStr);
      const horaIndex = parseInt(horaStr);

      const horario = {
        dia_semana: diaIndex,
        hora_inicio: horas[horaIndex].inicio,
        hora_fin: horas[horaIndex].fin,
        id_periodo: parseInt(periodoSeleccionado),
        id_docente: parseInt(docenteSeleccionado),
        id_curso: parseInt(cursoSeleccionado),
        id_grupo: parseInt(grupoSeleccionado),
        id_ambiente: parseInt(ambienteSeleccionado),
        tipo_clase: tipoClase,
        estado: 'borrador'
      };

      try {
        const response = await fetch('/api/horarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(horario)
        });

        const data = await response.json();
        if (data.exito) {
          exitosos++;
        } else {
          errores++;
          setError(data.mensaje || 'Error al asignar horario');
        }
      } catch {
        errores++;
        setError('Error de conexión');
      }
    }

    if (exitosos > 0) {
      setSuccess(`✅ ${exitosos} horario(s) asignado(s) exitosamente${errores > 0 ? ` (${errores} con error)` : ''}`);
      setTimeout(() => setSuccess(''), 5000);
      // Clear localStorage
      localStorage.removeItem('horarios-celdas');
      setCeldasSeleccionadas(new Set());
      setModoSeleccion(false);
      cargarHorarios();
    }
  };

  const obtenerHorarios = (diaIndex: number, horaIndex: number) => {
    if (!cicloSeleccionado) return [];
    
    // Retornar TODOS los horarios que coincidan (puede haber hasta 2 en lab/práctica)
    return horarios.filter(h => 
      h.dia_semana === diaIndex && 
      h.hora_inicio === horas[horaIndex].inicio &&
      h.curso?.ciclo === parseInt(cicloSeleccionado)
    );
  };

  const esCeldaSeleccionada = (diaIndex: number, horaIndex: number) => {
    return celdasSeleccionadas.has(getCeldaKey(diaIndex, horaIndex));
  };

  const limpiarSeleccion = () => {
    setCeldasSeleccionadas(new Set());
    setModoSeleccion(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sistema de asignación de horarios</h1>
          <p className="text-gray-600 text-sm mt-1">Crea y gestiona horarios por ciclo</p>
        </div>
        <div className="flex gap-2">
          <Boton
            onClick={() => router.push('/dashboard/horarios/generar-algoritmico')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            🧬 Generar horarios IA
          </Boton>
        </div>
      </div>

      {/* Panel de Vistas de Horarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/dashboard/horarios/vista-ciclo')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 hover:shadow-lg transition"
        >
          <div className="text-3xl mb-2">🎓</div>
          <div className="font-bold text-blue-900">Por ciclo</div>
          <div className="text-xs text-blue-700 mt-1">Ver horarios agrupados por ciclo académico</div>
        </button>

        <button
          onClick={() => router.push('/dashboard/horarios/vista-aula')}
          className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 hover:shadow-lg transition"
        >
          <div className="text-3xl mb-2">🏫</div>
          <div className="font-bold text-green-900">Por aula</div>
          <div className="text-xs text-green-700 mt-1">Ver disponibilidad de aulas de teoría</div>
        </button>

        <button
          onClick={() => router.push('/dashboard/horarios/vista-laboratorio')}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4 hover:shadow-lg transition"
        >
          <div className="text-3xl mb-2">🔬</div>
          <div className="font-bold text-purple-900">Por laboratorio</div>
          <div className="text-xs text-purple-700 mt-1">Ver disponibilidad de laboratorios</div>
        </button>

        <button
          onClick={() => router.push('/dashboard/horarios/vista-docente')}
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-4 hover:shadow-lg transition"
        >
          <div className="text-3xl mb-2">👨‍🏫</div>
          <div className="font-bold text-orange-900">Por docente</div>
          <div className="text-xs text-orange-700 mt-1">Ver horarios de cada docente</div>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>❌ {error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold">
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {horarioAEliminar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setHorarioAEliminar(null); }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-800">¿Eliminar Horario?</h3>
              <button 
                onClick={() => { setHorarioAEliminar(null); setEliminarError(''); }} 
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-gray-700">
              <p><strong>Curso:</strong> {horarioAEliminar.curso?.nombre} ({horarioAEliminar.curso?.codigo})</p>
              <p><strong>Ciclo:</strong> {horarioAEliminar.curso?.ciclo}</p>
              <p><strong>Docente:</strong> {horarioAEliminar.docente?.apellidos}, {horarioAEliminar.docente?.nombres}</p>
              <p><strong>Grupo:</strong> {horarioAEliminar.grupo?.codigo_grupo}</p>
              <p><strong>Ambiente:</strong> {horarioAEliminar.ambiente?.nombre}</p>
              <p><strong>Horario:</strong> {DIAS[horarioAEliminar.dia_semana]} {horarioAEliminar.hora_inicio} - {horarioAEliminar.hora_fin}</p>
            </div>

            {eliminarError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span>{eliminarError}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={eliminarHorario}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {eliminarError ? 'Reintentar Eliminar' : 'Eliminar'}
              </button>
              <button
                onClick={() => { setHorarioAEliminar(null); setEliminarError(''); }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {horariosParaEliminar.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Selecciona el horario a eliminar</h3>
            
            <div className="space-y-3 mb-6">
              {horariosParaEliminar.map((h: any, index: number) => (
                <div 
                  key={h.id_asignacion}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 cursor-pointer transition-colors"
                  onClick={() => {
                    setHorarioAEliminar(h);
                    setHorariosParaEliminar([]);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div><strong>Curso:</strong> {h.curso?.codigo}</div>
                      <div><strong>Tipo:</strong> {h.tipo_clase}</div>
                      <div><strong>Docente:</strong> {h.docente?.apellidos}</div>
                      <div><strong>Ambiente:</strong> {h.ambiente?.nombre}</div>
                      <div className="col-span-2"><strong>Grupo:</strong> {h.grupo?.codigo_grupo}</div>
                    </div>
                    <div className="flex-shrink-0 text-red-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setHorariosParaEliminar([])}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Selección */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Datos para Asignación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Período Académico *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={periodoSeleccionado}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setPeriodoSeleccionado(e.target.value);
                setCicloSeleccionado('');
                setCursoSeleccionado('');
                setGrupoSeleccionado('');
              }}
            >
              <option value="">Seleccione período</option>
              {periodos.map((p: any) => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Ciclo * {periodoSeleccionado && `(${ciclosDisponibles.join(', ')})`}
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={cicloSeleccionado}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setCicloSeleccionado(e.target.value);
                setCursoSeleccionado('');
                setGrupoSeleccionado('');
              }}
              disabled={!periodoSeleccionado}
            >
              <option value="">Seleccione ciclo</option>
              {ciclosDisponibles.map((ciclo: number) => (
                <option key={ciclo} value={ciclo}>
                  Ciclo {ciclo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Docente *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={docenteSeleccionado}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setDocenteSeleccionado(e.target.value);
                setCursoSeleccionado('');
                setGrupoSeleccionado('');
                setCeldasSeleccionadas(new Set());
                setModoSeleccion(false);
                setError('');
              }}
            >
              <option value="">Seleccione docente</option>
              {docentes.map((d: any) => (
                <option key={d.id_docente} value={d.id_docente}>
                  {d.apellidos}, {d.nombres}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Curso * (Ciclo {cicloSeleccionado || '?'})
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={cursoSeleccionado}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setCursoSeleccionado(e.target.value);
                setGrupoSeleccionado('');
                setCeldasSeleccionadas(new Set());
                setModoSeleccion(false);
                setError('');
              }}
              disabled={!cicloSeleccionado || !docenteSeleccionado}
            >
              <option value="">Seleccione curso</option>
              {cursos.map((c: any) => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.codigo} - {c.nombre}
                </option>
              ))}
            </select>
            {cicloSeleccionado && docenteSeleccionado && cursos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Este docente no tiene cursos asignados en el ciclo {cicloSeleccionado}
              </p>
            )}
            {cicloSeleccionado && !docenteSeleccionado && cursos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ No hay cursos de ciclo {cicloSeleccionado}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Grupo *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={grupoSeleccionado}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGrupoSeleccionado(e.target.value)}
              disabled={!cursoSeleccionado}
            >
              <option value="">Seleccione grupo</option>
              {grupos.map((g: any) => (
                <option key={g.id_grupo} value={g.id_grupo}>
                  Grupo {g.codigo_grupo}
                </option>
              ))}
            </select>
            {cursoSeleccionado && docenteSeleccionado && grupos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Este docente no tiene grupos asignados para este curso y período
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Ambiente *
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-3 py-2"
                value={ambienteSeleccionado}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAmbienteSeleccionado(e.target.value)}
              >
                <option value="">Seleccione ambiente</option>
                {ambientes.map((a: any) => (
                  <option key={a.id_ambiente} value={a.id_ambiente}>
                    {a.nombre} ({a.tipo})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setConsultaTipo('aula')}
                className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 border border-blue-200 transition-colors"
                title="Consultar disponibilidad de Aulas"
              >
                🏫
              </button>
              <button
                type="button"
                onClick={() => setConsultaTipo('laboratorio')}
                className="bg-purple-100 text-purple-700 p-2 rounded hover:bg-purple-200 border border-purple-200 transition-colors"
                title="Consultar disponibilidad de Laboratorios"
              >
                🔬
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Clase *
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={tipoClase}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setTipoClase(e.target.value);
                setCeldasSeleccionadas(new Set());
                setModoSeleccion(false);
                setError('');
              }}
            >
              <option value="teoria">Teoría</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="practica">Práctica</option>
            </select>
            {cursoSeleccionado && (
              <p className="text-xs text-blue-600 mt-1">
                Horas disponibles: {obtenerHorasDisponibles()} de {obtenerHorasLimite()}
              </p>
            )}
          </div>
        </div>
      </div>

      {!cicloSeleccionado && periodoSeleccionado && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-lg">
          <p className="text-amber-800 font-medium">
            ⚠️ Por favor seleccione un CICLO para ver la matriz de horarios
          </p>
        </div>
      )}

      {modoSeleccion && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-800 font-medium">
            {celdasSeleccionadas.size} bloque(s) seleccionado(s) - Ciclo {cicloSeleccionado}
          </span>
          <div className="flex gap-2">
            <Boton onClick={confirmarAsignacion}>
              ✅ Confirmar ({celdasSeleccionadas.size})
            </Boton>
            <Boton variante="secondary" onClick={limpiarSeleccion}>
              Limpiar
            </Boton>
          </div>
        </div>
      )}

      {cicloSeleccionado && (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">
            Matriz de Horarios - CICLO {cicloSeleccionado}
            <span className="text-sm font-normal text-gray-600 ml-2">
              (Click verde/amarillo = Eliminar | Click blanco = Asignar)
            </span>
          </h3>
          
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 sticky left-0 z-10">Hora</th>
                {DIAS.map(dia => (
                  <th key={dia} className="border p-2 bg-gray-100 min-w-[150px]">{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((hora, horaIndex) => (
                <tr key={horaIndex}>
                  <td className="border p-2 text-sm font-medium bg-gray-50 sticky left-0 z-10">
                    {hora.inicio}<br/>{hora.fin}
                  </td>
                  {DIAS.map((_dia, diaIndex) => {
                    const horariosBloque = obtenerHorarios(diaIndex, horaIndex);
                    const esSeleccionada = esCeldaSeleccionada(diaIndex, horaIndex);

                    const horariosActivos = horariosBloque.filter((h) => h.estado !== 'cancelado');
                    const bloqueOcupado = horariosActivos.length > 0;
                    const bloqueSolicitado =
                      bloqueOcupado && horariosActivos.every((h) => h.estado === 'solicitado');
                    
                    // Determinar el tooltip según el estado
                    let tooltip = 'Click para seleccionar';
                    if (bloqueOcupado) {
                      if (bloqueSolicitado) {
                        tooltip = 'SOLICITADO (bloqueado) - Click para eliminar o gestionar en Solicitudes';
                      } else {
                      const primerHorario = horariosActivos[0];
                      const esLabOPractica = primerHorario.tipo_clase === 'laboratorio' || primerHorario.tipo_clase === 'practica';
                      
                      if (horariosActivos.length === 1 && esLabOPractica) {
                        tooltip = 'Click para agregar 2do horario (Lab/Práctica) o eliminar';
                      } else if (horariosActivos.length === 1) {
                        tooltip = 'Click para eliminar (Teoría: solo 1 grupo)';
                      } else {
                        tooltip = 'Click para eliminar (Máximo: 2 horarios)';
                      }
                      }
                    } else {
                      // Verificar si este docente ya tiene una clase en este bloque (pero en otro ciclo)
                      const docenteOcupado = horarios.some(h => 
                        h.id_docente === parseInt(docenteSeleccionado) && 
                        h.dia_semana === diaIndex && 
                        h.hora_inicio === horas[horaIndex].inicio &&
                        h.estado !== 'cancelado'
                      );
                      if (docenteOcupado) {
                        tooltip = '⚠️ El docente ya tiene una clase en este horario (otro ciclo)';
                      }
                    }

                    return (
                      <td
                        key={`${diaIndex}-${horaIndex}`}
                        className={`border p-0 cursor-pointer transition-colors ${
                          bloqueOcupado
                            ? bloqueSolicitado
                              ? 'bg-yellow-100 hover:bg-yellow-200'
                              : 'bg-green-100 hover:bg-red-100'
                            : esSeleccionada
                              ? 'bg-blue-200 hover:bg-blue-300 ring-2 ring-blue-500'
                              : 'bg-white hover:bg-blue-50'
                        }`}
                        onClick={() => handleCeldaClick(diaIndex, horaIndex, horariosBloque)}
                        title={tooltip}
                      >
                        {!bloqueOcupado ? (
                          // Celda vacía
                          <div className="text-center text-gray-300 py-4">
                            {esSeleccionada ? '✓' : '+'}
                          </div>
                        ) : horariosActivos.length === 1 ? (
                          // Un solo horario
                          <div className="text-xs p-2">
                            {horariosActivos[0].estado === 'solicitado' && (
                              <div className="font-semibold text-yellow-900">SOLICITADO</div>
                            )}
                            <div className="font-semibold text-gray-900">{horariosActivos[0].curso?.codigo}</div>
                            <div className="text-gray-700">{horariosActivos[0].docente?.apellidos}</div>
                            <div className="text-gray-500 text-[10px]">{horariosActivos[0].ambiente?.nombre}</div>
                            <div className="text-gray-400 text-[10px] capitalize">{horariosActivos[0].tipo_clase}</div>
                          </div>
                        ) : (
                          // Múltiples horarios (dividir celda)
                          <div className="flex h-full">
                            {horariosActivos.slice(0, 2).map((h, idx) => (
                              <div 
                                key={h.id_asignacion}
                                className={`flex-1 text-xs p-1 ${
                                  idx === 0 ? 'border-r border-gray-300' : ''
                                }`}
                              >
                                {h.estado === 'solicitado' && (
                                  <div className="font-semibold text-yellow-900 text-[10px]">SOLICITADO</div>
                                )}
                                <div className="font-semibold text-gray-900 text-[10px]">{h.curso?.codigo}</div>
                                <div className="text-gray-700 text-[10px]">{h.docente?.apellidos}</div>
                                <div className="text-gray-500 text-[9px]">{h.ambiente?.nombre}</div>
                                <div className="text-gray-400 text-[9px] capitalize">{h.tipo_clase}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>Sistema de Horarios por Ciclo:</strong><br/>
          • Cada período tiene {ciclosDisponibles.length} ciclos independientes<br/>
          • Cada ciclo tiene su propia matriz de horarios<br/>
          • Los horarios de un ciclo NO interfieren con otros ciclos<br/>
          • Un docente puede tener clases en el mismo horario en diferentes ciclos
        </p>
      </div>

      {/* Modales de Consulta Rápida */}
      {consultaTipo && (
        <ModalConsultaAmbientes
          abierto={!!consultaTipo}
          alCerrar={() => setConsultaTipo(null)}
          tipo={consultaTipo}
          ambientes={ambientes}
          horarios={horarios}
          horas={horas.map(h => h.inicio)}
        />
      )}
    </div>
  );
}
