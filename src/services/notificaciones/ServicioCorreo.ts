import nodemailer from 'nodemailer';

export class ServicioCorreo {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  static async enviarNotificacionVentana(correo: string, datos: any) {
    const asunto = `Ventana de Atención - ${datos.fecha}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1e40af;">Sistema de Horarios UNT</h2>
        <h3>Recordatorio: Ventana de Atención</h3>
        <p>Estimado(a) docente,</p>
        <p>Le recordamos que tiene asignada una ventana de atención:</p>
        <ul>
          <li><strong>Fecha:</strong> ${datos.fecha}</li>
          <li><strong>Hora:</strong> ${datos.hora_inicio} - ${datos.hora_fin}</li>
          <li><strong>Modalidad:</strong> ${datos.modalidad}</li>
        </ul>
        <p>Por favor, asegúrese de estar presente a la hora indicada.</p>
        <p style="color: #666; font-size: 12px;">
          Este es un mensaje automático, por favor no responder.
        </p>
      </div>
    `;

    return await this.enviarCorreo(correo, asunto, html);
  }

  static async enviarNotificacionHorarioAsignado(correo: string, datos: any) {
    const asunto = 'Horario Asignado';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1e40af;">Horario Asignado</h2>
        <p>Se ha asignado un nuevo horario:</p>
        <ul>
          <li><strong>Curso:</strong> ${datos.curso}</li>
          <li><strong>Día:</strong> ${datos.dia}</li>
          <li><strong>Hora:</strong> ${datos.hora_inicio} - ${datos.hora_fin}</li>
          <li><strong>Ambiente:</strong> ${datos.ambiente}</li>
        </ul>
      </div>
    `;

    return await this.enviarCorreo(correo, asunto, html);
  }

  private static async enviarCorreo(destinatario: string, asunto: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Sistema de Horarios UNT" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: asunto,
        html: html
      });

      return {
        exito: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error enviando correo:', error);
      return {
        exito: false,
        error: error
      };
    }
  }
}
