'use client';

import { useState } from 'react';

// Cola de notificaciones en tiempo real
export const ColaNotificaciones = ({ notificaciones }: any) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Cola de notificaciones</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notificaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay notificaciones pendientes
          </div>
        ) : (
          <div className="divide-y">
            {notificaciones.map((notif: any) => (
              <div key={notif.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{notif.destinatario}</div>
                    <div className="text-sm text-gray-600 mt-1">{notif.asunto}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {notif.canal}
                      </span>
                      <span className="text-xs text-gray-500">
                        {notif.intentos} intento(s)
                      </span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    notif.estado === 'pendiente' ? 'bg-yellow-500' :
                    notif.estado === 'procesando' ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Configuración de plantillas
export const ConfiguracionPlantillas = ({ plantillas, onGuardar }: any) => {
  const [plantillaActiva, setPlantillaActiva] = useState(plantillas[0]);
  const [contenido, setContenido] = useState(plantillaActiva?.contenido || '');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Plantillas de Notificaciones</h3>
      </div>
      <div className="grid grid-cols-3">
        <div className="border-r">
          <div className="p-4 space-y-2">
            {plantillas.map((plantilla: any) => (
              <button
                key={plantilla.id}
                onClick={() => {
                  setPlantillaActiva(plantilla);
                  setContenido(plantilla.contenido);
                }}
                className={`w-full text-left px-3 py-2 rounded ${
                  plantillaActiva?.id === plantilla.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{plantilla.nombre}</div>
                <div className="text-xs text-gray-600">{plantilla.tipo}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2 p-4">
          {plantillaActiva && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  value={plantillaActiva.asunto}
                  className="w-full border rounded-lg px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contenido
                </label>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 h-64"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Variables disponibles: {'{'}nombre{'}'}, {'{'}curso{'}'}, {'{'}fecha{'}'}, {'{'}hora{'}'}
                </p>
              </div>
              <button
                onClick={() => onGuardar?.(plantillaActiva.id, contenido)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Editor de plantilla
export const EditorPlantilla = ({ plantilla, onChange }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Nombre de la plantilla</label>
        <input
          type="text"
          value={plantilla.nombre}
          onChange={(e) => onChange({ ...plantilla, nombre: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Tipo</label>
        <select
          value={plantilla.tipo}
          onChange={(e) => onChange({ ...plantilla, tipo: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="recordatorio">Recordatorio</option>
          <option value="confirmacion">Confirmación</option>
          <option value="alerta">Alerta</option>
          <option value="notificacion">Notificación General</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Asunto</label>
        <input
          type="text"
          value={plantilla.asunto}
          onChange={(e) => onChange({ ...plantilla, asunto: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contenido</label>
        <textarea
          value={plantilla.contenido}
          onChange={(e) => onChange({ ...plantilla, contenido: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 h-48"
        />
      </div>
    </div>
  );
};

// Vista previa de notificación
export const VistaPreviaNotificacion = ({ plantilla, datos = {} }: any) => {
  const procesarPlantilla = (texto: string) => {
    let resultado = texto;
    Object.entries(datos).forEach(([key, value]) => {
      resultado = resultado.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return resultado;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Vista Previa</h3>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="font-medium mb-2">
          {procesarPlantilla(plantilla.asunto)}
        </div>
        <div className="text-sm whitespace-pre-line">
          {procesarPlantilla(plantilla.contenido)}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Canal:</strong> Email, WhatsApp, Telegram
      </div>
    </div>
  );
};

// QR de Telegram
export const QRTelegram = ({ chatId }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <h3 className="font-semibold mb-4">Conectar con Telegram</h3>
      <div className="inline-block bg-gray-100 p-4 rounded-lg">
        {/* QR Code placeholder */}
        <div className="w-48 h-48 bg-white flex items-center justify-center border-2 border-dashed">
          QR Code
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Escanea este código con Telegram para vincular tu cuenta
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Chat ID: {chatId || 'Pendiente'}
      </p>
    </div>
  );
};
