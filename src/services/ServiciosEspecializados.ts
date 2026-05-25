// Servidor WebSocket
export class ServidorWebSocket {
  private static clientes: Map<string, Set<any>> = new Map();

  static suscribir(canal: string, cliente: any) {
    if (!this.clientes.has(canal)) {
      this.clientes.set(canal, new Set());
    }
    this.clientes.get(canal)!.add(cliente);
  }

  static desuscribir(canal: string, cliente: any) {
    this.clientes.get(canal)?.delete(cliente);
  }

  static difundir(canal: string, mensaje: any) {
    const clientes = this.clientes.get(canal);
    if (clientes) {
      clientes.forEach(cliente => {
        try {
          cliente.send(JSON.stringify(mensaje));
        } catch (error) {
          console.error('Error enviando mensaje:', error);
        }
      });
    }
  }

  static difundirDisponibilidad(idPeriodo: number, datos: any) {
    this.difundir(`disponibilidad:${idPeriodo}`, {
      tipo: 'actualizacion_disponibilidad',
      datos
    });
  }

  static difundirNotificacion(idUsuario: number, notificacion: any) {
    this.difundir(`notificaciones:${idUsuario}`, {
      tipo: 'nueva_notificacion',
      notificacion
    });
  }
}

// Servicio de Reportes
export class ServicioReportes {
  static async generarPDF(tipo: string, parametros: any): Promise<Buffer> {
    // Implementación con Puppeteer
    const html = await this.generarHTML(tipo, parametros);
    
    // Simulación - en producción usar Puppeteer
    return Buffer.from(html);
  }

  private static async generarHTML(tipo: string, parametros: any): Promise<string> {
    switch (tipo) {
      case 'aula':
        return this.generarHTMLAula(parametros);
      case 'docente':
        return this.generarHTMLDocente(parametros);
      case 'laboratorio':
        return this.generarHTMLLaboratorio(parametros);
      default:
        return '<html><body><h1>Reporte no soportado</h1></body></html>';
    }
  }

  private static generarHTMLAula(parametros: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horario de Aula</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #1e40af; color: white; }
          .header { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Universidad Nacional de Trujillo</h1>
          <h2>Horario de Aula: ${parametros.nombreAula}</h2>
          <p>Período: ${parametros.periodo}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Lunes</th>
              <th>Martes</th>
              <th>Miércoles</th>
              <th>Jueves</th>
              <th>Viernes</th>
            </tr>
          </thead>
          <tbody>
            ${this.generarFilasHorario(parametros.horarios)}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  private static generarHTMLDocente(parametros: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horario de Docente</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <h1>Horario del Docente</h1>
        <p><strong>Docente:</strong> ${parametros.nombreDocente}</p>
        <p><strong>Código:</strong> ${parametros.codigoDocente}</p>
        <p><strong>Categoría:</strong> ${parametros.categoria}</p>
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Hora</th>
              <th>Curso</th>
              <th>Grupo</th>
              <th>Ambiente</th>
            </tr>
          </thead>
          <tbody>
            ${this.generarFilasDocente(parametros.horarios)}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  private static generarHTMLLaboratorio(parametros: any): string {
    return this.generarHTMLAula({ ...parametros, nombreAula: parametros.nombreLaboratorio });
  }

  private static generarFilasHorario(horarios: any[]): string {
    return horarios.map(fila => `
      <tr>
        <td>${fila.hora}</td>
        ${fila.dias.map((dia: any) => `
          <td>${dia.curso ? `${dia.curso}<br>${dia.docente}` : ''}</td>
        `).join('')}
      </tr>
    `).join('');
  }

  private static generarFilasDocente(horarios: any[]): string {
    return horarios.map(h => `
      <tr>
        <td>${h.dia}</td>
        <td>${h.hora_inicio} - ${h.hora_fin}</td>
        <td>${h.curso}</td>
        <td>${h.grupo}</td>
        <td>${h.ambiente}</td>
      </tr>
    `).join('');
  }
}
