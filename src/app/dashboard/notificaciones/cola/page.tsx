'use client';

import { useState, useEffect } from 'react';
import { ColaNotificaciones } from '@/components/notificaciones/ComponentesNotificacionesAvanzados';
import { Boton } from '@/components/ui/Boton';

export default function ColaNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    pendientes: 0,
    procesando: 0,
    enviadas: 0,
    fallidas: 0
  });

  useEffect(() => {
    cargarCola();
    const intervalo = setInterval(cargarCola, 3000); // Actualizar cada 3 segundos
    return () => clearInterval(intervalo);
  }, []);

  const cargarCola = async () => {
    try {
      const response = await fetch('/api/notificaciones/cola');
      const data = await response.json();
      if (data.exito) {
        setNotificaciones(data.datos);
        calcularEstadisticas(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calcularEstadisticas = (notifs: any[]) => {
    setEstadisticas({
      pendientes: notifs.filter(n => n.estado === 'pendiente').length,
      procesando: notifs.filter(n => n.estado === 'procesando').length,
      enviadas: notifs.filter(n => n.estado === 'enviado').length,
      fallidas: notifs.filter(n => n.estado === 'fallido').length
    });
  };

  const limpiarEnviadas = async () => {
    if (!confirm('¿Limpiar notificaciones enviadas de la cola?')) return;

    try {
      const response = await fetch('/api/notificaciones/cola/limpiar', {
        method: 'POST'
      });
      if (response.ok) {
        cargarCola();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const reintentarFallidas = async () => {
    try {
      const response = await fetch('/api/notificaciones/cola/reintentar', {
        method: 'POST'
      });
      if (response.ok) {
        cargarCola();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cola de Notificaciones</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Actualizando en tiempo real</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
          <div className="text-sm text-yellow-800">Pendientes</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{estadisticas.procesando}</div>
          <div className="text-sm text-blue-800">Procesando</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{estadisticas.enviadas}</div>
          <div className="text-sm text-green-800">Enviadas</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{estadisticas.fallidas}</div>
          <div className="text-sm text-red-800">Fallidas</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Boton onClick={limpiarEnviadas} variante="secondary">
          Limpiar Enviadas
        </Boton>
        <Boton onClick={reintentarFallidas}>
          Reintentar Fallidas
        </Boton>
      </div>

      <ColaNotificaciones notificaciones={notificaciones} />
    </div>
  );
}
