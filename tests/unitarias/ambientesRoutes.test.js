jest.mock('@/lib/prisma', () => ({
  prisma: {
    ambiente: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));

const { prisma } = require('@/lib/prisma');
const ambientesRoute = require('@/app/api/ambientes/route');
const ambienteDetalleRoute = require('@/app/api/ambientes/[id]/route');

describe('API ambientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.ambiente.findUnique.mockResolvedValue(null);
  });

  it('rechaza registrar un ambiente con capacidad inválida', async () => {
    const request = {
      json: async () => ({
        codigo: 'A-101',
        nombre: 'Laboratorio de redes',
        tipo: 'laboratorio',
        capacidad: ''
      })
    };

    const response = await ambientesRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.exito).toBe(false);
    expect(body.errores.capacidad).toMatch(/capacidad/i);
    expect(prisma.ambiente.create).not.toHaveBeenCalled();
  });

  it('registra un ambiente válido normalizando código y campos opcionales', async () => {
    prisma.ambiente.findUnique.mockResolvedValue(null);
    prisma.ambiente.create.mockResolvedValue({
      id_ambiente: 1,
      codigo: 'LAB-201',
      nombre: 'Laboratorio de cómputo',
      tipo: 'laboratorio',
      capacidad: 30
    });

    const request = {
      json: async () => ({
        codigo: ' lab-201 ',
        nombre: '  Laboratorio   de cómputo ',
        tipo: 'laboratorio',
        capacidad: '30',
        piso: ' 2 ',
        pabellon: ' B ',
        equipamiento: ' 30 PC '
      })
    };

    const response = await ambientesRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.ambiente.findUnique).toHaveBeenCalledWith({
      where: {
        codigo: 'LAB-201'
      }
    });
    expect(prisma.ambiente.create).toHaveBeenCalledWith({
      data: {
        codigo: 'LAB-201',
        nombre: 'Laboratorio de cómputo',
        tipo: 'laboratorio',
        capacidad: 30,
        piso: '2',
        pabellon: 'B',
        equipamiento: '30 PC'
      }
    });
  });

  it('reactiva un ambiente inactivo cuando se vuelve a registrar el mismo código', async () => {
    prisma.ambiente.findUnique.mockResolvedValue({
      id_ambiente: 9,
      codigo: 'LAB-201',
      activo: false
    });
    prisma.ambiente.update.mockResolvedValue({
      id_ambiente: 9,
      codigo: 'LAB-201',
      activo: true
    });

    const request = {
      json: async () => ({
        codigo: 'lab-201',
        nombre: 'Laboratorio reactivado',
        tipo: 'laboratorio',
        capacidad: '40',
        piso: '3',
        pabellon: 'C',
        equipamiento: 'Proyector'
      })
    };

    const response = await ambientesRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(body.mensaje).toMatch(/reactivó/i);
    expect(prisma.ambiente.create).not.toHaveBeenCalled();
    expect(prisma.ambiente.update).toHaveBeenCalledWith({
      where: {
        id_ambiente: 9
      },
      data: {
        codigo: 'LAB-201',
        nombre: 'Laboratorio reactivado',
        tipo: 'laboratorio',
        capacidad: 40,
        piso: '3',
        pabellon: 'C',
        equipamiento: 'Proyector',
        activo: true
      }
    });
  });

  it('actualiza capacidad cuando llega como texto numérico en edición', async () => {
    prisma.ambiente.update.mockResolvedValue({
      id_ambiente: 7,
      capacidad: 45
    });

    const request = {
      json: async () => ({
        capacidad: '45'
      })
    };

    const response = await ambienteDetalleRoute.PUT(request, { params: { id: '7' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exito).toBe(true);
    expect(prisma.ambiente.update).toHaveBeenCalledWith({
      where: { id_ambiente: 7 },
      data: {
        capacidad: 45
      }
    });
  });
});
