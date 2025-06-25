import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

// Schema for validating vendor input data
const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  // add other fields here as needed
});

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

    // Validate incoming data against schema
    const parseResult = vendorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid vendor data', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // Determine approval status based on user role
    const isAdmin = user.publicMetadata?.role === 'admin';

    const newVendor = {
      ...parseResult.data,
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
    console.error('POST /api/vendors error:', err);
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}
