import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callerPhone, businessName, customerMessage } = body;

    // Agar OpenAI API key nahi hai toh fallback simulated message dega
    let aiResponseText = `Hello! Thanks for calling ${businessName || 'Apex Realty'}. Sorry we missed your call. What is your preferred location and budget?`;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a polite real estate assistant for ${businessName}. Ask for budget and location.` },
          { role: 'user', content: customerMessage || '[System: Missed Call Received]' }
        ],
        max_tokens: 100,
      });
      aiResponseText = completion.choices[0]?.message?.content || aiResponseText;
    }

    // Console par simulation print karegi
    console.log(`\n--- [SIMULATED SMS DISPATCH] ---`);
    console.log(`To: ${callerPhone || '+15550199'}`);
    console.log(`Message: ${aiResponseText}`);
    console.log(`---------------------------------\n`);

    return NextResponse.json({
      success: true,
      simulated: true,
      leadPhone: callerPhone || '+15550199',
      sentMessage: aiResponseText,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}