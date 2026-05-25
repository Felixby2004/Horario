// Script para configurar webhook de Telegram
// scripts/configurar-telegram-webhook.ts

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL;

async function configurarWebhook() {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook de Telegram configurado exitosamente');
      console.log(`URL: ${WEBHOOK_URL}`);
    } else {
      console.error('❌ Error configurando webhook:', data.description);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

configurarWebhook();

// Script para verificar conexiones externas
// scripts/verificar-conexiones.ts

async function verificarConexiones() {
  console.log('=== Verificando Conexiones Externas ===\n');

  // Verificar PostgreSQL
  try {
    const { prisma } = await import('../src/lib/prisma');
    await prisma.$connect();
    console.log('✅ PostgreSQL: Conectado');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ PostgreSQL: Error de conexión');
  }

  // Verificar Redis
  try {
    const { redis } = await import('../src/lib/redis');
    await redis.ping();
    console.log('✅ Redis: Conectado');
  } catch (error) {
    console.log('❌ Redis: Error de conexión');
  }

  // Verificar SMTP
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.verify();
    console.log('✅ SMTP: Conectado');
  } catch (error) {
    console.log('❌ SMTP: Error de conexión');
  }

  // Verificar WhatsApp API
  try {
    const response = await fetch(process.env.WHATSAPP_API_URL + '/health');
    if (response.ok) {
      console.log('✅ WhatsApp API: Disponible');
    } else {
      console.log('❌ WhatsApp API: No disponible');
    }
  } catch (error) {
    console.log('❌ WhatsApp API: Error de conexión');
  }

  // Verificar Telegram Bot
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();
    if (data.ok) {
      console.log('✅ Telegram Bot: Conectado');
      console.log(`   Bot: @${data.result.username}`);
    } else {
      console.log('❌ Telegram Bot: Error');
    }
  } catch (error) {
    console.log('❌ Telegram Bot: Error de conexión');
  }

  console.log('\n=== Verificación Completada ===');
}

if (require.main === module) {
  verificarConexiones();
}

export { verificarConexiones };
