jest.mock('@/lib/prisma', () => ({
  prisma: {
    curso: {
      findMany: jest.fn()
    },
    departamentoAcademico: {
      findUnique: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

jest.mock('@/lib/planesEstudio', () => ({
  obtenerPlanesEstudioDisponibles: jest.fn(),
  obtenerCursosDePlan: jest.fn(),
  obtenerCursosDisponiblesParaAsignar: jest.fn(),
  obtenerPlanPorId: jest.fn(),
  obtenerSnapshotPlanEstudio: jest.fn(),
  registrarVersionPlanEstudio: jest.fn(),
  validarDatosPlan: jest.fn(() => ({})),
  validarDuplicidadPlan: jest.fn(() => Promise.resolve({}))
}));

jest.mock('@/lib/docentesIntegridad', () => ({
  obtenerUsuarioAutenticadoOpcional: jest.fn()
}));

const { prisma } = require('@/lib/prisma');
const planesEstudioLib = require('@/lib/planesEstudio');
const { obtenerUsuarioAutenticadoOpcional } = require('@/lib/docentesIntegridad');
const planesRoute = require('@/app/api/planes-estudio/route');
const planDetalleRoute = require('@/app/api/planes-estudio/[id]/route');

describe('API planes de estudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consolida totales del listado con una sola consulta de cursos', async () => {
    planesEstudioLib.obtenerPlanesEstudioDisponibles.mockResolvedValue([
      { id_plan: 1, codigo: 'PLAN-2024', nombre: 'Plan 2024' },
      { id_plan: 2, codigo: 'PLAN-2023', nombre: 'Plan 2023' }
    ]);
    prisma.curso.findMany.mockResolvedValue([
      { plan_estudios: 'PLAN-2024', creditos: 4 },
      { plan_estudios: ' PLAN-2024 ', creditos: 3 },
      { plan_estudios: 'PLAN-2023', creditos: 5 }
    ]);

    const response = await planesRoute.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.curso.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.curso.findMany).toHaveBeenCalledWith({
      where: {
        activo: true,
        plan_estudios: {
          in: ['PLAN-2024', 'PLAN-2023']
        }
      },
      select: {
        plan_estudios: true,
        creditos: true
      }
    });
    expect(body.datos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: 'PLAN-2024', total_cursos: 2, total_creditos: 7 }),
        expect.objectContaining({ codigo: 'PLAN-2023', total_cursos: 1, total_creditos: 5 })
      ])
    );
  });

  it('devuelve 500 en detalle cuando ocurre un fallo inesperado del servidor', async () => {
    planesEstudioLib.obtenerPlanPorId.mockRejectedValue(new Error('Fallo de base de datos'));

    const response = await planDetalleRoute.GET({}, { params: { id: '5' } });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.exito).toBe(false);
    expect(body.error).toMatch(/base de datos/i);
  });

  it('rechaza modificar cursos que no pertenecen al plan ni se agregan en la misma operación', async () => {
    planesEstudioLib.obtenerPlanPorId.mockResolvedValue({
      id_plan: 1,
      codigo: 'PLAN-2024',
      estado: true
    });
    prisma.departamentoAcademico.findUnique.mockResolvedValue({
      id_departamento: 5,
      nombre: 'Ingeniería de Sistemas'
    });
    prisma.curso.findMany
      .mockResolvedValueOnce([
        {
          id_curso: 10,
          codigo: 'CS999',
          nombre: 'Curso ajeno',
          plan_estudios: 'OTRO-PLAN',
          prerequisitos: null,
          tipo_curso: 'EP',
          ciclo: 5,
          creditos: 4,
          horas_teoria: 2,
          horas_practica: 2,
          horas_laboratorio: 0,
          activo: true
        }
      ])
      .mockResolvedValueOnce([{ id_curso: 1 }]);

    const request = {
      json: async () => ({
        codigo: 'PLAN-2024',
        nombre: 'Plan 2024',
        anio_creacion: 2024,
        anio_vigencia: 2024,
        estado: true,
        id_departamento: 5,
        cursos_modificados: [{ id_curso: 10, nombre: 'Curso ajeno modificado' }]
      })
    };

    const response = await planDetalleRoute.PUT(request, { params: { id: '1' } });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.error).toMatch(/modificar cursos del plan/i);
  });

  it('preserva datos omitidos del curso y convierte correctamente estado=false', async () => {
    const tx = {
      curso: {
        updateMany: jest.fn(),
        update: jest.fn().mockResolvedValue({})
      },
      planEstudio: {
        update: jest.fn().mockResolvedValue({})
      }
    };

    planesEstudioLib.obtenerPlanPorId
      .mockResolvedValueOnce({
        id_plan: 1,
        codigo: 'PLAN-2024',
        estado: true
      })
      .mockResolvedValueOnce({
        id_plan: 1,
        codigo: 'PLAN-2024',
        estado: false
      });
    planesEstudioLib.obtenerSnapshotPlanEstudio
      .mockResolvedValueOnce({ version: 'antes' })
      .mockResolvedValueOnce({ version: 'antes' });
    planesEstudioLib.obtenerCursosDePlan.mockResolvedValue([]);
    planesEstudioLib.obtenerCursosDisponiblesParaAsignar.mockResolvedValue([]);
    obtenerUsuarioAutenticadoOpcional.mockResolvedValue({ id_usuario: 99 });
    prisma.departamentoAcademico.findUnique.mockResolvedValue({
      id_departamento: 5,
      nombre: 'Ingeniería de Sistemas'
    });
    prisma.curso.findMany
      .mockResolvedValueOnce([
        {
          id_curso: 1,
          codigo: 'CS101',
          nombre: 'Algoritmos',
          plan_estudios: 'PLAN-2024',
          prerequisitos: 'MAT101 - Matemática',
          tipo_curso: 'EP',
          ciclo: 3,
          creditos: 4,
          horas_teoria: 2,
          horas_practica: 2,
          horas_laboratorio: 0,
          activo: true
        }
      ])
      .mockResolvedValueOnce([{ id_curso: 1 }]);
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const request = {
      json: async () => ({
        codigo: 'PLAN-2024',
        nombre: 'Plan actualizado',
        anio_creacion: 2024,
        anio_vigencia: 2025,
        estado: 'false',
        id_departamento: 5,
        descripcion_cambios: 'Ajuste general',
        cursos_modificados: [{ id_curso: 1, nombre: ' Algoritmos avanzados ' }]
      })
    };

    const response = await planDetalleRoute.PUT(request, { params: { id: '1' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(tx.planEstudio.update).toHaveBeenCalledWith({
      where: {
        id_plan: 1
      },
      data: expect.objectContaining({
        estado: false,
        codigo: 'PLAN-2024',
        nombre: 'Plan actualizado'
      })
    });
    expect(tx.curso.update).toHaveBeenCalledWith({
      where: {
        id_curso: 1
      },
      data: expect.objectContaining({
        nombre: 'Algoritmos avanzados',
        tipo_curso: 'EP',
        ciclo: 3,
        creditos: 4,
        horas_teoria: 2,
        horas_practica: 2,
        horas_laboratorio: 0,
        prerequisitos: 'MAT101 - Matemática',
        plan_estudios: 'PLAN-2024',
        id_departamento: 5,
        escuela_profesional: 'Ingeniería de Sistemas'
      })
    });
    expect(planesEstudioLib.registrarVersionPlanEstudio).not.toHaveBeenCalled();
  });
});
