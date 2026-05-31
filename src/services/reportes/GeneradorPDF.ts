import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';

// Importar chromium opcional para Render
let chromium: any = null;
try {
  chromium = require('@sparticuz/chromium');
} catch (e) {
  // @sparticuz/chromium es opcional
}

interface DiaHorario {
  [key: string]: Array<{
    hora_inicio: string;
    hora_fin: string;
    curso: string;
    grupo: string;
    docente: string;
    ambiente?: string;
  }>;
}

// Colores por curso (para diferenciar visualmente)
const COLORES_CURSOS: string[] = [
  '#FFE699', // Amarillo
  '#C6EFCE', // Verde
  '#BDD7EE', // Azul
  '#F4B084', // Naranja
  '#E2EFDA', // Verde claro
  '#FBE5D6', // Naranja claro
  '#D5E8F7', // Azul claro
  '#FCE4D6', // Salmón
  '#E2EFDA', // Verde oscuro
  '#C5E0B4', // Verde medio
  '#DDEBF7', // Azul muy claro
  '#F8CBAD'  // Naranja arena
];

export class GeneradorPDF {
  // Reporte por Aula
  static async generarReporteAula(idAmbiente: number, idPeriodo: number) {
    const ambiente = await prisma.ambiente.findUnique({
      where: { id_ambiente: idAmbiente }
    });

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_ambiente: idAmbiente,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    // Agrupar horarios por docente y curso para tabla de profesores
    const horariosSet = new Map();
    horarios.forEach(h => {
      const key = `${h.id_docente}-${h.id_curso}`;
      if (!horariosSet.has(key)) {
        horariosSet.set(key, h);
      }
    });

    const horariosUnicos = Array.from(horariosSet.values());

    // Crear matriz de horarios para grid
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horasDisponibles = this.generarHorasStandard();
    const matrizHorarios = this.crearMatrizHorariosOptimizada(horarios, diasSemana, horasDisponibles);

    const html = this.generarHTMLReporteAulaFormato(
      ambiente, 
      periodo, 
      horariosUnicos,
      matrizHorarios, 
      diasSemana, 
      horasDisponibles
    );
    
    return await this.convertirAPDF(html);
  }

  // Reporte por Ciclo
  static async generarReporteCiclo(idPeriodo: number, ciclo: number) {
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] },
        curso: { ciclo }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true,
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const cursosUnicos = Array.from(
      new Map(horarios.map(h => [h.id_curso, h])).values()
    );

    const html = this.generarHTMLReporteCiclo(
      periodo,
      ciclo,
      horarios,
      cursosUnicos
    );

    return await this.convertirAPDF(html);
  }

  // Reporte por Laboratorio (similar a aula)
  static async generarReporteLaboratorio(idAmbiente: number, idPeriodo: number) {
    return this.generarReporteAula(idAmbiente, idPeriodo);
  }

  // Reporte de Auditoría por Día
  static async generarReporteDia(idPeriodo: number, diaSemana: number) {
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        dia_semana: diaSemana,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true,
        ambiente: true
      },
      orderBy: [
        { hora_inicio: 'asc' }
      ]
    });

    const html = this.generarHTMLReporteDia(periodo, diaSemana, horarios);
    return await this.convertirAPDF(html);
  }

  // Excel por Día
  static async generarExcelDia(idPeriodo: number, diaSemana: number): Promise<Buffer> {
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        dia_semana: diaSemana,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true,
        ambiente: true
      },
      orderBy: [
        { hora_inicio: 'asc' }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Auditoría Diaria');

    // Estilos
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF1E3A8A' }, size: 14 },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
    };

    // Configurar ancho de columnas
    worksheet.columns = [
      { width: 10 }, // Hora Inicio
      { width: 10 }, // Hora Fin
      { width: 20 }, // Profesor
      { width: 25 }, // Curso
      { width: 15 }, // Grupo
      { width: 20 }, // Ambiente
      { width: 12 }  // Tipo de Clase
    ];

    // Título
    worksheet.mergeCells('A1:G1');
    const cellTitle = worksheet.getCell('A1');
    cellTitle.value = 'UNIVERSIDAD NACIONAL DE TRUJILLO';
    cellTitle.style = titleStyle;
    worksheet.getRow(1).height = 25;

    // Información del período y día
    const nombresDias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const nombreDia = nombresDias[diaSemana] || 'Día desconocido';

    worksheet.mergeCells('A3:G3');
    const cellInfo = worksheet.getCell('A3');
    cellInfo.value = `Reporte de Auditoría - ${nombreDia} | Período: ${periodo?.nombre || 'N/A'} (${periodo?.anio})`;
    cellInfo.style = { ...titleStyle, font: { ...titleStyle.font, size: 11 } };

    // Encabezados de tabla
    const headerRow = worksheet.getRow(5);
    const headers = ['Hora Inicio', 'Hora Fin', 'Profesor', 'Curso', 'Grupo', 'Ambiente', 'Tipo de Clase'];
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    headerRow.height = 20;

    // Datos
    let rowIndex = 6;
    horarios.forEach((h: any) => {
      const row = worksheet.getRow(rowIndex);
      const docente = h.docente ? `${h.docente.apellidos}, ${h.docente.nombres}` : 'N/A';
      const curso = h.curso?.nombre || 'N/A';
      const grupo = h.grupo?.codigo_grupo || 'N/A';
      const ambiente = h.ambiente?.nombre || h.ambiente?.codigo || 'N/A';
      const tipoClase = h.tipo_clase || 'N/A';

      row.values = [h.hora_inicio, h.hora_fin, docente, curso, grupo, ambiente, tipoClase];
      row.eachCell((cell) => {
        cell.style = cellStyle;
      });
      rowIndex++;
    });

    // Pie de página con fecha
    const footerRow = worksheet.getRow(rowIndex + 2);
    footerRow.values = ['Generado:', new Date().toLocaleDateString('es-ES')];

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  // Generar horas estándar del día (7-8, 8-9, etc.)
  private static generarHorasStandard(): string[] {
    const horas: string[] = [];
    for (let i = 7; i < 22; i++) {
      horas.push(`${String(i).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
    }
    return horas;
  }

  // Crear matriz optimizada de horarios
  private static crearMatrizHorariosOptimizada(horarios: any[], diasSemana: string[], horasRango: string[]): any {
    const matriz: any = {};

    diasSemana.forEach(dia => {
      matriz[dia] = {};
      horasRango.forEach(hora => {
        matriz[dia][hora] = null;
      });
    });

    // Llenar matriz
    horarios.forEach(h => {
      const diaNombre = this.obtenerNombreDia(h.dia_semana);
      if (diaNombre && diaNombre !== 'N/A') {
        const [horaI] = h.hora_inicio.split(':').map(Number);
        const horaKey = horasRango.find(hora => {
          const horaFormato = `${String(horaI).padStart(2, '0')}`;
          return hora.startsWith(horaFormato);
        });

        if (horaKey && matriz[diaNombre]) {
          matriz[diaNombre][horaKey] = {
            horaInicio: h.hora_inicio,
            horaFin: h.hora_fin,
            cursoNum: h.curso?.codigo || h.curso?.id_curso || '?',
            cursoNombre: h.curso?.nombre || 'N/A',
            idCursoRef: h.id_curso, // Para mapear color
            ambiente: h.ambiente?.nombre || h.ambiente?.codigo || 'N/A',
            tipo: h.tipo_clase || 'Teoría',
            docente: h.docente ? `${h.docente.apellidos}, ${h.docente.nombres}` : 'N/A'
          };
        }
      }
    });

    return matriz;
  }

  // HTML para reporte de auditoría por día
  private static generarHTMLReporteDia(periodo: any, diaSemana: number, horarios: any[]) {
    const nombresDias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const nombreDia = nombresDias[diaSemana] || 'Día desconocido';

    // Agrupar horarios por hora para visualización
    const horariosAgrupadosPorHora = new Map<string, any[]>();
    horarios.forEach(h => {
      const key = h.hora_inicio;
      if (!horariosAgrupadosPorHora.has(key)) {
        horariosAgrupadosPorHora.set(key, []);
      }
      horariosAgrupadosPorHora.get(key)!.push(h);
    });

    // Crear filas de horario
    const filasHorario = Array.from(horariosAgrupadosPorHora.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hora, horariosHora]) => {
        const filasClase = horariosHora.map((h: any) => `
          <tr style="background-color: ${horariosHora.indexOf(h) % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">${hora}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${h.hora_fin}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">
              <strong>${h.docente ? h.docente.apellidos + ' ' + h.docente.nombres : 'N/A'}</strong>
              <br><span style="font-size: 10px; color: #666;">${h.docente?.codigo_docente || ''}</span>
            </td>
            <td style="border: 1px solid #ddd; padding: 10px;">
              <strong>${h.curso?.nombre || 'N/A'}</strong>
              <br><span style="font-size: 10px; color: #666;">${h.curso?.codigo || ''}</span>
            </td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${h.grupo?.codigo_grupo || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">
              <strong>${h.ambiente?.nombre || h.ambiente?.codigo || 'N/A'}</strong>
              <br><span style="font-size: 10px; color: #666;">(${h.ambiente?.capacidad || 'N/A'} cap.)</span>
            </td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
              <span style="background-color: ${h.tipo_clase === 'Laboratorio' ? '#FFE699' : h.tipo_clase === 'Práctica' ? '#C6EFCE' : '#BDD7EE'}; padding: 4px 8px; border-radius: 4px;">
                ${h.tipo_clase || 'Teoría'}
              </span>
            </td>
          </tr>
        `).join('');

        return filasClase;
      }).join('');

    const totalClases = horarios.length;
    const totalProfesores = new Set(horarios.map(h => h.id_docente)).size;
    const totalAmbientes = new Set(horarios.map(h => h.id_ambiente)).size;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Auditoría - ${nombreDia}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            padding: 15px; 
            font-size: 11px;
            background: white;
          }
          .header-uni { 
            text-align: center; 
            margin-bottom: 10px; 
            border-bottom: 3px solid #1e3a8a; 
            padding-bottom: 10px; 
          }
          .header-uni h1 { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 3px;
            color: #1e3a8a;
          }
          .header-uni h2 { 
            font-size: 14px; 
            font-weight: bold; 
            margin-bottom: 2px;
            color: #333;
          }
          .header-uni p { 
            font-size: 10px; 
            margin: 2px 0;
            color: #666;
          }
          .info-section { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 8px; 
            margin-bottom: 10px; 
            font-size: 10px; 
            background-color: #e8f0ff;
            padding: 8px;
            border-left: 4px solid #1e3a8a;
          }
          .info-box { 
            display: flex;
            gap: 4px;
          }
          .info-label { 
            font-weight: bold; 
            color: #1e3a8a;
            min-width: 70px;
          }
          .info-value {
            flex: 1;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .stat-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-align: center;
            font-size: 9px;
          }
          .stat-box.alt1 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          .stat-box.alt2 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          .stat-number { font-size: 18px; font-weight: bold; }
          .stat-label { font-size: 8px; margin-top: 2px; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 10px;
          }
          th { 
            background-color: #1e3a8a; 
            color: white; 
            padding: 8px; 
            text-align: left;
            border: 1px solid #000;
            font-weight: bold; 
          }
          td { 
            border: 1px solid #ddd; 
            padding: 8px; 
          }
          .titulo-seccion {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 15px;
            margin-bottom: 8px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 5px;
          }
          .footer {
            text-align: center;
            font-size: 9px;
            color: #666;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
          .firma-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
          }
          .firma-box {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 40px;
          }
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-uni">
          <h1>UNIVERSIDAD NACIONAL DE TRUJILLO</h1>
          <h2>📅 Reporte de Auditoría por Día</h2>
          <p>FACULTAD DE INGENIERIA | ESCUELA DE INGENIERIA DE SISTEMAS</p>
        </div>

        <div class="info-section">
          <div class="info-box">
            <span class="info-label">DÍA:</span>
            <span class="info-value"><strong>${nombreDia}</strong></span>
          </div>
          <div class="info-box">
            <span class="info-label">PERÍODO:</span>
            <span class="info-value">${periodo?.nombre || 'N/A'} (${periodo?.anio})</span>
          </div>
          <div class="info-box">
            <span class="info-label">FECHA REPORTE:</span>
            <span class="info-value">${new Date().toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">${totalClases}</div>
            <div class="stat-label">Clases programadas</div>
          </div>
          <div class="stat-box alt1">
            <div class="stat-number">${totalProfesores}</div>
            <div class="stat-label">Profesores activos</div>
          </div>
          <div class="stat-box alt2">
            <div class="stat-number">${totalAmbientes}</div>
            <div class="stat-label">Ambientes utilizados</div>
          </div>
        </div>

        <div class="titulo-seccion">📋 Detalle de Clases del Día</div>
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">Inicio</th>
              <th style="width: 8%;">Fin</th>
              <th style="width: 22%;">Profesor</th>
              <th style="width: 22%;">Curso</th>
              <th style="width: 12%;">Grupo</th>
              <th style="width: 18%;">Ambiente</th>
              <th style="width: 10%;">Tipo</th>
            </tr>
          </thead>
          <tbody>
            ${filasHorario || '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No hay clases programadas para este día.</td></tr>'}
          </tbody>
        </table>

        <div class="firma-section">
          <div class="firma-box">
            Director de Escuela
            <br><br>_____________________
          </div>
          <div class="firma-box">
            Coordinador Académico
            <br><br>_____________________
          </div>
          <div class="firma-box">
            Rector/Autoridad
            <br><br>_____________________
          </div>
        </div>

        <div class="footer">
          <p><strong>Propósito:</strong> Este reporte permite auditar y verificar cómo se imparten las clases en un día específico.</p>
          <p>Generado automáticamente por el Sistema de Horarios de la UNT</p>
          <p style="margin-top: 10px; color: #999;">Reporte generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;
  }

  // HTML generador con formato exacto del template
  private static generarHTMLReporteAulaFormato(
    ambiente: any, 
    periodo: any, 
    horariosUnicos: any[],
    matrizHorarios: any, 
    diasSemana: string[], 
    horasRango: string[]
  ) {
    // Obtener escuela (puede venir de ambiente o del grupo)
    const escuela = ambiente?.nombre || 'INGENIERIA DE SISTEMAS';
    
    // Crear mapeo de cursos a números y colores
    const cursosMap = new Map();
    const cursosColores: { [key: number]: string } = {};
    horariosUnicos.forEach((h, idx) => {
      const cursoKey = h.id_curso;
      if (!cursosMap.has(cursoKey)) {
        const profNum = idx + 1;
        cursosMap.set(cursoKey, { profNum, cursoNombre: h.curso?.nombre });
        cursosColores[profNum] = COLORES_CURSOS[idx % COLORES_CURSOS.length];
      }
    });
    
    // Construir filas de la tabla de profesores
    const filasProf = horariosUnicos.map((h, idx) => {
      const profNum = idx + 1;
      const color = '#ffffff'; // Color base
      const curso = h.curso;
      const horasT = curso?.horas_teoria || 0;
      const horasP = curso?.horas_practica || 0;
      const horasL = curso?.horas_laboratorio || 0;
      const horasTotal = horasT + horasP + horasL;
      const grupo = h.grupo?.codigo_grupo || '-';

      return `
      <tr>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px; font-weight: bold;">${profNum}</td>
        <td style="border: 1px solid #000; padding: 4px; font-size: 10px;">${h.docente ? h.docente.apellidos + ' ' + h.docente.nombres : 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 4px; font-size: 10px;">${h.curso?.nombre || 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${horasT}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${horasP}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${horasL}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${grupo}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${horasTotal}</td>
        <td style="border: 1px solid #000; padding: 4px; font-size: 10px;">Ing. de Sistemas</td>
      </tr>
    `;
    }).join('');

    // Construir filas de horario - simplificado
    const filasHorario = horasRango.map(hora => {
      const celdas = [
        `<td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #e0e0e0; text-align: center; font-size: 9px;">${hora}</td>`
      ];

      diasSemana.forEach(dia => {
        const horario = matrizHorarios[dia]?.[hora];
        
        if (horario) {
          // Buscar el número del profesor/curso
          const cursoInfo = cursosMap.get(horario.idCursoRef);
          const profNum = cursoInfo?.profNum || '?';
          const bgColor = cursosColores[profNum] || '#FFFFFF';
          const tipoCorto = horario.tipo === 'Laboratorio' ? 'Lab' : horario.tipo.substring(0, 3);
          
          celdas.push(`
            <td style="border: 1px solid #000; padding: 4px; background-color: ${bgColor}; font-size: 8px; text-align: center; vertical-align: middle; font-weight: bold;">
              <div>${horario.cursoNombre}</div>
              <div>(${tipoCorto})</div>
              <div>Prof. ${profNum}</div>
            </td>
          `);
        } else {
          celdas.push(`<td style="border: 1px solid #000; padding: 4px; background-color: #FFFFFF;"></td>`);
        }
      });

      celdas.push(`<td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #e0e0e0; text-align: center; font-size: 9px;">${hora}</td>`);

      return `<tr>${celdas.join('')}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Aula - ${ambiente?.nombre}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            padding: 10px; 
            font-size: 10px;
            background: white;
          }
          .header-uni { 
            text-align: center; 
            margin-bottom: 5px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 5px; 
          }
          .header-uni h1 { 
            font-size: 12px; 
            font-weight: bold; 
            margin-bottom: 1px; 
          }
          .header-uni p { 
            font-size: 9px; 
            margin: 0; 
          }
          .info-section { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr 1fr; 
            gap: 5px; 
            margin-bottom: 5px; 
            font-size: 8px; 
          }
          .info-box { 
            display: flex;
            gap: 3px;
          }
          .info-label { 
            font-weight: bold; 
            min-width: 60px;
          }
          .info-value {
            flex: 1;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 5px 0; 
            font-size: 8px; 
            page-break-inside: avoid;
          }
          th { 
            background-color: #1e3a8a; 
            color: white; 
            padding: 3px; 
            text-align: center;
            border: 1px solid #000;
            font-weight: bold; 
            font-size: 7px;
          }
          td { 
            border: 1px solid #000; 
            padding: 2px; 
          }
          .firma-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            page-break-before: auto;
          }
          .firma-box {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 30px;
          }
          @media print {
            @page {
              size: A4 landscape;
              margin: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-uni">
          <h1>UNIVERSIDAD NACIONAL DE TRUJILLO</h1>
          <p>FACULTAD DE INGENIERIA | TRUJILLO</p>
        </div>

        <div class="info-section">
          <div class="info-box">
            <span class="info-label">ESCUELA:</span>
            <span class="info-value">${escuela}</span>
          </div>
          <div class="info-box">
            <span class="info-label">AÑO:</span>
            <span class="info-value">${periodo?.anio || '2026'}</span>
          </div>
          <div class="info-box">
            <span class="info-label">CICLO:</span>
            <span class="info-value">I</span>
          </div>
          <div class="info-box">
            <span class="info-label">SEMESTRE:</span>
            <span class="info-value">I</span>
          </div>
        </div>

        <table style="margin-top: 5px;">
          <thead>
            <tr>
              <th>HORA</th>
              <th>LUNES</th>
              <th>MARTES</th>
              <th>MIERCOLES</th>
              <th>JUEVES</th>
              <th>VIERNES</th>
              <th>SABADO</th>
              <th>HORA</th>
            </tr>
          </thead>
          <tbody>
            ${filasHorario}
          </tbody>
        </table>

        <h3 style="font-size: 10px; margin-top: 10px; border-bottom: 1px solid #000;">Relación de Docentes y Asignaturas</h3>
        <table style="margin-top: 5px;">
          <thead>
            <tr>
              <th>Nº</th>
              <th>PROFESOR</th>
              <th>ASIGNATURA</th>
              <th>T</th>
              <th>P</th>
              <th>L</th>
              <th>G</th>
              <th>T.HORAS</th>
              <th>DEPARTAMENTO</th>
            </tr>
          </thead>
          <tbody>
            ${filasProf}
          </tbody>
        </table>

        <div class="firma-section">
          <div class="firma-box">Director de Escuela</div>
          <div class="firma-box">Coordinador Académico</div>
          <div class="firma-box">Docente Responsable</div>
        </div>

        <div style="text-align: center; font-size: 7px; color: #666; margin-top: 5px;">
          <p>Reporte generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </body>
      </html>
    `;
  }

  // Obtener color según departamento
  private static getColorDepartamento(tipo: string): string {
    // Deprecated - use colores cursos instead
    return '#FFFFFF';
  }

  // Generación de Excel - Formato profesional con colores y estilos
  static async generarExcelAula(idAmbiente: number, idPeriodo: number): Promise<Buffer> {
    const ambiente = await prisma.ambiente.findUnique({
      where: { id_ambiente: idAmbiente }
    });

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_ambiente: idAmbiente,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: { curso: true, grupo: true, docente: true, ambiente: true },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Horario Semanal
    const worksheet = workbook.addWorksheet('Horario Semanal');

    // Estilos
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF1E3A8A' }, size: 14 },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const subTitleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 11 },
      alignment: { vertical: 'middle', horizontal: 'left' }
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    const hourCellStyle: Partial<ExcelJS.Style> = {
      ...cellStyle,
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } }
    };

    // Título principal
    worksheet.mergeCells('A1:H1');
    const cellTitle = worksheet.getCell('A1');
    cellTitle.value = 'UNIVERSIDAD NACIONAL DE TRUJILLO';
    cellTitle.style = titleStyle;

    worksheet.mergeCells('A2:H2');
    const cellSubtitle1 = worksheet.getCell('A2');
    cellSubtitle1.value = 'FACULTAD DE INGENIERÍA';
    cellSubtitle1.style = { ...titleStyle, font: { ...titleStyle.font, size: 12 } };

    worksheet.mergeCells('A3:H3');
    const cellSubtitle2 = worksheet.getCell('A3');
    cellSubtitle2.value = 'TRUJILLO';
    cellSubtitle2.style = { ...titleStyle, font: { ...titleStyle.font, size: 11 } };

    worksheet.addRow([]);

    // Información del periodo y ambiente
    worksheet.mergeCells('A5:B5');
    const cellEscuela = worksheet.getCell('A5');
    cellEscuela.value = 'ESCUELA:';
    cellEscuela.style = subTitleStyle;
    worksheet.mergeCells('C5:H5');
    worksheet.getCell('C5').value = ambiente?.nombre || 'INGENIERÍA DE SISTEMAS';
    worksheet.getCell('C5').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('A6:B6');
    worksheet.getCell('A6').value = 'AÑO:';
    worksheet.getCell('A6').style = subTitleStyle;
    worksheet.mergeCells('C6:D6');
    worksheet.getCell('C6').value = periodo?.anio || '2026';
    worksheet.getCell('C6').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('E6:F6');
    worksheet.getCell('E6').value = 'CICLO:';
    worksheet.getCell('E6').style = subTitleStyle;
    worksheet.mergeCells('G6:H6');
    worksheet.getCell('G6').value = 'I';
    worksheet.getCell('G6').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('A7:B7');
    worksheet.getCell('A7').value = 'INICIO:';
    worksheet.getCell('A7').style = subTitleStyle;
    worksheet.mergeCells('C7:D7');
    worksheet.getCell('C7').value = periodo?.fecha_inicio_clases ? new Date(periodo.fecha_inicio_clases).toLocaleDateString('es-ES') : '13-04-2026';
    worksheet.getCell('C7').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('E7:F7');
    worksheet.getCell('E7').value = 'FIN:';
    worksheet.getCell('E7').style = subTitleStyle;
    worksheet.mergeCells('G7:H7');
    worksheet.getCell('G7').value = periodo?.fecha_fin_clases ? new Date(periodo.fecha_fin_clases).toLocaleDateString('es-ES') : '08-08-2026';
    worksheet.getCell('G7').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.addRow([]);

    // Preparar datos para tabla de horarios
    const horariosSet = new Map();
    horarios.forEach(h => {
      const key = `${h.id_docente}-${h.id_curso}`;
      if (!horariosSet.has(key)) {
        horariosSet.set(key, h);
      }
    });
    const horariosUnicos = Array.from(horariosSet.values());
    const cursosMap = new Map();
    const cursosColores: { [key: number]: string } = {};
    horariosUnicos.forEach((h, idx) => {
      const cursoKey = h.id_curso;
      if (!cursosMap.has(cursoKey)) {
        const profNum = idx + 1;
        cursosMap.set(cursoKey, { profNum, cursoNombre: h.curso?.nombre });
        cursosColores[profNum] = COLORES_CURSOS[idx % COLORES_CURSOS.length];
      }
    });

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horasRango = this.generarHorasStandard();
    const matrizHorarios = this.crearMatrizHorariosOptimizada(horarios, diasSemana, horasRango);

    // Encabezado del horario
    const headerRow = worksheet.addRow(['HORA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'HORA']);
    headerRow.eachCell((cell, colNumber) => {
      cell.style = headerStyle;
    });

    // Filas del horario
    horasRango.forEach((hora) => {
      const row = worksheet.addRow([hora]);
      row.getCell(1).style = hourCellStyle;

      diasSemana.forEach((dia, idx) => {
        const horario = matrizHorarios[dia]?.[hora];
        if (horario) {
          const cursoInfo = cursosMap.get(horario.idCursoRef);
          const profNum = cursoInfo?.profNum || '?';
          const color = cursosColores[profNum] || 'FFFFFF';
          const tipoCorto = horario.tipo === 'Laboratorio' ? 'Lab' : horario.tipo.substring(0, 3);
          
          const cell = row.getCell(idx + 2);
          cell.value = `${horario.cursoNombre}\n(${tipoCorto})\nProf. ${profNum}`;
          cell.style = {
            ...cellStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color.replace('#', '')}` } },
            font: { bold: true, size: 9 }
          };
        } else {
          row.getCell(idx + 2).style = cellStyle;
        }
      });

      row.getCell(8).value = hora;
      row.getCell(8).style = hourCellStyle;
    });

    // Ajustar ancho de columnas
    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(8).width = 10;
    for (let i = 2; i <= 7; i++) {
      worksheet.getColumn(i).width = 20;
    }
    worksheet.getRow(1).height = 25;
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 22;

    // Hoja 2: Tabla de Profesores
    const worksheetProfesores = workbook.addWorksheet('Profesores y Cursos');

    // Título
    worksheetProfesores.mergeCells('A1:I1');
    worksheetProfesores.getCell('A1').value = 'LISTADO DE PROFESORES Y ASIGNATURAS';
    worksheetProfesores.getCell('A1').style = titleStyle;

    worksheetProfesores.addRow([]);

    // Encabezado de la tabla
    const headerProfRow = worksheetProfesores.addRow(['Nº', 'PROFESOR', 'ASIGNATURA', 'T', 'P', 'L', 'G', 'T.HORAS', 'DEPARTAMENTO']);
    headerProfRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Filas de la tabla
    horariosUnicos.forEach((h, idx) => {
      const color = cursosColores[idx + 1] || 'FFFFFF';
      const curso = h.curso;
      const horasT = curso?.horas_teoria || 0;
      const horasP = curso?.horas_practica || 0;
      const horasL = curso?.horas_laboratorio || 0;
      const horasTotal = horasT + horasP + horasL;
      const grupo = h.grupo?.codigo_grupo || '-';

      const row = worksheetProfesores.addRow([
        idx + 1,
        h.docente ? `${h.docente.apellidos} ${h.docente.nombres}` : 'N/A',
        h.curso?.nombre || 'N/A',
        horasT,
        horasP,
        horasL,
        grupo,
        horasTotal,
        'Ing. de Sistemas'
      ]);
      row.eachCell((cell, colNumber) => {
        cell.style = {
          ...cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color.replace('#', '')}` } },
          alignment: { vertical: 'middle', horizontal: colNumber === 1 ? 'center' : 'left' }
        };
      });
    });

    // Ajustar ancho de columnas
    worksheetProfesores.getColumn(1).width = 6;
    worksheetProfesores.getColumn(2).width = 30;
    worksheetProfesores.getColumn(3).width = 35;
    for (let i = 4; i <= 8; i++) {
      worksheetProfesores.getColumn(i).width = 10;
    }
    worksheetProfesores.getColumn(9).width = 20;

    return await workbook.xlsx.writeBuffer();
  }

  static async generarExcelCiclo(idPeriodo: number, ciclo: number): Promise<Buffer> {
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] },
        curso: { ciclo }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true,
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Horario Semanal');

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF1E3A8A' }, size: 14 },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = 'UNIVERSIDAD NACIONAL DE TRUJILLO';
    worksheet.getCell('A1').style = titleStyle;

    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').value = 'FACULTAD DE INGENIERÍA';
    worksheet.getCell('A2').style = { ...titleStyle, font: { ...titleStyle.font, size: 12 } };

    worksheet.mergeCells('A3:H3');
    worksheet.getCell('A3').value = `REPORTE POR CICLO ${ciclo}`;
    worksheet.getCell('A3').style = { ...titleStyle, font: { ...titleStyle.font, size: 11 } };

    worksheet.addRow([]);
    worksheet.mergeCells('A5:B5');
    worksheet.getCell('A5').value = 'ESCUELA:';
    worksheet.getCell('A5').style = subTitleStyle;
    worksheet.mergeCells('C5:H5');
    worksheet.getCell('C5').value = 'INGENIERÍA DE SISTEMAS';
    worksheet.getCell('C5').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('A6:B6');
    worksheet.getCell('A6').value = 'AÑO:';
    worksheet.getCell('A6').style = subTitleStyle;
    worksheet.mergeCells('C6:D6');
    worksheet.getCell('C6').value = periodo?.anio || 'N/A';
    worksheet.getCell('C6').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('E6:F6');
    worksheet.getCell('E6').value = 'CICLO:';
    worksheet.getCell('E6').style = subTitleStyle;
    worksheet.mergeCells('G6:H6');
    worksheet.getCell('G6').value = `${ciclo}`;
    worksheet.getCell('G6').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('A7:B7');
    worksheet.getCell('A7').value = 'INICIO:';
    worksheet.getCell('A7').style = subTitleStyle;
    worksheet.mergeCells('C7:D7');
    worksheet.getCell('C7').value = periodo?.fecha_inicio_clases ? new Date(periodo.fecha_inicio_clases).toLocaleDateString('es-ES') : 'N/A';
    worksheet.getCell('C7').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.mergeCells('E7:F7');
    worksheet.getCell('E7').value = 'FIN:';
    worksheet.getCell('E7').style = subTitleStyle;
    worksheet.mergeCells('G7:H7');
    worksheet.getCell('G7').value = periodo?.fecha_fin_clases ? new Date(periodo.fecha_fin_clases).toLocaleDateString('es-ES') : 'N/A';
    worksheet.getCell('G7').style = { ...subTitleStyle, font: { ...subTitleStyle.font, bold: false } };

    worksheet.addRow([]);

    const horariosSet = new Map();
    horarios.forEach(h => {
      const key = `${h.id_docente}-${h.id_curso}`;
      if (!horariosSet.has(key)) {
        horariosSet.set(key, h);
      }
    });

    const horariosUnicos = Array.from(horariosSet.values());
    const cursosMap = new Map();
    const cursosColores: { [key: number]: string } = {};
    horariosUnicos.forEach((h, idx) => {
      const cursoKey = h.id_curso;
      if (!cursosMap.has(cursoKey)) {
        const profNum = idx + 1;
        cursosMap.set(cursoKey, { profNum, cursoNombre: h.curso?.nombre });
        cursosColores[profNum] = COLORES_CURSOS[idx % COLORES_CURSOS.length];
      }
    });

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horasRango = this.generarHorasStandard();
    const matrizHorarios = this.crearMatrizHorariosOptimizada(horarios, diasSemana, horasRango);

    const headerProfRow = worksheet.addRow(['Nº', 'PROFESOR', 'ASIGNATURA', 'T', 'P', 'L', 'G', 'T.HORAS', 'DEPARTAMENTO']);
    headerProfRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    horariosUnicos.forEach((h, idx) => {
      const color = cursosColores[idx + 1] || 'FFFFFF';
      const row = worksheet.addRow([
        idx + 1,
        h.docente ? `${h.docente.apellidos} ${h.docente.nombres}` : 'N/A',
        h.curso?.nombre || 'N/A',
        h.curso?.horas_teoria || 0,
        h.curso?.horas_practica || 0,
        h.curso?.horas_laboratorio || 0,
        h.grupo?.codigo_grupo || 'N/A',
        (h.curso?.horas_teoria || 0) + (h.curso?.horas_practica || 0) + (h.curso?.horas_laboratorio || 0),
        'Ing. de Sistemas'
      ]);
      row.eachCell((cell, colNumber) => {
        cell.style = {
          ...cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color.replace('#', '')}` } },
          alignment: { vertical: 'middle', horizontal: colNumber === 1 ? 'center' : 'left' }
        };
      });
    });

    worksheet.addRow([]);

    const headerHorario = worksheet.addRow(['HORA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'HORA']);
    headerHorario.eachCell((cell) => {
      cell.style = headerStyle;
    });

    horasRango.forEach((hora) => {
      const row = worksheet.addRow([hora]);
      row.getCell(1).style = hourCellStyle;

      diasSemana.forEach((dia, idx) => {
        const horario = matrizHorarios[dia]?.[hora];
        if (horario) {
          const cursoInfo = cursosMap.get(horario.idCursoRef);
          const profNum = cursoInfo?.profNum || '?';
          const color = cursosColores[profNum] || 'FFFFFF';
          const tipoCorto = horario.tipo === 'Laboratorio' ? 'Lab' : horario.tipo.substring(0, 3);

          const cell = row.getCell(idx + 2);
          cell.value = `${horario.cursoNombre}\n(${tipoCorto})\nProf. ${profNum}`;
          cell.style = {
            ...cellStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color.replace('#', '')}` } },
            font: { bold: true, size: 9 }
          };
        } else {
          row.getCell(idx + 2).style = cellStyle;
        }
      });

      row.getCell(8).value = hora;
      row.getCell(8).style = hourCellStyle;
    });

    worksheet.getColumn(1).width = 6;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 35;
    for (let i = 4; i <= 8; i++) {
      worksheet.getColumn(i).width = 10;
    }

    return await workbook.xlsx.writeBuffer();
  }

  static async generarExcelDocente(idDocente: number, idPeriodo: number): Promise<Buffer> {
    const docente = await prisma.docente.findUnique({
      where: { id_docente: idDocente }
    });

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: { curso: true, grupo: true, ambiente: true },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Horario Docente');

    // Estilos
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF1E3A8A' }, size: 14 },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const altCellStyle: Partial<ExcelJS.Style> = {
      ...cellStyle,
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
    };

    // Título principal
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'UNIVERSIDAD NACIONAL DE TRUJILLO';
    worksheet.getCell('A1').style = titleStyle;

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'FACULTAD DE INGENIERÍA';
    worksheet.getCell('A2').style = { ...titleStyle, font: { ...titleStyle.font, size: 12 } };

    worksheet.mergeCells('A3:F3');
    worksheet.getCell('A3').value = 'HORARIO SEMANAL DEL DOCENTE';
    worksheet.getCell('A3').style = { ...titleStyle, font: { ...titleStyle.font, size: 12 } };

    worksheet.addRow([]);

    // Información del docente
    worksheet.mergeCells('A5:B5');
    worksheet.getCell('A5').value = 'DOCENTE:';
    worksheet.getCell('A5').style = { font: { bold: true, size: 11 }, alignment: { horizontal: 'left' } };
    worksheet.mergeCells('C5:F5');
    worksheet.getCell('C5').value = docente ? `${docente.apellidos} ${docente.nombres}` : 'N/A';
    worksheet.getCell('C5').style = { font: { size: 11 }, alignment: { horizontal: 'left' } };

    worksheet.mergeCells('A6:B6');
    worksheet.getCell('A6').value = 'CÓDIGO:';
    worksheet.getCell('A6').style = { font: { bold: true, size: 11 }, alignment: { horizontal: 'left' } };
    worksheet.mergeCells('C6:D6');
    worksheet.getCell('C6').value = docente?.codigo_docente || 'N/A';
    worksheet.getCell('C6').style = { font: { size: 11 }, alignment: { horizontal: 'left' } };

    worksheet.mergeCells('E6:F6');
    worksheet.getCell('E6').value = 'PERÍODO:';
    worksheet.getCell('E6').style = { font: { bold: true, size: 11 }, alignment: { horizontal: 'left' } };
    worksheet.mergeCells('G6:H6');
    worksheet.getCell('G6').value = periodo?.nombre || 'N/A';
    worksheet.getCell('G6').style = { font: { size: 11 }, alignment: { horizontal: 'left' } };

    worksheet.addRow([]);

    // Encabezado de la tabla
    const headerRow = worksheet.addRow(['DÍA', 'HORA INICIO', 'HORA FIN', 'CURSO', 'GRUPO', 'AMBIENTE']);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Filas de datos
    horarios.forEach((h, idx) => {
      const row = worksheet.addRow([
        this.obtenerNombreDia(h.dia_semana),
        h.hora_inicio,
        h.hora_fin,
        h.curso.nombre,
        h.grupo?.codigo_grupo || 'N/A',
        h.ambiente?.nombre || 'N/A'
      ]);
      row.eachCell((cell) => {
        cell.style = idx % 2 === 0 ? cellStyle : altCellStyle;
      });
    });

    // Ajustar ancho de columnas
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 40;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 25;

    return await workbook.xlsx.writeBuffer();
  }

  // Métodos auxiliares de HTML
  // Reporte por Docente - Horario Semanal
  static async generarReporteDocenteHorario(idDocente: number, idPeriodo: number) {
    const docente = await prisma.docente.findUnique({
      where: { id_docente: idDocente }
    });

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: {
        curso: true,
        grupo: true,
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horariosPorDia: any = {};

    diasSemana.forEach(dia => {
      horariosPorDia[dia] = horarios.filter(h => {
        const diaNum = diasSemana.indexOf(dia) + 1;
        return h.dia_semana === diaNum;
      });
    });

    const html = this.generarHTMLReporteDocenteHorario(docente, periodo, horariosPorDia, diasSemana);
    return await this.convertirAPDF(html);
  }

  // Reporte por Docente - Carga Horaria
  static async generarReporteCargaHoraria(idDocente: number, idPeriodo: number) {
    const docente = await prisma.docente.findUnique({
      where: { id_docente: idDocente }
    });

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: {
        curso: true,
        grupo: true
      }
    });

    const html = this.generarHTMLCargaHoraria(docente, periodo, horarios);
    return await this.convertirAPDF(html);
  }

  // Reporte de Gestión
  static async generarReporteGestion(idPeriodo: number) {
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodo }
    });

    // Obtener estadísticas
    const totalHorarios = await prisma.horarioAsignado.count({
      where: { id_periodo: idPeriodo }
    });

    const totalDocentes = await prisma.horarioAsignado.findMany({
      where: { id_periodo: idPeriodo },
      distinct: ['id_docente']
    });

    const totalAmbientes = await prisma.horarioAsignado.findMany({
      where: { id_periodo: idPeriodo },
      distinct: ['id_ambiente']
    });

    const totalGrupos = await prisma.grupo.count({
      where: { id_periodo: idPeriodo }
    });

    const totalCursos = await prisma.horarioAsignado.findMany({
      where: { id_periodo: idPeriodo },
      distinct: ['id_curso']
    });

    // Cargas horarias por docente
    const docentesConCarga = await prisma.horarioAsignado.groupBy({
      by: ['id_docente'],
      where: { id_periodo: idPeriodo },
      _count: { id_asignacion: true }
    });

    const docentes = await Promise.all(
      docentesConCarga.map(async (d) => {
        const docente = await prisma.docente.findUnique({
          where: { id_docente: d.id_docente || 0 }
        });

        // Calcular horas del docente
        const horariosDocente = await prisma.horarioAsignado.findMany({
          where: {
            id_docente: d.id_docente,
            id_periodo: idPeriodo
          }
        });

        let totalHoras = 0;
        horariosDocente.forEach(h => {
          const [horaI, minI] = h.hora_inicio.split(':').map(Number);
          const [horaF, minF] = h.hora_fin.split(':').map(Number);
          const minutos = (horaF * 60 + minF) - (horaI * 60 + minI);
          totalHoras += minutos / 60;
        });

        return {
          nombre: docente ? `${docente.apellidos}, ${docente.nombres}` : 'Sin asignar',
          horarios: d._count.id_asignacion,
          horas: Math.round(totalHoras * 100) / 100
        };
      })
    );

    const html = this.generarHTMLReporteGestion(periodo, {
      totalHorarios,
      totalDocentes: totalDocentes.length,
      totalAmbientes: totalAmbientes.length,
      totalGrupos,
      totalCursos: totalCursos.length,
      docentes
    });

    return await this.convertirAPDF(html);
  }

  private static generarHTMLReporteDocenteHorario(docente: any, periodo: any, horariosPorDia: any, diasSemana: string[]) {
    const tablasHorario = diasSemana.map((dia, diaIdx) => {
      const horariosDelDia = horariosPorDia[dia];
      if (horariosDelDia.length === 0) return '';

      return `
        <h4 style="margin-top: 20px; margin-bottom: 10px; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; font-size: 14px;">
          ${dia}
        </h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #1e3a8a; color: white;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Hora</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Curso</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Tipo</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Grupo</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Ambiente</th>
            </tr>
          </thead>
          <tbody>
            ${horariosDelDia.map((h: any, idx: number) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${h.hora_inicio} - ${h.hora_fin}</td>
                <td style="border: 1px solid #000; padding: 8px;">${h.curso.nombre}</td>
                <td style="border: 1px solid #000; padding: 8px;">${h.tipo_clase || 'Teoría'}</td>
                <td style="border: 1px solid #000; padding: 8px;">${h.grupo?.codigo_grupo || 'N/A'}</td>
                <td style="border: 1px solid #000; padding: 8px;">${h.ambiente?.nombre || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Horario - ${docente?.apellidos}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; padding: 20px; background-color: white; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; }
          .header h1 { color: #1e3a8a; font-size: 22px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 12px; margin: 2px 0; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 12px; }
          .info-item { padding: 10px; background-color: #f9f9f9; border-left: 4px solid #1e3a8a; }
          .info-label { font-weight: bold; color: #1e3a8a; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Universidad Nacional de Trujillo</h1>
          <h2 style="font-size: 18px; color: #333; margin-top: 5px;">Horario Semanal</h2>
        </div>
        
        <div class="info">
          <div class="info-item">
            <span class="info-label">Docente:</span> ${docente?.apellidos || 'N/A'}, ${docente?.nombres || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Código:</span> ${docente?.codigo_docente || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Categoría:</span> ${docente?.categoria || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Período:</span> ${periodo?.nombre || 'N/A'}
          </div>
        </div>

        ${tablasHorario || '<p style="text-align: center; color: #999;">No hay horarios asignados para este docente.</p>'}

        <div class="footer">
          <p>Reporte generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </body>
      </html>
    `;
  }

  private static generarHTMLReporteCiclo(periodo: any, ciclo: number, horarios: any[], cursosUnicos: any[]) {
    const horariosSet = new Map();
    horarios.forEach(h => {
      const key = `${h.id_docente}-${h.id_curso}`;
      if (!horariosSet.has(key)) {
        horariosSet.set(key, h);
      }
    });

    const horariosUnicos = Array.from(horariosSet.values());

    const cursosMap = new Map();
    const cursosColores: { [key: number]: string } = {};
    horariosUnicos.forEach((h, idx) => {
      const cursoKey = h.id_curso;
      if (!cursosMap.has(cursoKey)) {
        const profNum = idx + 1;
        cursosMap.set(cursoKey, { profNum, cursoNombre: h.curso?.nombre });
        cursosColores[profNum] = COLORES_CURSOS[idx % COLORES_CURSOS.length];
      }
    });

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horasRango = this.generarHorasStandard();
    const matrizHorarios = this.crearMatrizHorariosOptimizada(horarios, diasSemana, horasRango);

    const filasProf = horariosUnicos.map((h, idx) => {
      const profNum = idx + 1;
      const color = cursosColores[profNum];
      const horasCurso = (h.curso?.horas_teoria || 0) + (h.curso?.horas_practica || 0) + (h.curso?.horas_laboratorio || 0);
      return `
      <tr>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px; background-color: ${color}; font-weight: bold;">${profNum}</td>
        <td style="border: 1px solid #000; padding: 4px; font-size: 10px; background-color: ${color};">${h.docente ? h.docente.apellidos + ' ' + h.docente.nombres : 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 4px; font-size: 10px; background-color: ${color};">${h.curso?.nombre || 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${h.curso?.horas_teoria || 0}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${h.curso?.horas_practica || 0}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${h.curso?.horas_laboratorio || 0}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${h.grupo?.codigo_grupo || 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">${horasCurso}</td>
        <td style="border: 1px solid #000; padding: 4px; font-size: 10px;">Ing. de Sistemas</td>
      </tr>
    `;
    }).join('');

    const filasHorario = horasRango.map(hora => {
      const celdas = [
        `<td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #e0e0e0; text-align: center; font-size: 9px;">${hora}</td>`
      ];

      diasSemana.forEach(dia => {
        const horario = matrizHorarios[dia]?.[hora];

        if (horario) {
          const cursoInfo = cursosMap.get(horario.idCursoRef);
          const profNum = cursoInfo?.profNum || '?';
          const bgColor = cursosColores[profNum] || '#FFFFFF';
          const tipoCorto = horario.tipo === 'Laboratorio' ? 'Lab' : horario.tipo.substring(0, 3);

          celdas.push(`
            <td style="border: 1px solid #000; padding: 4px; background-color: ${bgColor}; font-size: 8px; text-align: center; vertical-align: middle; font-weight: bold;">
              <div>${horario.cursoNombre}</div>
              <div>(${tipoCorto})</div>
              <div>Prof. ${profNum}</div>
            </td>
          `);
        } else {
          celdas.push(`<td style="border: 1px solid #000; padding: 4px; background-color: #FFFFFF;"></td>`);
        }
      });

      celdas.push(`<td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #e0e0e0; text-align: center; font-size: 9px;">${hora}</td>`);

      return `<tr>${celdas.join('')}</tr>`;
    }).join('');

    const filasCursosResumen = cursosUnicos.map((h, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#f9f9f9' : 'white'};">
        <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 8px;">${h.curso?.codigo || 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 8px;">${h.curso?.nombre || 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${h.curso?.horas_teoria || 0}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${h.curso?.horas_practica || 0}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${h.curso?.horas_laboratorio || 0}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${h.docente ? `${h.docente.apellidos}, ${h.docente.nombres}` : 'N/A'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${horarios.filter(item => item.id_curso === h.id_curso).length}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Ciclo - ${ciclo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 12px; font-size: 9px; background: white; }
          .header-uni { text-align: center; margin-bottom: 8px; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .header-uni h1 { font-size: 12px; margin-bottom: 2px; }
          .header-uni p { font-size: 9px; margin: 1px 0; }
          .info-section { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 8px; }
          .info-box { border: 1px solid #ccc; padding: 5px; border-radius: 4px; }
          .info-label { font-weight: bold; color: #1e3a8a; display: block; margin-bottom: 2px; font-size: 8px; }
          .info-value { font-size: 8px; }
          .section-title { margin: 10px 0 5px; padding-bottom: 4px; border-bottom: 1px solid #1e3a8a; color: #1e3a8a; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; page-break-inside: avoid; }
          th { background: #1e3a8a; color: white; font-size: 8px; padding: 4px; }
          th, td { border: 1px solid #000; padding: 4px; vertical-align: middle; }
          .firma-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
          }
          .firma-box {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header-uni">
          <h1>Universidad Nacional de Trujillo</h1>
          <p>FACULTAD DE INGENIERÍA | Reporte de Ciclo ${ciclo}</p>
        </div>

        <div class="info-section">
          <div class="info-box">
            <span class="info-label">ESCUELA:</span>
            <span class="info-value">INGENIERÍA DE SISTEMAS</span>
          </div>
          <div class="info-box">
            <span class="info-label">AÑO:</span>
            <span class="info-value">${periodo?.anio || 'N/A'}</span>
          </div>
          <div class="info-box">
            <span class="info-label">CICLO:</span>
            <span class="info-value">${ciclo}</span>
          </div>
          <div class="info-box">
            <span class="info-label">SEMESTRE:</span>
            <span class="info-value">${periodo?.codigo?.endsWith('-II') ? 'II' : 'I'}</span>
          </div>
        </div>

        <h3 class="section-title">Horario Semanal</h3>
        <table style="margin-top: 5px;">
          <thead>
            <tr>
              <th>HORA</th>
              <th>LUNES</th>
              <th>MARTES</th>
              <th>MIERCOLES</th>
              <th>JUEVES</th>
              <th>VIERNES</th>
              <th>SABADO</th>
              <th>HORA</th>
            </tr>
          </thead>
          <tbody>
            ${filasHorario}
          </tbody>
        </table>

        <h3 class="section-title">Relación de Docentes</h3>
        <table style="margin-top: 5px;">
          <thead>
            <tr>
              <th>Nº</th>
              <th>PROFESOR</th>
              <th>ASIGNATURA</th>
              <th>T</th>
              <th>P</th>
              <th>L</th>
              <th>G</th>
              <th>T.HORAS</th>
              <th>DEPARTAMENTO</th>
            </tr>
          </thead>
          <tbody>
            ${filasProf}
          </tbody>
        </table>

        <h3 class="section-title">Resumen de Cursos</h3>
        <table style="page-break-before: auto;">
          <thead>
            <tr>
              <th>N°</th>
              <th>Código</th>
              <th>Curso</th>
              <th>T</th>
              <th>P</th>
              <th>L</th>
              <th>Docente</th>
              <th>Bloques</th>
            </tr>
          </thead>
          <tbody>
            ${filasCursosResumen}
          </tbody>
        </table>

        <div class="firma-section">
          <div class="firma-box">Director de Escuela</div>
          <div class="firma-box">Coordinador Académico</div>
          <div class="firma-box">Docente Responsable</div>
        </div>

        <div style="text-align: center; font-size: 7px; color: #666; margin-top: 10px; border-top: 1px solid #999; padding-top: 5px;">
          <p>Reporte generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </body>
      </html>
    `;
  }

  private static generarHTMLCargaHoraria(docente: any, periodo: any, horarios: any[]) {
    // Agrupar por curso
    const cargaPorCurso: any = {};
    let totalHoras = 0;

    horarios.forEach(h => {
      const nombreCurso = h.curso.nombre;
      if (!cargaPorCurso[nombreCurso]) {
        cargaPorCurso[nombreCurso] = { grupos: 0, horas: 0 };
      }
      cargaPorCurso[nombreCurso].grupos++;
      
      // Calcular horas
      const [horaI, minI] = h.hora_inicio.split(':').map(Number);
      const [horaF, minF] = h.hora_fin.split(':').map(Number);
      const minutos = (horaF * 60 + minF) - (horaI * 60 + minI);
      const horas = minutos / 60;
      
      cargaPorCurso[nombreCurso].horas += horas;
      totalHoras += horas;
    });

    const filasCursos = Object.entries(cargaPorCurso).map(([curso, data]: any) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px;">${curso}</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${data.grupos}</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${data.horas.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Carga Horaria - ${docente?.apellidos}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; background-color: #f5f5f5; }
          .container { max-width: 900px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
          .header h1 { color: #1e40af; font-size: 24px; margin-bottom: 5px; }
          .header h2 { color: #333; font-size: 20px; margin-bottom: 10px; }
          .info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; font-size: 14px; }
          .info-item { display: flex; justify-content: space-between; }
          .info-label { font-weight: bold; color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #1e40af; color: white; padding: 10px; text-align: left; }
          .resumen { background-color: #e8f0ff; padding: 15px; margin: 20px 0; border-left: 4px solid #1e40af; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Universidad Nacional de Trujillo</h1>
            <h2>Reporte de Carga Horaria</h2>
          </div>
          
          <div class="info">
            <div class="info-item">
              <span class="info-label">Docente:</span>
              <span>${docente?.apellidos}, ${docente?.nombres}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código:</span>
              <span>${docente?.codigo_docente || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Categoría:</span>
              <span>${docente?.categoria || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Período:</span>
              <span>${periodo?.nombre || 'N/A'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th style="text-align: center;">Grupos</th>
                <th style="text-align: right;">Horas</th>
              </tr>
            </thead>
            <tbody>
              ${filasCursos}
            </tbody>
          </table>

          <div class="resumen">
            <strong style="color: #1e40af;">Total de Horas Semanales: ${totalHoras.toFixed(2)} horas</strong><br>
            <strong style="color: #1e40af;">Total de Grupos: ${horarios.length}</strong>
          </div>

          <div class="footer">
            <p>Reporte generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generarHTMLReporteGestion(periodo: any, stats: any) {
    // Calcular porcentajes
    const pctDocentes = ((stats.totalDocentes / (stats.totalAmbientes || 1)) * 100).toFixed(1);
    const pctCursos = ((stats.totalCursos / (stats.totalGrupos || 1)) * 100).toFixed(1);
    const horasPorDocente = (stats.totalHorarios / (stats.totalDocentes || 1)).toFixed(2);
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Gestión</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 1000px; margin: 0 auto; background-color: white; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; }
          .header h1 { color: #1e3a8a; font-size: 26px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .period-info { background-color: #e8f0ff; padding: 15px; border-left: 4px solid #1e3a8a; margin-bottom: 20px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0; }
          .stat-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
          .stat-label { font-size: 12px; opacity: 0.9; }
          .stat-box.alt1 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          .stat-box.alt2 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          .stat-box.alt3 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
          .stat-box.alt4 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
          .stat-box.alt5 { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
          .section { margin-top: 30px; }
          .section-title { color: #1e3a8a; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #1e3a8a; color: white; padding: 12px; text-align: left; font-weight: bold; }
          td { border: 1px solid #ddd; padding: 10px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f0f0f0; }
          .metric-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
          .metric { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1e3a8a; }
          .metric-label { font-weight: bold; color: #333; font-size: 14px; }
          .metric-value { font-size: 20px; color: #1e3a8a; font-weight: bold; margin-top: 5px; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Universidad Nacional de Trujillo</h1>
            <h2>Reporte de Gestión y Estadísticas</h2>
          </div>

          <div class="period-info">
            <strong>Período Académico:</strong> ${periodo?.nombre || 'N/A'} | 
            <strong>Año:</strong> ${periodo?.anio || 'N/A'} | 
            <strong>Semestre:</strong> ${periodo?.semestre || 'I'}
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-number">${stats.totalHorarios}</div>
              <div class="stat-label">Horarios Asignados</div>
            </div>
            <div class="stat-box alt1">
              <div class="stat-number">${stats.totalDocentes}</div>
              <div class="stat-label">Docentes Activos</div>
            </div>
            <div class="stat-box alt2">
              <div class="stat-number">${stats.totalGrupos}</div>
              <div class="stat-label">Grupos de Clase</div>
            </div>
            <div class="stat-box alt3">
              <div class="stat-number">${stats.totalAmbientes}</div>
              <div class="stat-label">Ambientes Utilizados</div>
            </div>
            <div class="stat-box alt4">
              <div class="stat-number">${stats.totalCursos}</div>
              <div class="stat-label">Cursos Dictados</div>
            </div>
            <div class="stat-box alt5">
              <div class="stat-number">${horasPorDocente}</div>
              <div class="stat-label">Promedio Horas/Docente</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Indicadores de Distribución</div>
            <div class="metric-row">
              <div class="metric">
                <div class="metric-label">Docentes por Ambiente</div>
                <div class="metric-value">${pctDocentes}%</div>
              </div>
              <div class="metric">
                <div class="metric-label">Cursos por Grupo</div>
                <div class="metric-value">${pctCursos}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Carga Horaria por Docente</div>
            <table>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th style="text-align: center;">Horarios Asignados</th>
                  <th style="text-align: right;">Horas Totales</th>
                </tr>
              </thead>
              <tbody>
                ${stats.docentes.map((d: any) => `
                  <tr>
                    <td>${d.nombre}</td>
                    <td style="text-align: center;">${d.horarios}</td>
                    <td style="text-align: right;"><strong>${d.horas} hrs</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Reporte generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style="margin-top: 10px; font-size: 10px; color: #999;">Sistema de Horarios - Universidad Nacional de Trujillo</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static obtenerNombreDia(numeroDia: number): string {
    // Soportar tanto rango 0-6 como 1-7
    // 0 o 1 = Lunes, 1 o 2 = Martes, ..., 6 o 7 = Domingo
    const diasZero = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const diasUno = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // Intentar primero con rango 0-6
    if (numeroDia >= 0 && numeroDia < diasZero.length) {
      return diasZero[numeroDia];
    }
    
    // Si no, intentar con rango 1-7
    if (numeroDia >= 0 && numeroDia < diasUno.length) {
      return diasUno[numeroDia] || 'N/A';
    }
    
    return 'N/A';
  }

  private static async convertirAPDF(html: string): Promise<Buffer> {
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    };

    // Usar @sparticuz/chromium si está disponible (Render)
    if (chromium) {
      launchOptions.executablePath = await chromium.executablePath();
    }
    // O usar PUPPETEER_EXECUTABLE_PATH si está configurado (local Windows)
    else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }
}

