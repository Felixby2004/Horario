'use client';

import { useEffect, useState } from 'react';

// Gráfico de ocupación de aulas
export const GraficoOcupacionAulas = ({ idPeriodo }: any) => {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [idPeriodo]);

  const cargarDatos = async () => {
    const response = await fetch(`/api/estadisticas/ocupacion-ambientes?periodo=${idPeriodo}&tipo=aula`);
    const data = await response.json();
    if (data.exito) setDatos(data.datos);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Ocupación de Aulas</h3>
      <div className="space-y-3">
        {datos.map((aula: any) => (
          <div key={aula.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{aula.nombre}</span>
              <span>{aula.porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${aula.porcentaje}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Gráfico de distribución por día
export const GraficoDistribucionDia = ({ idPeriodo }: any) => {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [idPeriodo]);

  const cargarDatos = async () => {
    const response = await fetch(`/api/estadisticas/distribucion-dia?periodo=${idPeriodo}`);
    const data = await response.json();
    if (data.exito) setDatos(data.datos);
  };

  const maxValor = Math.max(...datos.map(d => d.cantidad));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Distribución por Día</h3>
      <div className="flex items-end justify-between gap-2 h-64">
        {datos.map((dia: any) => (
          <div key={dia.dia} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col justify-end h-full">
              <div
                className="bg-primary-600 rounded-t"
                style={{ height: `${(dia.cantidad / maxValor) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm mt-2 font-medium">{dia.dia}</div>
            <div className="text-xs text-gray-600">{dia.cantidad}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Gráfico de carga docente
export const GraficoCargaDocente = ({ idPeriodo }: any) => {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [idPeriodo]);

  const cargarDatos = async () => {
    const response = await fetch(`/api/estadisticas/carga-docente?periodo=${idPeriodo}`);
    const data = await response.json();
    if (data.exito) setDatos(data.datos);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Carga por Docente (Top 10)</h3>
      <div className="space-y-2">
        {datos.slice(0, 10).map((docente: any, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 text-sm font-bold text-gray-600">{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm font-medium truncate">{docente.nombre}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary-600 h-1.5 rounded-full"
                  style={{ width: `${(docente.horas / 40) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-semibold">{docente.horas}h</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Actividad en tiempo real
export const ActividadTiempoReal = () => {
  const [actividades, setActividades] = useState<any[]>([]);

  useEffect(() => {
    const intervalo = setInterval(cargarActividades, 5000);
    cargarActividades();
    return () => clearInterval(intervalo);
  }, []);

  const cargarActividades = async () => {
    const response = await fetch('/api/auditoria/historial?limite=5');
    const data = await response.json();
    if (data.exito) setActividades(data.datos);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
      <div className="space-y-3">
        {actividades.map((act: any) => (
          <div key={act.id_auditoria} className="flex items-start gap-3 pb-3 border-b last:border-0">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">{act.accion}</div>
              <div className="text-xs text-gray-600">{act.usuario?.nombres}</div>
              <div className="text-xs text-gray-500">{new Date(act.fecha_hora).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Lista de últimas asignaciones
export const ListaUltimasAsignaciones = ({ idPeriodo }: any) => {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);

  useEffect(() => {
    cargarAsignaciones();
  }, [idPeriodo]);

  const cargarAsignaciones = async () => {
    const response = await fetch(`/api/horarios?periodo=${idPeriodo}&limite=10&orden=desc`);
    const data = await response.json();
    if (data.exito) setAsignaciones(data.datos);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Últimas Asignaciones</h3>
      <div className="space-y-2">
        {asignaciones.map((asig: any) => (
          <div key={asig.id_horario} className="p-3 bg-gray-50 rounded">
            <div className="font-medium text-sm">{asig.curso?.nombre}</div>
            <div className="text-xs text-gray-600 mt-1">
              {asig.docente?.apellidos} • {asig.dia_semana} {asig.hora_inicio}-{asig.hora_fin}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Alertas pendientes
export const AlertasPendientes = () => {
  const [alertas, setAlertas] = useState<any[]>([]);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    const response = await fetch('/api/horarios/conflictos');
    const data = await response.json();
    if (data.exito) setAlertas(data.conflictos || []);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Alertas Pendientes</h3>
      {alertas.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          ✅ No hay alertas pendientes
        </div>
      ) : (
        <div className="space-y-2">
          {alertas.map((alerta: any, i) => (
            <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="font-medium text-sm text-yellow-800">{alerta.tipo}</div>
              <div className="text-xs text-yellow-700 mt-1">{alerta.descripcion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
