'use client'

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from 'react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Boton } from '@/components/ui/Boton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSearch, faCheck, faTimes, faFileAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { DocumentoCargaAcademica, DocumentoDeclaracionJurada, DocumentoHorarioSemanal } from '@/components/DocumentGenerator'

const TIPOS_ACTIVIDAD = [
  { valor: 'tutoria_consejeria', label: 'Tutoría / Consejería' },
  { valor: 'investigacion', label: 'Investigación' },
  { valor: 'responsabilidad_social', label: 'Responsabilidad Social' },
  { valor: 'gestion_gobierno', label: 'Gestión y Gobierno' },
  { valor: 'asesoria_tesis_jurado', label: 'Asesoría de Tesis / Jurado' },
  { valor: 'perfeccionamiento', label: 'Perfeccionamiento' },
  { valor: 'preparacion_evaluacion', label: 'Preparación y Evaluación' }
]

// Validación checks
interface ValidationCheck {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'warning' | 'fail';
  message: string;
}

export default function CargaAcademicaAdminPage() {
  const [cargas, setCargas] = useState<any[]>([])
  const [periodos, setPeriodos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [modalRechazoAbierto, setModalRechazoAbierto] = useState(false)
  const [cargaSeleccionada, setCargaSeleccionada] = useState<any>(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false)
  const [modalValidacionAbierto, setModalValidacionAbierto] = useState(false)
  const [mostrarDocumento, setMostrarDocumento] = useState<'carga' | 'declaracion' | 'horario' | null>(null)
  const [validations, setValidations] = useState<ValidationCheck[]>([])
  const documentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarCargasAcademicas()
  }, [periodoSeleccionado])

  const cargarDatos = async () => {
    try {
      const [resPeriodos] = await Promise.all([
        fetch('/api/periodos')
      ])
      const dataPeriodos = await resPeriodos.json()
      if (dataPeriodos.exito) {
        setPeriodos(dataPeriodos.datos)
        if (dataPeriodos.datos.length > 0) {
          setPeriodoSeleccionado(String(dataPeriodos.datos[0].id_periodo))
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setCargando(false)
    }
  }

  const cargarCargasAcademicas = async () => {
    if (!periodoSeleccionado) return

    try {
      const response = await fetch(`/api/carga-academica?periodoId=${periodoSeleccionado}`)
      const data = await response.json()
      if (data.exito) {
        const cargasFiltradas = data.datos.filter((c: any) => c.estado !== 'borrador')
        setCargas(cargasFiltradas)
      }
    } catch (error) {
      console.error('Error cargando cargas académicas:', error)
    }
  }

  const handleCambiarEstado = async (
    cargaId: number,
    nuevoEstado: string,
    observaciones?: string
  ) => {
    try {
      const response = await fetch(`/api/carga-academica/${cargaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          usuario_id: 1,
          fecha_aprobacion: nuevoEstado === 'aprobado' ? new Date() : undefined,
          observaciones_generales: observaciones
        })
      })

      const data = await response.json()
      if (data.exito) {
        await cargarCargasAcademicas()
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
    }
  }

  const handleRechazar = async () => {
    if (!cargaSeleccionada || !motivoRechazo) return
    await handleCambiarEstado(
      cargaSeleccionada.id_carga,
      'observado',
      motivoRechazo
    )
    setModalRechazoAbierto(false)
    setMotivoRechazo('')
    setCargaSeleccionada(null)
  }

  const runValidations = (carga: any) => {
    const checks: ValidationCheck[] = [
      {
        id: 'horas-totales',
        name: 'Verificación de horas totales',
        status: carga.horas_totales >= carga.horas_meta ? 'pass' : 'warning',
        message: carga.horas_totales >= carga.horas_meta 
          ? `Horas totales (${carga.horas_totales}) cumplen con la meta (${carga.horas_meta})`
          : `Horas totales (${carga.horas_totales}) no alcanzan la meta (${carga.horas_meta})`
      },
      {
        id: 'horas-lectivas',
        name: 'Verificación de horas lectivas',
        status: carga.horas_lectivas > 0 ? 'pass' : 'fail',
        message: carga.horas_lectivas > 0 
          ? `Horas lectivas registradas: ${carga.horas_lectivas}`
          : 'No hay horas lectivas registradas'
      },
      {
        id: 'documentos-completos',
        name: 'Documentos completos',
        status: carga.estado === 'aprobado' || carga.estado === 'publicado' ? 'pass' : 'pending',
        message: 'Documentos pendientes de validación'
      },
      {
        id: 'actividades-no-lectivas',
        name: 'Actividades no lectivas',
        status: (carga.actividades_no_lectivas?.length || 0) > 0 ? 'pass' : 'warning',
        message: (carga.actividades_no_lectivas?.length || 0) > 0 
          ? `${carga.actividades_no_lectivas.length} actividades no lectivas registradas`
          : 'No hay actividades no lectivas registradas'
      },
      {
        id: 'preparacion-evaluacion',
        name: 'Horas de preparación y evaluación',
        status: carga.horas_preparacion > 0 ? 'pass' : 'warning',
        message: carga.horas_preparacion > 0 
          ? `Horas de preparación y evaluación: ${carga.horas_preparacion}`
          : 'No hay horas de preparación y evaluación registradas'
      }
    ];
    setValidations(checks);
  };

  const getEstadoColor = (estado: string) => {
    const colores = {
      borrador: 'bg-gray-100 text-gray-800',
      enviado: 'bg-blue-100 text-blue-800',
      en_revision: 'bg-yellow-100 text-yellow-800',
      observado: 'bg-orange-100 text-orange-800',
      validado: 'bg-purple-100 text-purple-800',
      aprobado: 'bg-green-100 text-green-800',
      publicado: 'bg-emerald-100 text-emerald-800',
      cancelado: 'bg-red-100 text-red-800'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoTexto = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, ' ')
  }

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '⏳';
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'pass': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'fail': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleDescargarPDF = async () => {
    const element = documentRef.current
    if (!element) return

    try {
      // Importación dinámica para evitar errores de SSR/Prerendering
      const html2pdf = (await import('html2pdf.js')).default;

      const nombreDocente = cargaSeleccionada?.docente 
        ? `${cargaSeleccionada.docente.apellidos}_${cargaSeleccionada.docente.nombres}`
        : 'documento'
      
      let nombreArchivo = 'documento.pdf'
      if (mostrarDocumento === 'carga') {
        nombreArchivo = `Formato_1_Carga_Academica_${nombreDocente}.pdf`
      } else if (mostrarDocumento === 'declaracion') {
        nombreArchivo = `Formato_2_Declaracion_Jurada_${nombreDocente}.pdf`
      } else if (mostrarDocumento === 'horario') {
        nombreArchivo = `Formato_F03_Horario_Semanal_${nombreDocente}.pdf`
      }

      const opt: any = {
        margin: [10, 10, 10, 10],
        filename: nombreArchivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente de nuevo.');
    }
  }

  const columnas = [
    {
      campo: 'docente',
      encabezado: 'Docente',
      renderizar: (_: any, fila: any) =>
        fila.docente ? `${fila.docente.apellidos}, ${fila.docente.nombres}` : '-'
    },
    { campo: 'horas_lectivas', encabezado: 'Lectivas' },
    { campo: 'horas_preparacion', encabezado: 'P&E' },
    { campo: 'horas_no_lectivas', encabezado: 'No Lectivas' },
    { campo: 'horas_totales', encabezado: 'Totales' },
    { campo: 'horas_meta', encabezado: 'Meta' },
    {
      campo: 'estado',
      encabezado: 'Estado',
      renderizar: (valor: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(valor)}`}>
          {getEstadoTexto(valor)}
        </span>
      )
    },
    {
      campo: 'id_carga',
      encabezado: 'Acciones',
      renderizar: (_: any, fila: any) => (
        <div className="flex gap-1.5 flex-wrap items-center">
          <button
            onClick={() => {
              setCargaSeleccionada(fila)
              setModalDetallesAbierto(true)
            }}
            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors flex items-center"
            title="Ver"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-2" />
            Ver
          </button>

          {fila.estado === 'enviado' && (
            <button
              onClick={() =>
                handleCambiarEstado(fila.id_carga, 'en_revision')
              }
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4 mr-2" />
              Revisar
            </button>
          )}

          {fila.estado === 'en_revision' && (
            <>
              <button
                onClick={() => {
                  setCargaSeleccionada(fila);
                  runValidations(fila);
                  setModalValidacionAbierto(true);
                }}
                className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors flex items-center"
                title="Validar documentos"
              >
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                Validar Docs
              </button>
              <button
                onClick={() => {
                  setCargaSeleccionada(fila)
                  setModalRechazoAbierto(true)
                }}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center"
                title="Rechazar"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                Rechazar
              </button>
            </>
          )}

          {fila.estado === 'validado' && (
              <button
                onClick={() =>
                  handleCambiarEstado(fila.id_carga, 'aprobado')
                }
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                Aprobar
              </button>
          )}

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setCargaSeleccionada(fila)
                setMostrarDocumento('carga')
              }}
              className="px-2 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors flex items-center"
              title="Formato 1 - Carga Académica"
            >
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-2" />
              Carga
            </button>
            <button
              onClick={() => {
                setCargaSeleccionada(fila)
                setMostrarDocumento('declaracion')
              }}
              className="px-2 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600 transition-colors flex items-center"
              title="Formato 2 - Declaración Jurada"
            >
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-2" />
              Declaración
            </button>
            <button
              onClick={() => {
                setCargaSeleccionada(fila)
                setMostrarDocumento('horario')
              }}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center"
              title="Formato F03 - Horario Semanal"
            >
              <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" />
              Horario
            </button>
          </div>
        </div>
      )
    }
  ]

  const textoBusqueda = busqueda.trim().toLowerCase()
  const cargasFiltradas = cargas.filter((c: any) => {
    if (!textoBusqueda) return true
    const nombreDocente = c.docente
      ? `${c.docente.apellidos} ${c.docente.nombres}`.toLowerCase()
      : ''
    return nombreDocente.includes(textoBusqueda)
  })

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de carga académica</h1>
          <p className="text-gray-600 mt-1">Revisa y valida las cargas académicas y documentos de los docentes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Periodo</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {periodos.map((p: any) => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Buscar docente</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Busca por nombre del docente..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TablaPaginada
          datos={cargasFiltradas}
          columnas={columnas}
          keyField="id_carga"
        />
      </div>

      {/* Modal Validación de Documentos */}
      {modalValidacionAbierto && cargaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-purple-600">
                ✅ Validación de Documentos - {cargaSeleccionada.docente?.apellidos}, {cargaSeleccionada.docente?.nombres}
              </h2>
              <button
                onClick={() => {
                  setModalValidacionAbierto(false)
                  setCargaSeleccionada(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Checklist de Validación */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Checklist de Validación</h3>
                <div className="space-y-3">
                  {validations.map((check) => (
                    <div key={check.id} className={`p-4 border rounded-lg ${getValidationColor(check.status)}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getValidationIcon(check.status)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{check.name}</h4>
                          <p className="text-sm text-gray-600">{check.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentos para Verificar */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Documentos a Verificar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setModalValidacionAbierto(false)
                      setMostrarDocumento('carga')
                    }}
                    className="p-6 border-2 border-dashed border-emerald-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <div className="text-4xl mb-2">📄</div>
                    <h4 className="font-semibold">Formato 1</h4>
                    <p className="text-sm text-gray-500">Carga Horaria Asignada</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setModalValidacionAbierto(false)
                      setMostrarDocumento('declaracion')
                    }}
                    className="p-6 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
                  >
                    <div className="text-4xl mb-2">📜</div>
                    <h4 className="font-semibold">Formato 2</h4>
                    <p className="text-sm text-gray-500">Declaración Jurada</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setModalValidacionAbierto(false)
                      setMostrarDocumento('horario')
                    }}
                    className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-4xl mb-2">📅</div>
                    <h4 className="font-semibold">Formato F03</h4>
                    <p className="text-sm text-gray-500">Horario Semanal</p>
                  </button>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setModalValidacionAbierto(false)
                    setCargaSeleccionada(null)
                  }}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleCambiarEstado(cargaSeleccionada.id_carga, 'validado')
                    setModalValidacionAbierto(false)
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  ✓ Marcar como Validado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazo */}
      {modalRechazoAbierto && cargaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-red-600">Rechazar Carga Académica</h2>
              <button
                onClick={() => {
                  setModalRechazoAbierto(false)
                  setMotivoRechazo('')
                  setCargaSeleccionada(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Docente: {cargaSeleccionada.docente?.apellidos}, {cargaSeleccionada.docente?.nombres}
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Motivo del Rechazo *
                </label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  required
                  placeholder="Especifica los motivos del rechazo (ej: documentos incompletos, datos incorrectos, etc.)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 p-6">
              <button
                onClick={() => {
                  setModalRechazoAbierto(false)
                  setMotivoRechazo('')
                  setCargaSeleccionada(null)
                }}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <Boton onClick={handleRechazar} className="bg-red-600 hover:bg-red-700">
                Confirmar Rechazo
              </Boton>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {modalDetallesAbierto && cargaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Detalles de la Carga Académica</h2>
              <button
                onClick={() => {
                  setModalDetallesAbierto(false)
                  setCargaSeleccionada(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <p className="text-sm text-gray-600">Docente</p>
                  <p className="font-semibold">
                    {cargaSeleccionada.docente?.apellidos}, {cargaSeleccionada.docente?.nombres}
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-gray-600">Periodo</p>
                  <p className="font-semibold">{cargaSeleccionada.periodo?.nombre}</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-semibold">
                    {getEstadoTexto(cargaSeleccionada.estado)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div className="p-4 border rounded bg-blue-50">
                  <p className="text-xs text-gray-600">Horas Lectivas</p>
                  <p className="text-xl font-bold text-blue-700">
                    {cargaSeleccionada.horas_lectivas}
                  </p>
                </div>
                <div className="p-4 border rounded bg-purple-50">
                  <p className="text-xs text-gray-600">Preparación y Evaluación</p>
                  <p className="text-xl font-bold text-purple-700">
                    {cargaSeleccionada.horas_preparacion}
                  </p>
                </div>
                <div className="p-4 border rounded bg-green-50">
                  <p className="text-xs text-gray-600">Horas No Lectivas</p>
                  <p className="text-xl font-bold text-green-700">
                    {cargaSeleccionada.horas_no_lectivas}
                  </p>
                </div>
                <div className="p-4 border rounded bg-yellow-50">
                  <p className="text-xs text-gray-600">Horas Totales</p>
                  <p className="text-xl font-bold text-yellow-700">
                    {cargaSeleccionada.horas_totales}
                  </p>
                </div>
                <div className="p-4 border rounded bg-orange-50">
                  <p className="text-xs text-gray-600">Meta</p>
                  <p className="text-xl font-bold text-orange-700">
                    {cargaSeleccionada.horas_meta}
                  </p>
                </div>
              </div>

              {cargaSeleccionada.observaciones_generales && (
                <div className="p-4 border rounded bg-orange-50">
                  <p className="text-sm font-medium text-orange-900">Observaciones</p>
                  <p className="text-sm text-orange-800">
                    {cargaSeleccionada.observaciones_generales}
                  </p>
                </div>
              )}

              {cargaSeleccionada.actividades_no_lectivas && cargaSeleccionada.actividades_no_lectivas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Actividades No Lectivas</h3>
                  <div className="space-y-3">
                    {cargaSeleccionada.actividades_no_lectivas.map((actividad: any, index: number) => (
                      <div key={index} className="p-4 border rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {TIPOS_ACTIVIDAD.find((t) => t.valor === actividad.tipo_actividad)
                                ?.label || actividad.tipo_actividad}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Horas: {actividad.horas_asignadas || actividad.horas_semanales || 0}
                            </p>

                            {actividad.datos_sustento &&
                              Object.keys(actividad.datos_sustento).length > 0 && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                  {Object.entries(actividad.datos_sustento).map(
                                    ([key, value]: [string, any]) => (
                                      <p key={key}>
                                        <strong>
                                          {key
                                            .replace(/_/g, ' ')
                                            .charAt(0)
                                            .toUpperCase() + key.replace(/_/g, ' ').slice(1)}
                                          :
                                        </strong>{' '}
                                        {String(value)}
                                      </p>
                                    )
                                  )}
                                </div>
                              )}

                            {actividad.horarios_actividad &&
                              actividad.horarios_actividad.length > 0 && (
                                <div className="mt-2 text-xs text-gray-600">
                                  {actividad.horarios_actividad.map((h: any, i: number) => (
                                    <div key={i}>
                                      {
                                        ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][
                                          h.dia_semana
                                        ] || h.dia
                                      }
                                      : {h.hora_inicio || h.inicio} - {h.hora_fin || h.fin}
                                    </div>
                                  ))}
                                </div>
                              )}

                            {actividad.observaciones && (
                              <p className="text-xs text-gray-500 mt-1">
                                {actividad.observaciones}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setModalDetallesAbierto(false)
                  setCargaSeleccionada(null)
                }}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Documento */}
      {mostrarDocumento && cargaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">
                {mostrarDocumento === 'carga'
                  ? 'Formato N° 1 - Declaración de Carga Horaria Asignada'
                  : mostrarDocumento === 'horario'
                  ? 'Formato F03-CAD - Horario Semanal de la Carga Académica Docente'
                  : 'Formato 2 - Declaración Jurada'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDescargarPDF}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                >
                  📥 Descargar PDF
                </button>
                <button
                  onClick={() => {
                    setMostrarDocumento(null)
                    if (cargaSeleccionada) {
                      setModalValidacionAbierto(true)
                      runValidations(cargaSeleccionada)
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  ← Volver a Validación
                </button>
                <button
                  onClick={() => {
                    setMostrarDocumento(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8" ref={documentRef}>
              {mostrarDocumento === 'carga' ? (
                <DocumentoCargaAcademica
                  carga={cargaSeleccionada}
                  docente={cargaSeleccionada.docente}
                  periodo={cargaSeleccionada.periodo}
                  horarios={cargaSeleccionada.docente?.horarios || []}
                  actividades={cargaSeleccionada.actividades_no_lectivas}
                />
              ) : mostrarDocumento === 'horario' ? (
                <DocumentoHorarioSemanal
                  carga={cargaSeleccionada}
                  docente={cargaSeleccionada.docente}
                  periodo={cargaSeleccionada.periodo}
                  horarios={cargaSeleccionada.docente?.horarios || []}
                  actividades={cargaSeleccionada.actividades_no_lectivas}
                />
              ) : (
                <DocumentoDeclaracionJurada docente={cargaSeleccionada.docente} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}