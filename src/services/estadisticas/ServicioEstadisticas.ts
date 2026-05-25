import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export class ServicioEstadisticas {
  static async obtenerResumenPeriodo(id_periodo: number) {
    const claveCache = `estadisticas:resumen:${id_periodo}`;
    
    try {
      const cache = await redis.get(claveCache);
      if (cache) return JSON.parse(cache);
    } catch (error) {
      console.log('Redis no disponible, consultando DB');
    }

    const resultado = await prisma.$queryRaw<Array<any>>`
      SELECT 
        COUNT(DISTINCT ha.id_docente) as total_docentes_con_horario,
        COUNT(DISTINCT ha.id_curso) as total_cursos_programados,
        COUNT(DISTINCT ha.id_grupo) as total_grupos,
        COUNT(DISTINCT ha.id_ambiente) as total_ambientes_utilizados,
        COUNT(*) as total_bloques_asignados,
        COALESCE(SUM(EXTRACT(EPOCH FROM (ha.hora_fin::TIME - ha.hora_inicio::TIME)) / 3600), 0) as total_horas_asignadas
      FROM horario_asignado ha
      WHERE ha.id_periodo = ${id_periodo}
        AND ha.estado IN ('confirmado', 'publicado')
    `;

    const resumen = resultado[0] || {
      total_docentes_con_horario: 0,
      total_cursos_programados: 0,
      total_grupos: 0,
      total_ambientes_utilizados: 0,
      total_bloques_asignados: 0,
      total_horas_asignadas: 0
    };

    try {
      await redis.setex(claveCache, 300, JSON.stringify(resumen));
    } catch (error) {
      console.log('No se pudo guardar en caché');
    }

    return resumen;
  }

  static async obtenerAvancePorCategoria(id_periodo: number) {
    return await prisma.$queryRaw<Array<any>>`
      SELECT 
        d.modalidad,
        d.categoria,
        COUNT(DISTINCT d.id_docente) as total_docentes,
        COUNT(DISTINCT ha.id_docente) as docentes_con_horario,
        CASE 
          WHEN COUNT(DISTINCT d.id_docente) > 0 
          THEN ROUND((COUNT(DISTINCT ha.id_docente)::DECIMAL / COUNT(DISTINCT d.id_docente)::DECIMAL) * 100, 1)
          ELSE 0 
        END as porcentaje_avance
      FROM docente d
      LEFT JOIN horario_asignado ha ON d.id_docente = ha.id_docente 
        AND ha.id_periodo = ${id_periodo}
        AND ha.estado IN ('confirmado', 'publicado')
      WHERE d.activo = TRUE
      GROUP BY d.modalidad, d.categoria
      ORDER BY 
        CASE d.modalidad WHEN 'nombrado' THEN 1 ELSE 2 END,
        CASE d.categoria 
          WHEN 'principal' THEN 1 
          WHEN 'asociado' THEN 2 
          WHEN 'auxiliar' THEN 3 
          WHEN 'jefe_practica' THEN 4 
        END
    `;
  }

  static async obtenerOcupacionAmbientes(id_periodo: number) {
    return await prisma.$queryRaw<Array<any>>`
      SELECT 
        a.id_ambiente,
        a.codigo,
        a.nombre,
        a.tipo,
        a.capacidad,
        COUNT(ha.id_asignacion) as bloques_ocupados,
        ROUND((COUNT(ha.id_asignacion)::DECIMAL / 75) * 100, 1) as porcentaje_ocupacion
      FROM ambiente a
      LEFT JOIN horario_asignado ha ON a.id_ambiente = ha.id_ambiente
        AND ha.id_periodo = ${id_periodo}
        AND ha.estado IN ('confirmado', 'publicado')
      WHERE a.activo = TRUE
      GROUP BY a.id_ambiente, a.codigo, a.nombre, a.tipo, a.capacidad
      ORDER BY porcentaje_ocupacion DESC
    `;
  }
}
