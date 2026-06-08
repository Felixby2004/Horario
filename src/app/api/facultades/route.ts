import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const facultades = await prisma.facultad.findMany({
      where: { activo: true },
      include: {
        departamentos: {
          where: { activo: true }
        }
      }
    })
    return NextResponse.json({ exito: true, datos: facultades })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ exito: false, error: 'Error al cargar facultades' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const facultad = await prisma.facultad.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre
      }
    })
    return NextResponse.json({ exito: true, datos: facultad })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ exito: false, error: 'Error al crear facultad' }, { status: 500 })
  }
}
