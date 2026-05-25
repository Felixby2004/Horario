import { NextRequest, NextResponse } from 'next/server';
import { ServicioAuditoria } from '@/services/auditoria/ServicioAuditoria';

// Middleware de autorización
export async function verificarAutorizacion(
  request: NextRequest,
  rolesPermitidos: string[]
) {
  try {
    const token = request.cookies.get('auth_token');
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar rol del usuario
    // Implementación simplificada
    return null;
  } catch (error) {
    return NextResponse.json({ error: 'Error de autorización' }, { status: 403 });
  }
}

// Middleware de registro de auditoría
export async function registrarAuditoria(
  idUsuario: number,
  accion: string,
  tabla: string,
  idRegistro?: number,
  valoresAnteriores?: any,
  valoresNuevos?: any
) {
  await ServicioAuditoria.registrar({
    id_usuario: idUsuario,
    accion,
    tabla_afectada: tabla,
    id_registro: idRegistro,
    valores_anteriores: valoresAnteriores,
    valores_nuevos: valoresNuevos
  });
}

// Middleware de validación de petición
export function validarPeticion(schema: any) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      // Validar contra schema
      // Implementación simplificada
      return null;
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: error.message },
        { status: 400 }
      );
    }
  };
}

// Decorador para rutas protegidas
export function rutaProtegida(handler: any, roles: string[] = []) {
  return async (request: NextRequest, context: any) => {
    const errorAuth = await verificarAutorizacion(request, roles);
    if (errorAuth) return errorAuth;

    return handler(request, context);
  };
}

// Cache de respuestas
const cache = new Map<string, { data: any; timestamp: number }>();

export function conCache(handler: any, ttl: number = 300) {
  return async (request: NextRequest, context: any) => {
    const clave = request.url;
    const ahora = Date.now();

    if (cache.has(clave)) {
      const { data, timestamp } = cache.get(clave)!;
      if (ahora - timestamp < ttl * 1000) {
        return NextResponse.json(data);
      }
    }

    const response = await handler(request, context);
    const data = await response.json();
    cache.set(clave, { data, timestamp: ahora });

    return NextResponse.json(data);
  };
}
