import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export class ImportadorDocentes {
  static async importarDesdeExcel(archivoBuffer: Buffer): Promise<{
    exitosos: number;
    errores: any[];
  }> {
    const workbook = XLSX.read(archivoBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datos = XLSX.utils.sheet_to_json(worksheet);

    const exitosos: number[] = [];
    const errores: any[] = [];

    for (let i = 0; i < datos.length; i++) {
      const fila: any = datos[i];
      
      try {
        const codigo = String(fila.codigo || fila.Codigo).trim();
        
        // Verificar si el docente ya existe
        const docenteExistente = await prisma.docente.findUnique({
          where: { codigo_docente: codigo }
        });

        if (docenteExistente) {
          // Actualizar en lugar de crear
          await prisma.docente.update({
            where: { codigo_docente: codigo },
            data: {
              nombres: String(fila.nombres || fila.Nombres),
              apellidos: String(fila.apellidos || fila.Apellidos),
              modalidad: String(fila.modalidad || fila.Modalidad || 'contratado').toLowerCase(),
              categoria: String(fila.categoria || fila.Categoria || 'auxiliar').toLowerCase(),
              correo_electronico: String(fila.correo || fila.Correo || ''),
              telefono: String(fila.telefono || fila.Telefono || ''),
              grado_academico: String(fila.grado || fila.Grado || 'licenciado'),
              especialidad: String(fila.especialidad || fila.Especialidad || ''),
              antiguedad: parseInt(fila.antiguedad || fila.Antiguedad || '0')
            }
          });
        } else {
          // Crear nuevo docente
          await prisma.docente.create({
            data: {
              codigo_docente: codigo,
              nombres: String(fila.nombres || fila.Nombres),
              apellidos: String(fila.apellidos || fila.Apellidos),
              modalidad: String(fila.modalidad || fila.Modalidad || 'contratado').toLowerCase(),
              categoria: String(fila.categoria || fila.Categoria || 'auxiliar').toLowerCase(),
              correo_electronico: String(fila.correo || fila.Correo || ''),
              telefono: String(fila.telefono || fila.Telefono || ''),
              grado_academico: String(fila.grado || fila.Grado || 'licenciado'),
              especialidad: String(fila.especialidad || fila.Especialidad || ''),
              antiguedad: parseInt(fila.antiguedad || fila.Antiguedad || '0')
            }
          });
        }
        
        exitosos.push(i + 1);
      } catch (error: any) {
        errores.push({
          fila: i + 1,
          error: error.message,
          datos: fila
        });
      }
    }

    return {
      exitosos: exitosos.length,
      errores
    };
  }

  static async importarDesdeCSV(texto: string): Promise<{
    exitosos: number;
    errores: any[];
  }> {
    const lineas = texto.split('\n');
    const headers = lineas[0].split(',').map(h => h.trim());

    const exitosos: number[] = [];
    const errores: any[] = [];

    for (let i = 1; i < lineas.length; i++) {
      const valores = lineas[i].split(',');
      
      if (valores.length < headers.length) continue;

      const fila: any = {};
      headers.forEach((header, idx) => {
        fila[header] = valores[idx]?.trim();
      });

      try {
        const codigo = fila.codigo?.trim();
        
        if (!codigo) {
          errores.push({
            fila: i,
            error: 'Código de docente es requerido',
            datos: fila
          });
          continue;
        }

        // Verificar si docente existe
        const docenteExistente = await prisma.docente.findUnique({
          where: { codigo_docente: codigo }
        });

        if (docenteExistente) {
          // Actualizar
          await prisma.docente.update({
            where: { codigo_docente: codigo },
            data: {
              nombres: fila.nombres || '',
              apellidos: fila.apellidos || '',
              modalidad: (fila.modalidad || 'contratado').toLowerCase() as any,
              categoria: (fila.categoria || 'auxiliar').toLowerCase() as any,
              correo_electronico: fila.correo || '',
              telefono: fila.telefono || '',
              grado_academico: fila.grado || 'licenciado',
              especialidad: fila.especialidad || '',
              antiguedad: parseInt(fila.antiguedad || '0')
            }
          });
        } else {
          // Crear
          await prisma.docente.create({
            data: {
              codigo_docente: codigo,
              nombres: fila.nombres || '',
              apellidos: fila.apellidos || '',
              modalidad: (fila.modalidad || 'contratado').toLowerCase() as any,
              categoria: (fila.categoria || 'auxiliar').toLowerCase() as any,
              correo_electronico: fila.correo || '',
              telefono: fila.telefono || '',
              grado_academico: fila.grado || 'licenciado',
              especialidad: fila.especialidad || '',
              antiguedad: parseInt(fila.antiguedad || '0')
            }
          });
        }

        exitosos.push(i);
      } catch (error: any) {
        errores.push({
          fila: i,
          error: error.message,
          datos: fila
        });
      }
    }

    return {
      exitosos: exitosos.length,
      errores
    };
  }
}

export class ImportadorCursos {
  static async importarDesdeExcel(archivoBuffer: Buffer): Promise<{
    exitosos: number;
    errores: any[];
  }> {
    const workbook = XLSX.read(archivoBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datos = XLSX.utils.sheet_to_json(worksheet);

    const exitosos: number[] = [];
    const errores: any[] = [];

    for (let i = 0; i < datos.length; i++) {
      const fila: any = datos[i];
      
      try {
        await prisma.curso.create({
          data: {
            codigo_curso: String(fila.codigo || fila.Codigo),
            nombre: String(fila.nombre || fila.Nombre),
            horas_teoria: parseInt(fila.teoria || fila.Teoria || '0'),
            horas_laboratorio: parseInt(fila.laboratorio || fila.Laboratorio || '0'),
            horas_practica: parseInt(fila.practica || fila.Practica || '0'),
            creditos: parseInt(fila.creditos || fila.Creditos || '3'),
            ciclo: parseInt(fila.ciclo || fila.Ciclo || '1')
          }
        });
        
        exitosos.push(i + 1);
      } catch (error: any) {
        errores.push({
          fila: i + 1,
          error: error.message,
          datos: fila
        });
      }
    }

    return {
      exitosos: exitosos.length,
      errores
    };
  }
}
