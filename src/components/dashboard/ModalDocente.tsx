'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

interface Docente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  modalidad: string;
  categoria: string;
  dedicacion?: string;
  antiguedad: number;
  fecha_ingreso?: string;
  correo_electronico?: string;
  telefono?: string;
  grado_academico?: string;
  especialidad?: string;
  horas_maximas_semanales: number;
  activo: boolean;
  usuario?: {
    correo_electronico?: string;
  };
}

interface Grupo {
  id_grupo: number;
  codigo_grupo: string;
  capacidad_maxima: number;
  cantidad_matriculados: number;
  curso: {
    nombre: string;
    codigo: string;
  };
  periodo: {
    nombre: string;
  };
}

interface ModalDocenteProps {
  abierto: boolean;
  alCerrar: () => void;
  idDocente: number | null;
}

export const ModalDocente: React.FC<ModalDocenteProps> = ({ abierto, alCerrar, idDocente }) => {
  const [docente, setDocente] = useState<Docente | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);

  useEffect(() => {
    if (abierto && idDocente) {
      cargarDocente();
      cargarPeriodos();
    }
  }, [abierto, idDocente]);

  const cargarDocente = async () => {
    try {
      const response = await fetch(`/api/docentes/${idDocente}`);
      const data = await response.json();
      
      if (data.exito && data.datos) {
        setDocente(data.datos);
      }
    } catch (error) {
      console.error('Error cargando docente:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarPeriodos = async () => {
    try {
      const response = await fetch('/api/periodos');
      const data = await response.json();
      
      if (data.exito && data.datos) {
        setPeriodos(data.datos);
        // Seleccionar el primer período por defecto
        if (data.datos.length > 0) {
          setPeriodoSeleccionado(data.datos[0].id_periodo);
        }
      }
    } catch (error) {
      console.error('Error cargando períodos:', error);
    }
  };

  useEffect(() => {
    if (periodoSeleccionado && idDocente) {
      cargarGrupos();
    }
  }, [periodoSeleccionado, idDocente]);

  const cargarGrupos = async () => {
    setCargandoGrupos(true);
    try {
      const response = await fetch(`/api/docentes/${idDocente}/grupos?id_periodo=${periodoSeleccionado}`);
      const data = await response.json();
      
      if (data.exito) {
        setGrupos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setCargandoGrupos(false);
    }
  };

  if (!abierto || !docente) return null;

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={`${docente.apellidos}, ${docente.nombres} (${docente.codigo_docente})`}
      tamaño="xl"
    >
      {cargando ? (
        <div className="flex justify-center py-8">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Información básica</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Modalidad</p>
                  <p className="text-gray-900 capitalize">{docente.modalidad || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Categoría</p>
                  <p className="text-gray-900 capitalize">{docente.categoria?.replace('_', ' ') || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Antigüedad (años)</p>
                  <p className="text-gray-900">{docente.antiguedad}</p>
                </div>
                {docente.fecha_ingreso && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Fecha de Ingreso</p>
                    <p className="text-gray-900">{new Date(docente.fecha_ingreso).toLocaleDateString('es-PE')}</p>
                  </div>
                )}
                {docente.dedicacion && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Dedicación</p>
                    <p className="text-gray-900 capitalize">{docente.dedicacion?.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Contacto</h3>
              <div className="space-y-2">
                {docente.correo_electronico && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Correo</p>
                    <p className="text-gray-900 break-all text-sm">{docente.correo_electronico}</p>
                  </div>
                )}
                {docente.telefono && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Teléfono</p>
                    <p className="text-gray-900">{docente.telefono}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información académica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Académica</h3>
              <div className="space-y-2">
                {docente.grado_academico && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Grado académico</p>
                    <p className="text-gray-900">{docente.grado_academico}</p>
                  </div>
                )}
                {docente.especialidad && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Especialidad</p>
                    <p className="text-gray-900">{docente.especialidad}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información laboral */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Laboral</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Horas máximas semanales</p>
                  <p className="text-gray-900">{docente.horas_maximas_semanales} hrs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
