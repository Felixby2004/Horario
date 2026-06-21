import * as ExcelJS from 'exceljs';
import { obtenerCodigoTipoCurso, obtenerEtiquetaCarreraCurso } from '@/lib/cursos';
import { obtenerPlanPorId, obtenerCursosDePlan } from '@/lib/planesEstudio';
import { puppeteerPool } from '@/services/reportes/PuppeteerPool';

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(fecha);
}

function escaparHtml(valor?: string | null) {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function obtenerDatosExportacion(idPlan: number) {
  const plan = await obtenerPlanPorId(idPlan);
  if (!plan) {
    throw new Error('Plan de estudio no encontrado.');
  }

  const cursos = await obtenerCursosDePlan(plan.codigo);
  const cursosPorCiclo = new Map<number, typeof cursos>();

  cursos.forEach((curso) => {
    const ciclo = curso.ciclo || 0;
    const acumulado = cursosPorCiclo.get(ciclo) || [];
    acumulado.push(curso);
    cursosPorCiclo.set(ciclo, acumulado);
  });

  const ciclos = Array.from(cursosPorCiclo.keys()).sort((a, b) => a - b);
  return { plan, cursos, cursosPorCiclo, ciclos };
}

function etiquetaCiclo(ciclo: number) {
  return ciclo > 0 ? String(ciclo) : '-';
}

export async function generarExcelPlanEstudio(idPlan: number) {
  const { plan, cursosPorCiclo, ciclos } = await obtenerDatosExportacion(idPlan);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema Horario';
  workbook.created = new Date();

  const hoja = workbook.addWorksheet('Plan de estudios');
  hoja.columns = [
    { header: '#', key: 'indice', width: 8 },
    { header: 'Ciclo', key: 'ciclo', width: 8 },
    { header: 'Tipo Curso', key: 'tipo', width: 12 },
    { header: 'Curso', key: 'curso', width: 44 },
    { header: 'T', key: 't', width: 6 },
    { header: 'P', key: 'p', width: 6 },
    { header: 'L', key: 'l', width: 6 },
    { header: 'C', key: 'c', width: 6 },
    { header: 'Departamento Responsable', key: 'departamento', width: 30 }
  ];

  hoja.mergeCells('A1:E1');
  hoja.getCell('A1').value = 'UNIVERSIDAD NACIONAL DE TRUJILLO';
  hoja.getCell('A1').font = { bold: true, size: 11 };
  hoja.getCell('A1').alignment = { horizontal: 'left' };

  hoja.mergeCells('F1:I1');
  hoja.getCell('F1').value = `Fecha de impresion: ${formatearFecha(new Date())}`;
  hoja.getCell('F1').font = { size: 10 };
  hoja.getCell('F1').alignment = { horizontal: 'right' };

  hoja.mergeCells('A3:I3');
  hoja.getCell('A3').value = `PLAN DE ESTUDIOS ${plan.nombre.toUpperCase()}`;
  hoja.getCell('A3').font = { bold: true, size: 14 };
  hoja.getCell('A3').alignment = { horizontal: 'center' };

  const encabezado = hoja.getRow(5);
  encabezado.values = ['#', 'Ciclo', 'Tipo Curso', 'Curso', 'T', 'P', 'L', 'C', 'Departamento Responsable'];
  encabezado.height = 26;
  encabezado.eachCell((cell) => {
    cell.font = { bold: true, size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB6A86B' } },
      bottom: { style: 'thin', color: { argb: 'FFB6A86B' } }
    };
  });

  let fila = 6;
  for (const ciclo of ciclos) {
    const cursos = cursosPorCiclo.get(ciclo) || [];

    cursos.forEach((curso, indice) => {
      hoja.getCell(`A${fila}`).value = curso.id_curso;
      hoja.getCell(`B${fila}`).value = etiquetaCiclo(ciclo);
      hoja.getCell(`C${fila}`).value = obtenerCodigoTipoCurso(curso.tipo_curso);
      hoja.getCell(`D${fila}`).value = curso.nombre;
      hoja.getCell(`E${fila}`).value = curso.horas_teoria || 0;
      hoja.getCell(`F${fila}`).value = curso.horas_practica || 0;
      hoja.getCell(`G${fila}`).value = curso.horas_laboratorio || 0;
      hoja.getCell(`H${fila}`).value = curso.creditos;
      hoja.getCell(`I${fila}`).value = obtenerEtiquetaCarreraCurso(
        curso.departamento?.nombre || curso.escuela_profesional || ''
      );

      hoja.getRow(fila).eachCell((cell) => {
        cell.alignment = {
          vertical: 'top',
          horizontal: cell.address.startsWith('D') || cell.address.startsWith('I') ? 'left' : 'center',
          wrapText: true
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFB6A86B' } }
        };
      });

      fila += 1;

      if (curso.prerequisitos) {
        hoja.mergeCells(`A${fila}:I${fila}`);
        hoja.getCell(`A${fila}`).value = `* ${curso.id_curso} ${curso.prerequisitos}`;
        hoja.getCell(`A${fila}`).font = { size: 9, italic: true };
        hoja.getCell(`A${fila}`).alignment = { horizontal: 'left', wrapText: true };
        hoja.getCell(`A${fila}`).border = {
          bottom: { style: 'thin', color: { argb: 'FFB6A86B' } }
        };
        fila += 1;
      }
    });

    hoja.getCell(`A${fila}`).value = '';
    hoja.mergeCells(`B${fila}:G${fila}`);
    hoja.getCell(`B${fila}`).value = 'Suma de creditos:';
    hoja.getCell(`B${fila}`).font = { bold: true };
    hoja.getCell(`B${fila}`).alignment = { horizontal: 'right' };
    hoja.getCell(`H${fila}`).value = cursos.reduce((total, curso) => total + curso.creditos, 0);
    hoja.getCell(`H${fila}`).font = { bold: true };
    hoja.getCell(`H${fila}`).alignment = { horizontal: 'center' };
    hoja.getCell(`I${fila}`).value = '';

    for (const columna of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']) {
      hoja.getCell(`${columna}${fila}`).border = {
        bottom: { style: 'thin', color: { argb: 'FFB6A86B' } }
      };
    }

    fila += 1;
  }

  hoja.views = [{ state: 'frozen', ySplit: 5 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function construirHtmlPlan(datos: Awaited<ReturnType<typeof obtenerDatosExportacion>>) {
  const fecha = formatearFecha(new Date());
  const filas = datos.ciclos
    .map((ciclo) => {
      const cursos = datos.cursosPorCiclo.get(ciclo) || [];
      const filasCurso = cursos
        .map((curso, indice) => {
          const prerequisitos = curso.prerequisitos
            ? `<tr class="prereq"><td colspan="9">* ${curso.id_curso} ${escaparHtml(curso.prerequisitos)}</td></tr>`
            : '';

          return `
            <tr>
              <td>${curso.id_curso}</td>
              <td>${escaparHtml(etiquetaCiclo(ciclo))}</td>
              <td>${escaparHtml(obtenerCodigoTipoCurso(curso.tipo_curso))}</td>
              <td class="curso">${escaparHtml(curso.nombre)}</td>
              <td>${curso.horas_teoria || 0}</td>
              <td>${curso.horas_practica || 0}</td>
              <td>${curso.horas_laboratorio || 0}</td>
              <td>${curso.creditos}</td>
              <td>${escaparHtml(obtenerEtiquetaCarreraCurso(curso.departamento?.nombre || curso.escuela_profesional || ''))}</td>
            </tr>
            ${prerequisitos}
          `;
        })
        .join('');

      return `
        ${filasCurso}
        <tr class="sum-row">
          <td></td>
          <td colspan="6">Suma de creditos:</td>
          <td>${cursos.reduce((total, curso) => total + curso.creditos, 0)}</td>
          <td></td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 18mm 12mm; }
          body { font-family: Arial, sans-serif; color: #111827; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #b6a86b; padding: 4px 6px; vertical-align: top; }
          .meta-row th, .title-row th { border-bottom: none; }
          .left { text-align: left; font-size: 11px; }
          .right { text-align: right; font-size: 11px; font-weight: normal; }
          .title-row th { font-size: 16px; text-align: center; padding: 14px 0 10px; }
          .head-row th { text-align: center; font-size: 11px; }
          td { text-align: center; }
          td.curso { text-align: left; }
          .prereq td { text-align: left; font-size: 9px; color: #4b5563; padding-top: 2px; }
          .sum-row td { font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr class="meta-row">
              <th colspan="5" class="left">UNIVERSIDAD NACIONAL DE TRUJILLO</th>
              <th colspan="4" class="right">Fecha de Impresion: ${escaparHtml(fecha)}</th>
            </tr>
            <tr class="title-row">
              <th colspan="9">PLAN DE ESTUDIOS ${escaparHtml(datos.plan.nombre.toUpperCase())}</th>
            </tr>
            <tr class="head-row">
              <th>#</th>
              <th>Ciclo</th>
              <th>Tipo Curso</th>
              <th>Curso</th>
              <th>T</th>
              <th>P</th>
              <th>L</th>
              <th>C</th>
              <th>Departamento Responsable</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </body>
    </html>
  `;
}

export async function generarPdfPlanEstudio(idPlan: number) {
  const datos = await obtenerDatosExportacion(idPlan);
  const html = construirHtmlPlan(datos);
  const page = await puppeteerPool.getPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '8mm',
        bottom: '10mm',
        left: '8mm'
      }
    });

    return Buffer.from(pdf);
  } finally {
    await puppeteerPool.releasePage(page);
  }
}
