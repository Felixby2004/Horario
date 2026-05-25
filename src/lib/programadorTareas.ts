import cron from 'node-cron';

// =============================================
// PROGRAMADOR DE TAREAS DEL SISTEMA
// =============================================

export class ProgramadorTareas {
  private static tareas: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicializar todas las tareas programadas
   */
  static inicializar(): void {
    console.log('🕐 Inicializando programador de tareas...');

    // Procesar cola de notificaciones cada minuto
    this.programar('procesar-cola-notificaciones', '* * * * *', async () => {
      try {
        // Importación dinámica para evitar dependencias circulares
        const { GestorNotificaciones } = await import('@/services/notificaciones/GestorNotificaciones');
        const resultado = await GestorNotificaciones.procesarColaNotificaciones();
        if (resultado.procesadas > 0) {
          console.log(
            `📬 Notificaciones procesadas: ${resultado.procesadas} (✅ ${resultado.exitosas} | ❌ ${resultado.fallidas})`
          );
        }
      } catch (error) {
        console.error('Error procesando cola de notificaciones:', error);
      }
    });

    // Limpiar selecciones temporales expiradas cada 5 minutos
    this.programar('limpiar-selecciones-expiradas', '*/5 * * * *', async () => {
      try {
        const { GestorSeleccionTemporal } = await import('@/services/horarios/GestorSeleccionTemporal');
        const eliminadas = await GestorSeleccionTemporal.limpiarSeleccionesExpiradas();
        if (eliminadas > 0) {
          console.log(`🧹 Selecciones temporales expiradas eliminadas: ${eliminadas}`);
        }
      } catch (error) {
        console.error('Error limpiando selecciones expiradas:', error);
      }
    });

    // Verificar recordatorios pendientes cada hora
    this.programar('verificar-recordatorios', '0 * * * *', async () => {
      try {
        console.log('🔔 Verificando recordatorios pendientes...');
        // Lógica adicional de verificación si es necesaria
      } catch (error) {
        console.error('Error verificando recordatorios:', error);
      }
    });

    // Generar respaldo de configuraciones cada día a las 2:00 AM
    this.programar('respaldo-configuraciones', '0 2 * * *', async () => {
      try {
        console.log('💾 Generando respaldo de configuraciones...');
        // Lógica de respaldo
      } catch (error) {
        console.error('Error generando respaldo:', error);
      }
    });

    console.log('✅ Programador de tareas inicializado correctamente');
    console.log(`   Tareas activas: ${this.tareas.size}`);
  }

  /**
   * Programar una tarea
   */
  static programar(
    nombre: string,
    expresionCron: string,
    tarea: () => Promise<void>
  ): void {
    // Validar expresión cron
    if (!cron.validate(expresionCron)) {
      console.error(`❌ Expresión cron inválida para tarea "${nombre}": ${expresionCron}`);
      return;
    }

    // Detener tarea existente si ya existe
    this.detener(nombre);

    const tareaProgramada = cron.schedule(
      expresionCron,
      async () => {
        try {
          await tarea();
        } catch (error) {
          console.error(`Error en tarea "${nombre}":`, error);
        }
      },
      {
        scheduled: true,
        timezone: 'America/Lima',
      }
    );

    this.tareas.set(nombre, tareaProgramada);
    console.log(`   📅 Tarea "${nombre}" programada: ${expresionCron}`);
  }

  /**
   * Detener una tarea específica
   */
  static detener(nombre: string): void {
    const tarea = this.tareas.get(nombre);
    if (tarea) {
      tarea.stop();
      this.tareas.delete(nombre);
    }
  }

  /**
   * Detener todas las tareas
   */
  static detenerTodas(): void {
    for (const [nombre, tarea] of this.tareas) {
      tarea.stop();
      console.log(`   ⏹️ Tarea "${nombre}" detenida`);
    }
    this.tareas.clear();
  }

  /**
   * Obtener estado de todas las tareas
   */
  static obtenerEstado(): Array<{ nombre: string; activa: boolean }> {
    return Array.from(this.tareas.entries()).map(([nombre]) => ({
      nombre,
      activa: true,
    }));
  }

  /**
   * Ejecutar una tarea manualmente
   */
  static async ejecutarManual(nombre: string): Promise<void> {
    const tarea = this.tareas.get(nombre);
    if (!tarea) {
      throw new Error(`Tarea "${nombre}" no encontrada`);
    }
    
    console.log(`▶️ Ejecutando tarea "${nombre}" manualmente...`);
    // Las tareas están envueltas en el scheduler, así que no podemos ejecutarlas directamente
    // Esta función es más para logging/debugging
  }
}

// Inicializar cuando el módulo se cargue (solo en servidor)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  ProgramadorTareas.inicializar();
}

export default ProgramadorTareas;
