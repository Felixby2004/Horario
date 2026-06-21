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
    if (modalidad === 'nombrado') return 3;
    if (modalidad === 'extraordinario') return 2;
    if (modalidad === 'contratado') return 1;
    return 0;
  }

  private static obtenerPrioridadCategoria(valor: unknown) {
    const categoria = this.normalizarValor(valor);
    if (categoria === 'principal') return 4;
    if (categoria === 'asociado') return 3;
    if (categoria === 'auxiliar') return 2;
    if (categoria === 'jefe_practica' || categoria === 'jefepractica') return 1;
    return 0;
  }

  private static obtenerCategoriaComparable(docente: any) {
    const modalidad = this.normalizarValor(docente?.modalidad);

    if (modalidad === 'nombrado') {
      return docente?.categoria_ordinaria ?? docente?.categoria;
    }

    if (modalidad === 'contratado') {
      return docente?.tipo_contrato ?? docente?.categoria;
    }

    return docente?.categoria;
  }

  private static obtenerAntiguedad(docente: any) {
    return docente.fecha_ingreso ? utilidadesFecha.calcularAntiguedad(docente.fecha_ingreso) : (docente.antiguedad || 0);
  }

  private static compararPrioridad(a: any, b: any) {
    const modA = this.obtenerPrioridadModalidad(a.modalidad);
    const modB = this.obtenerPrioridadModalidad(b.modalidad);
    if (modA !== modB) return modB - modA;

    const catA = this.obtenerPrioridadCategoria(this.obtenerCategoriaComparable(a));
    const catB = this.obtenerPrioridadCategoria(this.obtenerCategoriaComparable(b));
    if (catA !== catB) return catB - catA;

    const antigA = this.obtenerAntiguedad(a);
    const antigB = this.obtenerAntiguedad(b);
    if (antigA !== antigB) return antigB - antigA;

    return String(a.codigo_docente ?? '').localeCompare(String(b.codigo_docente ?? ''));
  }

  static async obtenerColaDocentes(id_ventana: number) {
    let cola: Array<any> = [];
    try {
      cola = await prisma.$queryRaw<Array<any>>`
        SELECT 
          d.id_docente,
          d.codigo_docente,
          d.nombres,
          d.apellidos,
          LOWER(d.modalidad::text) as modalidad,
          LOWER(d.categoria::text) as categoria,
          LOWER(COALESCE(d.categoria_ordinaria::text, '')) as categoria_ordinaria,
          LOWER(COALESCE(d.tipo_contrato::text, '')) as tipo_contrato,
          d.antiguedad
        FROM docente d
        WHERE d.activo = TRUE
      `;
    } catch (error) {
      console.error('Error obteniendo cola de docentes:', error);
      return [];
    }

    cola.sort((a, b) => this.compararPrioridad(a, b));

    const claveRedis = `ventana:${id_ventana}:cola`;
    try {
      await redis.set(claveRedis, JSON.stringify(cola));
      await redis.expire(claveRedis, 7200);
    } catch (error) {
      console.warn('Redis no disponible para cachear la cola de docentes');
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
      if (!Array.isArray(cola)) {
        return await this.obtenerColaDocentes(id_ventana);
      }
      const siguiente = cola.shift();
      
      await redis.set(claveRedis, JSON.stringify(cola));
      return siguiente;
    } catch (error) {
      console.error('Error obteniendo siguiente docente desde Redis:', error);
      return await this.obtenerColaDocentes(id_ventana);
    }
  }

  static async marcarAusente(id_ventana: number, id_docente: number) {
    const claveRedis = `ventana:${id_ventana}:ausentes`;
    try {
      await redis.sadd(claveRedis, id_docente.toString());
      await redis.expire(claveRedis, 7200);
    } catch (error) {
      console.warn('Redis no disponible para registrar docentes ausentes');
    }
  }
}
