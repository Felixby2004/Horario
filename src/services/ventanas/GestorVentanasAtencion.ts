import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

export class GestorVentanasAtencion {
  static async crearVentana(datos: any) {
    const ventana = await prisma.ventanaAtencion.create({
      data: {
        id_periodo: datos.id_periodo,
        fecha: new Date(datos.fecha),
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin,
        modalidad: datos.modalidad ?? datos.modalidad_docente,
        categoria: datos.categoria ?? datos.categoria_docente
      }
    });
    return ventana;
  }

  private static normalizarValor(valor: unknown) {
    return String(valor ?? '').trim().toLowerCase();
  }

  private static obtenerPrioridadModalidad(valor: unknown) {
    const modalidad = this.normalizarValor(valor);
    if (modalidad === 'nombrado') return 2;
    if (modalidad === 'contratado') return 1;
    return 0;
  }

  private static obtenerPrioridadCategoria(valor: unknown) {
    const categoria = this.normalizarValor(valor);
    if (categoria === 'principal') return 4;
    if (categoria === 'asociado') return 3;
    if (categoria === 'auxiliar') return 2;
    if (categoria === 'jefepractica') return 1;
    return 0;
  }

  private static obtenerAntiguedad(docente: any) {
    return docente.fecha_ingreso ? utilidadesFecha.calcularAntiguedad(docente.fecha_ingreso) : (docente.antiguedad || 0);
  }

  private static compararPrioridad(a: any, b: any) {
    const modA = this.obtenerPrioridadModalidad(a.modalidad);
    const modB = this.obtenerPrioridadModalidad(b.modalidad);
    if (modA !== modB) return modB - modA;

    const catA = this.obtenerPrioridadCategoria(a.categoria);
    const catB = this.obtenerPrioridadCategoria(b.categoria);
    if (catA !== catB) return catB - catA;

    const antigA = this.obtenerAntiguedad(a);
    const antigB = this.obtenerAntiguedad(b);
    if (antigA !== antigB) return antigB - antigA;

    return String(a.codigo_docente ?? '').localeCompare(String(b.codigo_docente ?? ''));
  }

  static async obtenerColaDocentes(id_ventana: number) {
    const cola = await prisma.$queryRaw<Array<any>>`
      SELECT 
        d.id_docente,
        d.codigo_docente,
        d.nombres,
        d.apellidos,
        LOWER(d.modalidad::text) as modalidad,
        LOWER(d.categoria::text) as categoria,
        d.antiguedad,
        CASE 
          WHEN LOWER(d.modalidad::text) = 'nombrado' THEN 1
          ELSE 2
        END as prioridad_modalidad,
        CASE 
          WHEN LOWER(d.categoria::text) = 'principal' THEN 1
          WHEN LOWER(d.categoria::text) = 'asociado' THEN 2
          WHEN LOWER(d.categoria::text) = 'auxiliar' THEN 3
          ELSE 4
        END as prioridad_categoria
      FROM docente d
      WHERE d.activo = TRUE
      ORDER BY prioridad_modalidad DESC, prioridad_categoria DESC, d.antiguedad DESC, d.codigo_docente ASC
    `;

    cola.sort((a, b) => this.compararPrioridad(a, b));

    const claveRedis = `ventana:${id_ventana}:cola`;
    try {
      await redis.set(claveRedis, JSON.stringify(cola));
      await redis.expire(claveRedis, 7200);
    } catch (error) {
      console.log('Redis no disponible');
    }

    return cola;
  }

  static async siguienteDocente(id_ventana: number) {
    const claveRedis = `ventana:${id_ventana}:cola`;
    
    try {
      const colaStr = await redis.get(claveRedis);
      if (!colaStr) {
        return await this.obtenerColaDocentes(id_ventana);
      }
      
      const cola = JSON.parse(colaStr);
      const siguiente = cola.shift();
      
      await redis.set(claveRedis, JSON.stringify(cola));
      return siguiente;
    } catch (error) {
      return null;
    }
  }

  static async marcarAusente(id_ventana: number, id_docente: number) {
    const claveRedis = `ventana:${id_ventana}:ausentes`;
    try {
      await redis.sadd(claveRedis, id_docente.toString());
      await redis.expire(claveRedis, 7200);
    } catch (error) {
      console.log('Redis no disponible');
    }
  }
}
