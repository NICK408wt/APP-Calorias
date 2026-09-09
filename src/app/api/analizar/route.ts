import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No se envió ninguna imagen.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key de OpenAI no configurada en Vercel.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza esta foto de comida. Identifica el plato y calcula sus valores nutricionales aproximados. Responde ÚNICAMENTE un objeto JSON sin markdown ni bloques de código, con este formato exacto: {"nombre": "Nombre del plato", "calorias": 450, "proteinas": 35, "carbs": 40, "grasas": 12}.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawText = data.choices[0].message.content.trim();
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Error al analizar la imagen:', error);
    return NextResponse.json(
      { error: 'Error interno procesando la imagen de la comida.' },
      { status: 500 }
    );
  }
}
