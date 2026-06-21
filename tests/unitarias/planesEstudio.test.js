jest.mock('@/lib/prisma', () => ({
  prisma: {
    planEstudio: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    },
    curso: {
      findMany: jest.fn()
    },
    historialVersionPlanEstudio: {
      create: jest.fn()
    }
  }
}));

const {
  compararSnapshotsPlan,
  validarDatosPlan
} = require('@/lib/planesEstudio');

describe('planesEstudio', () => {
  it('detecta cursos agregados, eliminados y modificados entre versiones', () => {
    const anterior = {
      plan: {
        id_plan: 1,
        codigo: '2018',
        nombre: 'Plan 2018',
        anio_creacion: 2018,
        anio_vigencia: 2018,
        estado: true,
        resolucion_aprobacion: null,
        id_departamento: 1,
        escuela_profesional: 'Ingenieria de Sistemas',
        version_actual: 1,
        fecha_actualizacion: '2026-06-20T10:00:00.000Z'
      },
      cursos: [
        {
          id_curso: 1,
          codigo: 'CS101',
          nombre: 'Algoritmos',
          tipo_curso: 'O',
          ciclo: 1,
          creditos: 4,
          horas_teoria: 2,
          horas_practica: 2,
          horas_laboratorio: 0,
          horas_totales: 4,
          prerequisitos: null
        },
        {
          id_curso: 2,
          codigo: 'CS102',
          nombre: 'Programacion',
          tipo_curso: 'O',
          ciclo: 1,
          creditos: 3,
          horas_teoria: 2,
          horas_practica: 1,
          horas_laboratorio: 0,
          horas_totales: 3,
          prerequisitos: null
        }
      ]
    };

    const despues = {
      ...anterior,
      cursos: [
        {
          id_curso: 1,
          codigo: 'CS101',
          nombre: 'Algoritmos',
          tipo_curso: 'O',
          ciclo: 1,
          creditos: 5,
          horas_teoria: 3,
          horas_practica: 2,
          horas_laboratorio: 0,
          horas_totales: 5,
          prerequisitos: null
        },
        {
          id_curso: 3,
          codigo: 'CS103',
          nombre: 'Base de Datos',
          tipo_curso: 'EP',
          ciclo: 2,
          creditos: 4,
          horas_teoria: 2,
          horas_practica: 2,
          horas_laboratorio: 0,
          horas_totales: 4,
          prerequisitos: 'CS101 - Algoritmos'
        }
      ]
    };

    const resultado = compararSnapshotsPlan(anterior, despues);

    expect(resultado.cursosAgregados).toHaveLength(1);
    expect(resultado.cursosAgregados[0].codigo).toBe('CS103');
    expect(resultado.cursosEliminados).toHaveLength(1);
    expect(resultado.cursosEliminados[0].codigo).toBe('CS102');
    expect(resultado.cursosModificados).toHaveLength(1);
    expect(resultado.cursosModificados[0].codigo).toBe('CS101');
    expect(resultado.cursosModificados[0].cambios.creditos).toBeDefined();
  });

  it('valida campos obligatorios y años inválidos del plan', () => {
    const errores = validarDatosPlan({
      nombre: '',
      codigo: '',
      anio_creacion: 1800,
      anio_vigencia: 1700,
      id_departamento: 'abc'
    });

    expect(errores.nombre).toBeDefined();
    expect(errores.codigo).toBeDefined();
    expect(errores.anio_creacion).toBeDefined();
    expect(errores.anio_vigencia).toBeDefined();
    expect(errores.id_departamento).toBeDefined();
  });

  it('acepta identificadores numéricos válidos para la escuela profesional', () => {
    const errores = validarDatosPlan({
      nombre: 'Plan 2024',
      codigo: 'PLAN-2024',
      anio_creacion: 2024,
      anio_vigencia: 2024,
      id_departamento: '5'
    });

    expect(errores).toEqual({});
  });
});
