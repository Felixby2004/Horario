# Script de ayuda para cargar BD en Render

Este archivo contiene comandos PowerShell para facilitar el despliegue.

## OPCIÓN 1: Cargar datos via psql (Windows PowerShell)

```powershell
# 1. Guarda tus datos en una variable
$dbUrl = "postgresql://admin:YOUR_PASSWORD@dpg-xxxxx.onrender.com:5432/horarios_unt"
$sqlFile = "C:\Users\FELIX\Desktop\horarios-unt\backup-completo.sql"

# 2. Establece la contraseña en la variable de entorno
$env:PGPASSWORD = "YOUR_PASSWORD"

# 3. Ejecuta el script SQL
psql -d $dbUrl -f $sqlFile

# 4. Verifica que cargó correctamente
psql -d $dbUrl -c "SELECT COUNT(*) as total_usuarios FROM usuario;"
psql -d $dbUrl -c "SELECT COUNT(*) as total_docentes FROM docente;"
psql -d $dbUrl -c "SELECT COUNT(*) as total_cursos FROM curso;"
```

---

## OPCIÓN 2: Crear render.yaml (Automatización)

Copia este contenido a un archivo `render.yaml` en la raíz del proyecto:

```yaml
version: 1

services:
  # Web Service
  - type: web
    name: horarios-unt-app
    env: node
    plan: free
    branch: main
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /
    envVars:
      - key: DATABASE_URL
        scope: build,runtime
        sync: false
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        scope: build,runtime
        sync: false
      - key: NOMBRE_APLICACION
        value: Sistema de Horarios UNT
      - key: VERSION
        value: 1.0.0

  # PostgreSQL Database
  - type: pserv
    name: horarios-unt-db
    env: postgresql
    plan: free
    ipAllowList: []
    envVars:
      - key: POSTGRES_DB
        value: horarios_unt
      - key: POSTGRES_USER
        value: admin

  # (Opcional) Redis para cache
  - type: redis
    name: horarios-unt-redis
    plan: free
    ipAllowList: []
```

Con este archivo, Render creará automáticamente:
- ✅ Web Service
- ✅ PostgreSQL
- ✅ Redis (si lo necesitas)

---

## OPCIÓN 3: Script de verificación post-despliegue

```powershell
# Verifica que todo esté funcionando

$appUrl = "https://horarios-unt-app.onrender.com"
$dbUrl = "postgresql://admin:YOUR_PASSWORD@dpg-xxxxx.onrender.com:5432/horarios_unt"

Write-Host "=== VERIFICACIÓN DE DESPLIEGUE ===" -ForegroundColor Green

# 1. Verifica que la app responde
Write-Host "`n1. Probando conexión a la app..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri $appUrl -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✅ App respondiendo correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la app" -ForegroundColor Red
}

# 2. Verifica conexión a BD
Write-Host "`n2. Probando conexión a la BD..." -ForegroundColor Cyan
$env:PGPASSWORD = "YOUR_PASSWORD"
$dbCheck = psql -d $dbUrl -c "SELECT VERSION();" 2>&1
if ($dbCheck -match "PostgreSQL") {
    Write-Host "✅ BD conectando correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la BD" -ForegroundColor Red
}

# 3. Verifica datos cargados
Write-Host "`n3. Verificando datos en la BD..." -ForegroundColor Cyan
$usuarios = psql -d $dbUrl -t -c "SELECT COUNT(*) FROM usuario;"
$docentes = psql -d $dbUrl -t -c "SELECT COUNT(*) FROM docente;"
$cursos = psql -d $dbUrl -t -c "SELECT COUNT(*) FROM curso;"

Write-Host "   Usuarios: $usuarios" -ForegroundColor Yellow
Write-Host "   Docentes: $docentes" -ForegroundColor Yellow
Write-Host "   Cursos: $cursos" -ForegroundColor Yellow

if ([int]$usuarios -gt 0 -and [int]$docentes -gt 0) {
    Write-Host "✅ Datos cargados correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Falta cargar datos en la BD" -ForegroundColor Yellow
}

Write-Host "`n=== VERIFICACIÓN COMPLETADA ===" -ForegroundColor Green
```

---

## OPCIÓN 4: Crear repositorio con estructura para Render

```powershell
# En la raíz del proyecto:

# 1. Asegura que los archivos necesarios existen
Test-Path "package.json"
Test-Path "next.config.js"
Test-Path "prisma/schema.prisma"
Test-Path ".gitignore"

# 2. Asegura que .gitignore tiene lo necesario
@"
node_modules/
.env
.env.local
.env.*.local
.next/
dist/
build/
*.pem
.DS_Store
"@ | Out-File -Encoding utf8 ".gitignore"

# 3. Prepara el repo
git add .
git commit -m "Preparación para Render"
git push origin main

Write-Host "✅ Repo listo para Render" -ForegroundColor Green
```

---

## OPCIÓN 5: Variables de entorno seguras

Para generar una contraseña y JWT_SECRET segura en PowerShell:

```powershell
# Generar JWT_SECRET aleatorio (32 caracteres)
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET: $jwtSecret"

# Generar contraseña BD (16 caracteres)
$dbPassword = -join ((48..57) + (65..90) + (97..122) + (33,35,36,37,38,42,43,45,61) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "DB_PASSWORD: $dbPassword"

# Copiar al portapapeles (en Windows)
$jwtSecret | Set-Clipboard
Write-Host "`n✅ JWT_SECRET copiado al portapapeles"
```

---

## OPCIÓN 6: Troubleshooting - Logs en Render

Si algo falla, Render te muestra los logs. Algunos comandos útiles:

```bash
# Ver últimas líneas de logs
tail -f render.log

# Buscar errores específicos
grep -i error render.log
grep -i failed render.log

# Ver si Prisma está generado
ls -la node_modules/.prisma

# Ver variables de entorno disponibles
env | grep DATABASE
env | grep JWT
```

---

## RESUMEN RÁPIDO

1. **Genera contraseñas seguras** (Opción 5)
2. **Crea DB en Render** y anota la URL interna y externa
3. **Carga datos** con psql (Opción 1) o DBeaver
4. **Crea Web Service** en Render
5. **Añade variables de entorno**
6. **Espera el build** (~10 min)
7. **Verifica con script** (Opción 3)

---

**✅ Listo para subir a Render**
