'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Selector } from '@/components/ui/Selector';
import { BotonDescargarPDF } from '@/components/reportes/ComponentesReportes';

// Página de reporte por aula
export function ReporteAulaPage() {
  const [periodos, setPeriodos] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [aulaSeleccionada, setAulaSeleccionada] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const resPeriodos = await fetch('/api/periodos');
    const dataPeriodos = await resPeriodos.json();
    if (dataPeriodos.exito) setPeriodos(dataPeriodos.datos);

    const resAulas = await fetch('/api/ambientes?tipo=aula');
    const dataAulas = await resAulas.json();
    if (dataAulas.exito) setAulas(dataAulas.datos);
  };

  const generarReporte = async () => {
    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/aula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periodo: periodoSeleccionado,
          id_ambiente: aulaSeleccionada
        })
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-aula-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      alert('Error generando reporte');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reporte de Horario por Aula</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <Selector
            etiqueta="Período Académico"
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            opciones={periodos.map((p: any) => ({
              valor: p.id_periodo,
              etiqueta: p.nombre
            }))}
          />
          
          <Selector
            etiqueta="Aula"
            value={aulaSeleccionada}
            onChange={(e) => setAulaSeleccionada(e.target.value)}
            opciones={aulas.map((a: any) => ({
              valor: a.id_ambiente,
              etiqueta: a.nombre
            }))}
          />
        </div>

        <div className="mt-6">
          <BotonDescargarPDF
            onClick={generarReporte}
            generando={generando}
          />
        </div>
      </div>
    </div>
  );
}

// Página de reporte de gestión
export function ReporteGestionPage() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    const response = await fetch('/api/periodos');
    const data = await response.json();
    if (data.exito) setPeriodos(data.datos);
  };

  const generarReporte = async () => {
    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/gestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_periodo: periodoSeleccionado })
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-gestion-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      alert('Error generando reporte');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reporte de Gestión</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <Selector
          etiqueta="Período Académico"
          value={periodoSeleccionado}
          onChange={(e) => setPeriodoSeleccionado(e.target.value)}
          opciones={periodos.map((p: any) => ({
            valor: p.id_periodo,
            etiqueta: p.nombre
          }))}
        />

        <div className="mt-6">
          <BotonDescargarPDF
            onClick={generarReporte}
            generando={generando}
          />
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Este reporte incluye:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Resumen ejecutivo del período</li>
            <li>Estadísticas de asignación por categoría</li>
            <li>Ocupación de ambientes</li>
            <li>Carga horaria por docente</li>
            <li>Distribución por día de la semana</li>
            <li>Gráficos y visualizaciones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Página de reporte de conflictos
export function ReporteConflictosPage() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [conflictos, setConflictos] = useState([]);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    const response = await fetch('/api/periodos');
    const data = await response.json();
    if (data.exito) setPeriodos(data.datos);
  };

  const cargarConflictos = async () => {
    if (!periodoSeleccionado) return;

    const response = await fetch(`/api/horarios/conflictos?periodo=${periodoSeleccionado}`);
    const data = await response.json();
    if (data.exito) {
      setConflictos(data.conflictos || []);
    }
  };

  useEffect(() => {
    cargarConflictos();
  }, [periodoSeleccionado]);

  const generarReporte = async () => {
    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/conflictos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_periodo: periodoSeleccionado })
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-conflictos-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      alert('Error generando reporte');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reporte de Conflictos</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <Selector
          etiqueta="Período Académico"
          value={periodoSeleccionado}
          onChange={(e) => setPeriodoSeleccionado(e.target.value)}
          opciones={periodos.map((p: any) => ({
            valor: p.id_periodo,
            etiqueta: p.nombre
          }))}
        />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              Conflictos Detectados: {conflictos.length}
            </div>
            <BotonDescargarPDF
              onClick={generarReporte}
              generando={generando}
            />
          </div>

          {conflictos.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              ✅ No se detectaron conflictos
            </div>
          ) : (
            <div className="space-y-3">
              {conflictos.map((c: any, i) => (
                <div key={i} className="p-4 bg-red-50 border border-red-200 rounded">
                  <div className="font-semibold text-red-800">{c.tipo}</div>
                  <div className="text-sm text-red-600 mt-1">{c.descripcion}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
