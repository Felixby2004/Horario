'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAlertasTemporales, Alerta } from '@/hooks/useAlertasTemporales';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';

interface AlertaContextType {
  exito: (titulo: string, mensaje: string, duracion?: number) => void;
  error: (titulo: string, mensaje: string, duracion?: number) => void;
  advertencia: (titulo: string, mensaje: string, duracion?: number) => void;
  info: (titulo: string, mensaje: string, duracion?: number) => void;
}

const AlertaContext = createContext<AlertaContextType | undefined>(undefined);

export function AlertaProvider({ children }: { children: ReactNode }) {
  const alertasHook = useAlertasTemporales();

  return (
    <AlertaContext.Provider
      value={{
        exito: alertasHook.exito,
        error: alertasHook.error,
        advertencia: alertasHook.advertencia,
        info: alertasHook.info
      }}
    >
      <ContenedorAlertas alertas={alertasHook.alertas} onEliminar={alertasHook.eliminarAlerta} />
      {children}
    </AlertaContext.Provider>
  );
}

export function useAlerta() {
  const context = useContext(AlertaContext);
  if (context === undefined) {
    throw new Error('useAlerta must be used within an AlertaProvider');
  }
  return context;
}
