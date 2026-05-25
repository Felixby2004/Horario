import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

/**
 * Envía notificación de citación al docente
 */
export async function enviarNotificacionCitacion(
  idDocente: number,
  citacion: any,
  periodo: any
) {
  try {
    // Obtener información del docente
    const docente = await prisma.docente.findUnique({
      where: { id_docente: idDocente },
      include: {
        preferencias_notificacion: true
      }
    });

    if (!docente || !docente.correo_electronico) {
      console.warn(`No hay correo disponible para docente ${idDocente}`);
      return;
    }

    // Preparar contenido del correo
    const fechaFormato = new Date(citacion.fecha_citacion).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const asunto = `Citación para Asignación de Horarios - ${periodo.nombre}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Citación para Asignación de Horarios</h2>
        <p>Estimado(a) Dr(a). ${docente.nombres} ${docente.apellidos},</p>
        
        <p>Le informamos que ha sido citado(a) para la asignación de horarios en el período <strong>${periodo.nombre}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Detalles de su Citación:</h3>
          <p><strong>Fecha:</strong> ${fechaFormato}</p>
          <p><strong>Hora:</strong> ${citacion.hora_inicio} - ${citacion.hora_fin}</p>
          <p><strong>Número de Turno:</strong> ${citacion.numero_orden_turno}</p>
          <p><strong>Período:</strong> ${periodo.nombre}</p>
        </div>
        
        <h3>Instrucciones:</h3>
        <ul>
          <li>Por favor confirme su asistencia dentro de los próximos 2 días</li>
          <li>Si no puede asistir en esta fecha, puede solicitar reprogramación</li>
          <li>Acceda al sistema para confirmar o rechazar esta citación</li>
        </ul>
        
        <p>Si tiene preguntas, contáctenos a través del sistema o al correo de soporte.</p>
        
        <p>Atentamente,<br/>Sistema de Gestión de Horarios<br/>Escuela de Ingeniería de Sistemas - UNT</p>
      </div>
    `;

    // Enviar correo
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: docente.correo_electronico,
      subject: asunto,
      html
    });

    // Registrar en historial
    await prisma.historialNotificaciones.create({
      data: {
        id_docente: idDocente,
        tipo_notificacion: 'citacion_asignada',
        canal: 'correo',
        mensaje: `Notificación de citación para ${fechaFormato} a las ${citacion.hora_inicio}`,
        estado_envio: 'enviado',
        fecha_envio: new Date()
      }
    });

    // Marcar como notificación enviada
    await prisma.citacionDocente.update({
      where: { id_citacion: citacion.id_citacion },
      data: { notificacion_enviada: true }
    });

  } catch (error) {
    console.error('Error enviando notificación de citación:', error);
    throw error;
  }
}

/**
 * Envía recordatorio de citación (24 horas antes)
 */
export async function enviarRecordatorioCitacion(idCitacion: number) {
  try {
    const citacion = await prisma.citacionDocente.findUnique({
      where: { id_citacion: idCitacion },
      include: {
        docente: true,
        ventana: true
      }
    });

    if (!citacion || !citacion.docente.correo_electronico) {
      return;
    }

    const fechaFormato = new Date(citacion.fecha_citacion).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recordatorio: Citación de Mañana</h2>
        <p>Estimado(a) Dr(a). ${citacion.docente.nombres} ${citacion.docente.apellidos},</p>
        
        <p>Le recordamos que mañana tiene su citación para la asignación de horarios.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Detalles:</h3>
          <p><strong>Fecha:</strong> ${fechaFormato}</p>
          <p><strong>Hora:</strong> ${citacion.hora_inicio} - ${citacion.hora_fin}</p>
          <p><strong>Turno:</strong> ${citacion.numero_orden_turno}</p>
        </div>
        
        <p>Por favor, confirme su asistencia o comuníquese si no puede asistir.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: citacion.docente.correo_electronico,
      subject: `Recordatorio: Citación de ${fechaFormato}`,
      html
    });

    // Actualizar bandera de recordatorio
    await prisma.citacionDocente.update({
      where: { id_citacion: idCitacion },
      data: { recordatorio_enviado: true }
    });

  } catch (error) {
    console.error('Error enviando recordatorio:', error);
  }
}

/**
 * Notifica cambios de estado de citación
 */
export async function notificarCambioEstadoCitacion(
  idCitacion: number,
  nuevoEstado: string
) {
  try {
    const citacion = await prisma.citacionDocente.findUnique({
      where: { id_citacion: idCitacion },
      include: { docente: true }
    });

    if (!citacion || !citacion.docente.correo_electronico) {
      return;
    }

    let asunto = '';
    let mensaje = '';

    switch (nuevoEstado) {
      case 'confirmada_docente':
        asunto = 'Confirmación Recibida';
        mensaje = 'Hemos recibido su confirmación de asistencia a la citación.';
        break;
      case 'rechazada':
        asunto = 'Citación Rechazada';
        mensaje = 'Su citación ha sido rechazada. Por favor contacte al coordinador para reprogramación.';
        break;
      case 'cancelada':
        asunto = 'Citación Cancelada';
        mensaje = 'Su citación ha sido cancelada. Se le asignará una nueva fecha pronto.';
        break;
      case 'completada':
        asunto = 'Citación Completada';
        mensaje = 'Su proceso de citación ha sido completado exitosamente.';
        break;
    }

    if (asunto && mensaje) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${asunto}</h2>
          <p>Estimado(a) Dr(a). ${citacion.docente.nombres} ${citacion.docente.apellidos},</p>
          <p>${mensaje}</p>
          <p>Atentamente,<br/>Sistema de Gestión de Horarios</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: citacion.docente.correo_electronico,
        subject: asunto,
        html
      });
    }

  } catch (error) {
    console.error('Error notificando cambio de estado:', error);
  }
}
