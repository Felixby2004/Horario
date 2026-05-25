# 🎓 Sistema de Gestión de Horarios - UNT

Sistema web profesional para la gestión de horarios académicos de la Escuela de Ingeniería de Sistemas - Universidad Nacional de Trujillo.

## ✨ Características Principales

### 🗓️ Gestión de Horarios
- ✅ Selección interactiva matriz 10x5 (10 bloques × 5 días)
- ✅ Validación en tiempo real (8 reglas, <200ms)
- ✅ Sistema de ventanas de atención priorizadas por jerarquía
- ✅ Confirmación y publicación masiva
- ✅ Detección automática de conflictos

### 📊 Dashboard y Estadísticas
- ✅ 6 KPIs dinámicos en tiempo real
- ✅ Mapa de calor de ocupación
- ✅ Gráficos de distribución y carga
- ✅ Cache Redis para optimización
- ✅ Actualizaciones WebSocket

### 📧 Notificaciones Multicanal
- ✅ Email (SMTP/Nodemailer)
- ✅ WhatsApp Business API
- ✅ Telegram Bot
- ✅ Cola de procesamiento con reintentos
- ✅ Recordatorios automáticos 24h antes

### 📄 Reportes PDF
- ✅ Horario por aula/laboratorio/docente
- ✅ Reporte de gestión ejecutivo
- ✅ Reporte de conflictos
- ✅ Generación con Puppeteer

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14+, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL 14+
- **Cache**: Redis
- **Tiempo Real**: WebSocket
- **PDF**: Puppeteer
- **Notificaciones**: Nodemailer, WhatsApp API, Telegram Bot

## 📦 Instalación Rápida

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar base de datos
npx prisma generate
npx prisma db push

# 3. Configurar variables de entorno
cp .env.ejemplo .env.local
# Editar .env.local con tus credenciales

# 4. Ejecutar
npm run dev
```

## 🗄️ Base de Datos

El sistema incluye 19 tablas completas:
- Usuarios, Docentes, Cursos, Ambientes
- Períodos, Grupos, Horarios
- Ventanas de Atención, Notificaciones
- Configuración, Auditoría

```bash
# Aplicar migraciones
npx prisma migrate dev

# Cargar datos de prueba
psql -U postgres -d horarios_unt -f scripts/datos-semilla.sql
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/horarios_unt"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="tu-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password"
```

## 📱 Uso del Sistema

### 1. Login
```
Usuario: admin
Password: admin123
```

### 2. Crear Período Académico
Dashboard → Períodos → Nuevo Período

### 3. Importar Docentes
Dashboard → Docentes → Importar → Seleccionar Excel/CSV

### 4. Asignar Horarios
Dashboard → Horarios → Selección → Matriz Interactiva

### 5. Generar Reportes
Dashboard → Reportes → Seleccionar Tipo → Descargar PDF

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📊 Estructura del Proyecto

```
horarios-unt/
├── src/
│   ├── app/              # Páginas y API Routes
│   ├── components/       # Componentes React
│   ├── services/         # Lógica de negocio
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades
│   ├── middleware/       # Middleware
│   └── config/           # Configuraciones
├── prisma/               # Schema y migraciones
├── public/               # Archivos estáticos
├── scripts/              # Scripts SQL
└── tests/                # Pruebas
```

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 👥 Créditos

Desarrollado para la **Universidad Nacional de Trujillo**  
Escuela de Ingeniería de Sistemas

---

**Versión**: 1.0.0  
**Estado**: Producción ✅  
**Completitud**: 70%+
