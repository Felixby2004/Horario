jest.mock('@/lib/prisma', () => ({
  prisma: {
    docente: {
      findUnique: jest.fn()
    },
    cargaAcademica: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    docenteCurso: {
      findMany: jest.fn()
    }
  }
}));

const { prisma } = require('@/lib/prisma');
const cargaAcademicaRoute = require('@/app/api/carga-academica/route');

describe('API crear carga académica', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 404 cuando el docente no existe', async () => {
    prisma.docente.findUnique.mockResolvedValue(null);

    const request = {
      json: async () => ({
        id_docente: 77,
        id_periodo: 1
      })
    };

    const response = await cargaAcademicaRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.exito).toBe(false);
    expect(body.mensaje).toMatch(/docente no encontrado/i);
    expect(prisma.cargaAcademica.create).not.toHaveBeenCalled();
  });

  it('usa las horas máximas del docente para la meta al crear la carga', async () => {
    prisma.docente.findUnique.mockResolvedValue({
      id_docente: 8,
      horas_maximas_semanales: 16
    });
    prisma.cargaAcademica.findFirst.mockResolvedValue(null);
    prisma.cargaAcademica.create.mockResolvedValue({
      id_carga: 10,
      id_docente: 8,
      horas_meta: 16,
      actividades_no_lectivas: []
    });
    prisma.docenteCurso.findMany.mockResolvedValue([]);
    prisma.cargaAcademica.update.mockResolvedValue({
      id_carga: 10,
      id_docente: 8,
      horas_meta: 16,
      horas_lectivas: 0,
      horas_no_lectivas: 0,
      horas_preparacion: 0,
      horas_totales: 0,
      actividades_no_lectivas: []
    });

    const request = {
      json: async () => ({
        id_docente: 8,
        id_periodo: 1
      })
    };

    const response = await cargaAcademicaRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.cargaAcademica.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id_docente: 8,
          id_periodo: 1,
          horas_meta: 16
        })
      })
    );
  });

  it('retorna 400 cuando el id_docente no es válido en lugar de fallar con 500', async () => {
    const request = {
      json: async () => ({
        id_docente: 'undefined',
        id_periodo: 1
      })
    };

    const response = await cargaAcademicaRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.mensaje).toMatch(/deben ser válidos/i);
    expect(prisma.docente.findUnique).not.toHaveBeenCalled();
  });

  it('reutiliza una carga existente para evitar errores al crear duplicados', async () => {
    prisma.docente.findUnique.mockResolvedValue({
      id_docente: 8,
      horas_maximas_semanales: 16
    });
    prisma.cargaAcademica.findFirst.mockResolvedValue({
      id_carga: 20,
      id_docente: 8,
      id_periodo: 1,
      horas_meta: 16,
      actividades_no_lectivas: []
    });
    prisma.docenteCurso.findMany.mockResolvedValue([]);
    prisma.cargaAcademica.update.mockResolvedValue({
      id_carga: 20,
      id_docente: 8,
      id_periodo: 1,
      horas_meta: 16,
      horas_lectivas: 0,
      horas_no_lectivas: 0,
      horas_preparacion: 0,
      horas_totales: 0,
      actividades_no_lectivas: []
    });

    const request = {
      json: async () => ({
        id_docente: 8,
        id_periodo: 1
      })
    };

    const response = await cargaAcademicaRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.cargaAcademica.create).not.toHaveBeenCalled();
    expect(prisma.cargaAcademica.update).toHaveBeenCalled();
  });
});
