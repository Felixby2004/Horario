import { useState, useMemo } from 'react';

export function usePaginacion<T>(datos: T[], itemsPorPagina: number = 10) {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(datos.length / itemsPorPagina);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return datos.slice(inicio, fin);
  }, [datos, paginaActual, itemsPorPagina]);

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const siguiente = () => irAPagina(paginaActual + 1);
  const anterior = () => irAPagina(paginaActual - 1);
  const primera = () => irAPagina(1);
  const ultima = () => irAPagina(totalPaginas);

  return {
    datosPaginados,
    paginaActual,
    totalPaginas,
    irAPagina,
    siguiente,
    anterior,
    primera,
    ultima,
    hayAnterior: paginaActual > 1,
    haySiguiente: paginaActual < totalPaginas
  };
}
