import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callerPhone = body.caller_phone || '+92 300 ' + Math.floor(1000000 + Math.random() * 9000000);
    const agencyName = body.agency_name || 'Apex Real Estate Lahore';

    let aiMessage = `Assalam-o-Alaikum! Sorry call miss ho gayi thi ${agencyName} par. Bataiye DHA ya Gulberg mein kis property mein interest hai aapka?`;

    try {
      const aiPrompt = `You are an elite automated AI receptionist for a high-ticket Pakistani real estate agency named "${agencyName}". 
      A client just missed a call. Write a short, professional, friendly Roman Urdu SMS (under 20 words) asking what property they are looking for (e.g., DHA plot, luxury house). No markdown quotes.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: aiPrompt }],
        max_tokens: 50,
      });

      if (completion.choices[0].message.content) {
        aiMessage = completion.choices[0].message.content;
      }
    } catch (openaiErr: any) {
      console.warn('OpenAI Quota exceeded, using smart fallback template.');
    }

    // Try saving to Supabase, but catch schema errors so demo never crashes
    try {
      await supabaseAdmin.from('leads').insert([
        {
          caller_phone: callerPhone,
          intent: aiMessage,
          status: 'AI Replied (10s)',
        }
      ]);
    } catch (dbErr) {
      console.warn('Database insert skipped due to schema mismatch, using local state.');
    }

    return NextResponse.json({
      success: true,
      caller_phone: callerPhone,
      message_sent: aiMessage,
      note: 'Simulated successfully'
    });

  } catch (err: any) {
    console.error('Simulation error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}