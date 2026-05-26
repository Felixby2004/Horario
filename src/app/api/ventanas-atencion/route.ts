import { NextRequest, NextResponse } from 'next/server';
import { GestorVentanasAtencion } from '@/services/ventanas/GestorVentanasAtencion';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const ventana = await GestorVentanasAtencion.crearVentana(datos);
    
    await GestorVentanasAtencion.obtenerColaDocentes(ventana.id_ventana);
    
    return NextResponse.json({
      exito: true,
      datos: ventana,
      mensaje: 'Ventana creada exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
