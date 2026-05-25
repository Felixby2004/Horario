'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState({
    totalDocentes: 0,
    totalCursos: 0,
    totalAmbientes: 0,
    totalHorarios: 0,
    totalGrupos: 0,
    totalUsuarios: 0,
    docentesPorCategoria: [],
    cursosPorCiclo: [],
    horariosRecientes: []
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Cargar todos los datos en paralelo
      const [resDocentes, resCursos, resAmbientes, resHorarios, resGrupos, resUsuarios] = await Promise.all([
        fetch('/api/docentes'),
        fetch('/api/cursos'),
        fetch('/api/ambientes'),
        fetch('/api/horarios'),
        fetch('/api/grupos'),
        fetch('/api/usuarios')
      ]);

      const [dataDocentes, dataCursos, dataAmbientes, dataHorarios, dataGrupos, dataUsuarios] = await Promise.all([
        resDocentes.json(),
        resCursos.json(),
        resAmbientes.json(),
        resHorarios.json(),
        resGrupos.json(),
        resUsuarios.json()
      ]);

      // Procesar datos
      const docentes = dataDocentes.datos || [];
      const cursos = dataCursos.datos || [];
      const horarios = dataHorarios.datos || [];

      // Contar por categoría
      const categorias = ['principal', 'asociado', 'auxiliar', 'jefe_practica'];
      const docentesPorCategoria = categorias.map(cat => ({
        categoria: cat,
        cantidad: docentes.filter((d: any) => d.categoria === cat).length
      }));

      // Contar por ciclo
      const ciclos = [...new Set(cursos.map((c: any) => c.ciclo))].filter(Boolean).sort();
      const cursosPorCiclo = ciclos.map(ciclo => ({
        ciclo,
        cantidad: cursos.filter((c: any) => c.ciclo === ciclo).length
      }));

      setEstadisticas({
        totalDocentes: docentes.length,
        totalCursos: cursos.length,
        totalAmbientes: dataAmbientes.datos?.length || 0,
        totalHorarios: horarios.length,
        totalGrupos: dataGrupos.datos?.length || 0,
        totalUsuarios: dataUsuarios.datos?.length || 0,
        docentesPorCategoria,
        cursosPorCiclo,
        horariosRecientes: horarios.slice(0, 5)
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión de horarios</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Docentes */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
             onClick={() => router.push('/dashboard/docentes')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total docentes</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalDocentes}</p>
            </div>
            <div className="text-5xl opacity-50">👨‍🏫</div>
          </div>
        </div>

        {/* Cursos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
             onClick={() => router.push('/dashboard/cursos')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total cursos</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalCursos}</p>
            </div>
            <div className="text-5xl opacity-50">📚</div>
          </div>
        </div>

        {/* Ambientes */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
             onClick={() => router.push('/dashboard/ambientes')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total ambientes</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalAmbientes}</p>
            </div>
            <div className="text-5xl opacity-50">🏫</div>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
             onClick={() => router.push('/dashboard/horarios')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Horarios asignados</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalHorarios}</p>
            </div>
            <div className="text-5xl opacity-50">🕐</div>
          </div>
        </div>

        {/* Grupos */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
             onClick={() => router.push('/dashboard/grupos')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total grupos</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalGrupos}</p>
            </div>
            <div className="text-5xl opacity-50">👥</div>
          </div>
        </div>

        {/* Usuarios */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow"
             onClick={() => router.push('/dashboard/usuarios')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total usuarios</p>
              <p className="text-4xl font-bold mt-2">{estadisticas.totalUsuarios}</p>
            </div>
            <div className="text-5xl opacity-50">👤</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Docentes por Categoría */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Docentes por categoría</h3>
          <div className="space-y-3">
            {estadisticas.docentesPorCategoria.map((item: any) => {
              const porcentaje = estadisticas.totalDocentes > 0 
                ? (item.cantidad / estadisticas.totalDocentes * 100).toFixed(1)
                : 0;
              
              const getCategoriaLabel = (cat: string) => {
                const labels: Record<string, string> = {
                  principal: 'Principal',
                  asociado: 'Asociado',
                  auxiliar: 'Auxiliar',
                  jefe_practica: 'Jefe de práctica'
                };
                return labels[cat] || cat;
              };

              return (
                <div key={item.categoria}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{getCategoriaLabel(item.categoria)}</span>
                    <span className="text-gray-600">{item.cantidad} ({porcentaje}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {estadisticas.totalDocentes === 0 && (
            <p className="text-center text-gray-500 py-4">No hay docentes registrados</p>
          )}
        </div>

        {/* Cursos por Ciclo */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cursos por ciclo</h3>
          <div className="space-y-3">
            {estadisticas.cursosPorCiclo.map((item: any) => {
              const porcentaje = estadisticas.totalCursos > 0
                ? (item.cantidad / estadisticas.totalCursos * 100).toFixed(1)
                : 0;
              
              return (
                <div key={item.ciclo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Ciclo {item.ciclo}</span>
                    <span className="text-gray-600">{item.cantidad} ({porcentaje}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {estadisticas.totalCursos === 0 && (
            <p className="text-center text-gray-500 py-4">No hay cursos registrados</p>
          )}
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Accesos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/dashboard/docentes/nuevo')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-3xl mb-2">➕</div>
            <div className="text-sm font-medium">Nuevo docente</div>
          </button>

          <button
            onClick={() => router.push('/dashboard/cursos/nuevo')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-3xl mb-2">📖</div>
            <div className="text-sm font-medium">Nuevo curso</div>
          </button>

          <button
            onClick={() => router.push('/dashboard/grupos/nuevo')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm font-medium">Nuevo grupo</div>
          </button>

          <button
            onClick={() => router.push('/dashboard/horarios')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm font-medium">Asignar horario</div>
          </button>
        </div>
      </div>
    </div>
  );
}
