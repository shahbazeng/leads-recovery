import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyName, email, phone, missedCalls } = body;

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .insert([
        {
          agency_name: agencyName,
          email: email,
          phone: phone,
          missed_calls: Number(missedCalls),
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}