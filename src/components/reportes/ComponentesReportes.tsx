'use client';

// Selector de tipo de reporte
export const SelectorTipoReporte = ({ onSeleccionar }: any) => {
  const tipos = [
    { id: 'aula', nombre: 'Horario por Aula', icono: '🏫' },
    { id: 'laboratorio', nombre: 'Horario por Laboratorio', icono: '🔬' },
    { id: 'docente', nombre: 'Horario por Docente', icono: '👨‍🏫' },
    { id: 'gestion', nombre: 'Reporte de Gestión', icono: '📊' },
    { id: 'conflictos', nombre: 'Reporte de Conflictos', icono: '⚠️' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {tipos.map((tipo) => (
        <button
          key={tipo.id}
          onClick={() => onSeleccionar(tipo.id)}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
        >
          <div className="text-4xl mb-2">{tipo.icono}</div>
          <div className="font-semibold">{tipo.nombre}</div>
        </button>
      ))}
    </div>
  );
};

// Botón de descargar PDF
export const BotonDescargarPDF = ({ onClick, generando = false }: any) => {
  return (
    <button
      onClick={onClick}
      disabled={generando}
      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
    >
      {generando ? (
        <>
          <span className="animate-spin">⏳</span>
          Generando...
        </>
      ) : (
        <>
          📄 Descargar PDF
        </>
      )}
    </button>
  );
};

// Visor de PDF
export const VisorPDF = ({ url }: any) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <iframe
        src={url}
        className="w-full h-[600px] border rounded"
        title="Vista previa del reporte"
      />
    </div>
  );
};

// Progreso de generación
export const ProgresoGeneracionPDF = ({ progreso }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Generando reporte</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso</span>
          <span>{progreso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
