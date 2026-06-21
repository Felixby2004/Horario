const { obtenerHorasMetaDocente, validarEnvioCargaAcademica } = require('@/lib/cargaAcademica');

describe('Validación de envío de carga académica', () => {
  it('usa la meta semanal del docente como referencia principal', () => {
    expect(
      obtenerHorasMetaDocente({
        horas_maximas_semanales: 16
      })
    ).toBe(16);
  });

  it('rechaza el envío cuando faltan rubros exigibles para la modalidad', () => {
    const validacion = validarEnvioCargaAcademica({
      docente: {
        dedicacion: 'tiempo_parcial_20',
        horas_maximas_semanales: 16
      },
      carga: {
        horas_lectivas: 12,
        horas_no_lectivas: 2,
        horas_preparacion: 2,
        horas_totales: 16,
        horas_meta: 16
      },
      actividades: [
        {
          tipo_actividad: 'tutoria_consejeria',
          horas_semanales: 2
        }
      ]
    });

    expect(validacion.valido).toBe(false);
    expect(validacion.rubrosFaltantes).toContain('responsabilidad_social');
    expect(validacion.mensaje).toMatch(/faltan/i);
  });

  it('rechaza el envío cuando el total semanal no coincide con la meta', () => {
    const validacion = validarEnvioCargaAcademica({
      docente: {
        dedicacion: 'tiempo_completo',
        horas_maximas_semanales: 40
      },
      carga: {
        horas_lectivas: 20,
        horas_no_lectivas: 10,
        horas_preparacion: 8,
        horas_totales: 38,
        horas_meta: 40
      },
      actividades: [
        { tipo_actividad: 'tutoria_consejeria', horas_semanales: 2 },
        { tipo_actividad: 'investigacion', horas_semanales: 2 },
        { tipo_actividad: 'responsabilidad_social', horas_semanales: 2 },
        { tipo_actividad: 'asesoria_tesis_jurado', horas_semanales: 2 },
        { tipo_actividad: 'perfeccionamiento', horas_semanales: 2 },
        {
          tipo_actividad: 'autoevaluacion_acreditacion',
          horas_semanales: 2,
          datos_sustento: { autoevaluacion_acreditacion_aprobada: true }
        }
      ]
    });

    expect(validacion.valido).toBe(false);
    expect(validacion.mensaje).toMatch(/total semanal debe ser 40/i);
  });
});
