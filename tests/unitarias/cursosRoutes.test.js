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

describe('API cursos route handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        curso: prisma.curso,
        cursoPrerequisito: prisma.cursoPrerequisito
      })
    );
  });

  it('rechaza crear cursos con tipo de curso invalido', async () => {
    const request = {
      json: async () => ({
        codigo: 'CS101',
        nombre: 'Algoritmos',
        tipo_curso: 'INVALIDO',
        id_departamento: 3,
        creditos: 4
      })
    };

    const response = await cursosRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.mensaje).toMatch(/tipo de curso/i);
    expect(prisma.curso.create).not.toHaveBeenCalled();
  });

  it('crea cursos validos con tipo y escuela profesional', async () => {
    prisma.departamentoAcademico.findFirst.mockResolvedValue({
      id_departamento: 3,
      nombre: 'Ingeniería de Sistemas'
    });
    prisma.curso.findUnique.mockResolvedValue(null);
    prisma.curso.create.mockResolvedValue({
      id_curso: 1,
      codigo: 'CS101',
      nombre: 'Algoritmos',
      tipo_curso: 'EP',
      escuela_profesional: 'Ingeniería de Sistemas',
      id_departamento: 3,
      prerequisitos_relacion: [
        {
          prerequisito: {
            id_curso: 8,
            codigo: 'MAT101',
            nombre: 'Matemática'
          }
        },
        {
          prerequisito: {
            id_curso: 9,
            codigo: 'CS100',
            nombre: 'Introducción a la programación'
          }
        }
      ]
    });
    prisma.curso.findMany.mockResolvedValue([
      { id_curso: 8, codigo: 'MAT101', nombre: 'Matemática', activo: true },
      { id_curso: 9, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true }
    ]);

    const request = {
      json: async () => ({
        codigo: ' CS101 ',
        nombre: ' Algoritmos ',
        tipo_curso: 'ep',
        id_departamento: '3',
        creditos: '4',
        horas_teoria: '3',
        horas_practica: '2',
        horas_laboratorio: '0',
        ciclo: '3',
        plan_estudios: ' 2020 ',
        prerequisito_ids: ['8', '9']
      })
    };

    const response = await cursosRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.curso.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigo: 'CS101',
          nombre: 'Algoritmos',
          id_departamento: 3,
          tipo_curso: 'EP',
          escuela_profesional: 'Ingeniería de Sistemas',
          creditos: 4,
          ciclo: 3,
          plan_estudios: '2020',
          prerequisitos: 'MAT101 - Matemática, CS100 - Introducción a la programación',
          prerequisitos_relacion: {
            create: [
              { id_curso_prerequisito: 8 },
              { id_curso_prerequisito: 9 }
            ]
          }
        }),
        include: expect.objectContaining({
          departamento: true,
          prerequisitos_relacion: expect.any(Object)
        })
      })
    );
  });

  it('rechaza filtros invalidos en listado de cursos', async () => {
    const request = {
      url: 'http://localhost:3000/api/cursos?ciclo=no-numero'
    };

    const response = await cursosRoute.GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.mensaje).toMatch(/ciclo/i);
  });

  it('obtiene detalle de curso usando la relacion correcta de docentes por grupo', async () => {
    prisma.curso.findUnique.mockResolvedValue({
      id_curso: 5,
      codigo: 'CS105',
      nombre: 'Base de Datos',
      grupos: []
    });

    const response = await cursoDetalleRoute.GET({}, { params: { id: '5' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.curso.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_curso: 5 },
        include: expect.objectContaining({
          departamento: true,
          prerequisitos_relacion: expect.any(Object),
          grupos: {
            include: {
              docentes: {
                include: {
                  docente: true
                }
              }
            }
          }
        })
      })
    );
  });

  it('rechaza actualizaciones con identificador invalido', async () => {
    const request = {
      json: async () => ({
        nombre: 'Nuevo nombre'
      })
    };

    const response = await cursoDetalleRoute.PUT(request, { params: { id: 'abc' } });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.error).toMatch(/identificador/i);
  });

  it('rechaza usar el mismo curso como prerrequisito', async () => {
    prisma.curso.findUnique.mockResolvedValue({
      id_curso: 5,
      codigo: 'CS105',
      nombre: 'Base de Datos',
      prerequisitos: null,
      prerequisitos_relacion: []
    });

    const request = {
      json: async () => ({
        prerequisito_ids: ['5']
      })
    };

    const response = await cursoDetalleRoute.PUT(request, { params: { id: '5' } });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.error).toMatch(/sí mismo|mismo/i);
  });

  it('actualiza un curso con múltiples prerrequisitos', async () => {
    prisma.curso.findUnique.mockResolvedValue({
      id_curso: 5,
      codigo: 'CS105',
      nombre: 'Base de datos',
      prerequisitos: null,
      prerequisitos_relacion: [],
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
    prisma.curso.findMany.mockResolvedValue([
      { id_curso: 8, codigo: 'MAT101', nombre: 'Matemática', activo: true },
      { id_curso: 9, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true }
    ]);
    prisma.curso.update.mockResolvedValue({
      id_curso: 5,
      codigo: 'CS105',
      nombre: 'Base de datos',
      prerequisitos: 'MAT101 - Matemática, CS100 - Introducción a la programación',
      prerequisitos_relacion: [
        { prerequisito: { id_curso: 8, codigo: 'MAT101', nombre: 'Matemática', activo: true } },
        { prerequisito: { id_curso: 9, codigo: 'CS100', nombre: 'Introducción a la programación', activo: true } }
      ],
      departamento: null
    });

    const request = {
      json: async () => ({
        prerequisito_ids: ['8', '9']
      })
    };

    const response = await cursoDetalleRoute.PUT(request, { params: { id: '5' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.cursoPrerequisito.deleteMany).toHaveBeenCalledWith({
      where: { id_curso: 5 }
    });
    expect(prisma.curso.update).toHaveBeenCalledWith({
      where: { id_curso: 5 },
      data: expect.objectContaining({
        prerequisitos: 'MAT101 - Matemática, CS100 - Introducción a la programación',
        prerequisitos_relacion: {
          create: [
            { id_curso_prerequisito: 8 },
            { id_curso_prerequisito: 9 }
          ]
        }
      }),
      include: expect.any(Object)
    });
  });
});
