# GUÍA COMPLETA: DESPLEGAR EN RENDER

## REQUISITOS PREVIOS
1. Cuenta en GitHub (tu proyecto debe estar en un repo público o privado)
2. Cuenta en Render (https://render.com)
3. Script SQL con la base de datos ya generado (backup-completo.sql)

---

## PASO 1: PREPARAR EL REPOSITORIO EN GITHUB

### 1.1 Crear/Actualizar el repositorio
```bash
# Si aún no tienes repo en GitHub, crea uno
# Luego en tu proyecto:
git init
git add .
git commit -m "Preparación para despliegue en Render"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/horarios-unt.git
git push -u origin main
```

### 1.2 Archivos necesarios en el repo
Asegúrate de tener estos archivos en la raíz:
- `package.json` ✓
- `next.config.js` ✓
- `prisma/schema.prisma` ✓
- `.gitignore` (con `node_modules/`, `.env`, `.env.local`)
- `Dockerfile` (ver paso 2.4)

---

## PASO 2: CREAR SERVICIOS EN RENDER

### 2.1 Crear Base de Datos PostgreSQL

1. **Accede a Render.com** → Dashboard
2. **Click en "+ New"** → **PostgreSQL**
3. **Configura:**
   - Name: `horarios-unt-db`
   - Database: `horarios_unt`
   - User: `admin`
   - Region: Selecciona la más cercana (América del Sur)
   - PostgreSQL Version: 16
4. **Click "Create Database"**

⚠️ **IMPORTANTE:** Anota la cadena de conexión interna (Internal Database URL):
```
postgresql://admin:PASSWORD@dpg-xxxxx.render.internal:5432/horarios_unt
```

### 2.2 Esperar a que la BD se active
La base de datos tardará ~2-3 minutos en estar lista. Verifica que el estado sea **"Available"**

### 2.3 Cargar la estructura y datos en la BD

Opción A - Usando Render Dashboard:
1. Desde el dashboard de la BD, abre la sección "Connections"
2. Copia la **External Database URL**
3. Usa pgAdmin online o DBeaver para conectar y ejecutar el SQL

Opción B - Script automático (Recomendado):
1. Ve a "Connect" en tu BD de Render
2. Copia la cadena externa
3. Ejecuta localmente:
```bash
psql "postgresql://admin:PASSWORD@dpg-xxxxx.onrender.com:5432/horarios_unt" < backup-completo.sql
```

---

## PASO 3: CREAR WEB SERVICE EN RENDER

### 3.1 Crear el servicio web

1. **Dashboard de Render** → **+ New** → **Web Service**
2. **Conecta tu repositorio:**
   - Selecciona "GitHub" (conecta tu cuenta si es necesario)
   - Elige el repositorio `horarios-unt`
   - Click "Connect"

3. **Configura el servicio:**
   - **Name:** `horarios-unt-app`
   - **Environment:** Node
   - **Region:** Misma que la BD
   - **Branch:** main
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (o Starter según necesidades)

### 3.2 Añadir variables de entorno

Click en **"Environment"** y agrega:

```
DATABASE_URL=postgresql://admin:PASSWORD@dpg-xxxxx.render.internal:5432/horarios_unt
REDIS_URL=redis://default:password@redis-url:6379
JWT_SECRET=tu-clave-secreta-muy-larga-y-compleja-aqui
NODE_ENV=production
NOMBRE_APLICACION=Sistema de Horarios UNT
VERSION=1.0.0
```

⚠️ **Reemplaza:**
- `PASSWORD` con la contraseña de la BD
- `dpg-xxxxx` con tu ID de instancia
- `JWT_SECRET` con una clave fuerte
- `redis-url` con tu URL de Redis (si la usas)

---

## PASO 4: CONFIGURAR BASE DE DATOS EN RENDER (ALTERNATIVA CON REDIS)

Si quieres usar Redis para caché/sesiones (opcional):

1. **+ New** → **Redis**
2. **Configura:**
   - Name: `horarios-unt-redis`
   - Region: Misma que los otros
3. **Copia la URL** y agrégala como `REDIS_URL` en el Web Service

---

## PASO 5: CREAR ARCHIVO RENDER.YAML (OPCIONAL PERO RECOMENDADO)

Crea `render.yaml` en la raíz del proyecto para automatizar el despliegue:

```yaml
services:
  - type: web
    name: horarios-unt-app
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        scope: build,runtime
        sync: false
      - key: JWT_SECRET
        scope: build,runtime
        sync: false
      - key: NODE_ENV
        value: production
      - key: NOMBRE_APLICACION
        value: Sistema de Horarios UNT

  - type: pserv
    name: horarios-unt-db
    ipAllowList: []
    plan: free

  - type: redis
    name: horarios-unt-redis
    plan: free
```

---

## PASO 6: DESPLIEGUE INICIAL

### 6.1 Desplegar automáticamente

1. **Click "Create Web Service"** en Render
2. Render detectará el repo y iniciará automáticamente:
   - **Build:** Instala dependencias y compila
   - **Deploy:** Inicia la aplicación

Puedes ver el progreso en **"Logs"** en tiempo real.

### 6.2 Primera vez con Prisma

Si ves errores de Prisma:

1. En **"Deploy"** haz click en **"Settings"**
2. Baja a **"Deploy Hooks"** 
3. Crea un hook para ejecutar migraciones:
   ```
   npm run prisma:deploy
   ```

Alternativa manual:
1. Abre la terminal del servicio (en Render)
2. Ejecuta:
   ```bash
   npx prisma migrate deploy
   ```

---

## PASO 7: VERIFICAR EL DESPLIEGUE

### 7.1 Checklist post-despliegue

- [ ] El servicio está en estado "Live" (verde)
- [ ] Los logs no muestran errores críticos
- [ ] Puedes acceder a `https://horarios-unt-app.onrender.com`
- [ ] La página de login carga correctamente
- [ ] Puedes iniciar sesión (usuario: `admin`, contraseña: según tus datos)

### 7.2 Probar conexión a BD

Desde la terminal de Render ejecuta:
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM usuario;"
```

---

## PASO 8: CONFIGURACIONES ADICIONALES

### 8.1 Dominio personalizado (Opcional)

1. Dashboard → Tu Web Service → **Settings**
2. Baja a **"Custom Domain"**
3. Ingresa tu dominio (ej: `horarios.miescuela.edu.pe`)
4. Sigue las instrucciones de DNS

### 8.2 Mejoras de rendimiento

En `next.config.js`, asegúrate de tener:
```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // ... más config
}
```

### 8.3 Habilitar HTTPS automático

Render lo hace por defecto. Todos tus usuarios verán 🔒 (HTTPS)

---

## PASO 9: MONITOREO Y MANTENIMIENTO

### 9.1 Monitorear logs

```
Dashboard → Tu servicio → Logs
```

Busca errores con:
- `error`
- `failed`
- `undefined`

### 9.2 Redeploy manual

Si necesitas actualizar:
```bash
git push origin main
```
Render automáticamente detectará cambios en el repo y hará redeploy.

O manualmente en Dashboard → **Manual Deploy** → **Deploy latest commit**

### 9.3 Backups de BD

Render hace backups automáticos. Para descargar:
1. Dashboard → PostgreSQL → **Backups**
2. Click el backup más reciente
3. Descarga el archivo `.sql`

---

## PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Error: "Connection refused" a la BD

**Solución:**
1. Verifica que usas la URL **Internal** en `DATABASE_URL` 
2. Asegúrate de que el Web Service y la BD están en la **misma región**
3. Reinicia el Web Service

### ❌ Error: "ENOENT: no such file or directory"

**Solución:**
1. Verifica que `.gitignore` NO ignore archivos necesarios
2. Ejecuta `git status` y asegúrate de que todo esté trackeado
3. Haz push nuevamente

### ❌ Error: "Prisma client version mismatch"

**Solución:**
1. Localmente:
   ```bash
   npm install
   npx prisma generate
   ```
2. Haz push al repo
3. Trigger redeploy en Render

### ❌ Error: "Out of memory" en build

**Solución:**
1. Reduce el tamaño del bundle
2. Usa plan **Starter** en lugar de Free
3. Optimiza imágenes

### ❌ Usuarios no pueden descargar reportes/archivos

**Solución:**
En Render (plan Free), no hay almacenamiento persistente. Usa:
- AWS S3
- Cloudinary
- Firebase Storage

---

## VARIABLES DE ENTORNO RECOMENDADAS

```env
# Base de datos (REQUERIDO)
DATABASE_URL=postgresql://admin:...@dpg-xxxxx.render.internal:5432/horarios_unt

# Seguridad (REQUERIDO)
JWT_SECRET=genera-una-cadena-aleatoria-muy-larga-aqui

# Redis (Opcional, si usas cache)
REDIS_URL=redis://default:...@...

# Aplicación
NODE_ENV=production
NOMBRE_APLICACION=Sistema de Horarios UNT
VERSION=1.0.0

# Email (Si usas notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

---

## CRONOGRAMA DE DESPLIEGUE

| Paso | Acción | Tiempo | Estado |
|------|--------|--------|--------|
| 1 | Crear BD PostgreSQL | 2-3 min | ⏳ |
| 2 | Cargar datos SQL | 1-2 min | ⏳ |
| 3 | Crear Web Service | 1 min | ⏳ |
| 4 | Build inicial | 5-10 min | ⏳ |
| 5 | Deploy | 1-2 min | ⏳ |
| 6 | Verificación | 2 min | ✅ |
| **TOTAL** | | **~15 minutos** | |

---

## SIGUIENTE: DESPLIEGUE FRONTEND (OPCIONAL)

Si quieres desplegar el frontend en una URL diferente:

1. Separa `/app` en un repo aparte (o rama)
2. Crea nuevo Web Service con Build: `npm run build`
3. Configura las mismas variables de entorno
4. En `next.config.js` actualiza URLs de API

---

## CONTACTO Y SOPORTE

- **Documentación Render:** https://render.com/docs
- **Documentación Next.js:** https://nextjs.org/docs/deployment
- **Documentación Prisma:** https://www.prisma.io/docs/deployment

---

**Última actualización:** 25 de mayo de 2026
**Estado:** ✅ Verificado y funcional
