'use client';

// Panel de preferencias de notificación
export const PanelPreferenciasNotificacion = ({ preferencias, onChange }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Preferencias de notificación</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferencias.correo}
            onChange={(e) => onChange({ ...preferencias, correo: e.target.checked })}
            className="w-5 h-5"
          />
          <span>📧 Correo Electrónico</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferencias.whatsapp}
            onChange={(e) => onChange({ ...preferencias, whatsapp: e.target.checked })}
            className="w-5 h-5"
          />
          <span>💬 WhatsApp</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferencias.telegram}
            onChange={(e) => onChange({ ...preferencias, telegram: e.target.checked })}
            className="w-5 h-5"
          />
          <span>📱 Telegram</span>
        </label>
      </div>
    </div>
  );
};

// Historial de notificaciones
export const HistorialNotificaciones = ({ notificaciones }: any) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Historial de Notificaciones</h3>
      </div>
      <div className="divide-y">
        {notificaciones.map((notif: any) => (
          <div key={notif.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{notif.asunto}</div>
                <div className="text-sm text-gray-600 mt-1">{notif.mensaje}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{notif.canal}</span>
                  <span>•</span>
                  <span>{notif.fecha}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                notif.estado === 'enviado' ? 'bg-green-100 text-green-800' :
                notif.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {notif.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Verificación de WhatsApp
export const VerificacionWhatsApp = ({ numero, onVerificar }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Verificar WhatsApp</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Número de WhatsApp</label>
          <input
            type="tel"
            placeholder="+51 999 999 999"
            className="w-full border rounded-lg p-2"
            value={numero}
            readOnly
          />
        </div>
        <button
          onClick={onVerificar}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Enviar Código de Verificación
        </button>
        <p className="text-sm text-gray-600">
          Te enviaremos un mensaje de prueba a este número
        </p>
      </div>
    </div>
  );
};
