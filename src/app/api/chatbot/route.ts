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
    console.log('=== Chatbot API iniciada ===');
    
    const { message, history = [] } = await request.json();
    console.log('Mensaje recibido:', message);
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ API Key no encontrada');
      return NextResponse.json(
        { error: 'API key de Gemini no configurada' },
        { status: 500 }
      );
    }

    console.log('✅ API Key encontrada');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    console.log('✅ Modelo configurado');

    let systemData = '';
    try {
      const [ambientes, horarios, periodos] = await Promise.all([
        prisma.ambiente.findMany({ take: 15, orderBy: { id_ambiente: 'asc' } }),
        prisma.horarioAsignado.findMany({
          take: 20,
          include: { ambiente: true, docente: true, curso: true, grupo: true },
          orderBy: { fecha_creacion: 'desc' }
        }),
        prisma.periodoAcademico.findMany({ where: { activo: true }, take: 5 })
      ]);

      systemData = `
Ambientes disponibles:
${ambientes.map(a => `- ${a.nombre} (${a.codigo}) - Tipo: ${a.tipo}`).join('\n')}

Horarios recientes:
${horarios.map(h => `- ${h.curso?.nombre || 'N/A'} - ${h.ambiente?.nombre || 'N/A'} - Día ${h.dia_semana} ${h.hora_inicio}-${h.hora_fin}`).join('\n')}

Periodos activos:
${periodos.map(p => `- ${p.nombre}`).join('\n')}
`;
    } catch (dbError) {
      console.error('⚠️ Error cargando datos del sistema:', dbError);
      systemData = 'Datos del sistema no disponibles temporalmente.';
    }

    console.log('✅ Datos del sistema cargados');

    const prompt = SYSTEM_PROMPT.replace('{systemData}', systemData) + '\n\n' + message;
    console.log('Enviando a Gemini...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('✅ Respuesta recibida de Gemini');

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('❌ Error en chatbot:', error);
    return NextResponse.json(
      { error: `Error al procesar la consulta: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
