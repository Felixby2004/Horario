'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Horario {
  id_seleccion?: number;
  id_asignacion?: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: 'teoria' | 'laboratorio' | 'practica';
  docente: {
    id_docente: number;
    codigo_docente: string;
    nombres: string;
    apellidos: string;
  };
  curso: {
    id_curso: number;
    codigo: string;
    nombre: string;
  };
  grupo: {
    id_grupo: number;
    codigo_grupo: string;
  };
  ambiente: {
    id_ambiente: number;
    codigo: string;
    nombre: string;
  };
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = [
  '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'
];

export default function VisualizarGeneradosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sesion_id = searchParams.get('sesion');

  const { alertas, eliminarAlerta, exito, error, info } = useAlertasTemporales();

  const [vistaActual, setVistaActual] = useState<'ciclo' | 'aula' | 'laboratorio' | 'docente'>('ciclo');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Horario | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!sesion_id) {
      router.push('/dashboard/horarios');
      return;
    }
    cargarHorarios();
  }, [sesion_id]);

  const cargarHorarios = async () => {
    try {
      setCargando(true);
      const res = await fetch(`/api/horarios/obtener-generados?sesion_id=${sesion_id}&tipo=temporal`);
      const data = await res.json();

      if (data.exito) {
        setHorarios(data.datos.horarios || []);
        info('✅ Horarios cargados', `Se encontraron ${data.datos.total} asignaciones`);
      } else {
        error('Error', data.error || 'No se pudieron cargar los horarios');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleEditarHorario = (horario: Horario) => {
    setEditando(horario);
  };

  const handleGuardarEdicion = async () => {
    if (!editando) return;

    try {
      setGuardando(true);
      const id = editando.id_asignacion || editando.id_seleccion;

      const res = await fetch(`/api/horarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dia_semana: editando.dia_semana,
          hora_inicio: editando.hora_inicio,
          hora_fin: editando.hora_fin,
          id_ambiente: editando.ambiente.id_ambiente,
          observaciones: null
        })
      });

      const data = await res.json();

      if (data.exito) {
        exito('✅ Horario actualizado', `${editando.docente.nombres} - ${editando.curso.codigo}`);
        setEditando(null);
        cargarHorarios();
      } else {
        error('Error', data.error || 'No se pudo guardar');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error', 'No se pudo guardar la edición');
    } finally {
      setGuardando(false);
    }
  };

  const exportarAPDF = async () => {
    try {
      info('📄 Generando PDF', 'Por favor espera...');

      const elemento = document.getElementById(`vista-${vistaActual}`);
      if (!elemento) {
        error('Error', 'No se encontró la vista para exportar');
        return;
      }

      const canvas = await html2canvas(elemento, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`horarios-${vistaActual}-${new Date().toISOString().split('T')[0]}.pdf`);
      exito('✅ PDF generado', 'El archivo ha sido descargado');
    } catch (err) {
      console.error('Error generando PDF:', err);
      error('Error', 'No se pudo generar el PDF');
    }
  };

  const handleGuardarDefinitivo = async () => {
    try {
      setGuardando(true);
      info('💾 Guardando horarios', 'Por favor espera...');

      const res = await fetch('/api/horarios/guardar-generados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periodo: 1, // Obtener del contexto
          sesion_id
        })
      });

      const data = await res.json();

      if (data.exito) {
        exito('✅ Horarios guardados', `Se guardaron ${data.datos.cantidad_guardada} horarios`);
        setTimeout(() => router.push('/dashboard/horarios'), 2000);
      } else {
        error('Error', data.error || 'No se pudo guardar');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error', 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12"><div className="loader"></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Visualizar Horarios Generados</h1>
            <p className="text-gray-600">Total: {horarios.length} asignaciones</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportarAPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              📄 Exportar a PDF
            </button>
            <button
              onClick={handleGuardarDefinitivo}
              disabled={guardando}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {guardando ? '⏳ Guardando...' : '💾 Guardar Definitivo'}
            </button>
          </div>
        </div>

        {/* Tabs de Vistas */}
        <div className="mb-6 border-b border-gray-300">
          <div className="flex gap-0">
            {['ciclo', 'aula', 'laboratorio', 'docente'].map(vista => (
              <button
                key={vista}
                onClick={() => setVistaActual(vista as any)}
                className={`px-6 py-3 border-b-2 transition ${
                  vistaActual === vista
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {vista === 'ciclo' && '🎓 Por Ciclo'}
                {vista === 'aula' && '🏫 Por Aula'}
                {vista === 'laboratorio' && '🔬 Por Laboratorio'}
                {vista === 'docente' && '👨‍🏫 Por Docente'}
              </button>
            ))}
          </div>
        </div>

        {/* Vista de Contenido */}
        <div id={`vista-${vistaActual}`} className="bg-white rounded-lg shadow p-6">
          {vistaActual === 'ciclo' && <VistaPorCiclo horarios={horarios} onEditar={handleEditarHorario} />}
          {vistaActual === 'aula' && <VistaPorAula horarios={horarios} onEditar={handleEditarHorario} />}
          {vistaActual === 'laboratorio' && <VistaPorLaboratorio horarios={horarios} onEditar={handleEditarHorario} />}
          {vistaActual === 'docente' && <VistaPorDocente horarios={horarios} onEditar={handleEditarHorario} />}
        </div>
      </div>

      {/* Modal de Edición */}
      {editando && (
        <ModalEditarHorario
          horario={editando}
          onChange={setEditando}
          onGuardar={handleGuardarEdicion}
          onCancelar={() => setEditando(null)}
          guardando={guardando}
        />
      )}
    </div>
  );
}

// Componentes de Vistas
function VistaPorCiclo({ horarios, onEditar }: { horarios: Horario[]; onEditar: (h: Horario) => void }) {
  const ciclos = new Map<number, Horario[]>();
  horarios.forEach(h => {
    const ciclo = h.curso?.id_curso || 0;
    if (!ciclos.has(ciclo)) ciclos.set(ciclo, []);
    ciclos.get(ciclo)!.push(h);
  });

  return (
    <div className="space-y-6">
      {Array.from(ciclos.entries()).map(([ciclo, items]) => (
        <div key={ciclo} className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Ciclo {ciclo}</h3>
          <MatrizHoraria horarios={items} onEditar={onEditar} />
        </div>
      ))}
    </div>
  );
}

function VistaPorAula({ horarios, onEditar }: { horarios: Horario[]; onEditar: (h: Horario) => void }) {
  const aulas = new Map<string, Horario[]>();
  horarios
    .filter(h => h.tipo_clase === 'teoria')
    .forEach(h => {
      const aula = h.ambiente?.codigo || 'SIN_AULA';
      if (!aulas.has(aula)) aulas.set(aula, []);
      aulas.get(aula)!.push(h);
    });

  return (
    <div className="space-y-6">
      {Array.from(aulas.entries()).map(([aula, items]) => (
        <div key={aula} className="border rounded-lg p-4 bg-green-50">
          <h3 className="text-xl font-bold text-green-900 mb-4">🏫 {aula}</h3>
          <MatrizHoraria horarios={items} onEditar={onEditar} />
        </div>
      ))}
    </div>
  );
}

function VistaPorLaboratorio({ horarios, onEditar }: { horarios: Horario[]; onEditar: (h: Horario) => void }) {
  const labs = new Map<string, Horario[]>();
  horarios
    .filter(h => h.tipo_clase === 'laboratorio')
    .forEach(h => {
      const lab = h.ambiente?.codigo || 'SIN_LAB';
      if (!labs.has(lab)) labs.set(lab, []);
      labs.get(lab)!.push(h);
    });

  return (
    <div className="space-y-6">
      {Array.from(labs.entries()).map(([lab, items]) => (
        <div key={lab} className="border rounded-lg p-4 bg-purple-50">
          <h3 className="text-xl font-bold text-purple-900 mb-4">🔬 {lab}</h3>
          <MatrizHoraria horarios={items} onEditar={onEditar} />
        </div>
      ))}
    </div>
  );
}

function VistaPorDocente({ horarios, onEditar }: { horarios: Horario[]; onEditar: (h: Horario) => void }) {
  const docentes = new Map<number, Horario[]>();
  horarios.forEach(h => {
    const id = h.docente?.id_docente || 0;
    if (!docentes.has(id)) docentes.set(id, []);
    docentes.get(id)!.push(h);
  });

  return (
    <div className="space-y-6">
      {Array.from(docentes.entries()).map(([id, items]) => (
        <div key={id} className="border rounded-lg p-4 bg-orange-50">
          <h3 className="text-xl font-bold text-orange-900 mb-4">
            👨‍🏫 {items[0]?.docente?.apellidos}, {items[0]?.docente?.nombres}
          </h3>
          <MatrizHoraria horarios={items} onEditar={onEditar} />
        </div>
      ))}
    </div>
  );
}

function MatrizHoraria({ horarios, onEditar }: { horarios: Horario[]; onEditar: (h: Horario) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Hora</th>
            {DIAS.map(dia => (
              <th key={dia} className="border p-2 text-center font-bold">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map(hora => (
            <tr key={hora}>
              <td className="border p-2 font-bold text-gray-700 bg-gray-50">{hora}</td>
              {DIAS.map((dia, diaIdx) => {
                const h = horarios.find(
                  item => item.dia_semana === diaIdx && item.hora_inicio === hora
                );
                return (
                  <td key={`${hora}-${dia}`} className="border p-2 text-center bg-white hover:bg-yellow-50">
                    {h ? (
                      <button
                        onClick={() => onEditar(h)}
                        className="w-full p-2 bg-blue-100 text-blue-900 rounded text-xs font-semibold hover:bg-blue-200 break-words"
                      >
                        <div className="font-bold">{h.curso?.codigo}</div>
                        <div className="text-xs">{h.grupo?.codigo_grupo}</div>
                        <div className="text-xs">{h.docente?.apellidos}</div>
                        <div className="text-xs">{h.ambiente?.codigo}</div>
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModalEditarHorario({
  horario,
  onChange,
  onGuardar,
  onCancelar,
  guardando
}: {
  horario: Horario;
  onChange: (h: Horario) => void;
  onGuardar: () => void;
  onCancelar: () => void;
  guardando: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{horario.curso?.codigo}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Día de la Semana</label>
            <select
              value={horario.dia_semana}
              onChange={(e) => onChange({ ...horario, dia_semana: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            >
              {DIAS.map((dia, idx) => (
                <option key={idx} value={idx}>{dia}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio</label>
              <select
                value={horario.hora_inicio}
                onChange={(e) => onChange({ ...horario, hora_inicio: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {HORAS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin</label>
              <input
                type="text"
                value={horario.hora_fin}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
            <input
              type="text"
              value={horario.ambiente?.nombre || ''}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
            <p><strong>Docente:</strong> {horario.docente?.nombres}</p>
            <p><strong>Grupo:</strong> {horario.grupo?.codigo_grupo}</p>
            <p><strong>Tipo:</strong> {horario.tipo_clase}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancelar}
            disabled={guardando}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            disabled={guardando}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? '⏳ Guardando...' : '✓ Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
