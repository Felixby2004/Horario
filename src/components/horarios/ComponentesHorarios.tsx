'use client';

// Vista de horario por aula
export const VistaHorarioAula = ({ horarios }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Horario por Aula</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Hora</th>
            <th className="border p-2">Lunes</th>
            <th className="border p-2">Martes</th>
            <th className="border p-2">Miércoles</th>
            <th className="border p-2">Jueves</th>
            <th className="border p-2">Viernes</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map((fila: any, i: number) => (
            <tr key={i}>
              <td className="border p-2 font-medium">{fila.hora}</td>
              {fila.dias.map((dia: any, j: number) => (
                <td key={j} className="border p-2">
                  {dia.curso && (
                    <div className="text-sm">
                      <div className="font-medium">{dia.curso}</div>
                      <div className="text-gray-600">{dia.docente}</div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Panel de selección de curso
export const PanelSeleccionCurso = ({ cursos, onSeleccionar }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="font-semibold mb-3">Seleccionar Curso</h4>
      <select
        onChange={(e) => onSeleccionar(parseInt(e.target.value))}
        className="w-full border rounded-lg p-2"
      >
        <option value="">-- Seleccione --</option>
        {cursos.map((curso: any) => (
          <option key={curso.id_curso} value={curso.id_curso}>
            {curso.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

// Selector de ambiente
export const SelectorAmbiente = ({ ambientes, onSeleccionar }: any) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Ambiente</label>
      <select
        onChange={(e) => onSeleccionar(parseInt(e.target.value))}
        className="w-full border rounded-lg p-2"
      >
        <option value="">-- Seleccione --</option>
        {ambientes.map((ambiente: any) => (
          <option key={ambiente.id_ambiente} value={ambiente.id_ambiente}>
            {ambiente.nombre} ({ambiente.tipo})
          </option>
        ))}
      </select>
    </div>
  );
};

// Indicador de progreso de horas
export const IndicadorProgresoHoras = ({ actual, total }: any) => {
  const porcentaje = (actual / total) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>Horas asignadas</span>
        <span>{actual}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
};
