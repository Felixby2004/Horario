import { useState, ChangeEvent } from 'react';

export function useFormulario<T extends Record<string, any>>(valoresIniciales: T) {
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [errores, setErrores] = useState<Partial<Record<keyof T, string>>>({});
  const [tocado, setTocado] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = (campo: keyof T, valor: any) => {
    setValores(prev => ({ ...prev, [campo]: valor }));
    setTocado(prev => ({ ...prev, [campo]: true }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const valorFinal = type === 'number' ? parseFloat(value) : value;
    handleChange(name as keyof T, valorFinal);
  };

  const setError = (campo: keyof T, mensaje: string) => {
    setErrores(prev => ({ ...prev, [campo]: mensaje }));
  };

  const limpiarError = (campo: keyof T) => {
    setErrores(prev => {
      const nuevos = { ...prev };
      delete nuevos[campo];
      return nuevos;
    });
  };

  const validar = (reglas: Partial<Record<keyof T, (valor: any) => string | undefined>>) => {
    const nuevosErrores: Partial<Record<keyof T, string>> = {};
    let esValido = true;

    Object.keys(reglas).forEach((campo) => {
      const regla = reglas[campo as keyof T];
      if (regla) {
        const error = regla(valores[campo as keyof T]);
        if (error) {
          nuevosErrores[campo as keyof T] = error;
          esValido = false;
        }
      }
    });

    setErrores(nuevosErrores);
    return esValido;
  };

  const resetear = () => {
    setValores(valoresIniciales);
    setErrores({});
    setTocado({});
  };

  return {
    valores,
    errores,
    tocado,
    handleChange,
    handleInputChange,
    setError,
    limpiarError,
    validar,
    resetear
  };
}
