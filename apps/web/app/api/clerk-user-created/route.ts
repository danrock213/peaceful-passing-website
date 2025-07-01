import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await req.json();

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
    return NextResponse.json({ error: 'Failed to insert user' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
