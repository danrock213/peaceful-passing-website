// app/api/clerk-user-created/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const payload = (await req.json()) as WebhookEvent;

  console.log('🔔 Clerk Webhook Payload:', JSON.stringify(payload, null, 2));

  if (payload.type !== 'user.created') {
    return NextResponse.json({ message: 'Ignored non-user.created event' }, { status: 200 });
  }

  const clerkUserId = payload?.data?.id;
  const email = payload?.data?.email_addresses?.[0]?.email_address ?? '';
  const full_name = `${payload?.data?.first_name ?? ''} ${payload?.data?.last_name ?? ''}`.trim() || 'Unknown';

  // 👇 This is the key: should match how you set publicMetadata during sign-up
  const role = payload?.data?.public_metadata?.role ?? 'user';

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Missing Clerk user ID' }, { status: 400 });
  }

  const supabase = createClient();

  const { error } = await supabase.from('profiles').insert({
    clerk_id: clerkUserId,
    email,
    full_name,
    role,
  });

  if (error) {
    console.error('❌ Supabase insert error:', error);
    return NextResponse.json({ error: 'Failed to insert user', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
