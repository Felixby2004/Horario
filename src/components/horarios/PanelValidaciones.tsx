'use client';

interface Validacion {
  valido: boolean;
  mensaje: string;
  tipo: 'error' | 'warning' | 'info';
}

interface PanelValidacionesProps {
  validaciones: Validacion[];
}

export const PanelValidaciones: React.FC<PanelValidacionesProps> = ({ validaciones }) => {
  const errores = validaciones.filter(v => !v.valido && v.tipo === 'error');
  const advertencias = validaciones.filter(v => !v.valido && v.tipo === 'warning');
  const validas = validaciones.filter(v => v.valido);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Estado de Validaciones</h3>
      
      <div className="space-y-3">
        {errores.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="font-semibold text-red-800 mb-2">
              ❌ Errores ({errores.length})
            </div>
            {errores.map((v, i) => (
              <div key={i} className="text-sm text-red-700">• {v.mensaje}</div>
            ))}
          </div>
        )}

        {advertencias.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="font-semibold text-yellow-800 mb-2">
              ⚠️ Advertencias ({advertencias.length})
            </div>
            {advertencias.map((v, i) => (
              <div key={i} className="text-sm text-yellow-700">• {v.mensaje}</div>
            ))}
          </div>
        )}

        {validas.length > 0 && errores.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="font-semibold text-green-800">
              ✅ Todas las validaciones pasaron ({validas.length})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
