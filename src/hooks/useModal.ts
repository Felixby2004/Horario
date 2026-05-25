import { useState } from 'react';

export function useModal() {
  const [abierto, setAbierto] = useState(false);

  const abrir = () => setAbierto(true);
  const cerrar = () => setAbierto(false);
  const alternar = () => setAbierto(!abierto);

  return {
    abierto,
    abrir,
    cerrar,
    alternar
  };
}
