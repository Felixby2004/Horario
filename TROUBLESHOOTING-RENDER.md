# TROUBLESHOOTING: SOLUCIONES A PROBLEMAS COMUNES EN RENDER

## 1. BD NO CONECTA (ECONNREFUSED)

### Síntoma:
```
Error: connect ECONNREFUSED 10.x.x.x:5432
error: could not connect to server
```

### Causas y soluciones:

**Causa 1: Usando URL externa en lugar de interna**
```
❌ MALO: postgresql://admin:pass@dpg-xxxxx.onrender.com:5432/...  (EXTERNA)
✅ BIEN: postgresql://admin:pass@dpg-xxxxx.render.internal:5432/... (INTERNA)
```
- Las URLs internas solo funcionan **dentro de Render**
- Úsalas en tu servicio web
- Úsalas en `DATABASE_URL` en el ambiente

**Causa 2: BD y Web Service en regiones diferentes**

Verifica:
1. Dashboard → Tu BD → **Settings** → Region
2. Dashboard → Tu Web Service → **Settings** → Region
3. Deben ser **EXACTAMENTE iguales**

Solución:
1. Elimina el Web Service
2. Recrea con la **misma región** que la BD

**Causa 3: BD no está en estado "Available"**

1. Espera 2-3 minutos más
2. Refresh la página (F5)
3. Si sigue gris/naranja, reinicia la BD:
   - Dashboard → BD → ⋮ → **Restart database**

**Causa 4: Variables de entorno no se aplicaron**

1. En el Web Service → **Environment**
2. Verifica que `DATABASE_URL` está ahí
3. Click **"Save"**
4. **Redeploy** (Manual Deploy)

---

## 2. APLICACIÓN NO CARGA (TIMEOUT)

### Síntoma:
```
504 Gateway Timeout
Request timed out
```

### Soluciones:

**Solución 1: Build no completó**
1. Abre **Logs**
2. Busca en la sección de BUILD:
   - `Successfully built...`
   - Errores de dependencias
3. Si ves errores:
   ```bash
   # En tu PC
   npm install
   npm run build
   git add .
   git commit -m "Fix build"
   git push
   ```
4. En Render → **Manual Deploy**

**Solución 2: Aplicación se cuelga al iniciar**
1. Logs → busca `listening on port 3000`
2. Si no aparece, probablemente es error de BD
3. Sigue la solución del problema #1 (conexión BD)

**Solución 3: Puerto equivocado**

Verifica `next.config.js` y scripts start:
```javascript
// next.config.js
module.exports = {
  // ... config
  // NO especifiques puerto aquí
}
```

```json
// package.json
{
  "scripts": {
    "start": "next start"  // ✅ Render asigna puerto automáticamente
  }
}
```

**Solución 4: Out of memory (plan Free insuficiente)**

Si ves:
```
FATAL ERROR: CALL_AND_RETRY_LAST
Out of memory
```

Opciones:
1. Comprime el build:
   ```javascript
   // next.config.js
   const nextConfig = {
     swcMinify: true,
     productionBrowserSourceMaps: false,
     // ... rest
   }
   ```
2. Cambia a plan **Starter** ($7/mes)
3. Elimina dependencias innecesarias

---

## 3. PRISMA - CLIENT NO ESTÁ GENERADO

### Síntoma:
```
Cannot find module '.prisma/client'
error TS2307: Cannot find module '@prisma/client'
```

### Soluciones:

**Solución 1: Generar localmente y pushear**
```bash
# En tu PC
npx prisma generate
git add prisma/
git commit -m "Generate Prisma client"
git push
```

**Solución 2: Build Command incorrecto**

En Render → Settings → Build Command debe ser:
```
npm install && npm run build
```

NO:
```
npm install && next build  ❌
npm run build             (esto ya genera Prisma)
```

**Solución 3: package.json con build script correcto**
```json
{
  "scripts": {
    "build": "prisma generate && next build",  // ✅ IMPORTANTE: prisma generate PRIMERO
    "start": "next start"
  }
}
```

**Solución 4: Ejecutar en terminal de Render**
1. En Render, tu servicio → **Console** (o Shell)
2. Ejecuta:
   ```bash
   npx prisma generate
   ```
3. Luego **Manual Deploy**

---

## 4. MIGRACIONES DE PRISMA NO CORREN

### Síntoma:
```
Error: Migrations have failed to apply
The following migration(s) have failed:
  20260520042246_init
```

### Soluciones:

**Solución 1: BD ya tiene tablas creadas**

Si cargaste `backup-completo.sql`, las tablas YA EXISTEN.

Opción A - Inicializar sin migraciones:
```bash
# En Render Console
npx prisma migrate resolve --applied 20260520042246_init
npx prisma migrate resolve --applied 20260518_add_horas_asignadas_docente_curso
# ... repite para todas las migraciones
```

Opción B - Limpiar y recriar:
```bash
# ⚠️ CUIDADO: Borra todos los datos
npx prisma migrate reset --force  # NO HACER EN PRODUCCIÓN
```

**Solución 2: Usar deploy en lugar de dev**

Build Command correcto:
```
npm install && npx prisma migrate deploy && npm run build
```

**Solución 3: Crear un hook de despliegue**

En Render → Tu servicio → **Settings** → **Build & Deploy** → **Deploy Hooks**

Agregar comando:
```
npx prisma migrate deploy
```

---

## 5. ERRORES DE AUTENTICACIÓN / SESIÓN

### Síntoma:
```
JWT error
SessionError
Cannot read property 'id_usuario' of undefined
```

### Soluciones:

**Solución 1: JWT_SECRET no configurado**
1. Render → Variables de ambiente
2. Verifica que `JWT_SECRET` existe
3. **No debe estar vacío**
4. **Manual Deploy**

**Solución 2: JWT_SECRET diferente entre servicios**

Si tienes múltiples servicios:
- Ambos deben tener el **MISMO JWT_SECRET**
- Verifica que está copiado exactamente igual

**Solución 3: Cookie domain/secure settings**

Si tienes HTTPS en Render, actualiza en tu auth middleware:
```typescript
// middleware/auth.ts
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // true en Render
  sameSite: 'lax',
  domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
}
```

---

## 6. PROBLEMAS CON ARCHIVOS ESTÁTICOS

### Síntoma:
```
404 Not Found
_next/static/chunks/...
public/...
```

### Soluciones:

**Solución 1: Archivos no están en el repo**
```bash
git status
# Verifica que ves:
# - public/
# - .next/

git add public/
git commit -m "Add static files"
git push
```

**Solución 2: Next.js cache limpio**
```bash
# Elimina build local
rm -r .next
npm run build
git add .
git commit -m "Rebuild"
git push
```

**Solución 3: Ruta de archivos incorrecta en código**

```typescript
// ❌ MALO
import img from './public/imagen.png'
const src = 'public/imagen.png'

// ✅ BIEN
import img from '@/public/imagen.png'
const src = '/imagen.png'  // Desde public/
```

---

## 7. BASE DE DATOS: NO HAY DATOS

### Síntoma:
```
Usuario no encontrado
SELECT devuelve 0 filas
```

### Verificar:

**Paso 1: ¿El SQL se cargó?**
```bash
# En terminal de Render (Console)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM usuario;"
```

Si devuelve 0 → los datos no se cargaron.

**Paso 2: Cargar datos manualmente**

Opción A - Desde DBeaver:
1. Conectar a Render (External URL)
2. Abrir `backup-completo.sql`
3. Ejecutar

Opción B - Desde PowerShell:
```powershell
$env:PGPASSWORD = "contraseña"
psql -h dpg-xxxxx.onrender.com -U admin -d horarios_unt -f backup-completo.sql
```

Opción C - Via psql en Render Console:
```bash
# Copia el contenido del backup-completo.sql
# Pégalo directamente o:
cat << 'EOF' | psql $DATABASE_URL
INSERT INTO usuario ...
EOF
```

---

## 8. PLAN FREE MÁS LIMITACIONES

### Síntoma:
- Servicio se reinicia cada 15 min de inactividad
- No hay almacenamiento persistente
- Límite de 100 MB de BD

### Soluciones:

**Para producción, usa plan Starter/Pro:**
- Render → Tu servicio → **Settings** → **Plan**
- Upgrade a **Starter** ($7/mes mínimo)

**Mientras usas Free:**
- Accede cada 30 min para evitar reinicio
- Usa almacenamiento externo (S3, etc) para archivos
- Limpia BD periódicamente

---

## 9. VARIABLES DE ENTORNO NO APLICAN

### Síntoma:
```
Error: process.env.DATABASE_URL is undefined
```

### Soluciones:

**Solución 1: Cambios en Environment no aplicaron**
1. Render → Tu servicio → **Environment**
2. Verifica que la variable está ahí
3. Scroll al final → **"Save"**
4. **Manual Deploy**

**Solución 2: Variable no seteada para buildtime**

Las variables deben tener scope:
- `build` (disponible durante npm run build)
- `runtime` (disponible cuando la app está corriendo)

En Render, ambos deben estar chequeados:
```
DATABASE_URL = postgresql://...
Scope: [✓] build, [✓] runtime
```

**Solución 3: Archivos .env locales interfieren**

Asegúrate que:
1. `.gitignore` incluya `.env`
2. NO pushees archivos `.env`
3. Variables solo vienen de Render → Environment

---

## 10. LOGS NO MUESTRAN NADA / LOGS TRUNCADOS

### Síntoma:
```
(No logs available)
(logs truncated)
```

### Soluciones:

**Solución 1: Iniciar sesión en Render**
1. Render.com → Login
2. Abre tu servicio
3. Click en **Logs** tab

**Solución 2: Aumentar retención de logs**

Render guarda logs por 24h. Para verlos:
1. Durante el despliegue, abre Logs
2. No cierres la pestaña

**Solución 3: Ver desde el inicio del deploy**

Click en **"Restart service"** para ver nuevos logs:
1. Tu servicio → ⋮ → **Restart service**
2. Abre **Logs** inmediatamente
3. Verás todo desde el inicio

---

## 11. ERRORES DE RED / CORS

### Síntoma:
```
CORS error in console
Access-Control-Allow-Origin
```

### Soluciones:

Agrega headers CORS en `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.ALLOWED_ORIGINS || '*'
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET,POST,PUT,DELETE,OPTIONS'
        }
      ]
    }
  ]
}
```

---

## CHECKLIST DE DEBUGGING

Si algo falla, verifica en orden:

- [ ] ¿Logs muestran errores? (Mira Logs en Render)
- [ ] ¿BD está en estado Available? (Refresh página)
- [ ] ¿DATABASE_URL en variables de entorno? (Copia correcta)
- [ ] ¿BD y Web Service en MISMA REGIÓN?
- [ ] ¿Build completó exitosamente? (Mira fin del log)
- [ ] ¿package.json tiene build y start scripts?
- [ ] ¿.gitignore EXCLUYE node_modules y .env?
- [ ] ¿Datos en BD? (psql query)

---

## CONTACTO Y RECURSOS

- **Estado de Render:** https://status.render.com
- **Documentación Render:** https://render.com/docs
- **Chat de soporte Render:** https://render.com/support
- **Comunidad Discord Render:** https://discord.gg/render

---

**Si nada funciona: Crea un nuevo servicio desde cero con render.yaml**

Es más fácil que debuggear problemas complejos.

---

**Última actualización:** 25 de mayo de 2026
