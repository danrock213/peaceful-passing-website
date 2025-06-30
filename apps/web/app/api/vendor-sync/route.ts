// apps/web/app/api/vendor-sync/route.ts
import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  // Check or set vendor role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile || profile.role !== 'vendor') {
    await supabase
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', userId);
  }

  // Check for existing vendor profile
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('created_by', userId)
    .maybeSingle();

  return NextResponse.json({ hasVendorProfile: !!vendor });
}
