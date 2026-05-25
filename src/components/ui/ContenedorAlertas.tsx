'use client';

import { Alerta } from '@/hooks/useAlertasTemporales';

interface ContenedorAlertasProps {
  alertas: Alerta[];
  onEliminar?: (id: string) => void;
  eliminarAlerta?: (id: string) => void;
}

export function ContenedorAlertas({ alertas, onEliminar, eliminarAlerta }: ContenedorAlertasProps) {
  const handlerEliminar =
    typeof onEliminar === 'function'
      ? onEliminar
      : typeof eliminarAlerta === 'function'
        ? eliminarAlerta
        : undefined;

  const obtenerEstilos = (tipo: Alerta['tipo']) => {
    const estilos = {
      exito: {
        contenedor: 'bg-green-50 border border-green-300',
        titulo: 'text-green-900 font-semibold',
        mensaje: 'text-green-800',
        icono: '✅',
        boton: 'text-green-600 hover:text-green-800'
      },
      error: {
        contenedor: 'bg-red-50 border border-red-300',
        titulo: 'text-red-900 font-semibold',
        mensaje: 'text-red-800',
        icono: '❌',
        boton: 'text-red-600 hover:text-red-800'
      },
      advertencia: {
        contenedor: 'bg-yellow-50 border border-yellow-300',
        titulo: 'text-yellow-900 font-semibold',
        mensaje: 'text-yellow-800',
        icono: '⚠️',
        boton: 'text-yellow-600 hover:text-yellow-800'
      },
      info: {
        contenedor: 'bg-blue-50 border border-blue-300',
        titulo: 'text-blue-900 font-semibold',
        mensaje: 'text-blue-800',
        icono: 'ℹ️',
        boton: 'text-blue-600 hover:text-blue-800'
      }
    };

    return estilos[tipo];
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md pointer-events-none">
      {alertas.map((alerta) => {
        const estilos = obtenerEstilos(alerta.tipo);

        return (
          <div
            key={alerta.id}
            className={`${estilos.contenedor} rounded-lg p-4 shadow-lg animate-slide-in pointer-events-auto`}
          >
            <div className="flex gap-3">
              <div className="text-xl flex-shrink-0 mt-0.5">{estilos.icono}</div>
              <div className="flex-1">
                <h4 className={estilos.titulo}>{alerta.titulo}</h4>
                <p className={`text-sm mt-1 ${estilos.mensaje}`}>{alerta.mensaje}</p>
              </div>
              <button
                onClick={() => handlerEliminar?.(alerta.id)}
                className={`flex-shrink-0 text-xl leading-none ${estilos.boton} transition-colors`}
              >
                ✕
              </button>
            </div>

            {/* Barra de progreso */}
            {alerta.duracion && alerta.duracion > 0 && (
              <div className="mt-3 h-1 bg-current opacity-20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-current opacity-50 rounded-full"
                  style={{
                    animation: `shrink ${alerta.duracion}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
