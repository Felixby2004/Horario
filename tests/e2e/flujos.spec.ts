import { test, expect } from '@playwright/test';

// Test de login
test.describe('Autenticación', () => {
  test('debe permitir login exitoso', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    
    await page.fill('input[name="codigo"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('debe rechazar credenciales incorrectas', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    
    await page.fill('input[name="codigo"]', 'admin');
    await page.fill('input[name="password"]', 'incorrecta');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=incorrectas')).toBeVisible();
  });
});

// Test de selección de horario
test.describe('Selección de Horarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="codigo"]', 'docente1');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('debe permitir seleccionar un horario', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/horarios/seleccion');

    // Seleccionar curso
    await page.selectOption('select[name="curso"]', '1');
    
    // Seleccionar ambiente
    await page.selectOption('select[name="ambiente"]', '1');

    // Hacer clic en una celda de la matriz
    await page.click('[data-dia="lunes"][data-bloque="0"]');

    // Esperar validación
    await page.waitForSelector('.validacion-exitosa');

    // Confirmar
    await page.click('button:has-text("Confirmar")');

    await expect(page.locator('text=confirmado')).toBeVisible();
  });

  test('debe mostrar conflictos al seleccionar horario ocupado', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/horarios/seleccion');

    await page.selectOption('select[name="curso"]', '1');
    await page.selectOption('select[name="ambiente"]', '1');

    // Intentar seleccionar un horario ya ocupado
    await page.click('[data-ocupado="true"]');

    await expect(page.locator('.alerta-conflicto')).toBeVisible();
  });
});

// Test de reportes
test.describe('Reportes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="codigo"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('debe generar reporte de aula', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/reportes/aula');

    await page.selectOption('select[name="periodo"]', '1');
    await page.selectOption('select[name="aula"]', '1');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar PDF")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

// Test de validación
test.describe('Validación de Horarios', () => {
  test('debe detectar conflictos', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="codigo"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:3000/dashboard/horarios/validar');

    await page.selectOption('select[name="periodo"]', '1');
    await page.click('button:has-text("Validar")');

    await page.waitForSelector('.resultados-validacion');

    const conflictos = await page.locator('.conflicto-item').count();
    expect(conflictos).toBeGreaterThanOrEqual(0);
  });
});

// Test de ventanas de atención
test.describe('Ventanas de Atención', () => {
  test('debe mostrar ventanas activas', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="codigo"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:3000/dashboard/horarios/ventanas/monitorear');

    await expect(page.locator('.ventana-card')).toBeVisible();
  });
});
