'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';

interface Ventana {
  id_ventana: number;
  fecha: string;
  orden_prioridad: number;
  modalidad: string;
  categoria: string;
  hora_inicio: string;
  hora_fin: string;
  periodo: {
    id_periodo: number;
    nombre: string;
  };
}

interface Docente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  modalidad: string;
  categoria: string;
}

interface Curso {
  id_curso: number;
  codigo: string;
  nombre: string;
  ciclo: number;
}

interface Grupo {
  id_grupo: number;
  codigo_grupo: string;
  capacidad_maxima: number;
  curso: Curso;
  periodo: {
    id_periodo: number;
    nombre: string;
  };
}

interface Ambiente {
  id_ambiente: number;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
}

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' }
];

export default function DocenteVentanasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_docente = searchParams.get('id_docente');

  const [docente, setDocente] = useState<Docente | null>(null);
  const [ventanasDisponibles, setVentanasDisponibles] = useState<Ventana[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ventanaSeleccionada, setVentanaSeleccionada] = useState<Ventana | null>(null);

  const [formulario, setFormulario] = useState({
    id_grupo: '',
    id_ambiente: '',
    dia_semana: '',
    hora_inicio: '08:00',
    tipo_clase: 'teoría'
  });

  useEffect(() => {
    if (id_docente) {
      cargarDatos();
    }
  }, [id_docente]);

  const cargarDatos = async () => {
    try {
      const [resDocente, resVentanas, resGrupos, resAmbientes] = await Promise.all([
        fetch(`/api/docentes/${id_docente}`),
        fetch('/api/ventanas'),
        fetch('/api/grupos'),
        fetch('/api/ambientes')
      ]);

      const [dataDocente, dataVentanas, dataGrupos, dataAmbientes] = await Promise.all([
        resDocente.json(),
        resVentanas.json(),
        resGrupos.json(),
        resAmbientes.json()
      ]);

      if (dataDocente.exito) {
        const docenteData = dataDocente.datos;
        setDocente(docenteData);

        // Filtrar ventanas según la modalidad y categoría del docente
        if (dataVentanas.exito) {
          const normalizar = (val: string) => val.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          const ventanasFiltradas = (dataVentanas.datos || []).filter((v: Ventana) => 
            normalizar(v.modalidad) === normalizar(docenteData.modalidad) && 
            normalizar(v.categoria) === normalizar(docenteData.categoria)
          );
          setVentanasDisponibles(ventanasFiltradas);
        }
      }

      if (dataGrupos.exito) setGrupos(dataGrupos.datos || []);
      if (dataAmbientes.exito) setAmbientes(dataAmbientes.datos || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ventanaSeleccionada) {
      alert('❌ Selecciona una ventana primero');
      return;
    }

    try {
      // Buscar una hora disponible en la ventana
      const horaInicio = formulario.hora_inicio;
      const horaFin = calcularHoraFin(horaInicio);

      const response = await fetch('/api/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_docente: parseInt(id_docente!),
          id_curso: parseInt(formulario.id_grupo.split('-')[0]),
          id_grupo: parseInt(formulario.id_grupo.split('-')[1]),
          tipo_clase: formulario.tipo_clase,
          id_ambiente: parseInt(formulario.id_ambiente),
          dia_semana: parseInt(formulario.dia_semana),
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          id_periodo: ventanaSeleccionada.periodo.id_periodo,
          id_ventana: ventanaSeleccionada.id_ventana
        })
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Horario asignado exitosamente');
        setVentanaSeleccionada(null);
        setFormulario({
          id_grupo: '',
          id_ambiente: '',
          dia_semana: '',
          hora_inicio: '08:00',
          tipo_clase: 'teoría'
        });
        cargarDatos();
      } else {
        alert('❌ Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al asignar horario');
    }
  };

  const calcularHoraFin = (horaInicio: string) => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const horaFinal = horas + 2; // Asumir 2 horas de clase
    return `${String(horaFinal).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  if (!docente) {
    return <div className="p-6">Docente no encontrado</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Selecciona tu Ventana de Horarios</h1>
          <p className="text-gray-600 mt-1">
            {docente.nombres} {docente.apellidos} ({docente.modalidad} - {docente.categoria})
          </p>
        </div>
        <Boton
          variante="secondary"
          onClick={() => router.push('/dashboard/docentes')}
        >
          Volver
        </Boton>
      </div>

      {/* Lista de ventanas disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ventanasDisponibles.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            <p>No hay ventanas disponibles para tu categoría y modalidad en este momento.</p>
          </div>
        ) : (
          ventanasDisponibles.map((ventana) => (
            <button
              key={ventana.id_ventana}
              onClick={() => setVentanaSeleccionada(ventana)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                ventanaSeleccionada?.id_ventana === ventana.id_ventana
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
            >
              <div className="font-semibold text-lg">
                📅 {new Date(ventana.fecha).toLocaleDateString('es-ES')}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                🕐 {ventana.hora_inicio} - {ventana.hora_fin}
              </div>
              <div className="text-sm text-gray-600">
                📌 {ventana.periodo.nombre}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-2">
                Prioridad #{ventana.orden_prioridad}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Formulario para seleccionar horario */}
      {ventanaSeleccionada && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Configura tu Horario para {new Date(ventanaSeleccionada.fecha).toLocaleDateString('es-ES')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Curso - Grupo *</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formulario.id_grupo}
                  onChange={(e) => setFormulario({ ...formulario, id_grupo: e.target.value })}
                  required
                >
                  <option value="">Seleccione curso y grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id_grupo} value={`${g.curso.id_curso}-${g.id_grupo}`}>
                      {g.curso.codigo} Grupo {g.codigo_grupo} (Ciclo {g.curso.ciclo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ambiente *</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formulario.id_ambiente}
                  onChange={(e) => setFormulario({ ...formulario, id_ambiente: e.target.value })}
                  required
                >
                  <option value="">Seleccione ambiente</option>
                  {ambientes.map((a) => (
                    <option key={a.id_ambiente} value={a.id_ambiente}>
                      {a.nombre} ({a.tipo} - Capacidad {a.capacidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Día de la Semana *</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formulario.dia_semana}
                  onChange={(e) => setFormulario({ ...formulario, dia_semana: e.target.value })}
                  required
                >
                  <option value="">Seleccione día</option>
                  {DIAS_SEMANA.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hora Inicio *</label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2"
                  value={formulario.hora_inicio}
                  onChange={(e) => setFormulario({ ...formulario, hora_inicio: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Clase *</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formulario.tipo_clase}
                  onChange={(e) => setFormulario({ ...formulario, tipo_clase: e.target.value })}
                >
                  <option value="teoría">Teoría</option>
                  <option value="práctica">Práctica</option>
                  <option value="laboratorio">Laboratorio</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Boton type="submit">✅ Confirmar Horario</Boton>
              <Boton
                type="button"
                variante="secondary"
                onClick={() => setVentanaSeleccionada(null)}
              >
                Cancelar
              </Boton>
            </div>
          </form>
        </div>
      )}

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Instrucciones</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1️⃣ Selecciona la ventana de horarios disponible para tu categoría y modalidad</li>
          <li>2️⃣ Completa el formulario con tu curso, grupo, ambiente y horario deseado</li>
          <li>3️⃣ Confirma para registrar tu horario</li>
          <li>4️⃣ Tu horario será procesado y aparecerá en tu sección de "Grupos Asignados"</li>
        </ul>
      </div>
    </div>
  );
}
