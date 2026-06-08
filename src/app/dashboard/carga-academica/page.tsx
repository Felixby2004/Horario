'use client'

import { useState, useEffect, useRef } from 'react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Boton } from '@/components/ui/Boton'
import html2pdf from 'html2pdf.js'

const TIPOS_ACTIVIDAD = [
  { valor: 'tutoria_consejeria', label: 'Tutoría / Consejería' },
  { valor: 'investigacion', label: 'Investigación' },
  { valor: 'responsabilidad_social', label: 'Responsabilidad Social' },
  { valor: 'gestion_gobierno', label: 'Gestión y Gobierno' },
  { valor: 'asesoria_tesis_jurado', label: 'Asesoría de Tesis / Jurado' },
  { valor: 'perfeccionamiento', label: 'Perfeccionamiento' }
]

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
  const [mostrarDocumento, setMostrarDocumento] = useState<'carga' | 'declaracion' | null>(null)
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
    return estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')
  }

  const handleDescargarPDF = () => {
    const element = documentRef.current
    if (!element) return

    const nombreDocente = cargaSeleccionada?.docente 
      ? `${cargaSeleccionada.docente.apellidos}_${cargaSeleccionada.docente.nombres}`
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
            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
          >
            Ver
          </button>

          {fila.estado === 'enviado' && (
            <button
              onClick={() =>
                handleCambiarEstado(fila.id_carga, 'en_revision')
              }
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Revisar
            </button>
          )}

          {fila.estado === 'en_revision' && (
            <>
              <button
                onClick={() =>
                  handleCambiarEstado(fila.id_carga, 'validado')
                }
                className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
              >
                Validar
              </button>
              <button
                onClick={() => {
                  setCargaSeleccionada(fila)
                  setModalRechazoAbierto(true)
                }}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
              >
                Rechazar
              </button>
            </>
          )}

          {fila.estado === 'validado' && (
            <button
              onClick={() =>
                handleCambiarEstado(fila.id_carga, 'aprobado')
              }
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
            >
              Aprobar
            </button>
          )}

          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setCargaSeleccionada(fila)
                setMostrarDocumento('carga')
              }}
              className="px-2 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors"
            >
              Carga
            </button>
            <button
              onClick={() => {
                setCargaSeleccionada(fila)
                setMostrarDocumento('declaracion')
              }}
              className="px-2 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600 transition-colors"
            >
              Declaración
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Carga Académica</h1>
          <p className="text-gray-600 mt-1">Revisa y valida las cargas académicas de los docentes</p>
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
                                        ]
                                      }
                                      : {h.hora_inicio} - {h.hora_fin}
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
                  : 'Formato 2 - Declaración Jurada'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDescargarPDF}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                >
                  Descargar PDF
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

function DocumentoCargaAcademica({
  carga,
  docente,
  periodo,
  horarios,
  actividades
}: any) {
  // Helper function to format date as dd/mm/yyyy
  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '[dd/mm/aaaa]';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '[dd/mm/aaaa]';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fechaEmision = formatDate(new Date());

  // Get unique courses from docente.cursos
  const getUniqueCursos = () => {
    const cursos: any[] = docente?.cursos || []
    // Group by curso id to avoid duplicates
    const unique: any[] = []
    const seen = new Set()
    for (const dc of cursos) {
      if (!seen.has(dc.id_curso)) {
        seen.add(dc.id_curso)
        unique.push(dc)
      }
    }
    return unique
  }

  const getActividadText = (tipo: string) => {
    const acts = actividades?.filter((a: any) => a.tipo_actividad === tipo) || []
    return acts.map((a: any) => {
      let text = a.nombre || ''
      if (a.datos_sustento) {
        Object.entries(a.datos_sustento).forEach(([key, value]) => {
          if (value && !['ciclo_academico', 'cantidad_alumnos'].includes(key)) {
            text += (text ? ' ' : '') + value
          }
        })
      }
      return text
    }).join('; ')
  }

  const getActividadHoras = (tipo: string) => {
    const acts = actividades?.filter((a: any) => a.tipo_actividad === tipo) || []
    return acts.reduce((sum: number, a: any) => sum + (a.horas_asignadas || a.horas_semanales || 0), 0)
  }

  const uniqueCursos = getUniqueCursos()

  return (
    <div className="print:max-w-full max-w-4xl mx-auto p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">FORMATO N° 1</h1>
        <h2 className="text-lg font-semibold mt-2 text-gray-800">
          DECLARACIÓN DE CARGA HORARIA ASIGNADA
        </h2>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">I. DATOS SOBRE LA SITUACIÓN DEL PROFESOR:</h3>
        <table className="w-full border-collapse border border-gray-900">
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 w-1/5 font-medium">FACULTAD:</td>
              <td className="border border-gray-900 p-2 w-4/5">{docente?.facultad?.nombre || '[Ingrese Nombre de Facultad]'}</td>
            </tr>
            <tr>
              <td className="border border-gray-900 p-2 font-medium">DPTO. ACADÉMICO:</td>
              <td className="border border-gray-900 p-2">{docente?.departamento?.nombre || '[Ingrese Departamento Académico]'}</td>
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-gray-900 mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-900 p-2 text-xs">NOMBRE COMPLETO</th>
              <th className="border border-gray-900 p-2 text-xs">CONDICIÓN</th>
              <th className="border border-gray-900 p-2 text-xs">CATEGORÍA</th>
              <th className="border border-gray-900 p-2 text-xs">MODALIDAD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 text-xs">{docente?.apellidos}, {docente?.nombres}</td>
              <td className="border border-gray-900 p-2 text-xs">{docente?.modalidad || 'Nombrado'}</td>
              <td className="border border-gray-900 p-2 text-xs">{docente?.categoria || 'Principal'}</td>
              <td className="border border-gray-900 p-2 text-xs">
                {docente?.tipo_dedicacion_laboral?.replace(/_/g, ' ') ||
                  docente?.dedicacion?.replace(/_/g, ' ') ||
                  'Tiempo Completo'}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-gray-900 mt-2">
          <tbody>
            <tr>
              <td className="border border-gray-900 p-2 w-1/4 font-medium text-xs">AÑO ACADÉMICO:</td>
              <td className="border border-gray-900 p-2 w-1/4 text-xs">{periodo?.anio || '[Ingrese Año]'}</td>
              <td className="border border-gray-900 p-2 w-1/4 font-medium text-xs">CICLO:</td>
              <td className="border border-gray-900 p-2 w-1/4 text-xs">{periodo?.nombre || '[Ingrese Ciclo]'}</td>
            </tr>
            <tr>
              <td className="border border-gray-900 p-2 font-medium text-xs">INICIO:</td>
              <td className="border border-gray-900 p-2 text-xs">{formatDate(periodo?.fecha_inicio)}</td>
              <td className="border border-gray-900 p-2 font-medium text-xs">FINAL:</td>
              <td className="border border-gray-900 p-2 text-xs">{formatDate(periodo?.fecha_fin)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-sm">1. TRABAJO LECTIVO. Datos completos y con claridad</h3>
        <table className="w-full border-collapse border border-gray-900 text-xs">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-900 p-1">CÓDIGO</th>
              <th className="border border-gray-900 p-1">NOMBRE DEL CURSO</th>
              <th className="border border-gray-900 p-1">CUR.</th>
              <th className="border border-gray-900 p-1">ESCUELA PROF.</th>
              <th className="border border-gray-900 p-1">CIC.</th>
              <th className="border border-gray-900 p-1">SEC.</th>
              <th className="border border-gray-900 p-1">N° AL.</th>
              <th className="border border-gray-900 p-1">HT</th>
              <th className="border border-gray-900 p-1">HP</th>
              <th className="border border-gray-900 p-1">HL</th>
              <th className="border border-gray-900 p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {uniqueCursos.map((dc: any, idx: number) => {
              const ht = dc.curso?.horas_teoria || 0;
              const hp = dc.curso?.horas_practica || 0;
              const hl = dc.curso?.horas_laboratorio || 0;
              const total = ht + hp + hl;
              return (
                <tr key={idx}>
                  <td className="border border-gray-900 p-1 text-center">{dc.curso?.codigo || '-'}</td>
                  <td className="border border-gray-900 p-1">{dc.curso?.nombre || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">{docente?.escuela_profesional || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">{dc.curso?.ciclo || '-'}</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">-</td>
                  <td className="border border-gray-900 p-1 text-center">{ht}</td>
                  <td className="border border-gray-900 p-1 text-center">{hp}</td>
                  <td className="border border-gray-900 p-1 text-center">{hl}</td>
                  <td className="border border-gray-900 p-1 text-center">{total}</td>
                </tr>
              );
            })}
            {(!uniqueCursos || uniqueCursos.length === 0) && (
              <tr>
                <td colSpan={11} className="border border-gray-900 p-2 text-center text-xs">
                  No hay cursos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse border border-gray-900 text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-900 p-1 w-1/3">DESCRIPCIÓN</th>
            <th className="border border-gray-900 p-1 w-2/3">DESCRIPCIÓN</th>
            <th className="border border-gray-900 p-1 w-16 text-center">HORAS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">2. PREPARACIÓN Y EVALUACIÓN (Max 50% del Trabajo Lectivo)</td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1 text-center">{carga?.horas_preparacion || 0}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">3. CONSEJERÍA: Señalar número de alumnos y el ciclo académico en el que se desempeña:</td>
            <td className="border border-gray-900 p-1">{getActividadText('tutoria_consejeria')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('tutoria_consejeria')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">4. INVESTIGACIÓN: Consignar el N° de inscripción, código, nombre y duración del proyecto. (Como máximo 04 y 05 horas semanales), según modalidad de trabajo docente:</td>
            <td className="border border-gray-900 p-1">{getActividadText('investigacion')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('investigacion')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">5. CAPACITACIÓN: Señalar la referencia a este curso en el marco de los planes de cada Facultad (como máximo 05 semanas.):</td>
            <td className="border border-gray-900 p-1">{getActividadText('perfeccionamiento')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('perfeccionamiento')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">6. ACTIVIDADES DE GOBIERNO: Sí desempeña cargo indique.</td>
            <td className="border border-gray-900 p-1">{getActividadText('gestion_gobierno')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('gestion_gobierno')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">8. ASESORÍA DE TESIS, EXÁMENES PROFESIONALES Y EXPERIENCIA DECENCIAL, profesional: Indicar el número de Resolución Decenal, proyectos y la duración de la actividad programada:</td>
            <td className="border border-gray-900 p-1">{getActividadText('asesoria_tesis_jurado')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('asesoria_tesis_jurado')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">9. RESPONSABILIDAD SOCIAL UNIVERSITARIA: Señalar actividad, proyecto programas a ejecutarse y comunidades de las cuales se ocupa: (Como máximo 02 horas semanales)</td>
            <td className="border border-gray-900 p-1">{getActividadText('responsabilidad_social')}</td>
            <td className="border border-gray-900 p-1 text-center">{getActividadHoras('responsabilidad_social')}</td>
          </tr>
          <tr>
            <td className="border border-gray-900 p-1 font-medium">10. COMITÉS TÉCNICOS Y COMISIONES: Consignar el número de Resolución autorizativa indicando el cargo de vigencia.</td>
            <td className="border border-gray-900 p-1"></td>
            <td className="border border-gray-900 p-1 text-center">0</td>
          </tr>
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-900 p-1 text-right" colSpan={2}>TOTAL</td>
            <td className="border border-gray-900 p-1 text-center">{carga?.horas_totales || 0}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-right mt-6 mb-8 text-sm">
        <p>Trujillo, {fechaEmision}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2 mt-4">
            <p className="text-sm">Firma del Profesor</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-900 pt-2 mt-4">
            <p className="text-sm">Firma del Director de Dpto.</p>
          </div>
        </div>
      </div>

      <div className="text-right mt-8 text-sm">
        <p className="font-bold">V° B° DECANO FAC.</p>
      </div>
    </div>
  )
}

function DocumentoDeclaracionJurada({ docente }: any) {
  const fechaActual = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="print:max-w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">
          FORMATO 2
        </h1>
        <h2 className="text-lg font-semibold mt-2 text-gray-800">
          DECLARACIÓN JURADA DE NO ESTAR IN CURSO EN CAUSALES DE INCOMPATIBILIDAD O IMPEDIMENTO LABORAL
        </h2>
        <p className="text-sm text-gray-600 mt-2">(Modificado R.R. N° 649-2011-UNT)</p>
      </div>

      <div className="space-y-4 leading-relaxed">
        <p className="text-justify">
          Yo, <span className="font-semibold">{docente?.apellidos}, {docente?.nombres}</span>,
          identificado con D.N.I. N° <span className="font-semibold">{docente?.dni_docente || '_____________'}</span>,
          con Código IBM N° <span className="font-semibold">{docente?.codigo_docente || '_____________'}</span>,
          del Departamento Académico de <span className="font-semibold">{docente?.departamento?.nombre || '_____________'}</span>,
          de la Facultad de <span className="font-semibold">{docente?.facultad?.nombre || '_____________'}</span>,
          en el marco del programa de homologación de la remuneración de los docentes universitarios, dispuesto por la D.S. N° 033-2006 y D.S. N° 019-2007-ED,
        </p>

        <p className="text-justify font-semibold">DECLARO BAJO JURAMENTO Y EN HONOR A LA VERDAD, QUE:</p>

        <p className="text-justify">
          NO ESTOY IN CURSO en causales de incompatibilidad laboral y NO TENGO impedimento para ejercer la docencia en la Universidad Nacional de Trujillo,
          de conformidad con lo previsto en el Capítulo VII de las Incompatibilidades e Impedimentos, del Título VI: Los Profesores, del Estatuto Institucional vigente.
        </p>

        <div className="space-y-2">
          <p className="text-justify">
            ( ) Soy docente nombrado ( ) / contratado ( ), a Dedicación Exclusiva y NO desarrollo otra actividad ordinaria remunerada en el sector público o privado,
            fuera de la Universidad Nacional de Trujillo (De conformidad con el Artículo 221° del Estatuto Institucional vigente).
          </p>
          <p className="text-justify">
            ( ) Soy docente nombrado ( ) / contratado ( ), a Tiempo Completo 40h, y NO desempeño cargo público o privado en horas que coinciden con el horario
            establecido en la Universidad Nacional de Trujillo (De conformidad con los Artículos 270° y 277° del Estatuto Institucional vigente).
          </p>
          <p className="text-justify">
            ( ) Soy docente nombrado ( ) / contratado ( ), a Tiempo Parcial y NO desempeño cargo público o privado en horas que coinciden con el horario
            establecido en la Universidad Nacional de Trujillo (En concordancia con el Artículo 245° del Estatuto Institucional vigente).
          </p>
        </div>

        <p className="text-justify mt-6">
          EN CASO DE FALTAR A LA VERDAD ME SOMETO A LAS SANCIONES QUE SEAN APLICABLES DE ACUERDO A LEY; ASIMISMO,
          DE ENCONTRARME IN CURSO EN SITUACIÓN DE INCOMPATIBILIDAD O IMPEDIMENTO PARA EJERCER LA DOCENCIA EN LA UNT,
          ME SOMETO A LAS SANCIONES PREVISTAS EN EL ESTATUTO, Y AUTORIZO AL FUNCIONARIO COMPETENTE DISPONGA EL DESCUENTO DE MI PLANILLA DE HABERES,
          DEL MONTO QUE LA UNIDAD DE REMUNERACIONES LIQUIDEZ COMO PAGOS INDEBIDOS POR EL LAPSO DE TIEMPO LABORADO ILEGALMENTE.
        </p>

        <div className="text-center mt-12">
          <p>Trujillo, {fechaActual}</p>
        </div>

        <div className="text-center mt-12">
          <div className="border-t border-gray-900 pt-2 mt-4 mx-auto w-64">
            <p className="text-sm font-medium">FIRMA DEL DECLARANTE</p>
          </div>
        </div>
      </div>
    </div>
  )
}
