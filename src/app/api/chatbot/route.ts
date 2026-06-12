import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import prisma from '@/lib/prisma';

const SYSTEM_PROMPT = `Eres un asistente virtual especializado en el Sistema de Gestión de Horarios de la Universidad Nacional de Trujillo (UNT). Tu función es ayudar a los usuarios con consultas sobre:

1. Disponibilidad de aulas y laboratorios
2. Uso del sistema y guías paso a paso
3. Preguntas generales sobre el funcionamiento del sistema

Contexto del sistema:
- Ambientes: aulas, laboratorios, auditorios, salas de reuniones
- Horarios: asignados por días de la semana (1=Lunes a 7=Domingo) y horas (formato HH:MM)
- Tipos de clase: teoría, laboratorio, práctica
- Estados de horarios: borrador, solicitado, aprobado, confirmado, publicado, modificado, cancelado
- Docentes, cursos, grupos, periodos académicos

Instrucciones:
- Responde en español de manera clara y concisa
- Si la consulta es sobre disponibilidad, proporciona detalles específicos
- Ofrece recomendaciones y acciones a seguir
- Si no tienes información suficiente, indica claramente qué datos faltan
- Mantén un tono profesional y amigable

DATOS DEL SISTEMA DISPONIBLES:
{systemData}

Ahora responde la siguiente consulta del usuario:`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const [ambientes, horarios, periodos] = await Promise.all([
      prisma.ambiente.findMany({
        take: 20,
        orderBy: { id_ambiente: 'asc' }
      }),
      prisma.horarioAsignado.findMany({
        take: 30,
        include: { ambiente: true, docente: true, curso: true, grupo: true },
        orderBy: { fecha_creacion: 'desc' }
      }),
      prisma.periodoAcademico.findMany({
        where: { activo: true },
        orderBy: { fecha_creacion: 'desc' }
      })
    ]);

    const systemData = `
Ambientes disponibles (ejemplos):
${ambientes.map(a => `- ${a.nombre} (${a.codigo}) - Tipo: ${a.tipo} - Capacidad: ${a.capacidad}`).join('\n')}

Horarios recientes (ejemplos):
${horarios.map(h => `- ${h.curso?.nombre || 'N/A'} - ${h.ambiente?.nombre || 'N/A'} - Día: ${h.dia_semana} - ${h.hora_inicio} a ${h.hora_fin}`).join('\n')}

Periodos activos:
${periodos.map(p => `- ${p.nombre} (${p.codigo})`).join('\n')}
`;

    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    const prompt = SYSTEM_PROMPT.replace('{systemData}', systemData) + '\n\n' + message;
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error en chatbot:', error);
    return NextResponse.json(
      { error: 'Error al procesar la consulta' },
      { status: 500 }
    );
  }
}
