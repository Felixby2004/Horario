'use client';

import { useState, useEffect } from 'react';
import { MatrizDisponibilidad } from '@/components/horarios/MatrizDisponibilidad';
import { Boton } from '@/components/ui/Boton';
import { Modal } from '@/components/ui/Modal';

export default function SeleccionHorariosPage() {
  const [docentes, setDocentes] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<any>(null);
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);
  const [ambientes, setAmbientes] = useState([]);
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState<any>(null);
  const [tipoClase, setTipoClase] = useState('teoria');
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [seleccionTemporal, setSeleccionTemporal] = useState<any>(null);
  const [validaciones, setValidaciones] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resDocentes, resCursos, resAmbientes] = await Promise.all([
        fetch('/api/docentes'),
        fetch('/api/cursos'),
        fetch('/api/ambientes')
      ]);

      const [dataDocentes, dataCursos, dataAmbientes] = await Promise.all([
        resDocentes.json(),
        resCursos.json(),
        resAmbientes.json()
      ]);

      if (dataDocentes.exito) setDocentes(dataDocentes.datos);
      if (dataCursos.exito) setCursos(dataCursos.datos);
      if (dataAmbientes.exito) setAmbientes(dataAmbientes.datos);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleSeleccionCelda = async (celda: any) => {
    if (!docenteSeleccionado || !cursoSeleccionado || !ambienteSeleccionado) {
      alert('Por favor selecciona docente, curso y ambiente');
      return;
    }

    try {
      const response = await fetch('/api/horarios/validar-seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_docente: docenteSeleccionado.id_docente,
          id_curso: cursoSeleccionado.id_curso,
          id_ambiente: ambienteSeleccionado.id_ambiente,
          dia: celda.dia,
          hora_inicio: celda.hora_inicio,
          hora_fin: celda.hora_fin,
          tipo_clase: tipoClase,
          id_periodo: 1
        })
      });

      const data = await response.json();

      if (data.exito && data.valido) {
        setSeleccionTemporal({
          celda,
          docente: docenteSeleccionado,
          curso: cursoSeleccionado,
          ambiente: ambienteSeleccionado
        });
        setValidaciones(data.validaciones || []);
        setModalConfirmacion(true);
      } else {
        setValidaciones(data.validaciones || []);
        alert('Hay conflictos en la selección. Revisa las validaciones.');
      }
    } catch (error) {
      console.error('Error validando selección:', error);
    }
  };

  const confirmarSeleccion = async () => {
    try {
      const response = await fetch('/api/horarios/seleccionar-celda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_docente: seleccionTemporal.docente.id_docente,
          id_curso: seleccionTemporal.curso.id_curso,
          id_ambiente: seleccionTemporal.ambiente.id_ambiente,
          dia: seleccionTemporal.celda.dia,
          hora_inicio: seleccionTemporal.celda.hora_inicio,
          hora_fin: seleccionTemporal.celda.hora_fin,
          tipo_clase: tipoClase,
          id_periodo: 1
        })
      });

      const data = await response.json();

      if (data.exito) {
        alert('Horario asignado exitosamente');
        setModalConfirmacion(false);
        setSeleccionTemporal(null);
      }
    } catch (error) {
      console.error('Error confirmando selección:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Selección de Horarios</h1>
        <p className="text-gray-600">Asigna horarios seleccionando celdas en la matriz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">Docente</label>
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => {
              const docente = docentes.find((d: any) => d.id_docente === parseInt(e.target.value));
              setDocenteSeleccionado(docente);
            }}
          >
            <option value="">Seleccionar docente</option>
            {docentes.map((d: any) => (
              <option key={d.id_docente} value={d.id_docente}>
                {d.apellidos}, {d.nombres} ({d.categoria})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">Curso</label>
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => {
              const curso = cursos.find((c: any) => c.id_curso === parseInt(e.target.value));
              setCursoSeleccionado(curso);
            }}
          >
            <option value="">Seleccionar curso</option>
            {cursos.map((c: any) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.codigo} - {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">Ambiente</label>
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => {
              const ambiente = ambientes.find((a: any) => a.id_ambiente === parseInt(e.target.value));
              setAmbienteSeleccionado(ambiente);
            }}
          >
            <option value="">Seleccionar ambiente</option>
            {ambientes.map((a: any) => (
              <option key={a.id_ambiente} value={a.id_ambiente}>
                {a.codigo} - {a.nombre} ({a.tipo})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">Tipo de Clase</label>
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

      {docenteSeleccionado && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Matriz de Disponibilidad - {docenteSeleccionado.apellidos}, {docenteSeleccionado.nombres}
          </h2>
          <MatrizDisponibilidad
            idDocente={docenteSeleccionado.id_docente}
            idPeriodo={1}
            tipoClaseSeleccionada={tipoClase}
            alSeleccionar={handleSeleccionCelda}
          />
        </div>
      )}

      {validaciones.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Validaciones</h3>
          <div className="space-y-2">
            {validaciones.map((v: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded ${v.valido ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
              >
                {v.valido ? '✅' : '❌'} {v.mensaje}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        abierto={modalConfirmacion}
        alCerrar={() => setModalConfirmacion(false)}
        titulo="Confirmar Asignación de Horario"
      >
        {seleccionTemporal && (
          <div className="space-y-4">
            <div>
              <strong>Docente:</strong> {seleccionTemporal.docente.apellidos}, {seleccionTemporal.docente.nombres}
            </div>
            <div>
              <strong>Curso:</strong> {seleccionTemporal.curso.nombre}
            </div>
            <div>
              <strong>Ambiente:</strong> {seleccionTemporal.ambiente.nombre}
            </div>
            <div>
              <strong>Horario:</strong> {seleccionTemporal.celda.dia} {seleccionTemporal.celda.hora_inicio} - {seleccionTemporal.celda.hora_fin}
            </div>
            <div>
              <strong>Tipo:</strong> <span className="capitalize">{tipoClase}</span>
            </div>
            <div className="flex gap-3 mt-6">
              <Boton onClick={confirmarSeleccion}>Confirmar</Boton>
              <Boton variante="secondary" onClick={() => setModalConfirmacion(false)}>Cancelar</Boton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
