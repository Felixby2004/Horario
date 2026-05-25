import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'secret';
  private static readonly JWT_EXPIRATION = process.env.JWT_EXPIRACION || '8h';

  static async login(codigo: string, contrasena: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { codigo },
      include: { docente: true }
    });

    if (!usuario || !usuario.activo) {
      throw new Error('Credenciales inválidas');
    }

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!esValida) {
      throw new Error('Credenciales inválidas');
    }

    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_acceso: new Date() }
    });

    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario,
        codigo: usuario.codigo,
        rol: usuario.rol,
        id_docente: usuario.docente?.id_docente
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRATION }
    );

    return {
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        codigo: usuario.codigo,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        correo_electronico: usuario.correo_electronico
      }
    };
  }

  static async verificarToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return decoded;
    } catch {
      return null;
    }
  }

  static async cambiarContrasena(idUsuario: number, contrasenaActual: string, contrasenaNueva: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: idUsuario }
    });

    if (!usuario) throw new Error('Usuario no encontrado');

    const esValida = await bcrypt.compare(contrasenaActual, usuario.contrasena_hash);
    if (!esValida) throw new Error('Contraseña actual incorrecta');

    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: { contrasena_hash: hash }
    });
  }
}
