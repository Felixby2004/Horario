import React from 'react';
import { TablaDatos, ColumnaTabla } from './TablaDatos';
import { Boton } from './Boton';

interface TablaPaginadaProps<T> {
  datos: T[];
  columnas: ColumnaTabla<T>[];
  keyField: keyof T;
  itemsPorPagina?: number;
  alHacerClic?: (item: T) => void;
}

export function TablaPaginada<T>({
  datos,
  columnas,
  keyField,
  itemsPorPagina = 10,
  alHacerClic
}: TablaPaginadaProps<T>) {
  const [paginaActual, setPaginaActual] = React.useState(1);

  const totalPaginas = Math.ceil(datos.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const datosPagina = datos.slice(inicio, inicio + itemsPorPagina);

  return (
    <div>
      <TablaDatos
        datos={datosPagina}
        columnas={columnas}
        keyField={keyField}
        alHacerClic={alHacerClic}
      />
      
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center mt-4 px-4 py-3">
          <div className="text-sm text-gray-600">
            Mostrando {inicio + 1} a {Math.min(inicio + itemsPorPagina, datos.length)} de {datos.length}
          </div>
          <div className="flex gap-2">
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(1)}
              disabled={paginaActual === 1}
            >
              ««
            </Boton>
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(p => p - 1)}
              disabled={paginaActual === 1}
            >
              ‹
            </Boton>
            <span className="px-4 py-2 text-sm">
              Página {paginaActual} de {totalPaginas}
            </span>
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(p => p + 1)}
              disabled={paginaActual === totalPaginas}
            >
              ›
            </Boton>
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(totalPaginas)}
              disabled={paginaActual === totalPaginas}
            >
              »»
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}
