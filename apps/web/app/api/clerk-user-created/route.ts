import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const payload = (await req.json()) as WebhookEvent;

  // Optional debug logging
  console.log('Webhook Payload:', JSON.stringify(payload, null, 2));

  if (payload.type !== 'user.created') {
    return NextResponse.json({ message: 'Ignored non-user.created event' }, { status: 200 });
  }

  const clerkUserId = payload?.data?.id;
  const role = payload?.data?.public_metadata?.role ?? 'user';

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from('profiles').insert({
    id: clerkUserId,
    role,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: 'Failed to insert user', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
