jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    ventanaAtencion: {
      create: jest.fn()
    }
  }
}));

jest.mock('@/lib/redis', () => ({
  redis: {
    set: jest.fn(),
    expire: jest.fn(),
    get: jest.fn(),
    sadd: jest.fn()
  }
}));

jest.mock('@/lib/utilidadesFecha', () => ({
  utilidadesFecha: {
    calcularAntiguedad: jest.fn((fecha) => {
      const year = new Date(fecha).getFullYear();
      return 2026 - year;
    })
  }
}));

const { GestorVentanasAtencion } = require('@/services/ventanas/GestorVentanasAtencion');
const { prisma } = require('@/lib/prisma');
const { redis } = require('@/lib/redis');

describe('GestorVentanasAtencion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ordena la cola priorizando ordinarios sobre extraordinarios y contratados', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        id_docente: 3,
        codigo_docente: 'C003',
        modalidad: 'contratado',
        categoria: 'auxiliar',
        categoria_ordinaria: '',
        tipo_contrato: 'tipo_b1',
        antiguedad: 4
      },
      {
        id_docente: 2,
        codigo_docente: 'C002',
        modalidad: 'extraordinario',
        categoria: 'auxiliar',
        categoria_ordinaria: '',
        tipo_contrato: '',
        antiguedad: 10
      },
      {
        id_docente: 1,
        codigo_docente: 'C001',
        modalidad: 'nombrado',
        categoria: 'auxiliar',
        categoria_ordinaria: 'principal',
        tipo_contrato: '',
        antiguedad: 2
      }
    ]);
    redis.set.mockResolvedValue('OK');
    redis.expire.mockResolvedValue(1);

    const cola = await GestorVentanasAtencion.obtenerColaDocentes(1);

    expect(cola.map((item) => item.id_docente)).toEqual([1, 2, 3]);
  });

  it('usa categoria_ordinaria para ordenar docentes nombrados', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        id_docente: 2,
        codigo_docente: 'C002',
        modalidad: 'nombrado',
        categoria: 'auxiliar',
        categoria_ordinaria: 'asociado',
        tipo_contrato: '',
        antiguedad: 6
      },
      {
        id_docente: 1,
        codigo_docente: 'C001',
        modalidad: 'nombrado',
        categoria: 'auxiliar',
        categoria_ordinaria: 'principal',
        tipo_contrato: '',
        antiguedad: 1
      }
    ]);
    redis.set.mockResolvedValue('OK');
    redis.expire.mockResolvedValue(1);

    const cola = await GestorVentanasAtencion.obtenerColaDocentes(2);

    expect(cola.map((item) => item.id_docente)).toEqual([1, 2]);
  });

  it('reconstruye la cola cuando Redis devuelve un valor invalido', async () => {
    redis.get.mockResolvedValue('{"invalido":true}');
    prisma.$queryRaw.mockResolvedValue([
      {
        id_docente: 7,
        codigo_docente: 'C007',
        modalidad: 'nombrado',
        categoria: 'principal',
        categoria_ordinaria: 'principal',
        tipo_contrato: '',
        antiguedad: 3
      }
    ]);
    redis.set.mockResolvedValue('OK');
    redis.expire.mockResolvedValue(1);

    const resultado = await GestorVentanasAtencion.siguienteDocente(5);

    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado[0].id_docente).toBe(7);
  });
});
