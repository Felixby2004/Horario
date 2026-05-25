'use client';

interface Docente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  modalidad: string;
  categoria: string;
  posicion: number;
}

interface ColaDocentesProps {
  docentes: Docente[];
  enAtencion?: number;
}

export const ColaDocentes: React.FC<ColaDocentesProps> = ({ docentes, enAtencion }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Cola de docentes</h3>
      
      <div className="space-y-2">
        {docentes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay docentes en cola
          </div>
        ) : (
          docentes.map((docente) => (
            <div
              key={docente.id_docente}
              className={`p-4 rounded-lg border-2 transition-colors ${
                enAtencion === docente.id_docente
                  ? 'bg-green-50 border-green-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    {docente.posicion}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {docente.apellidos}, {docente.nombres}
                    </div>
                    <div className="text-sm text-gray-600">
                      {docente.codigo_docente} • {docente.modalidad} - {docente.categoria}
                    </div>
                  </div>
                </div>
                {enAtencion === docente.id_docente && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    En atención
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
