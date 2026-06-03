/**
 * Inicializador del Pool de Puppeteer
 * Se ejecuta una única vez cuando la aplicación inicia
 * 
 * IMPORTANTE: Este archivo debe ser llamado desde el middleware
 * o desde el layout.tsx del servidor.
 */

import { puppeteerPool } from '@/services/reportes/PuppeteerPool';

/**
 * Inicializar el pool de Puppeteer cuando la app inicia
 * Esto es más eficiente que crear una nueva instancia para cada PDF
 */
export async function initializePuppeteerPool() {
  try {
    console.log('🚀 Inicializando Pool de Puppeteer...');
    await puppeteerPool.initialize();
    console.log('✅ Pool de Puppeteer inicializado correctamente');
    
    // Mostrar estado inicial
    const status = puppeteerPool.getStatus();
    console.log('📊 Estado del pool:', status);
  } catch (error) {
    console.error('❌ Error al inicializar Pool de Puppeteer:', error);
    // No lanzar error para no bloquear el startup de la app
  }
}

/**
 * Ejecutar este código en el servidor una única vez
 * Opción 1: Desde src/middleware.ts (recomendado)
 * Opción 2: Desde src/app/layout.tsx con un componente cliente que llama a API
 */
export async function closePuppeteerPool() {
  try {
    await puppeteerPool.close();
    console.log('✅ Pool de Puppeteer cerrado correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar Pool:', error);
  }
}
