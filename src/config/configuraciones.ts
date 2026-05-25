// Configuración de correo electrónico
export const configuracionCorreo = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  
  remitente: {
    nombre: 'Sistema de Horarios - UNT',
    correo: process.env.SMTP_FROM || 'horarios@unt.edu.pe'
  },

  plantillas: {
    recordatorio: {
      asunto: 'Recordatorio: Ventana de Atención - {fecha}',
      cuerpo: `
        Estimado(a) {nombre},

        Le recordamos que tiene asignada una ventana de atención para la selección de horarios:

        Fecha: {fecha}
        Hora: {hora}
        Ventana: {ventana}

        Por favor, asista puntualmente.

        Atentamente,
        Sistema de Gestión de Horarios
        Universidad Nacional de Trujillo
      `
    },
    
    confirmacion: {
      asunto: 'Confirmación de Horario Asignado',
      cuerpo: `
        Estimado(a) {nombre},

        Su horario ha sido confirmado exitosamente:

        Curso: {curso}
        Grupo: {grupo}
        Horario: {horario}
        Ambiente: {ambiente}

        Puede consultar su horario completo en el sistema.

        Atentamente,
        Sistema de Gestión de Horarios
      `
    },

    alerta: {
      asunto: 'Alerta: {asunto}',
      cuerpo: `
        Estimado(a) {nombre},

        Le informamos que: {mensaje}

        Atentamente,
        Sistema de Gestión de Horarios
      `
    }
  }
};

// Configuración de WhatsApp
export const configuracionWhatsApp = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send',
  apiKey: process.env.WHATSAPP_API_KEY,
  phoneNumberId: process.env.WHATSAPP_PHONE_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ID,

  mensajes: {
    recordatorio: `
🔔 *Recordatorio de Ventana de Atención*

Estimado(a) {nombre},

Fecha: {fecha}
Hora: {hora}
Ventana: {ventana}

Por favor, asista puntualmente.

_Sistema de Horarios - UNT_
    `,

    confirmacion: `
✅ *Horario Confirmado*

Curso: {curso}
Grupo: {grupo}
Horario: {horario}
Ambiente: {ambiente}

_Sistema de Horarios - UNT_
    `,

    alerta: `
⚠️ *Alerta*

{mensaje}

_Sistema de Horarios - UNT_
    `
  },

  configuracion: {
    intentosMaximos: 3,
    tiempoEntreReintentos: 60, // segundos
    timeout: 30000 // 30 segundos
  }
};

// Configuración de Telegram
export const configuracionTelegram = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  
  comandos: [
    {
      command: 'start',
      description: 'Iniciar el bot'
    },
    {
      command: 'mihorario',
      description: 'Ver mi horario actual'
    },
    {
      command: 'ventanas',
      description: 'Ver ventanas de atención'
    },
    {
      command: 'ayuda',
      description: 'Mostrar ayuda'
    }
  ],

  mensajes: {
    bienvenida: `
🎓 *Bienvenido al Sistema de Horarios - UNT*

Para vincular tu cuenta, envía tu código de docente.

Comandos disponibles:
/mihorario - Ver tu horario
/ventanas - Ver ventanas de atención
/ayuda - Mostrar ayuda
    `,

    horario: `
📅 *Tu Horario*

{horarios}

_Actualizado: {fecha}_
    `,

    noVinculado: `
⚠️ Tu cuenta no está vinculada.

Envía tu código de docente para vincular tu cuenta.
    `
  }
};

// Configuración de base de datos
export const configuracionBaseDatos = {
  postgresql: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'horarios_unt',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true',
    max: 20, // conexiones máximas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
};

// Configuración de Redis
export const configuracionRedis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  ttl: {
    estadisticas: 300, // 5 minutos
    disponibilidad: 60, // 1 minuto
    sesiones: 28800, // 8 horas
    cache: 3600 // 1 hora
  },

  prefijos: {
    sesion: 'sesion:',
    cache: 'cache:',
    estadisticas: 'stats:',
    disponibilidad: 'disp:',
    lock: 'lock:'
  }
};
