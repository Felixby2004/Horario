/**
 * Algoritmo Genético para Generación Automática de Horarios
 * 
 * Este módulo implementa un algoritmo genético que:
 * 1. Genera una población inicial de horarios
 * 2. Evalúa la aptitud de cada horario
 * 3. Aplica selección, cruzamiento y mutación
 * 4. Itera hasta encontrar una solución óptima
 */

import { prisma } from '@/lib/prisma';

// Tipos de datos
export interface Cromosoma {
  id: string;
  horarios: AsignacionHorario[];
  aptitud: number;
}

export interface AsignacionHorario {
  id_docente: number;
  id_curso: number;
  id_grupo: number;
  id_ambiente: number;
  dia_semana: number; // 0-4 (lunes a viernes)
  hora_inicio: string; // "08:00"
  hora_fin: string;
  tipo_clase: string;
}

export interface RestriccionesHorario {
  id_periodo: number;
  horas_laborales_inicio: string;
  horas_laborales_fin: string;
  dias_laborales: number[]; // [0,1,2,3,4] = lunes a viernes
  duracion_minima: number; // 45 minutos
}

export interface ParametrosAG {
  id_periodo: number;
  tamanio_poblacion: number;
  generaciones: number;
  probabilidad_cruzamiento: number;
  probabilidad_mutacion: number;
  criterio_ordenamiento?: 'combinado' | 'antiguedad' | 'disponibilidad';
}

class GeneradorHorariosAG {
  private restricciones: RestriccionesHorario;
  private docentes: any[] = [];
  private cursos: any[] = [];
  private grupos: any[] = [];
  private ambientes: any[] = [];
  private disponibilidades: Map<number, any[]> = new Map();
  private criterioOrdenamiento: 'combinado' | 'antiguedad' | 'disponibilidad' = 'combinado';

  /**
   * Inicializa el algoritmo genético cargando datos del sistema
   */
  async inicializar(id_periodo: number): Promise<void> {
    try {
      // Cargar período y restricciones
      const periodo = await prisma.periodoAcademico.findUnique({
        where: { id_periodo }
      });

      if (!periodo) {
        throw new Error(`Período ${id_periodo} no encontrado`);
      }

      // Cargar docentes con sus cursos asignados
      this.docentes = await prisma.docente.findMany({
        where: { activo: true },
        include: {
          cursos: {
            include: { curso: true }
          },
          disponibilidades: {
            where: { id_periodo }
          }
        }
      });

      // Cargar cursos activos
      this.cursos = await prisma.curso.findMany({
        where: { activo: true }
      });

      // Cargar grupos del período
      this.grupos = await prisma.grupo.findMany({
        where: {
          id_periodo,
          activo: true
        },
        include: { curso: true }
      });

      // Cargar ambientes activos
      this.ambientes = await prisma.ambiente.findMany({
        where: { activo: true }
      });

      // Cargar disponibilidades de docentes
      const disponibilidades = await prisma.disponibilidadDocente.findMany({
        where: { id_periodo }
      });

      disponibilidades.forEach(disp => {
        if (!this.disponibilidades.has(disp.id_docente)) {
          this.disponibilidades.set(disp.id_docente, []);
        }
        this.disponibilidades.get(disp.id_docente)!.push(disp);
      });

      // Configurar restricciones de horarios
      this.restricciones = {
        id_periodo,
        horas_laborales_inicio: '08:00',
        horas_laborales_fin: '22:00',
        dias_laborales: [0, 1, 2, 3, 4], // Lunes a viernes
        duracion_minima: 45
      };

      console.log(`[AG] Inicializado con ${this.docentes.length} docentes, ${this.grupos.length} grupos, ${this.ambientes.length} ambientes`);
    } catch (error) {
      console.error('[AG] Error inicializando:', error);
      throw error;
    }
  }

  private obtenerAntiguedad(docente: any): number {
    if (typeof docente?.antiguedad === 'number') {
      return docente.antiguedad;
    }

    if (docente?.fecha_ingreso) {
      const fechaIngreso = new Date(docente.fecha_ingreso);
      const hoy = new Date();
      let antiguedad = hoy.getFullYear() - fechaIngreso.getFullYear();
      const meses = hoy.getMonth() - fechaIngreso.getMonth();
      if (meses < 0 || (meses === 0 && hoy.getDate() < fechaIngreso.getDate())) {
        antiguedad--;
      }
      return Math.max(0, antiguedad);
    }

    return 0;
  }

  private obtenerPuntajeDisponibilidadDocente(docente: any, dia: number, horaInicio: string, horaFin: string): number {
    const disponibilidades = this.disponibilidades.get(docente.id_docente) || [];

    if (disponibilidades.length === 0) {
      return 1;
    }

    const disponible = disponibilidades.some((d: any) => {
      if (d.dia_semana !== dia || d.disponible !== true) {
        return false;
      }

      return this.intervaloCubiertoPorDisponibilidad(d.hora_inicio, d.hora_fin, horaInicio, horaFin);
    });

    return disponible ? 100 : 0;
  }

  private intervaloCubiertoPorDisponibilidad(dispoInicio: string, dispoFin: string, horaInicio: string, horaFin: string): boolean {
    return this.horaAMinutos(dispoInicio) <= this.horaAMinutos(horaInicio) &&
      this.horaAMinutos(dispoFin) >= this.horaAMinutos(horaFin);
  }

  private ordenarDocentesPorPrioridad(docentes: any[], dia: number, horaInicio: string, horaFin: string): any[] {
    const conPuntaje = docentes.map(docente => {
      const antiguedad = this.obtenerAntiguedad(docente);
      const disponibilidad = this.obtenerPuntajeDisponibilidadDocente(docente, dia, horaInicio, horaFin);
      const puntaje = this.criterioOrdenamiento === 'antiguedad'
        ? antiguedad
        : this.criterioOrdenamiento === 'disponibilidad'
          ? disponibilidad
          : (disponibilidad * 1000) + antiguedad;

      return { docente, puntaje, antiguedad, disponibilidad };
    });

    return conPuntaje
      .filter(item => item.disponibilidad > 0)
      .sort((a, b) => {
        if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
        if (b.disponibilidad !== a.disponibilidad) return b.disponibilidad - a.disponibilidad;
        return b.antiguedad - a.antiguedad;
      })
      .map(item => item.docente);
  }

  /**
   * Genera la población inicial de cromosomas
   */
  generarPoblacionInicial(tamanio: number): Cromosoma[] {
    const poblacion: Cromosoma[] = [];

    for (let i = 0; i < tamanio; i++) {
      const cromosoma: Cromosoma = {
        id: `cromosoma_${i}_${Date.now()}`,
        horarios: this.generarHorariosAleatorios(),
        aptitud: 0
      };

      cromosoma.aptitud = this.evaluarAptitud(cromosoma);
      poblacion.push(cromosoma);
    }

    return poblacion;
  }

  /**
   * Genera horarios aleatorios para un cromosoma
   */
  private generarHorariosAleatorios(): AsignacionHorario[] {
    const horarios: AsignacionHorario[] = [];

    const horaInicioBase = '08:00';
    const horaFinBase = '22:00';

    for (const grupo of this.grupos) {
      // Obtener docentes que pueden enseñar este curso
      const docentesValidos = this.docentes.filter(d =>
        d.cursos.some((dc: any) => dc.id_curso === grupo.id_curso)
      );

      if (docentesValidos.length === 0) continue;

      const dia = Math.floor(Math.random() * 5); // 0-4 (lunes a viernes)
      const horaBase = 8 + Math.floor(Math.random() * 10); // 8:00 a 18:00
      const horaInicio = `${String(horaBase).padStart(2, '0')}:00`;
      const horaFin = `${String(horaBase + 2).padStart(2, '0')}:00`;

      const docentesPriorizados = this.ordenarDocentesPorPrioridad(docentesValidos, dia, horaInicio, horaFin);

      if (docentesPriorizados.length === 0) continue;

      // Seleccionar el docente mejor priorizado para combinar disponibilidad y antigüedad
      const docente = docentesPriorizados[0];

      // Obtener ambiente válido para la capacidad del grupo
      const ambientesValidos = this.ambientes.filter(
        a => a.capacidad >= grupo.cantidad_matriculados
      );

      if (ambientesValidos.length === 0) continue;

      const ambiente = ambientesValidos[
        Math.floor(Math.random() * ambientesValidos.length)
      ];

      // Determinar duración según tipo de clase y curso
      const curso = this.cursos.find(c => c.id_curso === grupo.id_curso);
      const horasLab = curso?.horas_laboratorio || 2;
      const duracion = horasLab > 0 ? horasLab : 2;

      // Si el docente no tiene disponibilidad para este bloque, se intenta con el siguiente grupo
      const coberturaDisponibilidad = this.obtenerPuntajeDisponibilidadDocente(docente, dia, horaInicio, horaFin);
      if (coberturaDisponibilidad <= 0) {
        const docenteAlternativo = docentesPriorizados.find(candidato =>
          this.obtenerPuntajeDisponibilidadDocente(candidato, dia, horaInicio, horaFin) > 0
        );

        if (!docenteAlternativo) continue;
      }

      horarios.push({
        id_docente: docente.id_docente,
        id_curso: grupo.id_curso,
        id_grupo: grupo.id_grupo,
        id_ambiente: ambiente.id_ambiente,
        dia_semana: dia,
        hora_inicio: horaInicio,
        hora_fin: `${String(horaBase + duracion).padStart(2, '0')}:00`,
        tipo_clase: 'teoria'
      });
    }

    return horarios;
  }

  /**
   * Evalúa la aptitud de un cromosoma
   * Penaliza conflictos, incumplimientos de restricciones, etc.
   */
  private evaluarAptitud(cromosoma: Cromosoma): number {
    let aptitud = 100; // Comienza con puntuación perfecta

    // Penalizar conflictos de horario del mismo docente
    aptitud -= this.detectarConflictosDocente(cromosoma) * 10;

    // Penalizar conflictos de ambiente
    aptitud -= this.detectarConflictosAmbiente(cromosoma) * 10;

    // Penalizar indisponibilidades
    aptitud -= this.detectarIndisponibilidades(cromosoma) * 5;

    // Penalizar horarios fuera del rango permitido
    aptitud -= this.detectarHorariosInvalidos(cromosoma) * 15;

    // Bonificar distribución balanceada de carga
    aptitud += this.evaluarDistribucionCarga(cromosoma);

    return Math.max(0, aptitud);
  }

  /**
   * Detecta conflictos cuando el mismo docente tiene dos clases simultáneamente
   */
  private detectarConflictosDocente(cromosoma: Cromosoma): number {
    let conflictos = 0;

    for (let i = 0; i < cromosoma.horarios.length; i++) {
      for (let j = i + 1; j < cromosoma.horarios.length; j++) {
        const h1 = cromosoma.horarios[i];
        const h2 = cromosoma.horarios[j];

        // Si es el mismo docente y el mismo día
        if (h1.id_docente === h2.id_docente && h1.dia_semana === h2.dia_semana) {
          // Verificar si los horarios se solapan
          if (this.haysolapamiento(h1.hora_inicio, h1.hora_fin, h2.hora_inicio, h2.hora_fin)) {
            conflictos++;
          }
        }
      }
    }

    return conflictos;
  }

  /**
   * Detecta conflictos cuando el mismo ambiente se usa simultáneamente
   */
  private detectarConflictosAmbiente(cromosoma: Cromosoma): number {
    let conflictos = 0;

    for (let i = 0; i < cromosoma.horarios.length; i++) {
      for (let j = i + 1; j < cromosoma.horarios.length; j++) {
        const h1 = cromosoma.horarios[i];
        const h2 = cromosoma.horarios[j];

        // Si es el mismo ambiente y el mismo día
        if (h1.id_ambiente === h2.id_ambiente && h1.dia_semana === h2.dia_semana) {
          // Verificar si los horarios se solapan
          if (this.haysolapamiento(h1.hora_inicio, h1.hora_fin, h2.hora_inicio, h2.hora_fin)) {
            conflictos++;
          }
        }
      }
    }

    return conflictos;
  }

  /**
   * Detecta incumplimientos de disponibilidades de docentes
   */
  private detectarIndisponibilidades(cromosoma: Cromosoma): number {
    let penalizaciones = 0;

    for (const horario of cromosoma.horarios) {
      const disponibilidades = this.disponibilidades.get(horario.id_docente) || [];

      // Si el docente tiene restricciones de disponibilidad
      if (disponibilidades.length > 0) {
        const disponible = disponibilidades.some(d =>
          d.dia_semana === horario.dia_semana &&
          d.disponible === true &&
          !this.haysolapamiento(d.hora_inicio, d.hora_fin, horario.hora_inicio, horario.hora_fin)
        );

        if (!disponible) {
          penalizaciones++;
        }
      }
    }

    return penalizaciones;
  }

  /**
   * Detecta horarios fuera del rango permitido
   */
  private detectarHorariosInvalidos(cromosoma: Cromosoma): number {
    let penalizaciones = 0;

    for (const horario of cromosoma.horarios) {
      // Verificar que esté dentro del rango de horas permitidas
      if (horario.hora_inicio < this.restricciones.horas_laborales_inicio ||
          horario.hora_fin > this.restricciones.horas_laborales_fin) {
        penalizaciones++;
      }

      // Verificar que sea un día laboral
      if (!this.restricciones.dias_laborales.includes(horario.dia_semana)) {
        penalizaciones++;
      }

      // Verificar duración mínima
      const duracion = this.calcularDuracion(horario.hora_inicio, horario.hora_fin);
      if (duracion < this.restricciones.duracion_minima) {
        penalizaciones++;
      }
    }

    return penalizaciones;
  }

  /**
   * Bonifica distribución equilibrada de carga docente
   */
  private evaluarDistribucionCarga(cromosoma: Cromosoma): number {
    let bonus = 0;
    const cargaPorDocente = new Map<number, number>();

    // Calcular horas por docente
    for (const horario of cromosoma.horarios) {
      const duracion = this.calcularDuracion(horario.hora_inicio, horario.hora_fin);
      cargaPorDocente.set(
        horario.id_docente,
        (cargaPorDocente.get(horario.id_docente) || 0) + duracion
      );
    }

    // Si la distribución es relativamente uniforme, dar bonus
    const cargas = Array.from(cargaPorDocente.values());
    if (cargas.length > 0) {
      const media = cargas.reduce((a, b) => a + b, 0) / cargas.length;
      const varianza = cargas.reduce((sum, x) => sum + Math.pow(x - media, 2), 0) / cargas.length;
      
      // Bonus mayor si la distribución es más uniforme
      bonus = Math.max(0, 10 - (Math.sqrt(varianza) / media));
    }

    return bonus;
  }

  /**
   * Verifica si dos rangos de tiempo se solapan
   */
  private haysolapamiento(inicio1: string, fin1: string, inicio2: string, fin2: string): boolean {
    const minutos1 = this.horaAMinutos(inicio1);
    const minutos2 = this.horaAMinutos(fin1);
    const minutos3 = this.horaAMinutos(inicio2);
    const minutos4 = this.horaAMinutos(fin2);

    return minutos1 < minutos4 && minutos3 < minutos2;
  }

  /**
   * Convierte una hora "HH:MM" a minutos desde medianoche
   */
  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Calcula la duración en minutos entre dos horas
   */
  private calcularDuracion(inicio: string, fin: string): number {
    return this.horaAMinutos(fin) - this.horaAMinutos(inicio);
  }

  /**
   * Selecciona los mejores cromosomas de la población
   */
  private seleccionar(poblacion: Cromosoma[], cantidad: number): Cromosoma[] {
    return poblacion
      .sort((a, b) => b.aptitud - a.aptitud)
      .slice(0, cantidad)
      .map(c => ({...c})); // Clonar para evitar mutaciones
  }

  /**
   * Cruza dos cromosomas para generar descendencia
   */
  private cruzar(padre1: Cromosoma, padre2: Cromosoma): Cromosoma[] {
    const hijo1: Cromosoma = {
      id: `hijo_${Date.now()}_1`,
      horarios: [],
      aptitud: 0
    };

    const hijo2: Cromosoma = {
      id: `hijo_${Date.now()}_2`,
      horarios: [],
      aptitud: 0
    };

    // Punto de cruce aleatorio
    const puntoCruce = Math.floor(Math.random() * Math.min(padre1.horarios.length, padre2.horarios.length));

    // Combinar horarios
    hijo1.horarios = [
      ...padre1.horarios.slice(0, puntoCruce),
      ...padre2.horarios.slice(puntoCruce)
    ];

    hijo2.horarios = [
      ...padre2.horarios.slice(0, puntoCruce),
      ...padre1.horarios.slice(puntoCruce)
    ];

    // Evaluar aptitud
    hijo1.aptitud = this.evaluarAptitud(hijo1);
    hijo2.aptitud = this.evaluarAptitud(hijo2);

    return [hijo1, hijo2];
  }

  /**
   * Aplica mutación aleatoria a un cromosoma
   */
  private mutar(cromosoma: Cromosoma): Cromosoma {
    const clon = {
      ...cromosoma,
      id: `mutante_${Date.now()}`,
      horarios: cromosoma.horarios.map(h => ({...h}))
    };

    if (clon.horarios.length === 0) return clon;

    // Seleccionar un horario aleatorio para mutar
    const indice = Math.floor(Math.random() * clon.horarios.length);
    const horarioMutante = clon.horarios[indice];

    // Aplicar mutación: cambiar día, hora o ambiente
    const tipMutacion = Math.floor(Math.random() * 3);

    switch (tipMutacion) {
      case 0: // Cambiar día
        horarioMutante.dia_semana = Math.floor(Math.random() * 5);
        break;
      case 1: // Cambiar hora
        const horaBase = 8 + Math.floor(Math.random() * 12);
        horarioMutante.hora_inicio = `${String(horaBase).padStart(2, '0')}:00`;
        horarioMutante.hora_fin = `${String(horaBase + 2).padStart(2, '0')}:00`;
        break;
      case 2: // Cambiar ambiente
        if (this.ambientes.length > 0) {
          const ambienteAleatorio = this.ambientes[
            Math.floor(Math.random() * this.ambientes.length)
          ];
          horarioMutante.id_ambiente = ambienteAleatorio.id_ambiente;
        }
        break;
    }

    clon.aptitud = this.evaluarAptitud(clon);
    return clon;
  }

  /**
   * Ejecuta el algoritmo genético completo
   */
  async ejecutar(parametros: ParametrosAG): Promise<Cromosoma> {
    await this.inicializar(parametros.id_periodo);
    this.criterioOrdenamiento = parametros.criterio_ordenamiento || 'combinado';

    console.log(`[AG] Iniciando ejecución: ${parametros.generaciones} generaciones, población de ${parametros.tamanio_poblacion}`);

    let poblacion = this.generarPoblacionInicial(parametros.tamanio_poblacion);
    let mejorCromosoma = poblacion.reduce((a, b) => a.aptitud > b.aptitud ? a : b);

    for (let generacion = 0; generacion < parametros.generaciones; generacion++) {
      // Seleccionar los mejores
      const padres = this.seleccionar(poblacion, Math.ceil(parametros.tamanio_poblacion / 2));

      // Generar nueva población
      const nuevaPoblacion: Cromosoma[] = [];

      // Elitismo: mantener los mejores
      nuevaPoblacion.push(...padres);

      // Cruzamiento y mutación
      while (nuevaPoblacion.length < parametros.tamanio_poblacion) {
        const padre1 = padres[Math.floor(Math.random() * padres.length)];
        const padre2 = padres[Math.floor(Math.random() * padres.length)];

        if (Math.random() < parametros.probabilidad_cruzamiento) {
          const [hijo1, hijo2] = this.cruzar(padre1, padre2);
          nuevaPoblacion.push(hijo1);
          if (nuevaPoblacion.length < parametros.tamanio_poblacion) {
            nuevaPoblacion.push(hijo2);
          }
        } else {
          nuevaPoblacion.push({...padre1});
        }
      }

      // Aplicar mutación
      for (let i = 0; i < nuevaPoblacion.length; i++) {
        if (Math.random() < parametros.probabilidad_mutacion) {
          nuevaPoblacion[i] = this.mutar(nuevaPoblacion[i]);
        }
      }

      poblacion = nuevaPoblacion;

      // Actualizar mejor cromosoma
      const candidato = poblacion.reduce((a, b) => a.aptitud > b.aptitud ? a : b);
      if (candidato.aptitud > mejorCromosoma.aptitud) {
        mejorCromosoma = candidato;
        console.log(`[AG] Generación ${generacion + 1}: Mejor aptitud = ${mejorCromosoma.aptitud.toFixed(2)}`);
      }
    }

    console.log(`[AG] Finalizado. Mejor aptitud: ${mejorCromosoma.aptitud.toFixed(2)}`);
    return mejorCromosoma;
  }

  /**
   * Convierte un cromosoma en horarios guardables en BD
   */
  obtenerHorarios(cromosoma: Cromosoma): AsignacionHorario[] {
    return cromosoma.horarios;
  }
}

export default GeneradorHorariosAG;
