# Sistema de Gestión de Horarios - UNT

Sistema completo de gestión de horarios académicos para la Escuela de Ingeniería de Sistemas de la Universidad Nacional de Trujillo.

## 🎯 Características Principales

- ✅ Gestión completa de horarios académicos
- ✅ Sistema de ventanas de atención por jerarquía docente
- ✅ Validación en tiempo real (<200ms) con 8 validaciones paralelas
- ✅ Notificaciones multicanal (Correo, WhatsApp, Telegram)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Generación de reportes PDF
- ✅ WebSocket para actualizaciones en vivo
- ✅ Sistema de selección temporal con caché Redis

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL
- **Caché**: Redis
- **Notificaciones**: Nodemailer, WhatsApp Business API, Telegram Bot API
- **Reportes**: Puppeteer
- **Tareas programadas**: node-cron

## 📋 Requisitos Previos

- Node.js 20+ 
- PostgreSQL 14+ (con Laragon o instalación independiente)
- Redis 7+
- Google Chrome (para generación de PDFs)
- Cuenta de Gmail con contraseña de aplicación (para correos)
- WhatsApp Business API Token (opcional)
- Telegram Bot Token (opcional)

## 🚀 Instalación

### 1. Clonar/Descargar el Proyecto

Extrae el archivo RAR en tu ubicación deseada.

### 2. Instalar Dependencias

```bash
cd horarios-unt
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.ejemplo .env.local
```

Edita `.env.local` y configura:

```env
# Base de datos (Laragon)
DATABASE_URL=postgresql://postgres:password@localhost:5432/horarios_unt

# Redis
REDIS_URL=redis://localhost:6379

# JWT (cambia el secret)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Correo (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PUERTO=587
SMTP_USUARIO=tu_correo@gmail.com
SMTP_CONTRASENA=tu_contraseña_de_aplicacion

# Puppeteer (ruta de Chrome en Windows)
PUPPETEER_EXECUTABLE_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe
```

### 4. Configurar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# (Opcional) Ver base de datos en navegador
npx prisma studio
```

### 5. Iniciar Servicios

**Con Laragon:**
- Inicia Laragon
- Asegúrate de que PostgreSQL y Redis estén activos

**O manualmente:**
```bash
# Iniciar PostgreSQL (si no está en Laragon)
# Iniciar Redis
redis-server
```

### 6. Ejecutar la Aplicación

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

La aplicación estará disponible en: http://localhost:3000

## 📁 Estructura del Proyecto

```
horarios-unt/
├── prisma/
│   └── schema.prisma          # Modelo de base de datos
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── api/              # API Routes
│   │   ├── dashboard/        # Páginas del dashboard
│   │   └── auth/             # Autenticación
│   ├── components/           # Componentes React
│   ├── services/             # Lógica de negocio
│   ├── lib/                  # Utilidades y configuración
│   └── hooks/                # Custom hooks
└── public/                   # Archivos estáticos
```

## 🗄️ Base de Datos

El sistema utiliza **19 tablas principales**:

- Usuario, Docente, Curso, Grupo, Ambiente
- HorarioAsignado, SeleccionTemporalHorario
- VentanaAtencion, DisponibilidadDocente
- ConfiguracionNotificaciones, HistorialNotificaciones, ColaNotificaciones
- ConflictoHorario, AuditoriaHorario
- Y más...

## 🔐 Usuarios por Defecto

Para pruebas, puedes crear usuarios ejecutando:

```sql
INSERT INTO usuario (codigo, nombres, apellidos, correo_electronico, contrasena_hash, rol)
VALUES ('ADMIN001', 'Admin', 'Sistema', 'admin@unitru.edu.pe', 
        '$2b$10$hash_aqui', 'administrador_sistema');
```

Genera el hash de la contraseña con:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('tu_contraseña', 10);
console.log(hash);
```

## 📧 Configuración de Notificaciones

### Correo Electrónico (Gmail)

1. Habilita la verificación en 2 pasos en tu cuenta de Gmail
2. Genera una "Contraseña de aplicación" en: https://myaccount.google.com/apppasswords
3. Usa esa contraseña en `SMTP_CONTRASENA`

### WhatsApp Business API

1. Registra tu negocio en Meta for Developers
2. Obtén tu token de acceso y Phone Number ID
3. Configura en `.env.local`:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_NUMERO_TELEFONO_ID`

### Telegram Bot

1. Habla con @BotFather en Telegram
2. Crea un bot con `/newbot`
3. Copia el token y configura `TELEGRAM_BOT_TOKEN`

## 🎨 Módulos Principales

### 1. Dashboard
- KPIs en tiempo real
- Gráficos de avance
- Actividad reciente

### 2. Gestión de Horarios
- Selección interactiva con matrices
- Validación en tiempo real
- Sistema de ventanas de atención

### 3. Gestión de Docentes
- CRUD completo
- Asignación de cursos
- Preferencias de notificación

### 4. Reportes
- Horarios por aula
- Horarios por laboratorio
- Horarios por docente
- Reporte de gestión

### 5. Notificaciones
- Recordatorio 24h antes (Correo + WhatsApp + Telegram)
- Alerta 15min antes (WhatsApp + Telegram)
- Historial de envíos
- Configuración de preferencias

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar en modo desarrollo

# Base de datos
npx prisma studio             # Ver/editar datos
npx prisma migrate dev        # Crear migración
npx prisma db push            # Aplicar cambios sin migración
npx prisma generate           # Regenerar cliente

# Producción
npm run build                 # Compilar para producción
npm start                     # Iniciar en producción

# Calidad de código
npm run lint                  # Ejecutar ESLint
```

## 📊 Tareas Programadas (Cron Jobs)

El sistema ejecuta automáticamente:

- ✅ **Cada minuto**: Procesar cola de notificaciones
- ✅ **Cada 5 minutos**: Limpiar selecciones temporales expiradas
- ✅ **Cada hora**: Verificar recordatorios pendientes
- ✅ **Diario 2:00 AM**: Respaldo de configuraciones

## 🐛 Solución de Problemas

### La base de datos no se conecta
- Verifica que PostgreSQL esté corriendo
- Revisa el `DATABASE_URL` en `.env.local`
- Prueba la conexión con: `npx prisma db pull`

### Redis no está disponible
- Asegúrate de que Redis esté corriendo
- Prueba: `redis-cli ping` (debe responder PONG)

### Las notificaciones no se envían
- Verifica las credenciales de SMTP/WhatsApp/Telegram
- Revisa los logs en la consola
- Verifica que las tareas cron estén activas

### Error al generar PDFs
- Verifica la ruta de Chrome en `PUPPETEER_EXECUTABLE_PATH`
- Asegúrate de que Chrome esté instalado

## 📝 Notas Importantes

- **Zona horaria**: El sistema usa `America/Lima`
- **Validaciones**: Tiempo máximo de respuesta 200ms
- **Selecciones temporales**: Expiran en 30 minutos
- **Sesiones**: Duran 8 horas por defecto
- **Caché Redis**: Se usa para optimizar consultas frecuentes

## 🤝 Soporte

Para dudas o problemas:
- Email: sistemas@unitru.edu.pe
- Teléfono: (044) 123456

## 📄 Licencia

© 2026 Universidad Nacional de Trujillo - Escuela de Ingeniería de Sistemas

---

**Desarrollado para la Universidad Nacional de Trujillo**
