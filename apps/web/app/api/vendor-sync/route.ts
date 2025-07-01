// app/api/vendor-sync/route.ts
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
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Fetch error:', fetchError);
    return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
  }

  if (!existingProfile) {
    // Insert new profile as vendor
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      role: 'vendor',
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
  }

  // Check if vendor entry exists
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('created_by', userId)
    .maybeSingle();

  if (vendorError) {
    console.error('Vendor fetch error:', vendorError);
    return NextResponse.json({ error: 'Vendor fetch failed' }, { status: 500 });
  }

  return NextResponse.json({ hasVendorProfile: !!vendor });
}
