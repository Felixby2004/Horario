'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Selector } from '@/components/ui/Selector';
import { Alerta } from '@/components/ui/Alerta';

export default function ValidarHorariosPage() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultados, setResultados] = useState<any>(null);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    const response = await fetch('/api/periodos');
    const data = await response.json();
    if (data.exito) {
      setPeriodos(data.datos);
      if (data.datos.length > 0) {
        const activo = data.datos.find((p: any) => p.activo);
        setPeriodoSeleccionado(activo?.id_periodo || data.datos[0].id_periodo);
      }
    }
  };

  const validarTodo = async () => {
    if (!periodoSeleccionado) return;

    setValidando(true);
    setResultados(null);

    try {
      const response = await fetch(`/api/horarios/validar-todo?periodo=${periodoSeleccionado}`);
      const data = await response.json();
      
      if (data.exito) {
        setResultados(data.resultados);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setValidando(false);
    }
  };

  const exportarReporte = () => {
    if (!resultados) return;

    const texto = `REPORTE DE VALIDACIÓN DE HORARIOS
Período: ${periodos.find((p: any) => p.id_periodo === parseInt(periodoSeleccionado))?.nombre}
Fecha: ${new Date().toLocaleString()}

RESUMEN:
- Total de horarios: ${resultados.total}
- Válidos: ${resultados.validos}
- Con errores: ${resultados.errores}
- Con advertencias: ${resultados.advertencias}

CONFLICTOS DETECTADOS:
${resultados.conflictos?.map((c: any, i: number) => `
${i + 1}. ${c.tipo}
   ${c.descripcion}
`).join('') || 'No se detectaron conflictos'}
`;

    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validacion-horarios-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Validar Horarios</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <Selector
            etiqueta="Período Académico"
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            opciones={periodos.map((p: any) => ({
              valor: p.id_periodo,
              etiqueta: p.nombre
            }))}
          />

          <Boton
            onClick={validarTodo}
            disabled={validando || !periodoSeleccionado}
          >
            {validando ? 'Validando...' : 'Validar Todos los Horarios'}
          </Boton>
        </div>
      </div>

      {resultados && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{resultados.total}</div>
              <div className="text-sm text-blue-800">Total Horarios</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{resultados.validos}</div>
              <div className="text-sm text-green-800">Válidos</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{resultados.errores}</div>
              <div className="text-sm text-red-800">Con Errores</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{resultados.advertencias}</div>
              <div className="text-sm text-yellow-800">Advertencias</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Boton variante="secondary" onClick={exportarReporte}>
              Exportar Reporte
            </Boton>
          </div>

          {resultados.conflictos && resultados.conflictos.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold">Conflictos Detectados</h3>
              {resultados.conflictos.map((conflicto: any, i: number) => (
                <Alerta key={i} tipo="error" titulo={conflicto.tipo}>
                  {conflicto.descripcion}
                </Alerta>
              ))}
            </div>
          ) : (
            <Alerta tipo="success" titulo="Sin Conflictos">
              Todos los horarios están correctamente asignados sin conflictos.
            </Alerta>
          )}
        </div>
      )}
    </div>
  );
}
