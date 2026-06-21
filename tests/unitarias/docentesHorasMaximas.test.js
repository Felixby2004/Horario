const { calcularHorasMaximasSegunDedicacion } = require('@/lib/docentes');

describe('Horas máximas por dedicación', () => {
  it('retorna 40 horas para dedicación exclusiva', () => {
    expect(calcularHorasMaximasSegunDedicacion('dedicacion_exclusiva')).toBe(40);
  });
});
