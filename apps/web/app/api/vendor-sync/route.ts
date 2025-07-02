// app/api/vendor-sync/route.ts
import { createClient } from '@/lib/supabase/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const clerkUser = await currentUser();
  const clerkRole = (clerkUser?.unsafeMetadata?.role ?? 'user') as string;

  // 1. Check if profile exists in Supabase
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
    // 2. Insert if not exists
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      role: clerkRole,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
  } else if (existingProfile.role !== clerkRole) {
    // 3. Update role if it's out of sync
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: clerkRole })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Role update failed' }, { status: 500 });
    }
  }

  // 4. Check for vendor entry
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
