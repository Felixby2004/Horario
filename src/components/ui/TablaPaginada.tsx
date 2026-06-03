import React from 'react';
import { TablaDatos, Columna } from './TablaDatos';
import { Boton } from './Boton';

interface TablaPaginadaProps<T> {
  datos: T[];
  columnas: Columna<T>[];
  keyField: keyof T;
  itemsPorPagina?: number;
  alHacerClic?: (item: T) => void;
}

export function TablaPaginada<T>({
  datos,
  columnas,
  keyField,
  itemsPorPagina = 8,
  alHacerClic
}: TablaPaginadaProps<T>) {
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [inputPagina, setInputPagina] = React.useState('');

  const totalPaginas = Math.ceil(datos.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const datosPagina = datos.slice(inicio, inicio + itemsPorPagina);

  const handleIrAPagina = () => {
    const num = parseInt(inputPagina);
    if (num >= 1 && num <= totalPaginas) {
      setPaginaActual(num);
      setInputPagina('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleIrAPagina();
    }
  };

  // Generate page numbers to display
  const getPaginasVisibles = () => {
    const paginas = [];
    const delta = 2; // Show 2 pages before and after current
    
    if (totalPaginas <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Show first page, last page, and current +- delta
      paginas.push(1);
      
      const start = Math.max(2, paginaActual - delta);
      const end = Math.min(totalPaginas - 1, paginaActual + delta);
      
      if (start > 2) {
        paginas.push(-1); // Represents ellipsis
      }
      
      for (let i = start; i <= end; i++) {
        paginas.push(i);
      }
      
      if (end < totalPaginas - 1) {
        paginas.push(-2); // Represents ellipsis
      }
      
      paginas.push(totalPaginas);
    }
    
    return paginas;
  };

  return (
    <div>
      <TablaDatos
        datos={datosPagina}
        columnas={columnas as any}
        keyField={keyField}
        alHacerClic={alHacerClic}
      />
      
      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 py-3 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {inicio + 1} a {Math.min(inicio + itemsPorPagina, datos.length)} de {datos.length} registros
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(1)}
              disabled={paginaActual === 1}
              tamaño="small"
            >
              ««
            </Boton>
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(p => p - 1)}
              disabled={paginaActual === 1}
              tamaño="small"
            >
              ‹
            </Boton>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPaginasVisibles().map((pagina, index) => (
                pagina < 0 ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                ) : (
                  <Boton
                    key={pagina}
                    variante={pagina === paginaActual ? 'primary' : 'secondary'}
                    onClick={() => setPaginaActual(pagina)}
                    tamaño="small"
                  >
                    {pagina}
                  </Boton>
                )
              ))}
            </div>
            
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(p => p + 1)}
              disabled={paginaActual === totalPaginas}
              tamaño="small"
            >
              ›
            </Boton>
            <Boton
              variante="secondary"
              onClick={() => setPaginaActual(totalPaginas)}
              disabled={paginaActual === totalPaginas}
              tamaño="small"
            >
              »»
            </Boton>
            
            {/* Direct page input */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-gray-500">Ir a:</span>
              <input
                type="number"
                min={1}
                max={totalPaginas}
                value={inputPagina}
                onChange={(e) => setInputPagina(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Boton
                variante="primary"
                onClick={handleIrAPagina}
                tamaño="small"
              >
                Ir
              </Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
