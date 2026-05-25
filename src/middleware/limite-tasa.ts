import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LIMITE_PETICIONES = 100;
const VENTANA_TIEMPO = 60; // segundos

export async function limiteTasa(request: NextRequest, identificador: string) {
  try {
    const clave = `rate_limit:${identificador}`;
    const peticiones = await redis.incr(clave);

    if (peticiones === 1) {
      await redis.expire(clave, VENTANA_TIEMPO);
    }

    if (peticiones > LIMITE_PETICIONES) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Intenta de nuevo más tarde.' },
        { status: 429 }
      );
    }

    return null;
  } catch (error) {
    console.error('Error en rate limiting:', error);
    return null;
  }
}
