jest.mock('@/lib/prisma', () => ({
  prisma: {
    cargaAcademica: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    historialCargaAcademica: {
      create: jest.fn()
    }
  }
}));

const { prisma } = require('@/lib/prisma');
const cargaAcademicaDetalleRoute = require('@/app/api/carga-academica/[id]/route');

describe('API carga académica [id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza enviar una carga cuando faltan rubros requeridos', async () => {
    prisma.cargaAcademica.findUnique.mockResolvedValue({
      id_carga: 4,
      estado: 'borrador',
      horas_lectivas: 12,
      horas_no_lectivas: 2,
      horas_preparacion: 2,
      horas_totales: 16,
      horas_meta: 16,
      docente: {
        dedicacion: 'tiempo_parcial_20',
        horas_maximas_semanales: 16,
        departamento: null
      },
      actividades_no_lectivas: [
        {
          tipo_actividad: 'tutoria_consejeria',
          horas_semanales: 2
        }
      ]
    });

    const request = {
      json: async () => ({
        estado: 'enviado',
        usuario_id: 7
      })
    };

    const response = await cargaAcademicaDetalleRoute.PUT(request, { params: { id: '4' } });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.rubros_faltantes).toContain('responsabilidad_social');
    expect(prisma.cargaAcademica.update).not.toHaveBeenCalled();
  });
});
