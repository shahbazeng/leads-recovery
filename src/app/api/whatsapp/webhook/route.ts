import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 1. Meta Webhook Verification (Jab aap Meta dashboard mein URL register karenge)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.challenge');
  const verifyToken = url.searchParams.get('hub.verify_token');

  if (mode === 'subscribe' && verifyToken === 'reviveai_secure_token') {
    return new NextResponse(token, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// 2. Incoming WhatsApp Message / Missed Call Auto-Reply Listener
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const senderPhone = message.from; // Customer ka WhatsApp number
      const clientText = message.text?.body || 'Missed call inquiry';

      const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
      const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID || '1342850425572080';

      // Auto-reply message jo foran client ko jayega
      const replyMessage = `Assalam-o-Alaikum! Aapka call miss ho gaya tha. Bataiye kis property ya service ke baray mein maloomat chahiye?`;

      // Meta WhatsApp Cloud API request
      if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
        await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: senderPhone,
            type: 'text',
            text: { body: replyMessage }
          })
        });
      }

      // Supabase Database mein Lead save karna taake dashboard par live nazar aaye
      await supabaseAdmin.from('leads').insert([
        {
          caller_phone: senderPhone,
          intent: `Auto-Recovered: ${clientText}`,
          status: 'AI Replied',
        }
      ]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}