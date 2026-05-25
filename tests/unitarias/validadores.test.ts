import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValidadorHorario } from '@/services/horarios/ValidadorHorario';
import { validadores, formateadores } from '@/lib/utilidadesAvanzadas';

describe('ValidadorHorario', () => {
  it('debe detectar conflicto de horario', () => {
    const resultado = validadores.conflictoHorario(
      '08:00',
      '10:00',
      '09:00',
      '11:00'
    );
    expect(resultado).toBe(true);
  });

  it('no debe detectar conflicto cuando no se solapan', () => {
    const resultado = validadores.conflictoHorario(
      '08:00',
      '10:00',
      '10:00',
      '12:00'
    );
    expect(resultado).toBe(false);
  });
});

describe('Validadores', () => {
  it('debe validar correo electrónico', () => {
    expect(validadores.correo('usuario@example.com')).toBe(true);
    expect(validadores.correo('invalido')).toBe(false);
    expect(validadores.correo('sin@dominio')).toBe(false);
  });

  it('debe validar teléfono peruano', () => {
    expect(validadores.telefono('999888777')).toBe(true);
    expect(validadores.telefono('+51999888777')).toBe(true);
    expect(validadores.telefono('123456')).toBe(false);
  });

  it('debe validar código de docente', () => {
    expect(validadores.codigoDocente('123456')).toBe(true);
    expect(validadores.codigoDocente('1234567890')).toBe(true);
    expect(validadores.codigoDocente('123')).toBe(false);
  });

  it('debe validar password', () => {
    expect(validadores.password('12345678')).toBe(true);
    expect(validadores.password('123')).toBe(false);
  });

  it('debe validar hora', () => {
    expect(validadores.horaValida('08:00')).toBe(true);
    expect(validadores.horaValida('23:59')).toBe(true);
    expect(validadores.horaValida('24:00')).toBe(false);
    expect(validadores.horaValida('08:60')).toBe(false);
  });
});

describe('Formateadores', () => {
  it('debe formatear números', () => {
    expect(formateadores.numero(10.5, 2)).toBe('10.50');
    expect(formateadores.numero(100, 0)).toBe('100');
  });

  it('debe formatear porcentajes', () => {
    expect(formateadores.porcentaje(0.75)).toBe('75.0%');
    expect(formateadores.porcentaje(1)).toBe('100.0%');
  });

  it('debe formatear nombres completos', () => {
    expect(formateadores.nombreCompleto('Juan', 'Pérez García')).toBe('Pérez García, Juan');
  });

  it('debe formatear duraciones', () => {
    expect(formateadores.duracion(90)).toBe('1h 30m');
    expect(formateadores.duracion(45)).toBe('45m');
    expect(formateadores.duracion(120)).toBe('2h 0m');
  });

  it('debe formatear rangos horarios', () => {
    expect(formateadores.rangoHorario('08:00:00', '10:00:00')).toBe('08:00 - 10:00');
  });
});

describe('Utilidades de Fecha', () => {
  it('debe calcular diferencia de horas', () => {
    const { diferenciaHoras } = require('@/lib/utilidadesFecha').utilidadesFecha;
    expect(diferenciaHoras('08:00', '10:00')).toBe(2);
    expect(diferenciaHoras('08:30', '10:00')).toBe(1.5);
  });
});
