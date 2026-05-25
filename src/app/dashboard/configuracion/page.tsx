'use client';

import { useState } from 'react';
import { Pestanas } from '@/components/ui/Pestanas';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    bloques_horarios: 10,
    duracion_bloque: 90,
    hora_inicio: '07:00',
    hora_fin: '22:00',
    max_horas_docente: 40
  });

  const pestanas = [
    {
      id: 'general',
      titulo: 'General',
      contenido: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración General</h3>
          <div className="grid grid-cols-2 gap-4">
            <CampoTexto
              etiqueta="Bloques por día"
              type="number"
              value={config.bloques_horarios}
              onChange={(e) => setConfig({...config, bloques_horarios: parseInt(e.target.value)})}
            />
            <CampoTexto
              etiqueta="Duración bloque (min)"
              type="number"
              value={config.duracion_bloque}
              onChange={(e) => setConfig({...config, duracion_bloque: parseInt(e.target.value)})}
            />
            <CampoTexto
              etiqueta="Hora inicio"
              type="time"
              value={config.hora_inicio}
              onChange={(e) => setConfig({...config, hora_inicio: e.target.value})}
            />
            <CampoTexto
              etiqueta="Hora fin"
              type="time"
              value={config.hora_fin}
              onChange={(e) => setConfig({...config, hora_fin: e.target.value})}
            />
          </div>
          <Boton>Guardar Configuración</Boton>
        </div>
      )
    },
    {
      id: 'validaciones',
      titulo: 'Validaciones',
      contenido: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Validaciones</h3>
          <CampoTexto
            etiqueta="Máximo horas por docente"
            type="number"
            value={config.max_horas_docente}
            onChange={(e) => setConfig({...config, max_horas_docente: parseInt(e.target.value)})}
          />
          <Boton>Guardar</Boton>
        </div>
      )
    },
    {
      id: 'notificaciones',
      titulo: 'Notificaciones',
      contenido: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Notificaciones</h3>
          <p className="text-gray-600">Configurar canales y plantillas de notificaciones</p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <Pestanas pestanas={pestanas} />
      </div>
    </div>
  );
}
