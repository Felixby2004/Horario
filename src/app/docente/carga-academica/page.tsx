'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { DocumentoCargaAcademica, DocumentoDeclaracionJurada, DocumentoHorarioSemanal } from '@/components/DocumentGenerator';
import { utilidadesFecha } from '@/lib/utilidadesFecha';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ModalConsultaAmbientes } from '@/components/horarios/ModalConsultaAmbientes';
import { validarEnvioCargaAcademica } from '@/lib/cargaAcademica';
import { Download } from 'lucide-react';
import {
  calcularHorasAcumuladasPorTipo,
  obtenerEtiquetaActividadNoLectiva,
  obtenerLimitesNoLectivosPorModalidad,
  tieneAprobacionAutoevaluacion,
  validarAsignacionActividadNoLectiva
} from '@/lib/cargaNoLectiva';

const TIPOS_ACTIVIDAD = [
  { valor: 'tutoria_consejeria', label: 'Tutoria / Consejería' },
  { valor: 'investigacion', label: 'Investigación' },
  { valor: 'responsabilidad_social', label: 'Responsabilidad Social' },
  { valor: 'gestion_gobierno', label: 'Gestión y Gobierno' },
  { valor: 'asesoria_tesis_jurado', label: 'Asesoría de Tesis / Jurado' },
  { valor: 'perfeccionamiento', label: 'Formación académica y capacitación' },
  { valor: 'preparacion_evaluacion', label: 'Preparación y Evaluación' },
  { valor: 'autoevaluacion_acreditacion', label: 'Autoevaluación / Acreditación' }
];

// Configuración para cada tipo de actividad (según Reglamento Carga Académica UNT 2024)
const CONFIG_ACTIVIDAD = {
  tutoria_consejeria: {
    maxHoras: 2,
    campos: [
      { id: 'cantidad_alumnos', label: 'Cantidad de Alumnos', tipo: 'number', requerido: true },
      { id: 'ciclo_academico', label: 'Ciclo Académico', tipo: 'text', requerido: true }
    ]
  },
  investigacion: {
    maxHoras: 6,
    campos: [
      { id: 'numero_inscripcion', label: 'Número de Inscripción', tipo: 'text', requerido: false },
      { id: 'codigo_proyecto', label: 'Código del Proyecto', tipo: 'text', requerido: false },
      { id: 'titulo', label: 'Título del Proyecto', tipo: 'text', requerido: true }
    ]
  },
  responsabilidad_social: {
    maxHoras: 3,
    campos: [
      { id: 'nombre_proyecto', label: 'Nombre del Proyecto', tipo: 'text', requerido: true },
      { id: 'descripcion_actividad', label: 'Descripción de la Actividad', tipo: 'textarea', requerido: true }
    ]
  },
  gestion_gobierno: {
    maxHoras: 2,
    campos: [
      { id: 'numero_resolucion', label: 'Número de Resolución', tipo: 'text', requerido: true },
      { id: 'cargo_indique', label: 'Cargo (si desempeña cargo)', tipo: 'text', requerido: false }
    ]
  },
  asesoria_tesis_jurado: {
    maxHoras: 2,
    campos: [
      { id: 'numero_resolucion', label: 'Número de Resolución', tipo: 'text', requerido: true },
      { id: 'titulo_tesis', label: 'Título de la Tesis', tipo: 'text', requerido: false },
      { id: 'nombre_estudiante', label: 'Nombre del Estudiante', tipo: 'text', requerido: false }
    ]
  },
  perfeccionamiento: {
    campos: [
      { id: 'titulo_programa', label: 'Título del Programa', tipo: 'text', requerido: true },
      { id: 'institucion', label: 'Institución', tipo: 'text', requerido: true },
      { id: 'numero_horas_total', label: 'Número de Horas Total', tipo: 'number', requerido: false }
    ]
  },
  preparacion_evaluacion: {
    campos: [
      { id: 'ciclo_academico', label: 'Ciclo Académico', tipo: 'text', requerido: true },
      { id: 'cantidad_alumnos', label: 'Cantidad de Alumnos', tipo: 'number', requerido: true }
    ]
  },
  autoevaluacion_acreditacion: {
    campos: [
      {
        id: 'autoevaluacion_acreditacion_aprobada',
        label: 'Proceso formalmente aprobado',
        tipo: 'checkbox',
        requerido: true
      },
      { id: 'numero_resolucion', label: 'Número de Resolución', tipo: 'text', requerido: true },
      { id: 'detalle_proceso', label: 'Detalle del Proceso', tipo: 'textarea', requerido: true }
    ]
  }
};

export default function DocenteCargaAcademicaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');
  const [carga, setCarga] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [horariosDocente, setHorariosDocente] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<any>(null);
  const [mostrarDocumento, setMostrarDocumento] = useState<'carga' | 'declaracion' | 'horario' | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string>('');
  const [mensajeErrorCarga, setMensajeErrorCarga] = useState<string>('');
  const [modalGestionHorariosAbierto, setModalGestionHorariosAbierto] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const obtenerIdDocenteUsuario = (user: any) => {
    const idDocente = Number(user?.id_docente);
    return Number.isFinite(idDocente) && idDocente > 0 ? idDocente : null;
  };

  const handleDescargarPDF = async () => {
    try {
      const element = documentRef.current;
      if (!element) {
        console.error('No hay elemento para generar PDF');
        return;
      }

      // Importar dinámicamente html2pdf.js solo en el cliente
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      const nombreDocente = usuario ? `${usuario.apellidos}_${usuario.nombres}` : 'documento';

      const nombreArchivo =
        mostrarDocumento === 'carga'
          ? `Formato_1_Carga_Academica_${nombreDocente}.pdf`
          : mostrarDocumento === 'horario'
          ? `Formato_F03_Horario_Semanal_${nombreDocente}.pdf`
          : `Formato_2_Declaracion_Jurada_${nombreDocente}.pdf`;

      const opt: any = {
        margin: [15, 10, 15, 10],
        filename: nombreArchivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: true,
          allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al descargar el PDF. Por favor, intenta nuevamente.');
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.rol !== 'docente') {
      router.push('/');
      return;
    }

    const idDocente = obtenerIdDocenteUsuario(user);
    if (!idDocente) {
      setMensajeErrorCarga('No se encontró un docente válido en tu sesión. Vuelve a iniciar sesión.');
      setCargando(false);
      return;
    }

    setUsuario(user);
    cargarDatos(idDocente);
  }, [router]);

  // Ocultar mensaje de éxito después de 5 segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => {
        setMensajeExito('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const cargarDatos = async (idDocente: number) => {
    try {
      setCargando(true);
      setMensajeErrorCarga('');
      const resPeriodos = await fetch('/api/periodos');
      const dataPeriodos = await resPeriodos.json();

      if (dataPeriodos.exito) {
        setPeriodos(dataPeriodos.datos);
        if (dataPeriodos.datos.length > 0) {
          const idPeriodo = dataPeriodos.datos[0].id_periodo;
          setPeriodoSeleccionado(String(idPeriodo));
          await cargarCargaYActividades(idDocente, idPeriodo);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCargaYActividades = async (idDocente: number, idPeriodo: number) => {
    try {
      setMensajeErrorCarga('');
      const [resCarga, resHorarios] = await Promise.all([
        fetch(`/api/carga-academica?docenteId=${idDocente}&periodoId=${idPeriodo}`),
        fetch(`/api/horarios?periodo=${idPeriodo}&docenteId=${idDocente}`)
      ]);

      const dataCarga = await resCarga.json();
      const dataHorarios = await resHorarios.json();

      if (!resCarga.ok || !dataCarga.exito) {
        setMensajeErrorCarga(dataCarga?.mensaje || dataCarga?.error || 'No se pudo cargar tu carga académica.');
        return;
      }

      if (!resHorarios.ok || !dataHorarios.exito) {
        setMensajeErrorCarga(dataHorarios?.mensaje || dataHorarios?.error || 'No se pudo cargar tu horario.');
        return;
      }
      
      const parseJSON = (value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error('Error parsing JSON in cargarCargaYActividades:', e);
            return value;
          }
        }
        return value;
      };

      if (dataCarga.exito && dataCarga.datos.length > 0) {
        const cargaData = dataCarga.datos[0];
        const actividadesParseadas = (cargaData.actividades_no_lectivas || []).map((act: any) => ({
          ...act,
          horarios_actividad: parseJSON(act.horarios_actividad),
          dias_semana: parseJSON(act.dias_semana),
          datos_adicionales: parseJSON(act.datos_adicionales),
          datos_sustento: parseJSON(act.datos_sustento)
        }));
        
        console.log('cargarCargaYActividades - cargaData:', cargaData);
        console.log('cargarCargaYActividades - actividades_no_lectivas:', actividadesParseadas);
        setCarga({
          ...cargaData,
          actividades_no_lectivas: actividadesParseadas
        });
        setActividades(actividadesParseadas);
      } else {
        // Si no hay carga, creamos una nueva
        await crearCargaAcademica(idDocente, idPeriodo);
      }
      
      if (dataHorarios.exito) {
        console.log('Docente horarios:', dataHorarios.datos);
        setHorariosDocente(dataHorarios.datos);
      }
    } catch (error) {
      console.error('Error cargando carga y actividades:', error);
      setMensajeErrorCarga('Ocurrió un error al cargar tu carga académica.');
    }
  };

  const crearCargaAcademica = async (idDocente: number, idPeriodo: number) => {
    try {
      const res = await fetch('/api/carga-academica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_docente: idDocente, id_periodo: idPeriodo })
      });
      const data = await res.json();
      if (res.ok && data.exito) {
        setCarga(data.datos);
        setMensajeErrorCarga('');
      } else {
        setMensajeErrorCarga(data?.mensaje || 'No se pudo crear tu carga académica.');
      }
    } catch (error) {
      console.error('Error creando carga académica:', error);
      setMensajeErrorCarga('Ocurrió un error al crear tu carga académica.');
    }
  };

  const validacionEnvio = carga
    ? validarEnvioCargaAcademica({
        docente: carga.docente || usuario,
        carga,
        actividades
      })
    : null;

  const handleEnviar = async () => {
    if (!carga || !validacionEnvio) return;
    try {
      if (!validacionEnvio.valido) {
        alert(validacionEnvio.mensaje);
        return;
      }

      const response = await fetch(`/api/carga-academica/${carga.id_carga}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'enviado',
          fecha_envio: new Date(),
          usuario_id: usuario.id || usuario.id_usuario
        })
      });
      const data = await response.json();
      if (data.exito) {
        setMensajeExito('Carga académica enviada exitosamente!');
        await cargarCargaYActividades(usuario.id_docente, parseInt(periodoSeleccionado));
      } else {
        alert(data.mensaje || 'No se pudo enviar la carga académica.');
      }
    } catch (error) {
      console.error('Error enviando carga:', error);
    }
  };

  const handleNuevaActividad = () => {
    setActividadSeleccionada(null);
    setModalAbierto(true);
  };

  const handleEditarActividad = (actividad: any) => {
    setActividadSeleccionada(actividad);
    setModalAbierto(true);
  };

  const handleEliminarActividad = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    try {
      await fetch(`/api/actividad-no-lectiva/${id}`, { method: 'DELETE' });
      await cargarCargaYActividades(usuario.id_docente, parseInt(periodoSeleccionado));
    } catch (error) {
      console.error('Error eliminando actividad:', error);
    }
  };

  if (!isMounted) return null;

  if (!usuario) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-full xl:max-w-[1800px] mx-auto space-y-4 md:space-y-6">
        {/* Mensaje de éxito */}
        {mensajeExito && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <p className="text-green-800 font-medium">{mensajeExito}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi Carga Académica</h1>
          <p className="text-gray-600 mt-1">Gestiona tus horas lectivas y no lectivas</p>
        </div>

        {/* Selector de Periodo */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Periodo</label>
              <select
                value={periodoSeleccionado}
                onChange={(e) => {
                  setPeriodoSeleccionado(e.target.value);
                  cargarCargaYActividades(usuario.id_docente, parseInt(e.target.value));
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {periodos.map((p: any) => (
                  <option key={p.id_periodo} value={p.id_periodo}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              {carga && ['borrador', 'observado'].includes(carga.estado) && (
                <Boton onClick={handleEnviar} disabled={!validacionEnvio?.valido}>
                  📤 Enviar para Revisión
                </Boton>
              )}
            </div>
          </div>
          {mensajeErrorCarga && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">{mensajeErrorCarga}</p>
            </div>
          )}
          {carga && ['borrador', 'observado'].includes(carga.estado) && validacionEnvio && !validacionEnvio.valido && (
            <div className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-4">
              <p className="text-sm font-medium text-orange-900">{validacionEnvio.mensaje}</p>
            </div>
          )}
        </div>

        {/* Resumen de Carga */}
        {carga && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
              <p className="text-blue-600 text-sm font-medium">Horas Lectivas</p>
              <p className="text-4xl font-bold text-blue-800 mt-2">{carga.horas_lectivas} h</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
              <p className="text-green-600 text-sm font-medium">Horas No Lectivas</p>
              <p className="text-4xl font-bold text-green-800 mt-2">{carga.horas_no_lectivas} h</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
              <p className="text-purple-600 text-sm font-medium">Total</p>
              <p className="text-4xl font-bold text-purple-800 mt-2">
                {carga.horas_totales} h
              </p>
            </div>
          </div>
        )}

        {/* Estado de la Carga y Documentos */}
        {carga && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado de la Carga Académica</p>
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                    carga.estado === 'aprobado' || carga.estado === 'publicado'
                      ? 'bg-green-100 text-green-800'
                      : carga.estado === 'observado'
                      ? 'bg-orange-100 text-orange-800'
                      : carga.estado === 'en_revision' || carga.estado === 'validado' || carga.estado === 'enviado'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {carga.estado.charAt(0).toUpperCase() + carga.estado.slice(1).replace('_', ' ')}
                </span>
              </div>

              {/* Observaciones de Rechazo */}
              {carga.estado === 'observado' && carga.observaciones_generales && (
                <div className="p-4 border-2 border-orange-300 rounded-lg bg-orange-50">
                  <p className="text-base font-bold text-orange-900 mb-2">⚠️ Motivo del Rechazo:</p>
                  <p className="text-sm text-orange-800 whitespace-pre-wrap">{carga.observaciones_generales}</p>
                </div>
              )}

              {/* Sección de Documentos - Disponible para todos los estados */}
              <div className={`p-4 border rounded-lg ${
                (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-3 ${
                  (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                    ? 'text-green-900' 
                    : 'text-gray-700'
                }`}>
                  {carga.estado === 'aprobado' || carga.estado === 'publicado' 
                    ? 'Documentos Generados y Aprobados' 
                    : 'Vista Previa de Documentos'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setMostrarDocumento('carga')}
                    className={`flex items-center gap-3 p-4 border rounded-lg bg-white hover:shadow-md transition-all ${
                      (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                        ? 'border-green-200 hover:bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-3xl ${
                      (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                    }`}>📄</div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Formato N°1</p>
                      <p className="text-xs text-gray-600 mt-1">Declaración de Carga Horaria Asignada</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMostrarDocumento('declaracion')}
                    className={`flex items-center gap-3 p-4 border rounded-lg bg-white hover:shadow-md transition-all ${
                      (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                        ? 'border-green-200 hover:bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-3xl ${
                      (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                    }`}>📜</div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Declaración Jurada</p>
                      <p className="text-xs text-gray-600 mt-1">Declaración Jurada de No Estar Incluso en Causales</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMostrarDocumento('horario')}
                    className={`flex items-center gap-3 p-4 border rounded-lg bg-white hover:shadow-md transition-all ${
                      (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                        ? 'border-green-200 hover:bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-3xl ${
                      (carga.estado === 'aprobado' || carga.estado === 'publicado') 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                    }`}>📅</div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Horario Semanal</p>
                      <p className="text-xs text-gray-600 mt-1">Formato F03-CAD - Horario Semanal de la Carga Académica</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout: Actividades + Formato F03-CAD */}
        {carga && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Actividades No Lectivas */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-gray-50">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Actividades No Lectivas</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  {carga && ['borrador', 'observado'].includes(carga.estado) && (
                    <Boton onClick={handleNuevaActividad}>➕ Nueva Actividad</Boton>
                  )}
                  {carga && (
                    <button
                      onClick={() => setModalGestionHorariosAbierto(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                      📅 Gestionar Horarios
                    </button>
                  )}
                </div>
              </div>

              {actividades.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg mb-2">
                    No hay actividades no lectivas registradas.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Agrega tus actividades para visualizarlas en el horario
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] md:max-h-[700px] overflow-y-auto">
                  {actividades.map((actividad: any) => (
                    <div key={actividad.id_actividad} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900">
                            {TIPOS_ACTIVIDAD.find((t) => t.valor === actividad.tipo_actividad)?.label ||
                              actividad.tipo_actividad}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm md:text-base">
                            <strong>Horas Semanales:</strong> {actividad.horas_semanales} h
                          </p>
                          {actividad.nombre && (
                            <p className="text-gray-600 mt-1 text-sm md:text-base">
                              <strong>Nombre:</strong> {actividad.nombre}
                            </p>
                          )}
                          {actividad.descripcion && (
                            <p className="text-sm text-gray-500 mt-2">{actividad.descripcion}</p>
                          )}
                        </div>
                        {carga && ['borrador', 'observado'].includes(carga.estado) && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditarActividad(actividad)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleEliminarActividad(actividad.id_actividad)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formato F03-CAD - Horario Semanal */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                <h2 className="text-lg md:text-xl font-semibold text-blue-900">Formato F03-CAD - Horario Semanal</h2>
                <div className="text-xs md:text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-medium">
                  ⚡ Actualización en tiempo real
                </div>
              </div>
              <div className="p-3 md:p-4 bg-white max-h-[600px] md:max-h-[700px] overflow-auto">
                <div className="bg-white p-2 md:p-4 rounded-lg border border-gray-200">
                  <DocumentoHorarioSemanal
                    carga={carga}
                    docente={carga.docente || usuario}
                    periodo={carga.periodo}
                    horarios={horariosDocente}
                    actividades={actividades}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Nueva/Editar Actividad */}
      {modalAbierto && (
        <ModalActividadNoLectiva
          abierto={modalAbierto}
          alCerrar={() => setModalAbierto(false)}
          actividad={actividadSeleccionada}
          idCargaAcademica={carga?.id_carga}
          horasLectivas={carga?.horas_lectivas ?? 0}
          periodo={periodos.find((p) => p.id_periodo === parseInt(periodoSeleccionado))}
          periodos={periodos}
          docente={carga?.docente || usuario}
          onActualizar={async (mensaje: string) => {
            setModalAbierto(false);
            setMensajeExito(mensaje);
            if (usuario) await cargarCargaYActividades(usuario.id_docente, parseInt(periodoSeleccionado));
          }}
        />
      )}

      {/* Modal para Gestionar Horarios de Actividades No Lectivas */}
      {modalGestionHorariosAbierto && (
        <ModalGestionHorariosNoLectivas
          abierto={modalGestionHorariosAbierto}
          alCerrar={() => setModalGestionHorariosAbierto(false)}
          idCargaAcademica={carga?.id_carga}
          horasLectivas={carga?.horas_lectivas ?? 0}
          periodo={periodos.find((p) => p.id_periodo === parseInt(periodoSeleccionado))}
          docente={carga?.docente || usuario}
          onActualizar={async (mensaje: string) => {
            setMensajeExito(mensaje);
            if (usuario) await cargarCargaYActividades(usuario.id_docente, parseInt(periodoSeleccionado));
          }}
        />
      )}

      {/* Modal Documento */}
      {mostrarDocumento && carga && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                {mostrarDocumento === 'carga'
                  ? 'Formato N° 1 - Declaración de Carga Horaria Asignada'
                  : mostrarDocumento === 'horario'
                  ? 'Formato F03-CAD - Horario Semanal de la Carga Académica'
                  : 'Declaración Jurada'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDescargarPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setMostrarDocumento(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8" ref={documentRef}>
              {mostrarDocumento === 'carga' ? (
                <DocumentoCargaAcademica
                  carga={carga}
                  docente={carga.docente || usuario}
                  periodo={carga.periodo}
                  horarios={horariosDocente}
                  actividades={actividades}
                />
              ) : mostrarDocumento === 'horario' ? (
                <DocumentoHorarioSemanal
                  carga={carga}
                  docente={carga.docente || usuario}
                  periodo={carga.periodo}
                  horarios={horariosDocente}
                  actividades={actividades}
                />
              ) : (
                <DocumentoDeclaracionJurada docente={carga.docente || usuario} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalActividadNoLectiva({
  abierto,
  alCerrar,
  actividad,
  idCargaAcademica,
  horasLectivas = 0,
  periodo,
  periodos,
  docente,
  onActualizar
}: {
  abierto: boolean;
  alCerrar: () => void;
  actividad: any;
  idCargaAcademica?: number;
  horasLectivas?: number;
  periodo?: any;
  periodos?: any[];
  docente: any;
  onActualizar: (mensaje: string) => void;
}) {
  const [formData, setFormData] = useState<any>({
    tipo_actividad: 'tutoria_consejeria',
    nombre: '',
    descripcion: '',
    horas_semanales: 0,
    dias_semana: [],
    datos_adicionales: {},
    datos_sustento: {},
    horarios_actividad: []
  });

  const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<Set<string>>(new Set());
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [horariosExistentes, setHorariosExistentes] = useState<any[]>([]);
  const [actividadesNoLectivas, setActividadesNoLectivas] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [horas, setHoras] = useState<{ inicio: string; fin: string }[]>(utilidadesFecha.intervalosPorDefecto);
  const [consultaTipo, setConsultaTipo] = useState<'aula' | 'laboratorio' | null>(null);
  const [errorFormulario, setErrorFormulario] = useState('');

  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  useEffect(() => {
    if (abierto) {
      cargarDatos();
    }
  }, [abierto, periodo]);

  const limpiarSeleccionHoraria = () => {
    setCeldasSeleccionadas(new Set());
    setFormData((actual: any) => ({
      ...actual,
      horarios_actividad: [],
      dias_semana: [],
      horas_semanales: 0
    }));
  };

  const cargarDatos = async () => {
    try {
      const [resAmbientes, resHorarios, resConfig, resActividadesNoLectivas] = await Promise.all([
        fetch('/api/ambientes'),
        fetch(`/api/horarios?periodo=${periodo?.id_periodo}`),
        fetch('/api/configuracion'),
        fetch(`/api/actividad-no-lectiva?periodo=${periodo?.id_periodo}`)
      ]);

      const [dataAmbientes, dataHorarios, dataConfig, dataActividadesNoLectivas] = await Promise.all([
        resAmbientes.json(),
        resHorarios.json(),
        resConfig.json(),
        resActividadesNoLectivas.json()
      ]);

      if (dataAmbientes.exito) {
        setAmbientes(dataAmbientes.datos || []);
      }
      if (dataHorarios.exito) {
        setHorariosExistentes(dataHorarios.datos || []);
      }
      if (dataActividadesNoLectivas.exito) {
        setActividadesNoLectivas(dataActividadesNoLectivas.datos || []);
      }
      if (dataConfig.exito && dataConfig.datos) {
        setConfig(dataConfig.datos);
        const nuevosIntervalos = utilidadesFecha.generarIntervalosHorarios(
          dataConfig.datos.hora_inicio,
          dataConfig.datos.hora_fin,
          dataConfig.datos.duracion_bloque
        );
        setHoras(nuevosIntervalos);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    if (!abierto) return;

    if (actividad) {
      let horarios = actividad.horarios_actividad || [];
      let diasSemana = actividad.dias_semana || [];
      let datosAdicionales = actividad.datos_adicionales || {};
      let datosSustento = actividad.datos_sustento || {};

      const parseJSON = (value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error('Error parsing JSON field:', e);
            return value;
          }
        }
        return value;
      };

      horarios = parseJSON(horarios);
      diasSemana = parseJSON(diasSemana);
      datosAdicionales = parseJSON(datosAdicionales);
      datosSustento = parseJSON(datosSustento);

      // Backwards compatibility: if there's an old ciclo_academico, convert to new format (array of strings)
      if (datosSustento.ciclo_academico && !datosSustento.ciclos_academicos) {
        datosSustento.ciclos_academicos = [String(datosSustento.ciclo_academico)];
        delete datosSustento.ciclo_academico;
      } else if (datosSustento.ciclos_academicos) {
        // Normalize existing ciclos_academicos to array of strings
        datosSustento.ciclos_academicos = datosSustento.ciclos_academicos.map((c: any) =>
          typeof c === 'string' ? c : String(c.ciclo)
        );
      }

      setFormData({
        tipo_actividad: actividad.tipo_actividad,
        nombre: actividad.nombre,
        descripcion: actividad.descripcion || '',
        horas_semanales: actividad.horas_semanales || 0,
        dias_semana: diasSemana,
        datos_adicionales: datosAdicionales,
        datos_sustento: datosSustento,
        horarios_actividad: horarios
      });
    } else {
      setFormData({
        tipo_actividad: 'tutoria_consejeria',
        nombre: '',
        descripcion: '',
        horas_semanales: 0,
        dias_semana: [],
        datos_adicionales: {},
        datos_sustento: {
          ciclos_academicos: [],
          lugar: '',
          aula_total: '',
          autoevaluacion_acreditacion_aprobada: false
        },
        horarios_actividad: []
      });
    }

    setCeldasSeleccionadas(new Set());
    setErrorFormulario('');
  }, [abierto, actividad]);

  useEffect(() => {
    if (!abierto || !actividad) return;

    let horarios = actividad.horarios_actividad || [];
    if (typeof horarios === 'string') {
      try {
        horarios = JSON.parse(horarios);
      } catch (e) {
        console.error('Error parsing horarios_actividad:', e);
        horarios = [];
      }
    }

    const celdas = new Set<string>();
    if (Array.isArray(horarios)) {
      horarios.forEach((h: any) => {
        const idxDia = DIAS.indexOf(h.dia);
        const idxHora = horas.findIndex((hor) => hor.inicio === h.inicio);

        if (idxDia !== -1 && idxHora !== -1) {
          celdas.add(`${idxDia}-${idxHora}`);
        }
      });
    }

    setCeldasSeleccionadas(celdas);
  }, [abierto, actividad, horas]);

  const actividadesPropias = actividadesNoLectivas.filter(
    (item) => Number(item.id_carga) === Number(idCargaAcademica)
  );
  const autoevaluacionAprobada = tieneAprobacionAutoevaluacion(formData.datos_sustento, docente);
  const { limites: limitesModalidadBase } = obtenerLimitesNoLectivosPorModalidad({
    docente,
    autoevaluacionAprobada: true,
    horasLectivas
  });
  const { modalidad, limites } = obtenerLimitesNoLectivosPorModalidad({
    docente,
    autoevaluacionAprobada,
    horasLectivas
  });
  const limiteBaseTipo = limitesModalidadBase[formData.tipo_actividad] ?? Number.POSITIVE_INFINITY;
  const limiteActual = limites[formData.tipo_actividad] ?? Number.POSITIVE_INFINITY;
  const horasAcumuladasTipo = calcularHorasAcumuladasPorTipo({
    actividades: actividadesPropias,
    tipoActividad: formData.tipo_actividad,
    excluirIdActividad: actividad?.id_actividad || null
  });
  const horasDisponiblesTipo = Number.isFinite(limiteActual)
    ? Math.max(limiteActual - horasAcumuladasTipo, 0)
    : Number.POSITIVE_INFINITY;
  const tipoBloqueadoPorModalidad = Number.isFinite(limiteBaseTipo) && limiteBaseTipo <= 0;
  const autoevaluacionPendienteAprobacion =
    formData.tipo_actividad === 'autoevaluacion_acreditacion' && !autoevaluacionAprobada;
  const rubroDeshabilitado = tipoBloqueadoPorModalidad || autoevaluacionPendienteAprobacion;
  const puedeEditarHorario = !rubroDeshabilitado && horasDisponiblesTipo > 0;
  const puedeGuardarActividad = !tipoBloqueadoPorModalidad && !autoevaluacionPendienteAprobacion;
  const mensajeRestriccionActual = tipoBloqueadoPorModalidad
    ? `La modalidad ${modalidad} no permite registrar ${obtenerEtiquetaActividadNoLectiva(formData.tipo_actividad).toLowerCase()}.`
    : autoevaluacionPendienteAprobacion
    ? 'La autoevaluación y/o acreditación solo puede habilitarse cuando la escuela profesional tiene aprobación formal del proceso.'
    : '';

  useEffect(() => {
    if (!abierto || !rubroDeshabilitado) return;
    if (
      formData.horas_semanales === 0 &&
      (!Array.isArray(formData.horarios_actividad) || formData.horarios_actividad.length === 0) &&
      celdasSeleccionadas.size === 0
    ) {
      return;
    }
    limpiarSeleccionHoraria();
  }, [
    abierto,
    rubroDeshabilitado,
    formData.tipo_actividad,
    formData.horas_semanales,
    formData.horarios_actividad,
    celdasSeleccionadas.size
  ]);

  const handleCeldaClick = (diaIndex: number, horaIndex: number) => {
    const key = `${diaIndex}-${horaIndex}`;
    const nuevas = new Set(celdasSeleccionadas);
    if (nuevas.has(key)) {
      nuevas.delete(key);
    } else {
      if (!puedeEditarHorario) {
        setErrorFormulario(
          rubroDeshabilitado
            ? mensajeRestriccionActual
            : `Ya alcanzaste el límite permitido para ${obtenerEtiquetaActividadNoLectiva(formData.tipo_actividad).toLowerCase()}.`
        );
        return;
      }
      nuevas.add(key);
    }

    // Convertir celdas seleccionadas a horarios_actividad
    const horarios = Array.from(nuevas).map((k) => {
      const [d, h] = k.split('-').map(Number);
      return {
        dia: DIAS[d],
        diaIndex: d,
        inicio: horas[h].inicio,
        fin: horas[h].fin
      };
    });

    // Calculate horas_semanales based on config's duracion_bloque (in minutes)
    const duracionHoras = config ? config.duracion_bloque / 60 : 1.5;
    const horasCalculadas = horarios.length * duracionHoras;
    if (Number.isFinite(limiteActual) && horasAcumuladasTipo + horasCalculadas > limiteActual) {
      const horasDisponibles = Math.max(limiteActual - horasAcumuladasTipo, 0);
      setErrorFormulario(
        `No puedes agregar este bloque porque superarías el límite de ${limiteActual} hora(s) en ${obtenerEtiquetaActividadNoLectiva(formData.tipo_actividad).toLowerCase()} para la modalidad ${modalidad}. Tienes ${horasAcumuladasTipo} hora(s) registradas y solo quedan ${horasDisponibles} hora(s) disponibles.`
      );
      return;
    }

    setCeldasSeleccionadas(nuevas);
    setErrorFormulario('');
    setFormData({
      ...formData,
      horarios_actividad: horarios,
      dias_semana: Array.from(new Set(horarios.map((horario) => horario.dia))),
      // Calculamos horas semanales automáticamente
      horas_semanales: horasCalculadas
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCargaAcademica) return;

    const validacion = validarAsignacionActividadNoLectiva({
      docente,
      actividad: {
        id_actividad: actividad?.id_actividad,
        tipo_actividad: formData.tipo_actividad,
        horas_semanales: formData.horas_semanales,
        datos_sustento: formData.datos_sustento
      },
      actividadesExistentes: actividadesPropias,
      horasLectivas
    });

    if (!validacion.valido) {
      setErrorFormulario(validacion.mensaje);
      return;
    }

    try {
      const url = actividad
        ? `/api/actividad-no-lectiva/${actividad.id_actividad}`
        : '/api/actividad-no-lectiva';
      const method = actividad ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id_carga: idCargaAcademica,
          horas_asignadas: formData.horas_semanales,
          dias_semana: formData.dias_semana.length > 0 ? formData.dias_semana : null,
          fecha_inicio: periodo?.fecha_inicio ? new Date(periodo.fecha_inicio) : null,
          fecha_fin: periodo?.fecha_fin ? new Date(periodo.fecha_fin) : null,
          datos_adicionales: Object.keys(formData.datos_adicionales).length > 0 ? formData.datos_adicionales : null,
          datos_sustento: Object.keys(formData.datos_sustento).length > 0 ? formData.datos_sustento : null,
          horarios_actividad: formData.horarios_actividad.length > 0 ? formData.horarios_actividad : null
        })
      });

      const data = await response.json();
      if (data.exito) {
        onActualizar(data.mensaje || (actividad ? 'Actividad actualizada exitosamente!' : 'Actividad creada exitosamente!'));
      } else {
        setErrorFormulario(data.mensaje || 'No se pudo guardar la actividad.');
      }
    } catch (error) {
      console.error('Error guardando actividad:', error);
      setErrorFormulario('Ocurrió un error al guardar la actividad no lectiva.');
    }
  };

  const currentConfig = CONFIG_ACTIVIDAD[formData.tipo_actividad as keyof typeof CONFIG_ACTIVIDAD];

  const ambienteSeleccionado = ambientes.find(
    (a) => a.id_ambiente === Number(formData.datos_sustento?.id_ambiente)
  );

  const getCeldaInfo = (diaIndex: number, horaIndex: number): { ocupado: boolean; tipo?: 'lectivo' | 'no-lectivo'; nombre?: string; actividad?: string } => {
    const hora = horas[horaIndex];
    
    // 1. Check if ambiente is occupied with lectivo
    if (ambienteSeleccionado) {
      const horarioLectivo = horariosExistentes.find(
        (h) =>
          h.id_ambiente === ambienteSeleccionado.id_ambiente &&
          h.dia_semana === diaIndex &&
          h.hora_inicio === hora.inicio &&
          ['confirmado', 'publicado', 'borrador'].includes(h.estado)
      );
      if (horarioLectivo) {
        const nombres = horarioLectivo.docente?.nombres || '';
        const apellidos = horarioLectivo.docente?.apellidos || '';
        const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ') || 'Docente';
        
        return {
          ocupado: true,
          tipo: 'lectivo',
          nombre: nombreCompleto,
          actividad: horarioLectivo.curso?.nombre || horarioLectivo.grupo?.curso?.nombre || 'Clase'
        };
      }
      
      const actividadNoLectiva = actividadesNoLectivas.find(
        (act) =>
          act.datos_sustento?.id_ambiente === ambienteSeleccionado.id_ambiente &&
          act.horarios_actividad?.some(
            (h: any) =>
              DIAS.indexOf(h.dia) === diaIndex &&
              h.inicio === hora.inicio &&
              (!actividad || act.id_actividad !== actividad.id_actividad)
          )
      );
      if (actividadNoLectiva) {
        const nombres = actividadNoLectiva.carga_academica?.docente?.nombres || '';
        const apellidos = actividadNoLectiva.carga_academica?.docente?.apellidos || '';
        const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ') || 'Docente';
        
        return {
          ocupado: true,
          tipo: 'no-lectivo',
          nombre: nombreCompleto,
          actividad: actividadNoLectiva.nombre || actividadNoLectiva.tipo_actividad
        };
      }
    }

    // 2. Check if DOCENTE is occupied with lectivos (for same docente)
    const docenteHorarioLectivo = horariosExistentes.find(
      (h) =>
        h.id_docente === docente?.id_docente &&
        h.dia_semana === diaIndex &&
        h.hora_inicio === hora.inicio &&
        ['confirmado', 'publicado', 'borrador'].includes(h.estado)
    );
    if (docenteHorarioLectivo) {
      return {
        ocupado: true,
        tipo: 'lectivo',
        nombre: 'Tú',
        actividad: docenteHorarioLectivo.curso?.nombre || docenteHorarioLectivo.grupo?.curso?.nombre || 'Clase'
      };
    }

    // 3. Check if DOCENTE is occupied with other actividades no lectivas
    const docenteActividadNoLectiva = actividadesNoLectivas.find(
      (act) =>
        act.carga_academica?.id_docente === docente?.id_docente &&
        act.horarios_actividad?.some(
          (h: any) =>
            DIAS.indexOf(h.dia) === diaIndex &&
            h.inicio === hora.inicio &&
            (!actividad || act.id_actividad !== actividad.id_actividad)
        )
    );
    if (docenteActividadNoLectiva) {
      return {
        ocupado: true,
        tipo: 'no-lectivo',
        nombre: 'Tú',
        actividad: docenteActividadNoLectiva.nombre || docenteActividadNoLectiva.tipo_actividad
      };
    }

    return { ocupado: false };
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {actividad ? 'Editar Actividad No Lectiva' : 'Nueva Actividad No Lectiva'}
          </h2>
          <button onClick={alCerrar} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Tipo de Actividad */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Actividad</label>
            <select
              value={formData.tipo_actividad}
              onChange={(e) => {
                const tipoSeleccionado = e.target.value;
                const datosSustentoActualizados = {
                  ...formData.datos_sustento,
                  lugar: formData.datos_sustento?.lugar || '',
                  aula_total: formData.datos_sustento?.aula_total || '',
                  autoevaluacion_acreditacion_aprobada:
                    tipoSeleccionado === 'autoevaluacion_acreditacion'
                      ? formData.datos_sustento?.autoevaluacion_acreditacion_aprobada === true
                      : false
                };

                // For types that require ciclo_academico, ensure ciclos_academicos is initialized
                if (
                  (tipoSeleccionado === 'tutoria_consejeria' || tipoSeleccionado === 'preparacion_evaluacion') &&
                  !datosSustentoActualizados.ciclos_academicos
                ) {
                  // Check if there's an old ciclo_academico to migrate
                  if (datosSustentoActualizados.ciclo_academico) {
                    datosSustentoActualizados.ciclos_academicos = [String(datosSustentoActualizados.ciclo_academico)];
                    delete datosSustentoActualizados.ciclo_academico;
                  } else if (datosSustentoActualizados.ciclos_academicos) {
                    // Normalize existing ciclos_academicos to array of strings
                    datosSustentoActualizados.ciclos_academicos = datosSustentoActualizados.ciclos_academicos.map((c: any) =>
                      typeof c === 'string' ? c : String(c.ciclo)
                    );
                  } else {
                    datosSustentoActualizados.ciclos_academicos = [];
                  }
                }

                setErrorFormulario('');
                setCeldasSeleccionadas(new Set());
                setFormData({
                  ...formData,
                  tipo_actividad: tipoSeleccionado,
                  horas_semanales: 0,
                  dias_semana: [],
                  horarios_actividad: [],
                  datos_sustento: datosSustentoActualizados
                });
              }}
              className="w-full border rounded px-3 py-2"
            >
              {TIPOS_ACTIVIDAD.map((tipo) => (
                <option
                  key={tipo.valor}
                  value={tipo.valor}
                  disabled={Number.isFinite(limitesModalidadBase[tipo.valor]) && (limitesModalidadBase[tipo.valor] ?? 0) <= 0}
                >
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p>
              <strong>Modalidad:</strong> {modalidad}
            </p>
            <p>
              <strong>Límite permitido:</strong>{' '}
              {Number.isFinite(limiteActual) ? `${limiteActual} hora(s)` : 'Sin límite específico'}
            </p>
            <p>
              <strong>Horas registradas en el rubro:</strong> {horasAcumuladasTipo} hora(s)
            </p>
            <p>
              <strong>Horas disponibles:</strong>{' '}
              {Number.isFinite(horasDisponiblesTipo) ? `${horasDisponiblesTipo} hora(s)` : 'Sin límite específico'}
            </p>
            {mensajeRestriccionActual && <p className="mt-2 font-medium text-red-700">{mensajeRestriccionActual}</p>}
          </div>

          {/* Campos específicos del tipo de actividad */}
          {currentConfig.campos.map((campo) => (
            <div key={campo.id}>
              <label className="block text-sm font-medium mb-2">
                {campo.label} {campo.requerido && <span className="text-red-500">*</span>}
              </label>
              {campo.id === 'ciclo_academico' ? (
                // Multi-select para ciclos
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 5, 7, 9].map((ciclo) => {
                      const isSelected = (formData.datos_sustento.ciclos_academicos || []).some(
                        (c: any) => {
                          if (typeof c === 'string') {
                            return c === String(ciclo);
                          } else {
                            return String(c.ciclo) === String(ciclo);
                          }
                        }
                      );
                    return (
                      <label
                        key={ciclo}
                        className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={tipoBloqueadoPorModalidad}
                          onChange={(e) => {
                              let newCiclos = [...(formData.datos_sustento.ciclos_academicos || [])];
                              // Normalize to array of strings
                              newCiclos = newCiclos.map((c: any) => 
                                typeof c === 'string' ? c : String(c.ciclo)
                              );
                              if (e.target.checked) {
                                // Add ciclo if not present
                                if (!newCiclos.includes(String(ciclo))) {
                                  newCiclos.push(String(ciclo));
                                }
                              } else {
                                // Remove ciclo
                                newCiclos = newCiclos.filter((c: string) => c !== String(ciclo));
                              }
                              setFormData({
                                ...formData,
                                datos_sustento: {
                                  ...formData.datos_sustento,
                                  ciclos_academicos: newCiclos
                                }
                              });
                            }}
                        />
                        <span>Ciclo {ciclo}</span>
                      </label>
                    );
                  })}
                </div>
              ) : campo.tipo === 'checkbox' ? (
                <label className="flex items-center gap-3 rounded border px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.datos_sustento[campo.id] === true}
                    onChange={(e) => {
                      setErrorFormulario('');
                      setFormData({
                        ...formData,
                        datos_sustento: {
                          ...formData.datos_sustento,
                          [campo.id]: e.target.checked
                        }
                      });
                    }}
                    disabled={tipoBloqueadoPorModalidad}
                    required={campo.requerido}
                  />
                  <span className="text-sm text-gray-700">
                    Confirmo que la escuela profesional cuenta con aprobación formal del proceso.
                  </span>
                </label>
              ) : campo.tipo === 'textarea' ? (
                <textarea
                  value={formData.datos_sustento[campo.id] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      datos_sustento: {
                        ...formData.datos_sustento,
                        [campo.id]: e.target.value
                      }
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  disabled={tipoBloqueadoPorModalidad}
                  rows={3}
                  required={campo.requerido}
                />
              ) : (
                <input
                  type={campo.tipo}
                  value={formData.datos_sustento[campo.id] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      datos_sustento: {
                        ...formData.datos_sustento,
                        [campo.id]: campo.tipo === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                      }
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  disabled={tipoBloqueadoPorModalidad}
                  required={campo.requerido}
                />
              )}
            </div>
          ))}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la Actividad</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full border rounded px-3 py-2"
              disabled={tipoBloqueadoPorModalidad}
              required
            />
          </div>

          {/* Horas Totales */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Horas Totales <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.horas_semanales}
              onChange={(e) => {
                const valor = parseFloat(e.target.value);
                if (!Number.isNaN(valor)) {
                  if (Number.isFinite(limiteActual) && valor > limiteActual - horasAcumuladasTipo) {
                    setErrorFormulario(
                      `El valor ingresado supera el límite permitido. Solo puedes agregar ${limiteActual - horasAcumuladasTipo} horas más.`
                    );
                  } else if (valor <= 0) {
                    setErrorFormulario('Debes ingresar al menos 1 hora.');
                  } else {
                    setErrorFormulario('');
                  }
                  setFormData({ ...formData, horas_semanales: valor });
                }
              }}
              className="w-full border rounded px-3 py-2"
              disabled={tipoBloqueadoPorModalidad}
              required
              min={0.5}
              step={0.5}
            />
            <p className="text-xs text-gray-500 mt-1">
              Horas disponibles: {Number.isFinite(horasDisponiblesTipo) ? horasDisponiblesTipo : 'Sin límite'}
            </p>
          </div>

          {/* Error Formulario */}
          {errorFormulario && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-600">{errorFormulario}</p>
            </div>
          )}

          {/* Ambiente (Combobox) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ambiente <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    placeholder="Selecciona un ambiente"
                    value={formData.datos_sustento?.id_ambiente || ''}
                    disabled={tipoBloqueadoPorModalidad}
                    onChange={(valor) =>
                      setFormData({
                        ...formData,
                        datos_sustento: {
                          ...formData.datos_sustento,
                          id_ambiente: valor,
                          lugar: ambientes.find((a) => a.id_ambiente === Number(valor))?.pabellon || '',
                          aula_total: ambientes.find((a) => a.id_ambiente === Number(valor))?.nombre || ''
                        }
                      })
                    }
                    opciones={ambientes.map((a: any) => ({
                      valor: a.id_ambiente,
                      etiqueta: `${a.codigo} - ${a.nombre} (${a.tipo})`,
                      codigo: a.codigo,
                      nombre: a.nombre,
                      tipo: a.tipo
                    }))}
                    camposBusqueda={['codigo', 'nombre', 'tipo']}
                  />
                </div>
                <button
                  type="button"
                  disabled={tipoBloqueadoPorModalidad}
                  onClick={() => setConsultaTipo(ambienteSeleccionado?.tipo === 'laboratorio' ? 'laboratorio' : 'aula')}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 border border-blue-200 transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  title="Consultar disponibilidad"
                >
                  📅
                </button>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full border rounded px-3 py-2"
              disabled={tipoBloqueadoPorModalidad}
              rows={3}
            />
          </div>

          {/* Info del período (fechas) */}
          {periodo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Fechas del período: {periodo.fecha_inicio} - {periodo.fecha_fin}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Las fechas de la actividad se tomarán automáticamente del período académico
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Boton type="submit" disabled={!puedeGuardarActividad}>
              {actividad ? 'Guardar Cambios' : 'Crear Actividad'}
            </Boton>
          </div>
        </form>
      </div>

      {consultaTipo && (
        <ModalConsultaAmbientes
          abierto={!!consultaTipo}
          alCerrar={() => setConsultaTipo(null)}
          tipo={consultaTipo}
          ambientes={ambientes}
          horarios={horariosExistentes}
          horas={horas}
          actividadesNoLectivas={actividadesNoLectivas}
        />
      )}
    </div>
  );
}

function ModalGestionHorariosNoLectivas({
  abierto,
  alCerrar,
  idCargaAcademica,
  horasLectivas = 0,
  periodo,
  docente,
  onActualizar
}: {
  abierto: boolean;
  alCerrar: () => void;
  idCargaAcademica?: number;
  horasLectivas?: number;
  periodo?: any;
  docente: any;
  onActualizar: (mensaje: string) => void;
}) {
  const [actividadSeleccionada, setActividadSeleccionada] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    tipo_actividad: 'tutoria_consejeria',
    nombre: '',
    descripcion: '',
    horas_semanales: 0,
    dias_semana: [],
    datos_adicionales: {},
    datos_sustento: {},
    horarios_actividad: []
  });
  const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<Set<string>>(new Set());
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [horariosExistentes, setHorariosExistentes] = useState<any[]>([]);
  const [actividadesNoLectivas, setActividadesNoLectivas] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [horas, setHoras] = useState<{ inicio: string; fin: string }[]>(utilidadesFecha.intervalosPorDefecto);
  const [consultaTipo, setConsultaTipo] = useState<'aula' | 'laboratorio' | null>(null);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [mostrarListaActividades, setMostrarListaActividades] = useState(true);
  const [bloqueArrastrado, setBloqueArrastrado] = useState<{tipo: 'agregar' | 'remover', actividad: any, index?: number, celdaKey?: string} | null>(null);

  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  useEffect(() => {
    if (abierto) {
      fetchConfig();
      fetchActividadesNoLectivas();
      fetchHorariosLectivos();
      fetchAmbientes();
    }
  }, [abierto]);

  const fetchAmbientes = async () => {
    try {
      const res = await fetch('/api/ambientes');
      const data = await res.json();
      if (data.exito) {
        setAmbientes(data.datos || []);
      } else {
        setAmbientes([]);
      }
    } catch (error) {
      console.error('Error fetching ambientes:', error);
      setAmbientes([]);
    }
  };

  useEffect(() => {
    if (actividadSeleccionada) {
      // Parse JSON fields
      let horarios = actividadSeleccionada.horarios_actividad || [];
      let diasSemana = actividadSeleccionada.dias_semana || [];
      let datosAdicionales = actividadSeleccionada.datos_adicionales || {};
      let datosSustento = actividadSeleccionada.datos_sustento || {};
      
      const parseJSON = (value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error('Error parsing JSON field:', e);
            return value;
          }
        }
        return value;
      };
      
      horarios = parseJSON(horarios);
      diasSemana = parseJSON(diasSemana);
      datosAdicionales = parseJSON(datosAdicionales);
      datosSustento = parseJSON(datosSustento);

      setFormData({
        tipo_actividad: actividadSeleccionada.tipo_actividad,
        nombre: actividadSeleccionada.nombre,
        descripcion: actividadSeleccionada.descripcion || '',
        horas_semanales: actividadSeleccionada.horas_semanales || actividadSeleccionada.horas_asignadas || 0,
        dias_semana: diasSemana,
        datos_adicionales: datosAdicionales,
        datos_sustento: datosSustento,
        horarios_actividad: horarios
      });
      
      // Limpiamos y volvemos a calcular celdas seleccionadas cada vez
      const celdas = new Set<string>();
      if (Array.isArray(horarios) && horarios.length > 0) {
        horarios.forEach((horario: any) => {
          if (!horario || !horario.dia || !horario.inicio) return;
          const diaIndex = DIAS.indexOf(horario.dia);
          const horaIndex = horas.findIndex((h) => h.inicio === horario.inicio);
          if (diaIndex !== -1 && horaIndex !== -1) {
            celdas.add(`${diaIndex}-${horaIndex}`);
          }
        });
      }
      console.log('useEffect actividadSeleccionada - celdas seleccionadas:', Array.from(celdas));
      setCeldasSeleccionadas(celdas);
    }
  }, [actividadSeleccionada, horas]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/configuracion');
      const data = await res.json();
      if (data.exito && data.datos) {
        setConfig(data.datos);
        const nuevosIntervalos = utilidadesFecha.generarIntervalosHorarios(
          data.datos.hora_inicio,
          data.datos.hora_fin,
          data.datos.duracion_bloque
        );
        setHoras(nuevosIntervalos);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchActividadesNoLectivas = async () => {
    try {
      const res = await fetch('/api/actividad-no-lectiva');
      const data = await res.json();
      console.log('fetchActividadesNoLectivas received data:', data);
      if (data.exito && data.datos) {
        const parseJSON = (value: any) => {
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch (e) {
              console.error('Error parsing JSON:', e);
              return value;
            }
          }
          return value;
        };
        const actividadesParseadas = data.datos.map((act: any) => ({
          ...act,
          horarios_actividad: parseJSON(act.horarios_actividad),
          dias_semana: parseJSON(act.dias_semana),
          datos_adicionales: parseJSON(act.datos_adicionales),
          datos_sustento: parseJSON(act.datos_sustento)
        }));
        console.log('fetchActividadesNoLectivas parsed actividades:', actividadesParseadas);
        setActividadesNoLectivas(actividadesParseadas);
      } else {
        setActividadesNoLectivas([]);
      }
    } catch (error) {
      console.error('Error fetching actividades no lectivas:', error);
      setActividadesNoLectivas([]);
    }
  };

  const fetchHorariosLectivos = async () => {
    if (!periodo) return;
    try {
      const res = await fetch(`/api/horarios?periodo=${periodo.id_periodo}`);
      const data = await res.json();
      if (data.exito) {
        setHorariosExistentes(data.datos || []);
      } else {
        setHorariosExistentes([]);
      }
    } catch (error) {
      console.error('Error fetching horarios:', error);
      setHorariosExistentes([]);
    }
  };

  const handleCancelar = () => {
    setActividadSeleccionada(null);
    setFormData({
      tipo_actividad: 'tutoria_consejeria',
      nombre: '',
      descripcion: '',
      horas_semanales: 0,
      dias_semana: [],
      datos_adicionales: {},
      datos_sustento: {},
      horarios_actividad: []
    });
    setCeldasSeleccionadas(new Set());
    alCerrar();
  };

  const getCeldaInfo = (diaIndex: number, horaIndex: number): { ocupado: boolean; tipo?: 'lectivo' | 'no-lectivo'; nombre?: string; actividad?: string } => {
    const key = `${diaIndex}-${horaIndex}`;
    console.log('getCeldaInfo called for key:', key);
    // Si la celda ya está seleccionada para la actividad actual, NO está ocupada
    if (celdasSeleccionadas.has(key)) {
      console.log('getCeldaInfo:', key, 'is already selected, returning not occupied');
      return { ocupado: false };
    }

    const parseJSON = (value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error('Error parsing JSON in getCeldaInfo:', e);
          return value;
        }
      }
      return value;
    };

    // Check if cell is part of the currently selected activity's original data → NOT occupied
    if (actividadSeleccionada) {
      const originalHorarios = parseJSON(actividadSeleccionada.horarios_actividad);
      if (Array.isArray(originalHorarios)) {
        const isPartOfOriginal = originalHorarios.some((h: any) => {
          if (!h || !h.dia || !h.inicio) return false;
          const dIdx = DIAS.indexOf(h.dia);
          const hIdx = horas.findIndex((hr) => hr.inicio === h.inicio);
          return dIdx === diaIndex && hIdx === horaIndex;
        });
        if (isPartOfOriginal) {
          console.log('getCeldaInfo:', key, 'is part of original selected activity, returning not occupied');
          return { ocupado: false };
        }
      }
    }

    const hora = horas[horaIndex];
    const ambienteSeleccionado = ambientes.find(
      (a) => a.id_ambiente === Number(formData.datos_sustento?.id_ambiente)
    );
    
    // Creamos una lista temporal de actividades no lectivas que actualice la actividad seleccionada con los datos actuales
    const actividadesNoLectivasActualizadas = actividadesNoLectivas.map((act) => {
      if (actividadSeleccionada && act.id_actividad === actividadSeleccionada.id_actividad) {
        // Convertimos celdasSeleccionadas a horarios_actividad
        const horariosActividadActual = Array.from(celdasSeleccionadas).map((k) => {
          const [d, h] = k.split('-').map(Number);
          return {
            dia: DIAS[d],
            inicio: horas[h]?.inicio || '',
            fin: horas[h]?.fin || ''
          };
        });
        return {
          ...act,
          ...formData,
          horarios_actividad: horariosActividadActual
        };
      }
      return act;
    });
    
    // 1. Check if ambiente is occupied with lectivo
    if (ambienteSeleccionado) {
      const horarioLectivo = horariosExistentes.find(
        (h) =>
          h.id_ambiente === ambienteSeleccionado.id_ambiente &&
          h.dia_semana === diaIndex &&
          h.hora_inicio === hora.inicio &&
          ['confirmado', 'publicado', 'borrador'].includes(h.estado)
      );
      if (horarioLectivo) {
        const nombres = horarioLectivo.docente?.nombres || '';
        const apellidos = horarioLectivo.docente?.apellidos || '';
        const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ') || 'Docente';
        
        console.log('getCeldaInfo:', key, 'occupied by lectivo:', horarioLectivo);
        return {
          ocupado: true,
          tipo: 'lectivo',
          nombre: nombreCompleto,
          actividad: horarioLectivo.curso?.nombre || horarioLectivo.grupo?.curso?.nombre || 'Clase'
        };
      }
      
      const actividadNoLectiva = actividadesNoLectivasActualizadas.find(
        (act) => {
          // Solo consideramos actividades de la carga académica actual
          if (Number(act.id_carga) !== Number(idCargaAcademica)) return false;
          
          const horariosAct = parseJSON(act.horarios_actividad);
          if (!Array.isArray(horariosAct)) return false;
          
          const matches = (
            act.datos_sustento?.id_ambiente === ambienteSeleccionado.id_ambiente &&
            horariosAct.some(
              (h: any) =>
                h && h.dia && DIAS.indexOf(h.dia) === diaIndex &&
                h.inicio === hora.inicio &&
                (!actividadSeleccionada || act.id_actividad !== actividadSeleccionada.id_actividad)
            )
          );
          if (matches) {
            console.log('getCeldaInfo:', key, 'matched actividadNoLectiva:', act, 'horariosAct:', horariosAct);
          }
          return matches;
        }
      );
      if (actividadNoLectiva) {
        const nombres = actividadNoLectiva.carga_academica?.docente?.nombres || '';
        const apellidos = actividadNoLectiva.carga_academica?.docente?.apellidos || '';
        const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ') || 'Docente';
        
        console.log('getCeldaInfo:', key, 'occupied by ambiente actividadNoLectiva:', actividadNoLectiva);
        return {
          ocupado: true,
          tipo: 'no-lectivo',
          nombre: nombreCompleto,
          actividad: actividadNoLectiva.nombre || actividadNoLectiva.tipo_actividad
        };
      }
    }

    // 2. Check if DOCENTE is occupied with lectivos (for same docente)
    const docenteHorarioLectivo = horariosExistentes.find(
      (h) =>
        h.id_docente === docente?.id_docente &&
        h.dia_semana === diaIndex &&
        h.hora_inicio === hora.inicio &&
        ['confirmado', 'publicado', 'borrador'].includes(h.estado)
    );
    if (docenteHorarioLectivo) {
      console.log('getCeldaInfo:', key, 'occupied by docenteHorarioLectivo:', docenteHorarioLectivo);
      return {
        ocupado: true,
        tipo: 'lectivo',
        nombre: 'Tú',
        actividad: docenteHorarioLectivo.curso?.nombre || docenteHorarioLectivo.grupo?.curso?.nombre || 'Clase'
      };
    }

    // 3. Check if DOCENTE is occupied with other actividades no lectivas
    const docenteActividadNoLectiva = actividadesNoLectivasActualizadas.find(
      (act) => {
        // Solo consideramos actividades de la carga académica actual
        if (Number(act.id_carga) !== Number(idCargaAcademica)) return false;
        
        const horariosAct = parseJSON(act.horarios_actividad);
        if (!Array.isArray(horariosAct)) return false;

        const matches = (
          act.carga_academica?.id_docente === docente?.id_docente &&
          horariosAct.some(
            (h: any) =>
              h && h.dia && DIAS.indexOf(h.dia) === diaIndex &&
              h.inicio === hora.inicio &&
              (!actividadSeleccionada || act.id_actividad !== actividadSeleccionada.id_actividad)
          )
        );
        if (matches) {
          console.log('getCeldaInfo:', key, 'matched docenteActividadNoLectiva:', act, 'horariosAct:', horariosAct);
        }
        return matches;
      }
    );
    if (docenteActividadNoLectiva) {
      console.log('getCeldaInfo:', key, 'occupied by docenteActividadNoLectiva:', docenteActividadNoLectiva);
      return {
        ocupado: true,
        tipo: 'no-lectivo',
        nombre: 'Tú',
        actividad: docenteActividadNoLectiva.nombre || docenteActividadNoLectiva.tipo_actividad
      };
    }

    console.log('getCeldaInfo:', key, 'is NOT occupied');
    return { ocupado: false };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, diaIndex?: number, horaIndex?: number) => {
    e.preventDefault();
    const nuevas = new Set(celdasSeleccionadas);
    
    if (!bloqueArrastrado) return;

    if (bloqueArrastrado.tipo === 'agregar') {
      if (!diaIndex || !horaIndex) {
        setBloqueArrastrado(null);
        return;
      }
      const key = `${diaIndex}-${horaIndex}`;
      // Verificar si la celda está ocupada POR OTRA ACTIVIDAD o POR HORARIO LECTIVO
      const celdaInfo = getCeldaInfo(diaIndex, horaIndex);
      
      // Si la celda está ocupada por la MISMA actividad (está en celdasSeleccionadas),
      // permitimos la operación sin error (solo no hacemos nada ya que es un Set)
      if (celdaInfo.ocupado && !celdasSeleccionadas.has(key)) {
        setErrorFormulario('Esta celda ya está ocupada.');
        setBloqueArrastrado(null);
        return;
      }
      
      // Verificar límite de bloques
      const duracionBloque = config ? config.duracion_bloque / 60 : 1.5;
      const horasActividad = actividadSeleccionada?.horas_semanales || actividadSeleccionada?.horas_asignadas || 0;
      const numBloques = Math.ceil(horasActividad / duracionBloque);
      const bloquesAgregados = nuevas.size;
      
      if (bloquesAgregados >= numBloques && !nuevas.has(key)) {
        setErrorFormulario('No puedes agregar más bloques de los permitidos.');
        setBloqueArrastrado(null);
        return;
      }
      
      nuevas.add(key);
      setErrorFormulario('');
    } else if (bloqueArrastrado.tipo === 'remover') {
      if (bloqueArrastrado.celdaKey) {
        // If dropping on a new cell: move it!
        if (diaIndex !== undefined && horaIndex !== undefined) {
          const newKey = `${diaIndex}-${horaIndex}`;
          const celdaInfo = getCeldaInfo(diaIndex, horaIndex);
          
          if (bloqueArrastrado.celdaKey === newKey) {
            // No-op if same cell
            setErrorFormulario('');
          } else if (celdaInfo.ocupado && !celdasSeleccionadas.has(newKey)) {
            // Solo bloqueamos si está ocupada por otra actividad o horario lectivo
            setErrorFormulario('Esta celda ya está ocupada.');
            setBloqueArrastrado(null);
            return;
          } else {
            // Si newKey ya está ocupada por la MISMA actividad, la reemplazamos:
            // borramos la celda original y la nueva, luego agregamos la nueva
            nuevas.delete(bloqueArrastrado.celdaKey);
            if (nuevas.has(newKey)) {
              nuevas.delete(newKey);
            }
            nuevas.add(newKey);
            setErrorFormulario('');
          }
        } else {
          // If dropping outside schedule (no diaIndex/horaIndex), remove it!
          nuevas.delete(bloqueArrastrado.celdaKey);
          setErrorFormulario('');
        }
      }
    }

    const horarios = Array.from(nuevas).map((k) => {
      const [d, h] = k.split('-').map(Number);
      return {
        dia: DIAS[d],
        diaIndex: d,
        inicio: horas[h].inicio,
        fin: horas[h].fin
      };
    });

    setCeldasSeleccionadas(nuevas);
    setFormData({
      ...formData,
      horarios_actividad: horarios,
      dias_semana: Array.from(new Set(horarios.map((horario) => horario.dia))),
      // Keep original horas_semanales from the selected activity
      horas_semanales: actividadSeleccionada?.horas_semanales || actividadSeleccionada?.horas_asignadas || formData.horas_semanales
    });

    setBloqueArrastrado(null);
  };

  const handleCeldaClick = (diaIndex: number, horaIndex: number) => {
    const key = `${diaIndex}-${horaIndex}`;
    const nuevas = new Set(celdasSeleccionadas);
    
    if (nuevas.has(key)) {
      nuevas.delete(key);
    } else {
      const celdaInfo = getCeldaInfo(diaIndex, horaIndex);
      // Solo bloqueamos si está ocupada POR OTRA ACTIVIDAD o POR HORARIO LECTIVO
      if (celdaInfo.ocupado && !celdasSeleccionadas.has(key)) {
        setErrorFormulario('Esta celda ya está ocupada.');
        return;
      }
      
      // Verificar límite de bloques
      const duracionBloque = config ? config.duracion_bloque / 60 : 1.5;
      const horasActividad = actividadSeleccionada?.horas_semanales || actividadSeleccionada?.horas_asignadas || 0;
      const numBloques = Math.ceil(horasActividad / duracionBloque);
      const bloquesAgregados = nuevas.size;
      
      if (bloquesAgregados >= numBloques) {
        setErrorFormulario('No puedes agregar más bloques de los permitidos.');
        return;
      }
      
      nuevas.add(key);
    }

    const horarios = Array.from(nuevas).map((k) => {
      const [d, h] = k.split('-').map(Number);
      return {
        dia: DIAS[d],
        diaIndex: d,
        inicio: horas[h].inicio,
        fin: horas[h].fin
      };
    });

    setCeldasSeleccionadas(nuevas);
    setErrorFormulario('');
    setFormData({
      ...formData,
      horarios_actividad: horarios,
      dias_semana: Array.from(new Set(horarios.map((horario) => horario.dia))),
      // Keep original horas_semanales from the selected activity
      horas_semanales: actividadSeleccionada?.horas_semanales || actividadSeleccionada?.horas_asignadas || formData.horas_semanales
    });
  };

  const handleGuardar = async () => {
    if (!actividadSeleccionada) {
      setErrorFormulario('Debes seleccionar una actividad.');
      return;
    }
    try {
      const res = await fetch(`/api/actividad-no-lectiva/${actividadSeleccionada.id_actividad}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onActualizar('Horario actualizado correctamente');
        fetchActividadesNoLectivas();
        handleCancelar();
      } else {
        const data = await res.json();
        setErrorFormulario(data.error || 'Error al guardar');
      }
    } catch (error) {
      setErrorFormulario('Error al conectar con el servidor');
    }
  };

  if (!abierto) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios - Actividades No Lectivas</h2>
          <button onClick={handleCancelar} className="text-gray-500 hover:text-gray-700 text-3xl">
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Actividades y Bloques */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Actividades Disponibles</h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {actividadesNoLectivas
                  .filter(a => Number(a.id_carga) === Number(idCargaAcademica))
                  .map((act) => {
                    const duracionBloque = config ? config.duracion_bloque / 60 : 1.5;
                    const horasActividad = act.horas_semanales || act.horas_asignadas || 0;
                    const numBloques = Math.ceil(horasActividad / duracionBloque);
                    // Si la actividad está seleccionada, usamos celdasSeleccionadas para calcular bloquesAgregados
                    const bloquesAgregados = (actividadSeleccionada?.id_actividad === act.id_actividad) 
                      ? celdasSeleccionadas.size 
                      : (act.horarios_actividad ? act.horarios_actividad.length : 0);
                    const bloquesDisponibles = numBloques - bloquesAgregados;
                    
                    return (
                      <div key={act.id_actividad} className="space-y-2">
                        <div
                          onClick={() => setActividadSeleccionada(act)}
                          className={`p-3 border rounded-t-lg cursor-pointer transition-all ${
                            actividadSeleccionada?.id_actividad === act.id_actividad
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                          }`}
                        >
                          <h4 className="font-semibold text-gray-800">{obtenerEtiquetaActividadNoLectiva(act.tipo_actividad)}</h4>
                          <p className="text-sm text-gray-600">{act.nombre}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Total: {horasActividad}h | Agregados: {bloquesAgregados * duracionBloque}h
                          </p>
                        </div>
                        
                        {/* Bloques para agregar */}
                        {actividadSeleccionada?.id_actividad === act.id_actividad && bloquesDisponibles > 0 && (
                          <div className="grid grid-cols-2 gap-2 px-2">
                            {Array.from({length: bloquesDisponibles}).map((_, idx) => (
                              <div
                                key={`${act.id_actividad}-agregar-${idx}`}
                                draggable
                                onDragStart={(e) => {
                                  setActividadSeleccionada(act);
                                  setBloqueArrastrado({ tipo: 'agregar', actividad: act, index: idx });
                                }}
                                className="p-2 bg-green-50 border border-green-300 rounded text-center text-xs font-semibold text-green-800 cursor-grab"
                              >
                                + Bloque {idx + 1}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Bloques para quitar */}
                        {actividadSeleccionada?.id_actividad === act.id_actividad && celdasSeleccionadas.size > 0 && (
                          <div className="grid grid-cols-2 gap-2 px-2">
                            {Array.from(celdasSeleccionadas).map((key, idx) => {
                              const [diaIndexStr, horaIndexStr] = key.split('-');
                              const diaIndex = Number(diaIndexStr);
                              const horaIndex = Number(horaIndexStr);
                              const horario = {
                                dia: DIAS[diaIndex],
                                inicio: horas[horaIndex]?.inicio || '',
                                fin: horas[horaIndex]?.fin || ''
                              };
                              return (
                                <div
                                  key={`${act.id_actividad}-remover-${idx}`}
                                  draggable
                                  onDragStart={(e) => {
                                    setActividadSeleccionada(act);
                                    setBloqueArrastrado({ tipo: 'remover', actividad: act, celdaKey: key });
                                  }}
                                  className="p-2 bg-yellow-50 border border-yellow-300 rounded text-center text-xs font-semibold text-yellow-800 cursor-grab"
                                >
                                  - {horario.dia} {horario.inicio}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Bloques para quitar (cuando actividad no está seleccionada, usamos datos originales) */}
                        {actividadSeleccionada?.id_actividad !== act.id_actividad && act.horarios_actividad && act.horarios_actividad.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 px-2">
                            {act.horarios_actividad.map((horario: any, idx: number) => {
                              const diaIndex = DIAS.indexOf(horario.dia);
                              const horaIndex = horas.findIndex((h) => h.inicio === horario.inicio);
                              const key = `${diaIndex}-${horaIndex}`;
                              return (
                                <div
                                  key={`${act.id_actividad}-remover-${idx}`}
                                  draggable
                                  onDragStart={(e) => {
                                    setActividadSeleccionada(act);
                                    setBloqueArrastrado({ tipo: 'remover', actividad: act, celdaKey: key });
                                  }}
                                  className="p-2 bg-yellow-50 border border-yellow-300 rounded text-center text-xs font-semibold text-yellow-800 cursor-grab"
                                >
                                  - {horario.dia} {horario.inicio}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Gestión de Horarios */}
            <div className="lg:col-span-2">
              {actividadSeleccionada ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">
                      {obtenerEtiquetaActividadNoLectiva(actividadSeleccionada.tipo_actividad)}: {actividadSeleccionada.nombre}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">
                      Horario <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="bg-gray-50 p-3 rounded-lg overflow-x-auto"
                      onDragOver={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <table className="w-full border-collapse min-w-max">
                        <thead>
                          <tr>
                            <th className="border p-1 bg-gray-100 text-xs">Hora</th>
                            {DIAS.map((dia) => (
                              <th key={dia} className="border p-1 bg-gray-100 text-xs min-w-[90px]">
                                {dia}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {horas.map((hora, horaIndex) => (
                            <tr key={horaIndex}>
                              <td className="border p-1 text-[10px] font-medium bg-gray-50">
                                {hora.inicio}
                                <br />
                                {hora.fin}
                              </td>
                              {DIAS.map((_dia, diaIndex) => {
                                const key = `${diaIndex}-${horaIndex}`;
                                const esSeleccionada = celdasSeleccionadas.has(key);
                                const celdaInfo = getCeldaInfo(diaIndex, horaIndex);
                                const esOcupado = celdaInfo.ocupado;

                                return (
                                  <td
                                    key={key}
                                    onClick={() => !esOcupado && !esSeleccionada && handleCeldaClick(diaIndex, horaIndex)}
                                    onDragOver={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                    }}
                                    onDrop={(e) => {
                                      e.stopPropagation();
                                      handleDrop(e, diaIndex, horaIndex);
                                    }}
                                    draggable={esSeleccionada}
                                    onDragStart={(e) => {
                                      if (esSeleccionada) {
                                        e.stopPropagation();
                                        setBloqueArrastrado({ 
                                          tipo: 'remover', 
                                          actividad: actividadSeleccionada, 
                                          celdaKey: key 
                                        });
                                      }
                                    }}
                                    className={`border p-1 transition-all h-10 text-center ${
                                      esOcupado
                                        ? 'bg-red-100 cursor-not-allowed'
                                        : esSeleccionada
                                        ? 'bg-emerald-100 border-emerald-400 cursor-grab'
                                        : 'bg-white hover:bg-emerald-50 cursor-pointer'
                                    }`}
                                  >
                                    {esOcupado ? (
                                      <div className="text-[10px]">
                                        <div className="font-bold text-red-800">{celdaInfo.actividad}</div>
                                      </div>
                                    ) : esSeleccionada && actividadSeleccionada ? (
                                      <div className="text-[10px]">
                                        <div className="font-bold text-emerald-800">
                                          {obtenerEtiquetaActividadNoLectiva(actividadSeleccionada.tipo_actividad)}
                                        </div>
                                        <div className="text-emerald-700 truncate">{actividadSeleccionada.nombre}</div>
                                      </div>
                                    ) : null}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Haz clic en las celdas para seleccionar los horarios o arrastra una actividad.
                      <br />
                      Arrastra un horario seleccionado para moverlo o suéltalo fuera de la tabla para quitarlo.
                      <br />
                      Horas semanales: <span className="font-bold">{formData.horas_semanales}</span> horas
                    </p>
                    {errorFormulario && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errorFormulario}</p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleGuardar}
                      className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Guardar Horarios
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="flex-1 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
                  <p className="text-lg">Selecciona una actividad de la lista para gestionar sus horarios</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
