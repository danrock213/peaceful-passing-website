import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  // Check if profile exists
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
  }

  if (!profile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      role: 'vendor',
    });

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
  }

  // Check for vendor record
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('created_by', userId)
    .maybeSingle();

  if (vendorError) {
    return NextResponse.json({ error: 'Vendor fetch failed' }, { status: 500 });
  }

  return NextResponse.json({ hasVendorProfile: !!vendor });
}
