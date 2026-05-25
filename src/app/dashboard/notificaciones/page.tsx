'use client';

import { useState, useEffect } from 'react';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones');
      const data = await response.json();
      if (data.exito) {
        setNotificaciones(data.datos || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const enviarNotificacionPrueba = async () => {
    try {
      await fetch('/api/notificaciones/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'prueba',
          mensaje: 'Notificación de prueba desde el sistema'
        })
      });
      alert('Notificación de prueba enviada');
      cargarNotificaciones();
    } catch (error) {
      alert('Error al enviar notificación');
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        <Boton onClick={enviarNotificacionPrueba}>
          Enviar Notificación de Prueba
        </Boton>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Historial de Notificaciones</h3>
        
        {notificaciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay notificaciones registradas
          </div>
        ) : (
          <TablaDatos
            columnas={[
              { clave: 'tipo', etiqueta: 'Tipo' },
              { clave: 'canal', etiqueta: 'Canal' },
              { clave: 'estado', etiqueta: 'Estado' },
              { clave: 'fecha', etiqueta: 'Fecha' }
            ]}
            datos={notificaciones.map((n: any) => ({
              tipo: n.tipo_notificacion,
              canal: n.canal,
              estado: n.estado_envio,
              fecha: new Date(n.fecha_creacion).toLocaleString()
            }))}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {notificaciones.filter((n: any) => n.estado_envio === 'enviado').length}
          </div>
          <div className="text-sm text-gray-600">Enviadas</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {notificaciones.filter((n: any) => n.estado_envio === 'entregado').length}
          </div>
          <div className="text-sm text-gray-600">Entregadas</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {notificaciones.filter((n: any) => n.estado_envio === 'fallido').length}
          </div>
          <div className="text-sm text-gray-600">Fallidas</div>
        </div>
      </div>
    </div>
  );
}
