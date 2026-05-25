import { describe, it, expect } from '@jest/globals';

describe('API de Autenticación', () => {
  it('debe permitir login con credenciales válidas', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.exito).toBe(true);
    expect(data.usuario).toBeDefined();
  });

  it('debe rechazar credenciales inválidas', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: 'admin',
        password: 'incorrecta'
      })
    });

    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.exito).toBe(false);
  });
});

describe('API de Docentes', () => {
  it('debe listar docentes', async () => {
    const response = await fetch('http://localhost:3000/api/docentes');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.exito).toBe(true);
    expect(Array.isArray(data.datos)).toBe(true);
  });

  it('debe crear nuevo docente', async () => {
    const nuevoDocente = {
      codigo_docente: '999999',
      nombres: 'Test',
      apellidos: 'Docente',
      modalidad: 'nombrado',
      categoria: 'auxiliar',
      correo_electronico: 'test@example.com'
    };

    const response = await fetch('http://localhost:3000/api/docentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoDocente)
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.exito).toBe(true);
    expect(data.datos.codigo_docente).toBe('999999');
  });
});

describe('API de Horarios', () => {
  it('debe validar selección de horario', async () => {
    const seleccion = {
      id_docente: 1,
      id_curso: 1,
      id_ambiente: 1,
      dia_semana: 'lunes',
      hora_inicio: '08:00',
      hora_fin: '10:00',
      id_periodo: 1
    };

    const response = await fetch('http://localhost:3000/api/horarios/validar-seleccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seleccion)
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.validaciones).toBeDefined();
    expect(Array.isArray(data.validaciones)).toBe(true);
  });
});

describe('API de Estadísticas', () => {
  it('debe obtener resumen de período', async () => {
    const response = await fetch('http://localhost:3000/api/estadisticas/resumen?periodo=1');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.exito).toBe(true);
    expect(data.datos).toBeDefined();
  });

  it('debe obtener avance por categoría', async () => {
    const response = await fetch('http://localhost:3000/api/estadisticas/avance-categoria?periodo=1');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.exito).toBe(true);
    expect(Array.isArray(data.datos)).toBe(true);
  });
});
