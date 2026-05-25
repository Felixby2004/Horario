import axios from 'axios';

export class ServicioWhatsApp {
  private static readonly API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
  private static readonly TOKEN = process.env.WHATSAPP_TOKEN;
  private static readonly PHONE_ID = process.env.WHATSAPP_PHONE_ID;

  static async enviarMensaje(telefono: string, mensaje: string) {
    try {
      const response = await axios.post(
        `${this.API_URL}/${this.PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: telefono,
          type: 'text',
          text: { body: mensaje }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        exito: true,
        messageId: response.data.messages[0].id
      };
    } catch (error: any) {
      console.error('Error enviando WhatsApp:', error);
      return {
        exito: false,
        error: error.message
      };
    }
  }

  static async enviarNotificacionVentana(telefono: string, datos: any) {
    const mensaje = `
*Sistema de Horarios UNT*

Recordatorio: Ventana de Atención

📅 Fecha: ${datos.fecha}
🕐 Hora: ${datos.hora_inicio} - ${datos.hora_fin}
👥 Modalidad: ${datos.modalidad}

Por favor, asegúrese de estar presente.
    `.trim();

    return await this.enviarMensaje(telefono, mensaje);
  }

  static async enviarNotificacionUrgente(telefono: string, mensaje: string) {
    const mensajeFormateado = `
⚠️ *NOTIFICACIÓN URGENTE*

${mensaje}

Sistema de Horarios UNT
    `.trim();

    return await this.enviarMensaje(telefono, mensajeFormateado);
  }

  static async verificarNumero(telefono: string): Promise<boolean> {
    try {
      // Implementar verificación según API de WhatsApp Business
      return true;
    } catch (error) {
      return false;
    }
  }
}
