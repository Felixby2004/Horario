'use client';

// Configurador de ventanas
export const ConfiguradorVentanas = ({ onGuardar }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Configurar ventana de atención</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input type="date" className="w-full border rounded-lg p-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hora Inicio</label>
            <input type="time" className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hora Fin</label>
            <input type="time" className="w-full border rounded-lg p-2" />
          </div>
        </div>
        <button
          onClick={onGuardar}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
        >
          Guardar Ventana
        </button>
      </div>
    </div>
  );
};

// Monitor de ventanas
export const MonitorVentanas = ({ ventanas }: any) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {ventanas.map((ventana: any) => (
        <div key={ventana.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Ventana {ventana.numero}</h4>
            <span className={`px-2 py-1 rounded text-xs ${
              ventana.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {ventana.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div>Docentes en cola: {ventana.cola}</div>
            <div>Tiempo promedio: {ventana.tiempoPromedio} min</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Panel de llamar siguiente
export const PanelLlamarSiguiente = ({ onLlamar }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <h3 className="text-lg font-semibold mb-4">Atención de Docentes</h3>
      <button
        onClick={onLlamar}
        className="bg-primary-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-primary-700"
      >
        🔔 Llamar Siguiente
      </button>
      <p className="text-sm text-gray-600 mt-4">
        Presiona para llamar al siguiente docente en cola
      </p>
    </div>
  );
};

// Temporizador de ventana
export const TemporizadorVentana = ({ segundos }: any) => {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <div className="text-sm text-gray-600 mb-2">Tiempo de atención</div>
      <div className="text-4xl font-bold text-primary-600">
        {String(minutos).padStart(2, '0')}:{String(segs).padStart(2, '0')}
      </div>
    </div>
  );
};
