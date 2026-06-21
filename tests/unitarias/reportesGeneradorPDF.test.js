jest.mock('@/lib/prisma', () => ({
  prisma: {}
}));

jest.mock('puppeteer', () => ({}));

jest.mock('@/services/reportes/PuppeteerPool', () => ({
  puppeteerPool: {
    getPage: jest.fn(),
    releasePage: jest.fn()
  }
}));

const { GeneradorPDF } = require('@/services/reportes/GeneradorPDF');

describe('GeneradorPDF reportes con coincidencias horarias', () => {
  it('incluye ambos cursos cuando coinciden en el mismo bloque del reporte por ciclo', () => {
    const periodo = {
      anio: 2026,
      codigo: '2026-I'
    };

    const horarios = [
      {
        id_docente: 1,
        id_curso: 101,
        id_grupo: 1,
        dia_semana: 0,
        hora_inicio: '09:00',
        hora_fin: '13:00',
        tipo_clase: 'teoria',
        curso: {
          codigo: 'IS701',
          nombre: 'Ingeniería de software',
          horas_teoria: 4,
          horas_practica: 0,
          horas_laboratorio: 0
        },
        grupo: { codigo_grupo: 'A' },
        docente: { apellidos: 'Perez', nombres: 'Ana' }
      },
      {
        id_docente: 2,
        id_curso: 102,
        id_grupo: 1,
        dia_semana: 0,
        hora_inicio: '09:00',
        hora_fin: '13:00',
        tipo_clase: 'teoria',
        curso: {
          codigo: 'IS702',
          nombre: 'Redes y comunicaciones',
          horas_teoria: 4,
          horas_practica: 0,
          horas_laboratorio: 0
        },
        grupo: { codigo_grupo: 'B' },
        docente: { apellidos: 'Lopez', nombres: 'Luis' }
      }
    ];

    const resumenCursos = GeneradorPDF.obtenerResumenCursosReporte(horarios);
    const html = GeneradorPDF.generarHTMLReporteCiclo(periodo, 7, horarios, resumenCursos, {
      hora_inicio: '07:00',
      hora_fin: '22:00',
      duracion_bloque: 90
    });

    expect(html).toContain('Ingeniería de software');
    expect(html).toContain('Redes y comunicaciones');
    expect(html).toContain('border: 1px solid #999');
  });
});
