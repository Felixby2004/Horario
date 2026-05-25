'use client';

import { useState, useEffect } from 'react';

// Gráfico de líneas de tendencia
export const GraficoTendencias = ({ datos }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Tendencias de Asignación</h3>
      <div className="h-64">
        <svg viewBox="0 0 500 200" className="w-full h-full">
          <polyline
            points={datos.map((d: any, i: number) => 
              `${(i * 500) / (datos.length - 1)},${200 - (d.valor * 180) / 100}`
            ).join(' ')}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

// Gráfico circular de tipos de curso
export const GraficoTiposCurso = ({ datos }: any) => {
  const total = datos.reduce((sum: number, d: any) => sum + d.cantidad, 0);
  let currentAngle = 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Distribución por Tipo</h3>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {datos.map((d: any, i: number) => {
            const angle = (d.cantidad / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = 100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            
            return (
              <path
                key={i}
                d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={colors[i % colors.length]}
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-4 space-y-2">
        {datos.map((d: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
            }} />
            <span className="text-sm">{d.nombre}: {d.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tabla de top docentes
export const TablaTopDocentes = ({ docentes }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top 10 Docentes por Carga</h3>
      <div className="space-y-2">
        {docentes.slice(0, 10).map((d: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 text-center font-bold text-primary-600">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium">{d.nombre}</div>
              <div className="text-sm text-gray-600">{d.categoria}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{d.horas}h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Panel de alertas críticas
export const PanelAlertasCriticas = ({ alertas }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🚨 Alertas Críticas</h3>
      <div className="space-y-3">
        {alertas.map((alerta: any, i: number) => (
          <div key={i} className={`p-4 rounded-lg border-l-4 ${
            alerta.nivel === 'critico' ? 'border-red-500 bg-red-50' :
            alerta.nivel === 'advertencia' ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <div className="font-medium">{alerta.titulo}</div>
            <div className="text-sm mt-1">{alerta.mensaje}</div>
          </div>
        ))}
      </div>
      {alertas.length === 0 && (
        <div className="text-center py-8 text-green-600">
          ✅ No hay alertas críticas
        </div>
      )}
    </div>
  );
};

// Calendario de eventos
export const CalendarioEventos = ({ eventos }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">📅 Próximos Eventos</h3>
      <div className="space-y-3">
        {eventos.map((evento: any, i: number) => (
          <div key={i} className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {new Date(evento.fecha).getDate()}
              </div>
              <div className="text-xs text-gray-600">
                {new Date(evento.fecha).toLocaleDateString('es', { month: 'short' })}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium">{evento.titulo}</div>
              <div className="text-sm text-gray-600">{evento.descripcion}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Medidor de progreso circular
export const MedidorProgresoCircular = ({ porcentaje, titulo }: any) => {
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;

  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <div className="relative inline-block">
        <svg width="140" height="140">
          <circle
            cx="70"
            cy="70"
            r={radio}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx="70"
            cy="70"
            r={radio}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl font-bold text-primary-600">
            {porcentaje}%
          </div>
        </div>
      </div>
      <div className="mt-4 font-medium">{titulo}</div>
    </div>
  );
};

// Timeline de actividad
export const TimelineActividad = ({ actividades }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Línea de Tiempo</h3>
      <div className="space-y-4">
        {actividades.map((act: any, i: number) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-primary-600 rounded-full" />
              {i < actividades.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-300 my-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="text-sm text-gray-600">{act.hora}</div>
              <div className="font-medium">{act.titulo}</div>
              <div className="text-sm text-gray-600">{act.descripcion}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
