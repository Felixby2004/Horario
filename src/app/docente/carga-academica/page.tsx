'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Boton } from '@/components/ui/Boton'
import { DocumentoCargaAcademica, DocumentoDeclaracionJurada } from '@/components/DocumentGenerator'
import html2pdf from 'html2pdf.js';

const TIPOS_ACTIVIDAD = [
  { valor: 'tutoria_consejeria', label: 'Tutoria / Consejería' },
  { valor: 'investigacion', label: 'Investigación' },
  { valor: 'responsabilidad_social', label: 'Responsabilidad Social' },
  { valor: 'gestion_gobierno', label: 'Gestión y Gobierno' },
  { valor: 'asesoria_tesis_jurado', label: 'Asesoría de Tesis / Jurado' },
  { valor: 'perfeccionamiento', label: 'Perfeccionamiento' }
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
    maxHoras: 2,
    campos: [
      { id: 'titulo_programa', label: 'Título del Programa', tipo: 'text', requerido: true },
      { id: 'institucion', label: 'Institución', tipo: 'text', requerido: true },
      { id: 'numero_horas_total', label: 'Número de Horas Total', tipo: 'number', requerido: false }
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
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<any>(null);
  const [mostrarDocumento, setMostrarDocumento] = useState<'carga' | 'declaracion' | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string>('')
  const documentRef = useRef<HTMLDivElement>(null)

  const handleDescargarPDF = () => {
    const element = documentRef.current
    if (!element) return

    const nombreDocente = usuario
      ? `${usuario.apellidos}_${usuario.nombres}`
      : 'documento'

    const nombreArchivo = mostrarDocumento === 'carga'
      ? `Formato_1_Carga_Academica_${nombreDocente}.pdf`
      : `Formato_2_Declaracion_Jurada_${nombreDocente}.pdf`

    const opt: any = {
      margin: [10, 10, 10, 10],
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  };

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

    setUsuario(user);
    cargarDatos(user.id_docente);
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
      const resCarga = await fetch(`/api/carga-academica?docenteId=${idDocente}&periodoId=${idPeriodo}`);

      const dataCarga = await resCarga.json();
      if (dataCarga.exito && dataCarga.datos.length > 0) {
        const cargaData = dataCarga.datos[0];
        setCarga(cargaData);
        setActividades(cargaData.actividades_no_lectivas || []);
      } else {
        // Si no hay carga, creamos una nueva
        await crearCargaAcademica(idDocente, idPeriodo);
      }
    } catch (error) {
      console.error('Error cargando carga y actividades:', error);
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
      if (data.exito) {
        setCarga(data.datos);
      }
    } catch (error) {
      console.error('Error creando carga académica:', error);
    }
  };

  const handleCalcular = async () => {
    if (!usuario) return;
    try {
      const response = await fetch('/api/carga-academica/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_docente: usuario.id_docente,
          id_periodo: parseInt(periodoSeleccionado)
        })
      });
      const data = await response.json();
      if (data.exito) {
        await cargarCargaYActividades(usuario.id_docente, parseInt(periodoSeleccionado));
      }
    } catch (error) {
      console.error('Error calculando carga:', error);
    }
  };

  const handleEnviar = async () => {
    if (!carga) return;
    try {
      // Validar que todas las actividades estén en categorías permitidas
      const categoriasPermitidas = [
        'tutoria_consejeria', 
        'investigacion', 
        'responsabilidad_social', 
        'gestion_gobierno', 
        'asesoria_tesis_jurado', 
        'perfeccionamiento'
      ];
      
      const tieneActividadInvalida = actividades.some(
        (act: any) => !categoriasPermitidas.includes(act.tipo_actividad)
      );
      
      if (tieneActividadInvalida) {
        alert('Error: Todas las actividades deben estar en una categoría permitida.');
        return;
      }

      const response = await fetch(`/api/carga-academica/${carga.id_carga}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'enviado',
          fecha_envio: new Date(),
          usuario_id: usuario.id
        })
      });
      const data = await response.json();
      if (data.exito) {
        setMensajeExito('Carga académica enviada exitosamente!');
        await cargarCargaYActividades(usuario.id_docente, parseInt(periodoSeleccionado));
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

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Mensaje de éxito */}
        {mensajeExito && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <p className="text-green-800 font-medium">{mensajeExito}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Carga Académica</h1>
          <p className="text-gray-600 mt-1">Gestiona tus horas lectivas y no lectivas</p>
        </div>

        {/* Selector de Periodo */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <label className="block text-sm font-medium mb-2">Periodo</label>
              <select
                value={periodoSeleccionado}
                onChange={(e) => {
                  setPeriodoSeleccionado(e.target.value);
                  cargarCargaYActividades(usuario.id_docente, parseInt(e.target.value));
                }}
                className="border rounded px-3 py-2 min-w-[200px]"
              >
                {periodos.map((p: any) => (
                  <option key={p.id_periodo} value={p.id_periodo}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Boton variante="secondary" onClick={handleCalcular}>
                🧮 Recalcular
              </Boton>
              {carga && ['borrador', 'observado'].includes(carga.estado) && (
                <Boton onClick={handleEnviar}>
                  📤 Enviar para Revisión
                </Boton>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de Carga */}
        {carga && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-blue-600 text-sm font-medium">Horas Lectivas</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{carga.horas_lectivas} h</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-purple-600 text-sm font-medium">Preparación y Evaluación</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{carga.horas_preparacion} h</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <p className="text-green-600 text-sm font-medium">Horas No Lectivas</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{carga.horas_no_lectivas} h</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {carga.horas_totales} h
              </p>
            </div>
          </div>
        )}

        {/* Estado de la Carga */}
        {carga && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado de la Carga Académica</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  carga.estado === 'aprobado' || carga.estado === 'publicado' ? 'bg-green-100 text-green-800' :
                  carga.estado === 'observado' ? 'bg-orange-100 text-orange-800' :
                  carga.estado === 'en_revision' || carga.estado === 'validado' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
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

              {/* Sección de Documentos Generados */}
              {(carga.estado === 'aprobado' || carga.estado === 'publicado') && (
                <div className="p-4 border rounded bg-green-50">
                  <p className="text-sm font-medium text-green-900 mb-3">Documentos Generados</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setMostrarDocumento('carga')}
                      className="flex items-center gap-3 p-3 border border-green-200 bg-white rounded hover:bg-green-50 transition"
                    >
                      <div className="text-green-600 text-2xl">📄</div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Formato N°1</p>
                        <p className="text-xs text-gray-600">Declaración de Carga Horaria Asignada</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setMostrarDocumento('declaracion')}
                      className="flex items-center gap-3 p-3 border border-green-200 bg-white rounded hover:bg-green-50 transition"
                    >
                      <div className="text-green-600 text-2xl">📜</div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Declaración Jurada</p>
                        <p className="text-xs text-gray-600">Declaración Jurada de No Estar Incluso en Causales</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actividades No Lectivas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Actividades No Lectivas</h2>
            {carga && ['borrador', 'observado'].includes(carga.estado) && (
              <Boton onClick={handleNuevaActividad}>➕ Nueva Actividad</Boton>
            )}
          </div>

          {actividades.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                No hay actividades no lectivas registradas.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {actividades.map((actividad: any) => (
                <div key={actividad.id_actividad} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {TIPOS_ACTIVIDAD.find(t => t.valor === actividad.tipo_actividad)?.label || actividad.tipo_actividad}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <strong>Horas Semanales:</strong> {actividad.horas_semanales} h
                      </p>
                      {actividad.nombre && (
                        <p className="text-gray-600 mt-1">
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
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarActividad(actividad.id_actividad)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nueva/Editar Actividad */}
      {modalAbierto && (
        <ModalActividadNoLectiva
          abierto={modalAbierto}
          alCerrar={() => setModalAbierto(false)}
          actividad={actividadSeleccionada}
          idCargaAcademica={carga?.id_carga}
          periodo={periodos.find(p => p.id_periodo === parseInt(periodoSeleccionado))}
          periodos={periodos}
          onActualizar={async (mensaje: string) => {
            setModalAbierto(false);
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
                  : 'Declaración Jurada'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDescargarPDF}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Descargar PDF
                </button>
                <button
                  onClick={() => setMostrarDocumento(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
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
                  horarios={carga.docente?.horarios || []}
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
  periodo,
  periodos,
  onActualizar
}: {
  abierto: boolean;
  alCerrar: () => void;
  actividad: any;
  idCargaAcademica?: number;
  periodo?: any;
  periodos?: any[];
  onActualizar: (mensaje: string) => void;
}) {
  const [formData, setFormData] = useState<any>({
    tipo_actividad: 'tutoria_consejeria',
    nombre: '',
    descripcion: '',
    horas_semanales: 0,
    dias_semana: [],
    datos_adicionales: {},
    datos_sustento: {}
  });

  useEffect(() => {
    if (actividad) {
      setFormData({
        tipo_actividad: actividad.tipo_actividad,
        nombre: actividad.nombre,
        descripcion: actividad.descripcion || '',
        horas_semanales: actividad.horas_semanales || 0,
        dias_semana: actividad.dias_semana || [],
        datos_adicionales: actividad.datos_adicionales || {},
        datos_sustento: actividad.datos_sustento || {}
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
          // Preseleccionamos el ciclo 1 por defecto
          ciclo_academico: '1'
        }
      });
    }
  }, [actividad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCargaAcademica) return;

    try {
      const url = actividad
        ? `/api/actividad-no-lectiva/${actividad.id_actividad}`
        : `/api/actividad-no-lectiva`;
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
          datos_sustento: Object.keys(formData.datos_sustento).length > 0 ? formData.datos_sustento : null
        })
      });

      const data = await response.json();
      if (data.exito) {
        onActualizar(data.mensaje || (actividad ? 'Actividad actualizada exitosamente!' : 'Actividad creada exitosamente!'));
      }
    } catch (error) {
      console.error('Error guardando actividad:', error);
    }
  };

  const currentConfig = CONFIG_ACTIVIDAD[formData.tipo_actividad as keyof typeof CONFIG_ACTIVIDAD];

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {actividad ? 'Editar Actividad No Lectiva' : 'Nueva Actividad No Lectiva'}
          </h2>
          <button
            onClick={alCerrar}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Tipo de Actividad */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Actividad</label>
            <select
              value={formData.tipo_actividad}
              onChange={(e) => setFormData({
                ...formData,
                tipo_actividad: e.target.value,
                datos_sustento: {}
              })}
              className="w-full border rounded px-3 py-2"
            >
              {TIPOS_ACTIVIDAD.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campos específicos del tipo de actividad */}
          {currentConfig.campos.map((campo) => (
            <div key={campo.id}>
              <label className="block text-sm font-medium mb-2">
                {campo.label} {campo.requerido && <span className="text-red-500">*</span>}
              </label>
              {campo.id === 'ciclo_academico' ? (
                // Select con los ciclos (1,3,5,7,9) del período
                <select
                  value={formData.datos_sustento[campo.id] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    datos_sustento: {
                      ...formData.datos_sustento,
                      [campo.id]: e.target.value
                    }
                  })}
                  className="w-full border rounded px-3 py-2"
                  required={campo.requerido}
                >
                  <option value="">Selecciona un ciclo</option>
                  {[1, 3, 5, 7, 9].map((ciclo) => (
                    <option key={ciclo} value={ciclo}>
                      Ciclo {ciclo}
                    </option>
                  ))}
                </select>
              ) : campo.tipo === 'textarea' ? (
                <textarea
                  value={formData.datos_sustento[campo.id] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    datos_sustento: {
                      ...formData.datos_sustento,
                      [campo.id]: e.target.value
                    }
                  })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  required={campo.requerido}
                />
              ) : (
                <input
                  type={campo.tipo}
                  value={formData.datos_sustento[campo.id] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    datos_sustento: {
                      ...formData.datos_sustento,
                      [campo.id]: campo.tipo === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                    }
                  })}
                  className="w-full border rounded px-3 py-2"
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
              onChange={(e) => setFormData({
                ...formData,
                nombre: e.target.value
              })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Horas Semanales */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Horas Semanales (Máximo: {currentConfig.maxHoras})
            </label>
            <input
              type="number"
              value={formData.horas_semanales}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setFormData({
                  ...formData,
                  horas_semanales: Math.min(val, currentConfig.maxHoras)
                });
              }}
              className="w-full border rounded px-3 py-2"
              min="0"
              max={currentConfig.maxHoras}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo permitido: {currentConfig.maxHoras} horas por semana
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({
                ...formData,
                descripcion: e.target.value
              })}
              className="w-full border rounded px-3 py-2"
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
            <Boton type="submit">
              {actividad ? 'Guardar Cambios' : 'Crear Actividad'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
