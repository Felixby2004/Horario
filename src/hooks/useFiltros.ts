import { useState, useMemo } from 'react';

export function useFiltros<T>(datos: T[]) {
  const [filtros, setFiltros] = useState<Record<string, any>>({});
  const [busqueda, setBusqueda] = useState('');

  const datosFiltrados = useMemo(() => {
    let resultado = datos;

    // Aplicar filtros
    Object.keys(filtros).forEach(campo => {
      const valor = filtros[campo];
      if (valor !== '' && valor !== null && valor !== undefined) {
        resultado = resultado.filter(item =>
          (item as any)[campo] === valor
        );
      }
    });

    // Aplicar búsqueda
    if (busqueda) {
      resultado = resultado.filter(item => {
        const valores = Object.values(item as any).join(' ').toLowerCase();
        return valores.includes(busqueda.toLowerCase());
      });
    }

    return resultado;
  }, [datos, filtros, busqueda]);

  const setFiltro = (campo: string, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setBusqueda('');
  };

  return {
    datosFiltrados,
    filtros,
    setFiltro,
    busqueda,
    setBusqueda,
    limpiarFiltros
  };
}
