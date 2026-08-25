import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAIAssistantReply } from '@/lib/openai';
import { sendTwilioSMS } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const leadPhone = formData.get('From')?.toString();
    const recipientNumber = formData.get('To')?.toString();
    const incomingText = formData.get('Body')?.toString();

    if (!leadPhone || !incomingText || !recipientNumber) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Find client by Twilio number
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('twilio_number', recipientNumber)
      .single();

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // 2. Find active lead
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('client_id', client.id)
      .eq('lead_phone', leadPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // 3. Fetch past conversation history
    const { data: history } = await supabaseAdmin
      .from('conversations')
      .select('sender, message_text')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: true });

    // 4. Save incoming lead message
    await supabaseAdmin.from('conversations').insert({
      lead_id: lead.id,
      sender: 'lead',
      message_text: incomingText,
    });

    // 5. Generate AI reply
    const fullSystemPrompt = `${client.ai_system_prompt}\nBooking Link: ${client.calendar_link || 'None'}`;
    const aiReply = await generateAIAssistantReply({
      systemPrompt: fullSystemPrompt,
      chatHistory: history || [],
      incomingMessage: incomingText,
    });

    // 6. Save AI response and send SMS
    await supabaseAdmin.from('conversations').insert({
      lead_id: lead.id,
      sender: 'ai',
      message_text: aiReply,
    });

    await sendTwilioSMS(leadPhone, client.twilio_number, aiReply);
    await supabaseAdmin.from('leads').update({ status: 'replied' }).eq('id', lead.id);

    return NextResponse.json({ success: true, reply: aiReply });
  } catch (error: any) {
    console.error('Chat Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}