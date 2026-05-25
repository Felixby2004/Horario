import nodemailer from 'nodemailer';
import { configuracionCorreo, configuracionWhatsApp, configuracionTelegram } from '@/config/configuraciones';

// Servicio de Email
export class ServicioEmail {
  private static transporter: any;

  private static async inicializar() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport(configuracionCorreo.smtp);
    }
  }

  static async enviarRecordatorio(docente: any, ventana: any) {
    await this.inicializar();

    const mensaje = configuracionCorreo.plantillas.recordatorio.cuerpo
      .replace('{nombre}', `${docente.nombres} ${docente.apellidos}`)
      .replace('{fecha}', ventana.fecha)
      .replace('{hora}', ventana.hora)
      .replace('{ventana}', ventana.nombre);

    await this.transporter.sendMail({
      from: `${configuracionCorreo.remitente.nombre} <${configuracionCorreo.remitente.correo}>`,
      to: docente.correo_electronico,
      subject: configuracionCorreo.plantillas.recordatorio.asunto.replace('{fecha}', ventana.fecha),
      text: mensaje
    });
  }

  static async enviarConfirmacion(docente: any, horario: any) {
    await this.inicializar();

    const mensaje = configuracionCorreo.plantillas.confirmacion.cuerpo
      .replace('{nombre}', `${docente.nombres} ${docente.apellidos}`)
      .replace('{curso}', horario.curso.nombre)
      .replace('{grupo}', `Grupo ${horario.grupo.numero_grupo}`)
      .replace('{horario}', `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`)
      .replace('{ambiente}', horario.ambiente.nombre);

    await this.transporter.sendMail({
      from: `${configuracionCorreo.remitente.nombre} <${configuracionCorreo.remitente.correo}>`,
      to: docente.correo_electronico,
      subject: configuracionCorreo.plantillas.confirmacion.asunto,
      text: mensaje
    });
  }

  static async enviarAlerta(docente: any, asunto: string, mensaje: string) {
    await this.inicializar();

    const mensajeCompleto = configuracionCorreo.plantillas.alerta.cuerpo
      .replace('{nombre}', `${docente.nombres} ${docente.apellidos}`)
      .replace('{mensaje}', mensaje);

    await this.transporter.sendMail({
      from: `${configuracionCorreo.remitente.nombre} <${configuracionCorreo.remitente.correo}>`,
      to: docente.correo_electronico,
      subject: configuracionCorreo.plantillas.alerta.asunto.replace('{asunto}', asunto),
      text: mensajeCompleto
    });
  }
}

// Servicio de WhatsApp
export class ServicioWhatsApp {
  static async enviarMensaje(telefono: string, mensaje: string) {
    try {
      const response = await fetch(configuracionWhatsApp.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${configuracionWhatsApp.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number_id: configuracionWhatsApp.phoneNumberId,
          to: telefono,
          text: { body: mensaje }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
      throw error;
    }
  }

  static async enviarRecordatorio(docente: any, ventana: any) {
    const mensaje = configuracionWhatsApp.mensajes.recordatorio
      .replace('{nombre}', `${docente.nombres} ${docente.apellidos}`)
      .replace('{fecha}', ventana.fecha)
      .replace('{hora}', ventana.hora)
      .replace('{ventana}', ventana.nombre);

    return await this.enviarMensaje(docente.telefono, mensaje);
  }

  static async enviarConfirmacion(docente: any, horario: any) {
    const mensaje = configuracionWhatsApp.mensajes.confirmacion
      .replace('{curso}', horario.curso.nombre)
      .replace('{grupo}', `Grupo ${horario.grupo.numero_grupo}`)
      .replace('{horario}', `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`)
      .replace('{ambiente}', horario.ambiente.nombre);

    return await this.enviarMensaje(docente.telefono, mensaje);
  }

  static async verificarNumero(telefono: string) {
    try {
      const response = await fetch(`${configuracionWhatsApp.apiUrl}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${configuracionWhatsApp.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telefono })
      });

      const data = await response.json();
      return data.valido;
    } catch (error) {
      return false;
    }
  }
}

// Servicio de Telegram
export class ServicioTelegram {
  private static botUrl = `https://api.telegram.org/bot${configuracionTelegram.botToken}`;

  static async enviarMensaje(chatId: string, mensaje: string) {
    try {
      const response = await fetch(`${this.botUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: 'Markdown'
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error enviando mensaje Telegram:', error);
      throw error;
    }
  }

  static async enviarRecordatorio(docente: any, ventana: any) {
    const mensaje = configuracionTelegram.mensajes.horario
      .replace('{horarios}', `${ventana.fecha} ${ventana.hora}`)
      .replace('{fecha}', new Date().toLocaleDateString());

    return await this.enviarMensaje(docente.telegram_chat_id, mensaje);
  }

  static async configurarWebhook() {
    try {
      const response = await fetch(`${this.botUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: configuracionTelegram.webhookUrl
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error configurando webhook:', error);
      throw error;
    }
  }

  static async procesarActualizacion(update: any) {
    const mensaje = update.message;
    
    if (!mensaje) return;

    const chatId = mensaje.chat.id;
    const texto = mensaje.text;

    if (texto === '/start') {
      await this.enviarMensaje(chatId, configuracionTelegram.mensajes.bienvenida);
    } else if (texto === '/mihorario') {
      // Buscar docente por chat_id y enviar horario
      await this.enviarMensaje(chatId, 'Consultando tu horario...');
    } else if (texto === '/ayuda') {
      await this.enviarMensaje(chatId, 'Comandos disponibles:\n/mihorario - Ver tu horario\n/ventanas - Ver ventanas de atención');
    } else {
      // Procesar como código de docente para vincular cuenta
      await this.vincularDocente(chatId, texto);
    }
  }

  private static async vincularDocente(chatId: string, codigo: string) {
    const { prisma } = await import('@/lib/prisma');
    
    const docente = await prisma.docente.findFirst({
      where: { codigo_docente: codigo }
    });

    if (docente) {
      await prisma.docente.update({
        where: { id_docente: docente.id_docente },
        data: { telegram_chat_id: chatId }
      });

      await this.enviarMensaje(chatId, '✅ Cuenta vinculada exitosamente!\n\nUsa /mihorario para ver tu horario.');
    } else {
      await this.enviarMensaje(chatId, '❌ Código de docente no encontrado.\n\nVerifica tu código e intenta nuevamente.');
    }
  }
}

// Coordinador de notificaciones
export class CoordinadorNotificaciones {
  static async enviarNotificacionMulticanal(docente: any, tipo: string, datos: any) {
    const resultados = {
      email: false,
      whatsapp: false,
      telegram: false
    };

    // Email
    if (docente.correo_electronico && docente.preferencia_email) {
      try {
        if (tipo === 'recordatorio') {
          await ServicioEmail.enviarRecordatorio(docente, datos);
        } else if (tipo === 'confirmacion') {
          await ServicioEmail.enviarConfirmacion(docente, datos);
        }
        resultados.email = true;
      } catch (error) {
        console.error('Error enviando email:', error);
      }
    }

    // WhatsApp
    if (docente.telefono && docente.preferencia_whatsapp) {
      try {
        if (tipo === 'recordatorio') {
          await ServicioWhatsApp.enviarRecordatorio(docente, datos);
        } else if (tipo === 'confirmacion') {
          await ServicioWhatsApp.enviarConfirmacion(docente, datos);
        }
        resultados.whatsapp = true;
      } catch (error) {
        console.error('Error enviando WhatsApp:', error);
      }
    }

    // Telegram
    if (docente.telegram_chat_id && docente.preferencia_telegram) {
      try {
        await ServicioTelegram.enviarRecordatorio(docente, datos);
        resultados.telegram = true;
      } catch (error) {
        console.error('Error enviando Telegram:', error);
      }
    }

    return resultados;
  }
}
