jest.mock('@/lib/prisma', () => ({
  prisma: {
    curso: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    cursoPrerequisito: {
      deleteMany: jest.fn()
    },
    departamentoAcademico: {
      findFirst: jest.fn()
    },
    docenteCurso: {
      findMany: jest.fn()
    },
    periodoAcademico: {
      findUnique: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

const { prisma } = require('@/lib/prisma');
const cursosRoute = require('@/app/api/cursos/route');
const cursoDetalleRoute = require('@/app/api/cursos/[id]/route');

describe('Flujo integrado de múltiples prerrequisitos en cursos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        curso: prisma.curso,
        cursoPrerequisito: prisma.cursoPrerequisito
      })
    );
  });

  it('crea y luego actualiza un curso manteniendo varios prerrequisitos', async () => {
    prisma.departamentoAcademico.findFirst.mockResolvedValue({
      id_departamento: 3,
      nombre: 'Ingeniería de Sistemas'
    });
    prisma.curso.findMany.mockResolvedValue([
      { id_curso: 2, codigo: 'MAT101', nombre: 'Matemática', activo: true },
      { id_curso: 3, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true },
      { id_curso: 4, codigo: 'CS101', nombre: 'Algoritmos', activo: true }
    ]);

    prisma.curso.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id_curso: 10,
        codigo: 'CS200',
        nombre: 'Base de datos',
        prerequisitos: 'MAT101 - Matemática, CS100 - Introducción a la programación',
        prerequisitos_relacion: [
          { prerequisito: { id_curso: 2, codigo: 'MAT101', nombre: 'Matemática', activo: true } },
          { prerequisito: { id_curso: 3, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true } }
        ],
        id_departamento: 3,
        escuela_profesional: 'Ingeniería de Sistemas',
        tipo_curso: 'EP',
        horas_teoria: 3,
        horas_laboratorio: 2,
        horas_practica: 0,
        creditos: 4,
        ciclo: 4,
        plan_estudios: '2020'
      });

    prisma.curso.create.mockResolvedValue({
      id_curso: 10,
      codigo: 'CS200',
      nombre: 'Base de datos',
      prerequisitos_relacion: [
        { prerequisito: { id_curso: 2, codigo: 'MAT101', nombre: 'Matemática', activo: true } },
        { prerequisito: { id_curso: 3, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true } }
      ],
      departamento: { id_departamento: 3, nombre: 'Ingeniería de Sistemas' }
    });

    prisma.curso.update.mockResolvedValue({
      id_curso: 10,
      codigo: 'CS200',
      nombre: 'Base de datos',
      prerequisitos_relacion: [
        { prerequisito: { id_curso: 2, codigo: 'MAT101', nombre: 'Matemática', activo: true } },
        { prerequisito: { id_curso: 3, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true } },
        { prerequisito: { id_curso: 4, codigo: 'CS101', nombre: 'Algoritmos', activo: true } }
      ],
      departamento: { id_departamento: 3, nombre: 'Ingeniería de Sistemas' }
    });

    const createResponse = await cursosRoute.POST({
      json: async () => ({
        codigo: 'CS200',
        nombre: 'Base de datos',
        tipo_curso: 'EP',
        id_departamento: '3',
        creditos: '4',
        horas_teoria: '3',
        horas_laboratorio: '2',
        horas_practica: '0',
        ciclo: '4',
        plan_estudios: '2020',
        prerequisito_ids: ['2', '3']
      })
    });
    const createBody = await createResponse.json();

    const updateResponse = await cursoDetalleRoute.PUT(
      {
        json: async () => ({
          prerequisito_ids: ['2', '3', '4']
        })
      },
      { params: { id: '10' } }
    );
    const updateBody = await updateResponse.json();

    expect(createResponse.status).toBe(200);
    expect(createBody.datos.prerequisito_ids).toEqual([2, 3]);
    expect(updateResponse.status).toBe(200);
    expect(updateBody.datos.prerequisito_ids).toEqual([2, 3, 4]);
  });
});
