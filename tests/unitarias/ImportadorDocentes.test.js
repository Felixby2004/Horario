jest.mock('@/lib/prisma', () => ({
  prisma: {
    docente: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    facultad: {
      findMany: jest.fn()
    },
    departamentoAcademico: {
      findMany: jest.fn()
    }
  }
}));

jest.mock('@/lib/docentesIntegridad', () => ({
  construirErroresFormularioDocente: jest.fn(() => ({})),
  fusionarErroresDocente: jest.fn((...colecciones) => Object.assign({}, ...colecciones)),
  normalizarTextoSimple: jest.fn((valor) => String(valor || '').trim()),
  validarUnicidadDocente: jest.fn(() => Promise.resolve({})),
  registrarHistorialImportacionDocente: jest.fn(() => Promise.resolve({ id_importacion: 1 }))
}));

const { prisma } = require('@/lib/prisma');
const { ImportadorDocentes } = require('@/services/importacion/ServiciosImportacion');
const { registrarHistorialImportacionDocente } = require('@/lib/docentesIntegridad');

describe('ImportadorDocentes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.facultad.findMany.mockResolvedValue([
      { id_facultad: 1, nombre: 'Ingenieria' }
    ]);
    prisma.departamentoAcademico.findMany.mockResolvedValue([
      { id_departamento: 10, nombre: 'Sistemas', id_facultad: 1 }
    ]);
    prisma.docente.findMany.mockResolvedValue([]);
  });

  it('marca duplicados internos durante la vista previa', async () => {
    const vistaPrevia = await ImportadorDocentes.generarVistaPreviaDesdeRegistros(
      [
        {
          codigo_docente: 'D001',
          nombres: 'ANA',
          apellidos: 'LOPEZ',
          modalidad: 'nombrado',
          categoria_ordinaria: 'principal',
          dedicacion: 'tiempo_completo',
          correo_electronico: 'ana@unt.edu',
          dni_docente: '12345678',
          fecha_ingreso: '2024-01-01',
          id_facultad: '1',
          id_departamento: '10'
        },
        {
          codigo_docente: 'D001',
          nombres: 'BERTA',
          apellidos: 'LOPEZ',
          modalidad: 'nombrado',
          categoria_ordinaria: 'principal',
          dedicacion: 'tiempo_completo',
          correo_electronico: 'ana@unt.edu',
          dni_docente: '12345678',
          fecha_ingreso: '2024-01-01',
          id_facultad: '1',
          id_departamento: '10'
        }
      ],
      'docentes.xlsx',
      'xlsx'
    );

    expect(vistaPrevia.registros[0].errores.length).toBeGreaterThan(0);
    expect(vistaPrevia.registros[1].errores.length).toBeGreaterThan(0);
  });

  it('crea registros válidos y guarda historial de importación', async () => {
    prisma.docente.create.mockResolvedValue({ id_docente: 7, codigo_docente: 'D007' });

    const resultado = await ImportadorDocentes.importarRegistrosConfirmados({
      nombreArchivo: 'docentes.xlsx',
      formato: 'xlsx',
      idUsuarioResponsable: 1,
      registros: [
        {
          seleccionado: true,
          datos: {
            codigo_docente: 'D007',
            nombres: 'MARIO',
            apellidos: 'RAMOS',
            modalidad: 'nombrado',
            categoria: 'principal',
            categoria_ordinaria: 'principal',
            dedicacion: 'tiempo_completo',
            tipo_dedicacion_laboral: 'tiempo_completo',
            correo_electronico: 'mario@unt.edu',
            dni_docente: '87654321',
            fecha_ingreso: '2024-03-01',
            id_facultad: '1',
            id_departamento: '10',
            horas_maximas_semanales: 40
          }
        }
      ]
    });

    expect(resultado.resumen.exitosos).toBe(1);
    expect(prisma.docente.create).toHaveBeenCalledTimes(1);
    expect(registrarHistorialImportacionDocente).toHaveBeenCalledTimes(1);
  });
});
