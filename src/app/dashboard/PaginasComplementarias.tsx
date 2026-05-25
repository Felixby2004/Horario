'use client';

import { useState } from 'react';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';

// Página de importar cursos
export function ImportarCursosPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleImportar = async () => {
    if (!archivo) return;

    setImportando(true);
    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const response = await fetch('/api/cursos/importar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      alert('Error al importar');
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Importar Cursos</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Archivo Excel o CSV
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              Formato del archivo:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Código del curso</li>
              <li>• Nombre del curso</li>
              <li>• Horas teoría</li>
              <li>• Horas laboratorio</li>
              <li>• Horas práctica</li>
              <li>• Créditos</li>
              <li>• Ciclo</li>
            </ul>
          </div>

          <Boton
            onClick={handleImportar}
            disabled={!archivo || importando}
          >
            {importando ? 'Importando...' : 'Importar Cursos'}
          </Boton>
        </div>

        {resultado && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-800">
              ✅ Importación completada
            </p>
            <p className="text-sm text-green-700 mt-2">
              Cursos importados: {resultado.exitosos}
            </p>
            {resultado.errores?.length > 0 && (
              <p className="text-sm text-red-700">
                Errores: {resultado.errores.length}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Página de perfil de docente
export function PerfilDocentePage({ params }: { params: { id: string } }) {
  const [docente, setDocente] = useState<any>(null);
  const [horarios, setHorarios] = useState([]);

  useState(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const response = await fetch(`/api/docentes/${params.id}`);
    const data = await response.json();
    if (data.exito) setDocente(data.datos);

    const resHorarios = await fetch(`/api/docentes/${params.id}/horario`);
    const dataHorarios = await resHorarios.json();
    if (dataHorarios.exito) setHorarios(dataHorarios.datos);
  };

  if (!docente) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Perfil del Docente</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
                {docente.nombres[0]}{docente.apellidos[0]}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Nombres</div>
                <div className="font-medium">{docente.nombres}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Apellidos</div>
                <div className="font-medium">{docente.apellidos}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Código</div>
                <div className="font-medium">{docente.codigo_docente}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Categoría</div>
                <div className="font-medium capitalize">{docente.categoria}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Modalidad</div>
                <div className="font-medium capitalize">{docente.modalidad}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Correo</div>
                <div className="font-medium text-sm">{docente.correo_electronico}</div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Boton className="w-full" onClick={() => window.location.href = `/dashboard/docentes/${params.id}/editar`}>
                Editar Perfil
              </Boton>
              <Boton className="w-full" variante="secondary" onClick={() => window.location.href = `/dashboard/docentes/${params.id}/notificaciones`}>
                Preferencias Notificación
              </Boton>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Horario Actual</h3>
            
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100">Día</th>
                  <th className="border p-2 bg-gray-100">Hora</th>
                  <th className="border p-2 bg-gray-100">Curso</th>
                  <th className="border p-2 bg-gray-100">Ambiente</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h: any) => (
                  <tr key={h.id_horario}>
                    <td className="border p-2 capitalize">{h.dia_semana}</td>
                    <td className="border p-2">{h.hora_inicio}-{h.hora_fin}</td>
                    <td className="border p-2">{h.curso?.nombre}</td>
                    <td className="border p-2">{h.ambiente?.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {horarios.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tiene horarios asignados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Página de grupos de un curso
export function GruposCursoPage({ params }: { params: { id: string } }) {
  const [curso, setCurso] = useState<any>(null);
  const [grupos, setGrupos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  useState(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const response = await fetch(`/api/cursos/${params.id}`);
    const data = await response.json();
    if (data.exito) {
      setCurso(data.datos);
      setGrupos(data.datos.grupos || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{curso?.nombre}</h1>
          <p className="text-gray-600">Grupos del curso</p>
        </div>
        <Boton onClick={() => setModalAbierto(true)}>
          Nuevo Grupo
        </Boton>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {grupos.map((grupo: any) => (
          <div key={grupo.id_grupo} className="bg-white p-4 rounded-lg shadow">
            <div className="text-lg font-semibold mb-2">
              Grupo {grupo.numero_grupo}
            </div>
            <div className="text-sm text-gray-600">
              Docente: {grupo.docente?.apellidos}, {grupo.docente?.nombres}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Capacidad: {grupo.max_estudiantes} estudiantes
            </div>
          </div>
        ))}
      </div>

      {grupos.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No hay grupos creados para este curso
        </div>
      )}
    </div>
  );
}
