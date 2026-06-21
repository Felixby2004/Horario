jest.mock('@/lib/prisma', () => ({
  prisma: {
    docente: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock('@/lib/docentes', () => ({
  normalizarPayloadDocente: jest.fn((payload) => payload),
  validarDatosDocente: jest.fn(() => [])
}));

jest.mock('@/lib/docentesIntegridad', () => ({
  construirErroresFormularioDocente: jest.fn(() => ({})),
  fusionarErroresDocente: jest.fn((...colecciones) => Object.assign({}, ...colecciones)),
  obtenerCambiosDocente: jest.fn(() => [{ campo: 'departamento', antes: 'A', despues: 'B' }]),
  obtenerUsuarioAutenticadoOpcional: jest.fn(async () => ({ id_usuario: 1 })),
  registrarHistorialEdicionDocente: jest.fn(async () => ({ id_historial_edicion: 1 })),
  validarUnicidadDocente: jest.fn(async () => ({}))
}));

jest.mock('@/lib/utilidadesFecha', () => ({
  utilidadesFecha: {
    calcularAntiguedad: jest.fn(() => 17)
  }
}));

const { prisma } = require('@/lib/prisma');
const docenteDetalleRoute = require('@/app/api/docentes/[id]/route');

describe('API editar docente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('actualiza usando relaciones de facultad y departamento en lugar de ids directos', async () => {
    prisma.docente.findUnique.mockResolvedValue({
      id_docente: 19,
      codigo_docente: 'DOC019',
      facultad: { id_facultad: 1, nombre: 'Ingeniería' },
      departamento: { id_departamento: 1, nombre: 'Ingeniería de sistemas' }
    });

    prisma.docente.update.mockResolvedValue({
      id_docente: 19,
      codigo_docente: 'DOC019',
      nombres: 'ROBERT JERRY',
      apellidos: 'SÁNCHEZ TICONA',
      modalidad: 'contratado',
      categoria: 'auxiliar',
      categoria_ordinaria: null,
      tipo_contrato: 'tipo_a1',
      tipo_extraordinario: null,
      dedicacion: 'tiempo_completo',
      tipo_dedicacion_laboral: 'tiempo_completo',
      fecha_ingreso: new Date('2008-12-05T00:00:00.000Z'),
      correo_electronico: 'rsanchez@unitru.edu.pe',
      telefono: '976825908',
      grado_academico: '',
      especialidad: '',
      dni_docente: '19082305',
      horas_maximas_semanales: 40,
      antiguedad: 17,
      escuela_profesional: 'Ingeniería de sistemas',
      facultad: { id_facultad: 1, nombre: 'Ingeniería' },
      departamento: { id_departamento: 1, nombre: 'Ingeniería de sistemas' }
    });

    const request = {
      json: async () => ({
        codigo_docente: 'DOC019',
        nombres: 'ROBERT JERRY',
        apellidos: 'SÁNCHEZ TICONA',
        modalidad: 'contratado',
        categoria: 'auxiliar',
        categoria_ordinaria: '',
        tipo_contrato: 'tipo_a1',
        tipo_extraordinario: '',
        dedicacion: 'tiempo_completo',
        tipo_dedicacion_laboral: 'tiempo_completo',
        fecha_ingreso: '2008-12-05',
        correo_electronico: 'rsanchez@unitru.edu.pe',
        telefono: '976825908',
        grado_academico: '',
        especialidad: '',
        dni_docente: '19082305',
        horas_maximas_semanales: 40,
        id_facultad: '1',
        id_departamento: '1',
        escuela_profesional: 'Ingeniería de sistemas',
        motivo_edicion: ''
      })
    };

    const response = await docenteDetalleRoute.PUT(request, { params: { id: '19' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.docente.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_docente: 19 },
        data: expect.objectContaining({
          facultad: {
            connect: {
              id_facultad: 1
            }
          },
          departamento: {
            connect: {
              id_departamento: 1
            }
          }
        }),
        include: {
          facultad: true,
          departamento: true
        }
      })
    );
  });
});
