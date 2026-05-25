import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login para obtener token
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();
    authToken = data.token;
  });

  describe('Docentes API', () => {
    it('debe listar docentes', async () => {
      const response = await fetch('http://localhost:3000/api/docentes', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
      expect(Array.isArray(data.datos)).toBe(true);
    });

    it('debe crear un docente', async () => {
      const nuevoDocente = {
        codigo_docente: 'TEST001',
        nombres: 'Test',
        apellidos: 'Docente',
        categoria: 'auxiliar',
        modalidad: 'tiempo_completo',
        correo_electronico: 'test@unt.edu.pe'
      };

      const response = await fetch('http://localhost:3000/api/docentes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoDocente)
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.exito).toBe(true);
      expect(data.datos.codigo_docente).toBe('TEST001');
    });

    it('debe rechazar docente con código duplicado', async () => {
      const docenteDuplicado = {
        codigo_docente: 'TEST001',
        nombres: 'Otro',
        apellidos: 'Docente',
        categoria: 'auxiliar',
        modalidad: 'tiempo_completo',
        correo_electronico: 'otro@unt.edu.pe'
      };

      const response = await fetch('http://localhost:3000/api/docentes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(docenteDuplicado)
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Cursos API', () => {
    it('debe listar cursos', async () => {
      const response = await fetch('http://localhost:3000/api/cursos', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
    });

    it('debe validar código de curso', async () => {
      const response = await fetch('http://localhost:3000/api/cursos/validar-codigo?codigo=CS101', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('disponible');
    });
  });

  describe('Horarios API', () => {
    it('debe validar horario antes de crear', async () => {
      const horario = {
        id_periodo: 1,
        id_curso: 1,
        id_grupo: 1,
        id_docente: 1,
        id_ambiente: 1,
        dia_semana: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '09:30'
      };

      const response = await fetch('http://localhost:3000/api/horarios/validar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(horario)
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('valido');
      expect(data).toHaveProperty('errores');
    });
  });

  describe('Estadísticas API', () => {
    it('debe obtener estadísticas del dashboard', async () => {
      const response = await fetch('http://localhost:3000/api/estadisticas/dashboard?periodo=1', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
      expect(data.datos).toHaveProperty('totalHorarios');
      expect(data.datos).toHaveProperty('totalDocentes');
    });

    it('debe obtener mapa de calor', async () => {
      const response = await fetch('http://localhost:3000/api/estadisticas/mapa-calor?periodo=1', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
      expect(Array.isArray(data.datos)).toBe(true);
    });
  });

  describe('Notificaciones API', () => {
    it('debe enviar notificación de prueba', async () => {
      const notificacion = {
        id_docente: 1,
        tipo: 'email',
        asunto: 'Test',
        mensaje: 'Mensaje de prueba'
      };

      const response = await fetch('http://localhost:3000/api/notificaciones/enviar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificacion)
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
    });
  });

  describe('Reportes API', () => {
    it('debe generar reporte PDF', async () => {
      const response = await fetch('http://localhost:3000/api/reportes/aula', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_periodo: 1,
          id_ambiente: 1
        })
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/pdf');
    });
  });

  describe('Configuración API', () => {
    it('debe obtener restricciones', async () => {
      const response = await fetch('http://localhost:3000/api/configuracion/restricciones', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
      expect(data.datos).toHaveProperty('max_horas_consecutivas');
    });

    it('debe actualizar restricciones', async () => {
      const restricciones = {
        max_horas_consecutivas: 4,
        max_horas_por_dia: 8
      };

      const response = await fetch('http://localhost:3000/api/configuracion/restricciones', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(restricciones)
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.exito).toBe(true);
    });
  });
});

describe('Cache Tests', () => {
  it('debe almacenar y recuperar datos del cache', async () => {
    const { redis } = await import('@/lib/redis');
    
    await redis.set('test_key', JSON.stringify({ data: 'test' }), 'EX', 60);
    const valor = await redis.get('test_key');
    
    expect(valor).toBeDefined();
    expect(JSON.parse(valor).data).toBe('test');
  });

  it('debe expirar datos del cache', async () => {
    const { redis } = await import('@/lib/redis');
    
    await redis.set('test_expire', 'data', 'EX', 1);
    await new Promise(resolve => setTimeout(resolve, 1100));
    const valor = await redis.get('test_expire');
    
    expect(valor).toBeNull();
  });
});

describe('Database Tests', () => {
  it('debe conectar a la base de datos', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    
    expect(result).toBeDefined();
  });

  it('debe respetar relaciones de base de datos', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    const docente = await prisma.docente.findFirst({
      include: {
        horarios_asignados: true
      }
    });
    
    expect(docente).toBeDefined();
    expect(Array.isArray(docente?.horarios_asignados)).toBe(true);
  });
});
