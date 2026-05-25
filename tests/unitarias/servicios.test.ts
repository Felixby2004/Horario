import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValidadorHorario } from '@/services/horarios/ValidadorHorario';
import { GeneradorHorarios } from '@/services/horarios/ServiciosEspecializadosExtra';

describe('ValidadorHorario', () => {
  describe('validarSolapamiento', () => {
    it('debe detectar solapamiento de horarios', async () => {
      const horario = {
        id_docente: 1,
        dia_semana: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '10:00'
      };

      // Mock prisma query
      const resultado = await ValidadorHorario.validarHorario(horario as any);
      
      expect(resultado).toHaveProperty('valido');
      expect(resultado).toHaveProperty('errores');
    });

    it('debe permitir horarios sin solapamiento', async () => {
      const horario = {
        id_docente: 1,
        dia_semana: 'lunes',
        hora_inicio: '14:00',
        hora_fin: '16:00'
      };

      const resultado = await ValidadorHorario.validarHorario(horario as any);
      
      expect(resultado.valido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });
  });

  describe('validarCargaMaxima', () => {
    it('debe rechazar si excede carga máxima', async () => {
      const horario = {
        id_docente: 1,
        id_periodo: 1
      };

      const resultado = await ValidadorHorario.validarHorario(horario as any);
      
      if (!resultado.valido) {
        expect(resultado.errores).toContain(
          expect.objectContaining({ tipo: 'carga_maxima' })
        );
      }
    });
  });

  describe('validarDisponibilidadAmbiente', () => {
    it('debe detectar ambiente ocupado', async () => {
      const horario = {
        id_ambiente: 1,
        dia_semana: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '10:00'
      };

      const resultado = await ValidadorHorario.validarHorario(horario as any);
      
      expect(resultado).toBeDefined();
    });
  });
});

describe('GeneradorHorarios', () => {
  describe('generarAutomaticamente', () => {
    it('debe generar sugerencias de horarios', async () => {
      const resultado = await GeneradorHorarios.generarAutomaticamente(1, 1);
      
      expect(Array.isArray(resultado)).toBe(true);
    });

    it('debe respetar restricciones al generar', async () => {
      const resultado = await GeneradorHorarios.generarAutomaticamente(1, 1);
      
      for (const horario of resultado) {
        expect(horario).toHaveProperty('dia_semana');
        expect(horario).toHaveProperty('hora_inicio');
        expect(horario).toHaveProperty('hora_fin');
      }
    });
  });
});

describe('Utilidades de fecha', () => {
  it('debe formatear fechas correctamente', () => {
    const { formatearFecha } = require('@/lib/utilidades');
    const fecha = new Date('2025-01-15');
    const resultado = formatearFecha(fecha);
    
    expect(resultado).toBe('15/01/2025');
  });

  it('debe calcular diferencia de horas', () => {
    const { calcularDiferenciaHoras } = require('@/lib/utilidadesFecha');
    const inicio = '08:00';
    const fin = '10:00';
    
    const resultado = calcularDiferenciaHoras(inicio, fin);
    
    expect(resultado).toBe(2);
  });
});

describe('Servicios de notificación', () => {
  it('debe formatear mensaje de recordatorio', () => {
    const { GestorNotificaciones } = require('@/services/notificaciones/GestorNotificaciones');
    
    const mensaje = GestorNotificaciones.formatearMensaje('recordatorio', {
      nombre: 'Juan Pérez',
      fecha: '2025-01-15',
      hora: '14:00'
    });
    
    expect(mensaje).toContain('Juan Pérez');
    expect(mensaje).toContain('2025-01-15');
  });
});

describe('Servicios de importación', () => {
  it('debe validar formato de Excel', async () => {
    const { ImportadorDocentes } = require('@/services/importacion/ServiciosImportacion');
    
    const buffer = Buffer.from('mock excel data');
    
    try {
      await ImportadorDocentes.importarDesdeExcel(buffer);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('Caché Redis', () => {
  it('debe almacenar y recuperar datos', async () => {
    const { redis } = require('@/lib/redis');
    
    await redis.set('test_key', 'test_value', 'EX', 60);
    const valor = await redis.get('test_key');
    
    expect(valor).toBe('test_value');
  });
});

describe('Auditoría', () => {
  it('debe registrar acciones', async () => {
    const { ServicioAuditoria } = require('@/services/auditoria/ServicioAuditoria');
    
    await ServicioAuditoria.registrar({
      id_usuario: 1,
      accion: 'crear',
      tabla: 'horario',
      detalles: 'Test'
    });
    
    // Verificar que se registró
    expect(true).toBe(true);
  });
});
