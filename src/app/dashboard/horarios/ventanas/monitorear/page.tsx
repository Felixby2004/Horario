'use client';

import { useState, useEffect } from 'react';
import { MonitorVentanas } from '@/components/ventanas/ComponentesVentanas';
import { ColaDocentes } from '@/components/ventanas/ColaDocentes';
import { Boton } from '@/components/ui/Boton';

export default function MonitorearVentanasPage() {
  const [ventanas, setVentanas] = useState([]);
  const [ventanaSeleccionada, setVentanaSeleccionada] = useState<any>(null);
  const [cola, setCola] = useState([]);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarVentanas();
    const intervalo = setInterval(cargarVentanas, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (ventanaSeleccionada) {
      cargarCola(ventanaSeleccionada.id_ventana);
    }
  }, [ventanaSeleccionada]);

  const cargarVentanas = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/ventanas-atencion?fecha=${hoy}`);
      const data = await response.json();
      if (data.exito) {
        setVentanas(data.datos.map((v: any) => ({
          id: v.id_ventana,
          numero: v.id_ventana,
          activa: v.estado === 'activa',
          cola: v.cola_docentes?.length || 0,
          tiempoPromedio: 15
        })));
        
        if (data.datos.length > 0 && !ventanaSeleccionada) {
          setVentanaSeleccionada(data.datos[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando ventanas:', error);
    }
  };

  const cargarCola = async (idVentana: number) => {
    try {
      const response = await fetch(`/api/ventanas-atencion/${idVentana}/cola`);
      const data = await response.json();
      if (data.exito) {
        setCola(data.datos);
      }
    } catch (error) {
      console.error('Error cargando cola:', error);
    }
  };

  const activarVentana = async (idVentana: number) => {
    setActualizando(true);
    try {
      const response = await fetch(`/api/ventanas-atencion/${idVentana}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'activa' })
      });

      if (response.ok) {
        cargarVentanas();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monitoreo de Ventanas en Vivo</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Actualizando en vivo</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <MonitorVentanas ventanas={ventanas} />
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Boton
                onClick={() => ventanaSeleccionada && activarVentana(ventanaSeleccionada.id_ventana)}
                disabled={actualizando}
                className="w-full"
              >
                Activar Ventana
              </Boton>
              <Boton
                variante="secondary"
                onClick={cargarVentanas}
                className="w-full"
              >
                Actualizar Ahora
              </Boton>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Estadísticas del Día</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Docentes atendidos:</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo promedio:</span>
                <span className="font-semibold">15 min</span>
              </div>
              <div className="flex justify-between">
                <span>En cola:</span>
                <span className="font-semibold">{cola.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ventanaSeleccionada && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Cola - Ventana {ventanaSeleccionada.id_ventana}
          </h2>
          <ColaDocentes docentes={cola} />
        </div>
      )}
    </div>
  );
}
