import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs';

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  // ✅ Pull fresh metadata from Clerk backend API
  let clerkUser;
  try {
    clerkUser = await clerkClient.users.getUser(userId);
  } catch (err) {
    console.error('❌ Failed to fetch Clerk user from backend API:', err);
    return NextResponse.json({ error: 'Failed to get Clerk user' }, { status: 500 });
  }

  const clerkRole = (clerkUser?.unsafeMetadata?.role ?? 'user') as string;

  // 🔍 Check existing profile
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('❌ Supabase fetch error:', fetchError);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }

  if (!existingProfile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      role: clerkRole,
    });
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
  } else if (existingProfile.role !== clerkRole) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: clerkRole })
      .eq('id', userId);
    if (updateError) {
      console.error('❌ Update error:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
  }

  // Vendor profile check
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('created_by', userId)
    .maybeSingle();

  if (vendorError) {
    console.error('❌ Vendor fetch error:', vendorError);
    return NextResponse.json({ error: 'Vendor fetch failed' }, { status: 500 });
  }

  return NextResponse.json({ hasVendorProfile: !!vendor });
}
