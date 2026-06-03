import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Pool de conexiones de Puppeteer para optimizar recurso
 * Evita crear nuevas instancias de Chromium en cada generación de PDF
 */

class PuppeteerPoolManager {
  private static instance: PuppeteerPoolManager;
  private browser: Browser | null = null;
  private activePages = new Set<Page>();
  private maxPages = 3; // Máximo de páginas simultáneas (ajustar según Render)
  private pageQueue: Array<{
    resolve: (page: Page) => void;
    reject: (error: Error) => void;
  }> = [];

  private constructor() {}

  static getInstance(): PuppeteerPoolManager {
    if (!PuppeteerPoolManager.instance) {
      PuppeteerPoolManager.instance = new PuppeteerPoolManager();
    }
    return PuppeteerPoolManager.instance;
  }

  /**
   * Inicializar navegador (llamar una sola vez al startup)
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-dev-tools',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-extensions',
        '--disable-sync'
      ]
    };

    // Usar ruta de Chromium según ambiente
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (process.env.NODE_ENV === 'production') {
      launchOptions.executablePath = '/usr/bin/chromium';
    }

    try {
      this.browser = await puppeteer.launch(launchOptions);
      console.log('✅ Puppeteer Browser Pool inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Puppeteer:', error);
      throw error;
    }
  }

  /**
   * Obtener una página del pool (esperar si todas están ocupadas)
   */
  async getPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    // Si hay espacio, crear página inmediatamente
    if (this.activePages.size < this.maxPages && this.browser) {
      const page = await this.browser.newPage();
      this.activePages.add(page);
      return page;
    }

    // Si no hay espacio, enqueue la solicitud
    return new Promise((resolve, reject) => {
      this.pageQueue.push({ resolve, reject });
    });
  }

  /**
   * Liberar página al terminar (devuelve al pool)
   */
  async releasePage(page: Page): Promise<void> {
    this.activePages.delete(page);
    await page.close();

    // Si hay solicitudes en queue, procesar la siguiente
    if (this.pageQueue.length > 0 && this.browser) {
      const { resolve, reject } = this.pageQueue.shift()!;
      try {
        const newPage = await this.browser.newPage();
        this.activePages.add(newPage);
        resolve(newPage);
      } catch (error) {
        reject(error as Error);
      }
    }
  }

  /**
   * Cerrar todo el pool (llamar al shutdown)
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.activePages.clear();
      this.pageQueue = [];
      console.log('✅ Puppeteer Browser Pool cerrado');
    }
  }

  /**
   * Obtener estado del pool (para debugging)
   */
  getStatus() {
    return {
      activePagesCount: this.activePages.size,
      maxPagesAllowed: this.maxPages,
      queuedRequests: this.pageQueue.length,
      isBrowserActive: this.browser !== null
    };
  }
}

export const puppeteerPool = PuppeteerPoolManager.getInstance();
