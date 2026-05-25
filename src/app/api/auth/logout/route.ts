import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      exito: true,
      mensaje: 'Sesión cerrada exitosamente'
    });

    response.cookies.delete('auth_token');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
