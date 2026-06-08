import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id_facultad = searchParams.get('id_facultad')

  try {
    const where = { activo: true }
    if (id_facultad) {
      (where as any).id_facultad = parseInt(id_facultad)
    }

    const departamentos = await prisma.departamentoAcademico.findMany({
      where,
      include: {
        facultad: true
      }
    })
    return NextResponse.json({ exito: true, datos: departamentos })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ exito: false, error: 'Error al cargar departamentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const departamento = await prisma.departamentoAcademico.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        id_facultad: parseInt(data.id_facultad)
      }
    })
    return NextResponse.json({ exito: true, datos: departamento })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ exito: false, error: 'Error al crear departamento' }, { status: 500 })
  }
}
