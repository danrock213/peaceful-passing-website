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

  // ✅ Pull fresh Clerk user info
  let clerkUser;
  try {
    clerkUser = await clerkClient.users.getUser(userId);
  } catch (err) {
    console.error('❌ Failed to fetch Clerk user:', err);
    return NextResponse.json({ error: 'Clerk fetch failed' }, { status: 500 });
  }

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
  const full_name = `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim() || 'Unknown';
  const role = (clerkUser?.unsafeMetadata?.role ?? 'user') as string;

  // 🔍 Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('❌ Supabase profile fetch error:', fetchError);
    return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
  }

  if (!existingProfile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      clerk_id: userId,
      email,
      full_name,
      role,
    });

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }
  } else if (existingProfile.role !== role) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('clerk_id', userId);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
  }

  // ✅ Vendor profile check
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('created_by', userId)
    .maybeSingle();

  if (vendorError) {
    console.error('❌ Vendor fetch error:', vendorError);
    return NextResponse.json({ error: 'Vendor check failed' }, { status: 500 });
  }

  return NextResponse.json({ hasVendorProfile: !!vendor });
}
