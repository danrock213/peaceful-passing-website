// /app/api/vendors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  // Fetch only approved vendors for public listing
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('approved', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to add vendors' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Force approved to false unless user is admin
    const isAdmin = user.publicMetadata?.role === 'admin';

    const newVendor = {
      ...body,
      approved: isAdmin ? Boolean(body.approved) : false,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vendors')
      .insert([newVendor])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}
