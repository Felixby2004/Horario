import React from 'react';

// Soporta ambas estructuras para compatibilidad
interface ColumnaNueva {
  clave: string;
  etiqueta: string;
}

interface ColumnaAntigua<T = any> {
  campo: keyof T;
  encabezado: string;
  renderizar?: (valor: any, fila: T) => React.ReactNode;
}

type Columna<T = any> = ColumnaNueva | ColumnaAntigua<T>;

interface TablaDatosBaseProps {
  alHacerClic?: (fila: any) => void;
}

interface TablaDatosPropsNueva extends TablaDatosBaseProps {
  datos: any[];
  columnas: ColumnaNueva[];
}

interface TablaDatosPropsAntigua<T> extends TablaDatosBaseProps {
  datos: T[];
  columnas: ColumnaAntigua<T>[];
  keyField?: keyof T;
}

type TablaDatosProps<T = any> = TablaDatosPropsNueva | TablaDatosPropsAntigua<T>;

export function TablaDatos<T = any>(props: TablaDatosProps<T>) {
  const { datos, columnas } = props;
  const alHacerClic = (props as any).alHacerClic as ((fila: any) => void) | undefined;

  // Detectar si es estructura nueva o antigua
  const esEstructuraNueva = columnas.length > 0 && 'clave' in columnas[0];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((columna, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {esEstructuraNueva 
                  ? (columna as ColumnaNueva).etiqueta 
                  : (columna as ColumnaAntigua).encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {datos.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            datos.map((fila, filaIndex) => (
              <tr
                key={filaIndex}
                className={`hover:bg-gray-50${alHacerClic ? ' cursor-pointer' : ''}`}
                onClick={() => alHacerClic?.(fila)}
              >
                {columnas.map((columna, colIndex) => {
                  let contenido;

                  if (esEstructuraNueva) {
                    // Estructura nueva: usar clave directamente
                    const col = columna as ColumnaNueva;
                    contenido = fila[col.clave];
                  } else {
                    // Estructura antigua: usar campo y renderizar
                    const col = columna as ColumnaAntigua<T>;
                    const valor = fila[col.campo];
                    contenido = col.renderizar 
                      ? col.renderizar(valor, fila)
                      : String(valor ?? '');
                  }

                  return (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {contenido}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
