import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAIAssistantReply } from '@/lib/openai';
import { sendTwilioSMS } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callerPhone = formData.get('From')?.toString();
    const calledNumber = formData.get('To')?.toString();
    const callStatus = formData.get('CallStatus')?.toString(); // 'no-answer', 'busy', 'completed'

    if (!callerPhone || !calledNumber) {
      return NextResponse.json({ error: 'Missing phone data' }, { status: 400 });
    }

    // Only respond if call was missed or busy
    if (['no-answer', 'busy', 'canceled'].includes(callStatus || '')) {
      
      // 1. Fetch client registered under this Twilio number
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('twilio_number', calledNumber)
        .single();

      if (clientErr || !client) {
        return NextResponse.json({ error: 'Client configuration not found for number' }, { status: 404 });
      }

      // 2. Create lead in Supabase
      const { data: lead, error: leadErr } = await supabaseAdmin
        .from('leads')
        .insert({
          client_id: client.id,
          lead_phone: callerPhone,
          status: 'missed',
        })
        .select()
        .single();

      if (leadErr) throw leadErr;

      // 3. Generate first AI outreach message
      const initialPrompt = `${client.ai_system_prompt}\n(Note: The user just tried calling your agency and missed. Politely introduce yourself, acknowledge the missed call, and ask for their property requirements, budget, and preferred location. Include your calendar link if appropriate: ${client.calendar_link || ''})`;
      
      const aiResponseText = await generateAIAssistantReply({
        systemPrompt: initialPrompt,
        chatHistory: [],
        incomingMessage: "[System Event: User called and call was missed. Initiate first contact.]",
      });

      // 4. Log conversation to DB
      await supabaseAdmin.from('conversations').insert([
        { lead_id: lead.id, sender: 'lead', message_text: '[Missed Call Event]' },
        { lead_id: lead.id, sender: 'ai', message_text: aiResponseText }
      ]);

      // 5. Send SMS via Twilio
      await sendTwilioSMS(callerPhone, client.twilio_number, aiResponseText);

      // Update lead status to contacted
      await supabaseAdmin.from('leads').update({ status: 'contacted' }).eq('id', lead.id);

      return NextResponse.json({ success: true, message: 'Missed call recovered & AI text dispatched.' });
    }

    return NextResponse.json({ success: true, message: 'Call was answered normally.' });
  } catch (error: any) {
    console.error('Webhook Fatal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}