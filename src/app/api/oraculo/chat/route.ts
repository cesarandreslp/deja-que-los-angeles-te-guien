import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { interpretWithZhipu } from "@/lib/zhipu";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json();
    const { systemPrompt, userPrompt, type } = body;
    
    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    // Llamar a Zhipu AI
    const aiResponse = await interpretWithZhipu(systemPrompt, userPrompt);

    return NextResponse.json({ 
      success: true,
      response: typeof aiResponse === 'string' ? aiResponse : (aiResponse as any).choices?.[0]?.message?.content || aiResponse,
      fullResponse: aiResponse 
    });

  } catch (error) {
    console.error('Error generating archangel response:', error);
    return NextResponse.json(
      { error: 'Error generando respuesta angelical' },
      { status: 500 }
    );
  }
}