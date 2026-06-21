jest.mock('@/lib/prisma', () => ({
  prisma: {
    cargaAcademica: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    actividadNoLectiva: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    docenteCurso: {
      findMany: jest.fn()
    }
  }
}));

const { prisma } = require('@/lib/prisma');
const actividadNoLectivaRoute = require('@/app/api/actividad-no-lectiva/route');
const actividadNoLectivaDetalleRoute = require('@/app/api/actividad-no-lectiva/[id]/route');

describe('API actividad no lectiva', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza crear una actividad cuando excede el limite de la modalidad', async () => {
    prisma.cargaAcademica.findUnique.mockResolvedValue({
      id_carga: 7,
      docente: {
        id_docente: 12,
        dedicacion: 'tiempo_parcial_12',
        departamento: null
      },
      actividades_no_lectivas: []
    });

    const request = {
      json: async () => ({
        id_carga: 7,
        tipo_actividad: 'investigacion',
        nombre: 'Proyecto de investigación',
        horas_semanales: 1
      })
    };

    const response = await actividadNoLectivaRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.modalidad).toBe('TP2');
    expect(body.mensaje).toMatch(/no permite asignar horas/i);
    expect(prisma.actividadNoLectiva.create).not.toHaveBeenCalled();
  });

  it('rechaza actualizar autoevaluacion sin aprobacion formal', async () => {
    prisma.actividadNoLectiva.findUnique.mockResolvedValue({
      id_actividad: 15,
      tipo_actividad: 'autoevaluacion_acreditacion',
      horas_semanales: 1,
      datos_sustento: {},
      carga_academica: {
        docente: {
          id_docente: 9,
          dedicacion: 'dedicacion_exclusiva',
          departamento: null
        },
        actividades_no_lectivas: []
      }
    });

    const request = {
      json: async () => ({
        horas_semanales: 2,
        datos_sustento: {
          numero_resolucion: 'RES-123'
        }
      })
    };

    const response = await actividadNoLectivaDetalleRoute.PUT(request, { params: { id: '15' } });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.mensaje).toMatch(/aprobaci.n formal/i);
    expect(prisma.actividadNoLectiva.update).not.toHaveBeenCalled();
  });
});
