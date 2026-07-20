# Diagrama de Arquitectura

```mermaid
graph TB
    subgraph Cliente["Cliente (Navegador Web)"]
        Frontend["Frontend Next.js (App Router)"]
        Components["Componentes React<br/>- Dashboard<br/>- Gestión Docentes<br/>- Horarios<br/>- Reportes"]
    end

    subgraph Servidor["Servidor (Next.js)"]
        API_Routes["API Routes (Backend)"]
        Auth["Autenticación y Autorización"]
        Services["Servicios Negocio<br/>- Carga Académica<br/>- Horarios<br/>- Notificaciones<br/>- Reportes"]
    end

    subgraph BaseDatos["Base de Datos"]
        PostgreSQL["PostgreSQL"]
        Redis["Redis (Cache)"]
    end

    subgraph Externos["Servicios Externos"]
        Email["SMTP (Correo)"]
        WhatsApp["WhatsApp API"]
        Telegram["Telegram Bot"]
    end

    Frontend -->|HTTP/HTTPS| API_Routes
    Components --> Frontend
    API_Routes --> Services
    Services --> Auth
    Auth --> PostgreSQL
    Services --> PostgreSQL
    Services --> Redis
    Services --> Email
    Services --> WhatsApp
    Services --> Telegram
```

## Descripción de la Arquitectura

- **Cliente**: Aplicación web desarrollada con Next.js (App Router) y React.
- **Servidor**: Backend integrado en Next.js con API Routes.
- **Base de Datos**: PostgreSQL como base principal y Redis para caché.
- **Servicios Externos**: Integración con APIs de mensajería (correo, WhatsApp, Telegram).
