import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callerPhone = body.caller_phone || '923390676762'; 
    const agencyName = body.agency_name || 'Shezi Devs';
    
    const WHATSAPP_TOKEN = body.whatsapp_token || process.env.WHATSAPP_TOKEN;
    // Yahan ensure karein ke Phone ID number ho, phone number nahi
    const PHONE_NUMBER_ID = body.whatsapp_phone_id || process.env.WHATSAPP_PHONE_ID || '1342850425572080';

    const whatsappMessage = `Assalam-o-Alaikum! Sorry call miss ho gayi thi ${agencyName} par. Bataiye kis property mein help chahiye aapki?`;

    // Meta WhatsApp Cloud API Request (Using PHONE_NUMBER_ID in URL)
    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
      const whatsappRes = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: callerPhone,
          type: 'text',
          text: { body: whatsappMessage }
        })
      });

      const whatsappData = await whatsappRes.json();
      if (!whatsappRes.ok) {
        console.error('Meta API Error:', whatsappData);
        throw new Error(whatsappData.error?.message || 'Meta API Failed');
      }
    }

    // Save into Supabase Database
    await supabaseAdmin.from('leads').insert([
      {
        caller_phone: callerPhone,
        intent: `WhatsApp Sent: ${whatsappMessage}`,
        status: 'WhatsApp AI Replied',
      }
    ]);

    return NextResponse.json({
      success: true,
      channel: 'WhatsApp Cloud API (Direct)',
      recipient: callerPhone,
      message_sent: whatsappMessage,
      note: 'Sent successfully using correct Phone ID!'
    });

  } catch (err: any) {
    console.error('WhatsApp integration error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}