const {
  obtenerLimitesNoLectivosPorModalidad,
  resolverModalidadCargaNoLectiva,
  validarAsignacionActividadNoLectiva
} = require('@/lib/cargaNoLectiva');

describe('Reglas de carga no lectiva', () => {
  it('resuelve la modalidad normativa desde la dedicacion del docente', () => {
    expect(
      resolverModalidadCargaNoLectiva({
        dedicacion: 'dedicacion_exclusiva'
      })
    ).toBe('DE');

    expect(
      resolverModalidadCargaNoLectiva({
        dedicacion: 'tiempo_parcial_12'
      })
    ).toBe('TP2');
  });

  it('redistribuye el limite cuando autoevaluacion no esta aprobada para modalidades que la permiten', () => {
    const resultado = obtenerLimitesNoLectivosPorModalidad({
      docente: { dedicacion: 'dedicacion_exclusiva' },
      autoevaluacionAprobada: false
    });

    expect(resultado.modalidad).toBe('DE');
    expect(resultado.limites.tutoria_consejeria).toBe(3);
    expect(resultado.limites.responsabilidad_social).toBe(3);
    expect(resultado.limites.autoevaluacion_acreditacion).toBe(0);
  });

  it('mantiene restricciones de tiempo parcial cuando la modalidad no permite el rubro', () => {
    const resultado = obtenerLimitesNoLectivosPorModalidad({
      docente: { dedicacion: 'tiempo_parcial_12' },
      autoevaluacionAprobada: false
    });

    expect(resultado.modalidad).toBe('TP2');
    expect(resultado.limites.tutoria_consejeria).toBe(1);
    expect(resultado.limites.responsabilidad_social).toBe(0);
    expect(resultado.limites.autoevaluacion_acreditacion).toBe(0);
  });

  it('calcula el limite de preparacion y evaluacion como la mitad de las horas lectivas', () => {
    const resultado = obtenerLimitesNoLectivosPorModalidad({
      docente: { dedicacion: 'tiempo_completo' },
      autoevaluacionAprobada: true,
      horasLectivas: 17
    });

    expect(resultado.limites.preparacion_evaluacion).toBe(9);
  });

  it('rechaza rubros no permitidos para la modalidad', () => {
    const validacion = validarAsignacionActividadNoLectiva({
      docente: { dedicacion: 'tiempo_parcial_12' },
      actividad: {
        tipo_actividad: 'investigacion',
        horas_semanales: 1
      },
      actividadesExistentes: []
    });

    expect(validacion.valido).toBe(false);
    expect(validacion.modalidad).toBe('TP2');
    expect(validacion.mensaje).toMatch(/no permite asignar horas/i);
  });

  it('rechaza autoevaluacion cuando no existe aprobacion formal', () => {
    const validacion = validarAsignacionActividadNoLectiva({
      docente: { dedicacion: 'dedicacion_exclusiva' },
      actividad: {
        tipo_actividad: 'autoevaluacion_acreditacion',
        horas_semanales: 1,
        datos_sustento: {
          numero_resolucion: 'RES-001'
        }
      },
      actividadesExistentes: []
    });

    expect(validacion.valido).toBe(false);
    expect(validacion.mensaje).toMatch(/aprobaci.n formal/i);
  });

  it('acepta autoevaluacion cuando la aprobacion formal esta sustentada', () => {
    const validacion = validarAsignacionActividadNoLectiva({
      docente: {
        dedicacion: 'dedicacion_exclusiva',
        departamento: {
          autoevaluacion_acreditacion_aprobada: true
        }
      },
      actividad: {
        tipo_actividad: 'autoevaluacion_acreditacion',
        horas_semanales: 2,
        datos_sustento: {
          numero_resolucion: 'RES-002'
        }
      },
      actividadesExistentes: []
    });

    expect(validacion.valido).toBe(true);
    expect(validacion.limite).toBe(2);
  });

  it('tolera datos_sustento con valores no estructurados sin romper el tipado ni la validacion', () => {
    const validacion = validarAsignacionActividadNoLectiva({
      docente: { dedicacion: 'dedicacion_exclusiva' },
      actividad: {
        tipo_actividad: 'investigacion',
        horas_semanales: 1,
        datos_sustento: 'texto-json-legacy'
      },
      actividadesExistentes: []
    });

    expect(validacion.valido).toBe(true);
    expect(validacion.modalidad).toBe('DE');
  });

  it('rechaza cuando el docente supera el limite acumulado del rubro', () => {
    const validacion = validarAsignacionActividadNoLectiva({
      docente: { dedicacion: 'docente_investigador' },
      actividad: {
        tipo_actividad: 'investigacion',
        horas_semanales: 2
      },
      actividadesExistentes: [
        {
          id_actividad: 10,
          tipo_actividad: 'investigacion',
          horas_semanales: 22
        }
      ]
    });

    expect(validacion.valido).toBe(false);
    expect(validacion.modalidad).toBe('DI');
    expect(validacion.horasAcumuladas).toBe(22);
    expect(validacion.horasDisponibles).toBe(1);
    expect(validacion.mensaje).toMatch(/m.ximo 23 hora/i);
  });
});
