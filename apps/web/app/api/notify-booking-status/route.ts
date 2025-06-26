import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, newStatus } = body;

    if (!requestId || !newStatus) {
      return NextResponse.json({ error: 'Missing requestId or newStatus' }, { status: 400 });
    }

    // Fetch booking request details to get user email and name
    const { data, error } = await supabase
      .from('booking_requests')
      .select('name, email')
      .eq('id', requestId)
      .single();

    if (error || !data) {
      console.error('Error fetching booking request:', error);
      return NextResponse.json({ error: 'Failed to fetch booking request' }, { status: 500 });
    }

    const { name, email } = data;

    // Compose email content
    const subject = `Your booking request status has been updated`;
    const bodyText = `
      Hi ${name},

      Your booking request has been ${newStatus}.

      Thank you for using Starlit Passage.

      — The Starlit Passage Team
    `;

    try {
      await sendEmail(email, subject, bodyText);
    } catch (err) {
      console.error('Failed to send email:', err);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Notification sent successfully' }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
