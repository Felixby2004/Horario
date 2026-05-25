# CHECKLIST RÁPIDO: DESPLIEGUE EN RENDER (5-15 MIN)

## PRE-DESPLIEGUE
- [ ] Proyecto está en GitHub (público o privado)
- [ ] `package.json` tiene scripts `build` y `start`
- [ ] `.gitignore` contiene `node_modules/`, `.env`
- [ ] `prisma/schema.prisma` está en el repo
- [ ] Script SQL `backup-completo.sql` está listo

---

## PASO 1: BASE DE DATOS (3 MIN)

En Render Dashboard:

1. [ ] Click **"+ New"** → **"PostgreSQL"**
2. [ ] Nombre: `horarios-unt-db`
3. [ ] Database name: `horarios_unt`
4. [ ] User: `admin` (o tu preferencia)
5. [ ] Region: Cercana a ti (ej: `São Paulo` para LATAM)
6. [ ] Click **"Create Database"**
7. [ ] ⏳ Espera 2-3 min a que diga "Available" (verde)
8. [ ] **Copia y guarda:**
   - Internal Database URL: `postgresql://admin:...@dpg-xxxxx.render.internal:5432/horarios_unt`
   - Password: Anota tu contraseña

---

## PASO 2: CARGAR DATOS EN BD (2 MIN)

Opción A - Usando DBeaver (Más fácil):
1. [ ] Descarga DBeaver (https://dbeaver.io)
2. [ ] Nueva conexión PostgreSQL
3. [ ] Usa la **External URL** de Render
4. [ ] Abre archivo `backup-completo.sql`
5. [ ] Ejecuta (Ctrl+Enter)

Opción B - Línea de comandos:
1. [ ] En PowerShell:
```powershell
$env:PGPASSWORD = "TU_CONTRASEÑA"
psql -h dpg-xxxxx.onrender.com -U admin -d horarios_unt -f "C:\Users\FELIX\Desktop\horarios-unt\backup-completo.sql"
```

---

## PASO 3: WEB SERVICE (2 MIN)

En Render Dashboard:

1. [ ] Click **"+ New"** → **"Web Service"**
2. [ ] Selecciona tu repo `horarios-unt` de GitHub
3. [ ] **Nombre:** `horarios-unt-app`
4. [ ] **Environment:** Node
5. [ ] **Region:** MISMA que la BD
6. [ ] **Build Command:**
```
npm install && npm run build
```
7. [ ] **Start Command:**
```
npm start
```
8. [ ] Click **"Create Web Service"** (esperará a compilar ~8-10 min)

---

## PASO 4: VARIABLES DE ENTORNO (2 MIN)

Mientras se compila:

1. [ ] En Render, click **"Environment"** (en la página del servicio)
2. [ ] Agrega estas variables:

| Clave | Valor |
|-------|-------|
| `DATABASE_URL` | `postgresql://admin:PASSWORD@dpg-xxxxx.render.internal:5432/horarios_unt` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Genera algo como: `mk4!@#$%^&*()_+-=[]{}..` (larga y única) |
| `NOMBRE_APLICACION` | `Sistema de Horarios UNT` |

3. [ ] Click "Save"

---

## PASO 5: ESPERAR BUILD (8-10 MIN)

- [ ] Ve a la sección **"Logs"**
- [ ] Espera a ver:
```
Deployment live on https://horarios-unt-app.onrender.com
```
- [ ] Si hay errores, revisa la sección "Troubleshooting" más abajo

---

## PASO 6: VERIFICAR (2 MIN)

1. [ ] Abre https://horarios-unt-app.onrender.com en el navegador
2. [ ] Deberías ver la página de login
3. [ ] Intenta iniciar sesión:
   - Usuario: `admin`
   - Contraseña: (la que tengas en la BD)
4. [ ] Si funciona ✅ → **¡DEPLOYMENT EXITOSO!**

---

## SI ALGO SALE MAL

### Error: "Aplicación no carga (timeout)"

1. Abre **Logs** en Render
2. Busca "error" o "failed"
3. **Si dice "ECONNREFUSED en BD":**
   - Verifica que usas la URL **INTERNAL** en DATABASE_URL
   - Confirma que Web Service y BD están en **MISMA REGIÓN**
   - Reinicia el servicio (click ⋮ → Restart)

### Error: "Prisma client error"

1. Ejecuta en tu PC:
```bash
npx prisma generate
git add .
git commit -m "Fix prisma"
git push
```
2. En Render: Click en "Manual Deploy"

### Error: "Cannot find module 'next'"

1. Verifica que `package.json` está en la raíz (no en subdirectoria)
2. Haz push nuevamente

---

## RESUMEN FINAL

| Acción | Tiempo | ✅ |
|--------|--------|-----|
| Crear BD PostgreSQL | 3 min | [ ] |
| Cargar datos SQL | 2 min | [ ] |
| Crear Web Service | 2 min | [ ] |
| Variables de entorno | 2 min | [ ] |
| Esperar build | 8-10 min | [ ] |
| Verificar en navegador | 2 min | [ ] |
| **TOTAL** | **~20 min** | [ ] |

---

## DESPUÉS DEL PRIMER DESPLIEGUE

- [ ] Anota la URL: `https://horarios-unt-app.onrender.com`
- [ ] Configura dominio personalizado (opcional)
- [ ] Prueba todas las funciones
- [ ] Haz backup de la BD regularmente
- [ ] Revisa logs semanalmente

---

## COMANDOS ÚTILES (En terminal de Render)

Ver logs en tiempo real:
```bash
tail -f render.log
```

Verificar conexión a BD:
```bash
psql $DATABASE_URL -c "SELECT VERSION();"
```

Mostrar variables de entorno:
```bash
env | grep DATABASE
```

---

**¿Todo listo? ¡Comienza en Render.com ahora! 🚀**
