import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

/**
 * Verifica si la petición está autenticada mediante un token JWT
 * en las cookies o en el header Authorization.
 * @throws Error si no está autenticado o el token es inválido
 */
export async function verificarAutenticacion(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    throw new Error('No autorizado');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

/**
 * Verifica si el usuario tiene uno de los roles permitidos.
 * @throws Error si el usuario no tiene los permisos necesarios
 */
export async function verificarRol(idUsuario: number, rolesPermitidos: string[]) {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
    select: { rol: true }
  });

  if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
    throw new Error('No tiene permisos suficientes');
  }

  return true;
}

/**
 * Resuelve el registro de docente asociado a un usuario autenticado.
 * Prioriza la relación directa por id_usuario y, si no existe, intenta por código de usuario.
 */
export async function obtenerDocenteDelUsuario(usuario: { id_usuario: number; codigo?: string }) {
  let docente = await prisma.docente.findUnique({
    where: { id_usuario: usuario.id_usuario }
  });

  if (!docente && usuario.codigo) {
    docente = await prisma.docente.findUnique({
      where: { codigo_docente: usuario.codigo }
    });
  }

  return docente;
}
