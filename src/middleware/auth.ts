import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function verificarAutenticacion(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}

export function requiereRol(rolesPermitidos: string[]) {
  return async (request: NextRequest, usuario: any) => {
    if (!rolesPermitidos.includes(usuario.rol)) {
      return NextResponse.json(
        { error: 'No tiene permisos suficientes' },
        { status: 403 }
      );
    }
    return null;
  };
}
