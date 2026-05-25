import axios from 'axios';

export class ServicioTelegram {
  private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static readonly API_URL = `https://api.telegram.org/bot${this.BOT_TOKEN}`;

  static async enviarMensaje(chatId: string, mensaje: string) {
    try {
      const response = await axios.post(`${this.API_URL}/sendMessage`, {
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'Markdown'
      });

      return {
        exito: true,
        messageId: response.data.result.message_id
      };
    } catch (error: any) {
      console.error('Error enviando Telegram:', error);
      return {
        exito: false,
        error: error.message
      };
    }
  }

  static async enviarNotificacionVentana(chatId: string, datos: any) {
    const mensaje = `
🎓 *Sistema de Horarios UNT*

📢 *Recordatorio: Ventana de Atención*

📅 Fecha: ${datos.fecha}
🕐 Hora: ${datos.hora_inicio} - ${datos.hora_fin}
👥 Modalidad: ${datos.modalidad}

Por favor, asegúrese de estar presente a la hora indicada.
    `.trim();

    return await this.enviarMensaje(chatId, mensaje);
  }

  static async enviarNotificacionHorario(chatId: string, datos: any) {
    const mensaje = `
✅ *Horario Asignado*

📚 Curso: ${datos.curso}
📅 Día: ${datos.dia}
🕐 Hora: ${datos.hora_inicio} - ${datos.hora_fin}
🏫 Ambiente: ${datos.ambiente}
    `.trim();

    return await this.enviarMensaje(chatId, mensaje);
  }

  static async obtenerChatId(username: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.API_URL}/getUpdates`);
      const updates = response.data.result;
      
      const usuario = updates.find((u: any) => 
        u.message?.from?.username === username
      );
      
      return usuario?.message?.chat?.id || null;
    } catch (error) {
      return null;
    }
  }
}
