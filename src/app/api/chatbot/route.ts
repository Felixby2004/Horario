import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import prisma from '@/lib/prisma';

const SYSTEM_PROMPT = `Eres un asistente del Sistema de Horarios UNT. Responde en español conciso.`;

export async function POST(request: NextRequest) {
  try {
    console.log('=== Chatbot API iniciada ===');
    
    const { message } = await request.json();
    console.log('Mensaje:', message);
    
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
    });

    let contextData = '';
    try {
      const ambientes = await prisma.ambiente.findMany({ take: 10 });
      const horarios = await prisma.horarioAsignado.findMany({ 
        take: 10, 
        include: { ambiente: true, curso: true } 
      });

      contextData = `
Ambientes: ${ambientes.map(a => `${a.nombre}(${a.tipo})`).join(', ')}
Horarios: ${horarios.map(h => `${h.curso?.nombre || ''} ${h.ambiente?.nombre || ''} D${h.dia_semana} ${h.hora_inicio}`).join(' | ')}
`;
    } catch {
      contextData = 'Sistema UNT de horarios.';
    }

    const prompt = `${SYSTEM_PROMPT}\n${contextData}\nPregunta: ${message}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    
    let errorMsg = 'Error al procesar la consulta.';
    
    if (error instanceof Error && error.message.includes('429')) {
      errorMsg = 'Límite de uso excedido. Por favor intenta de nuevo en 1-2 minutos.';
    } else if (error instanceof Error) {
      errorMsg = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
