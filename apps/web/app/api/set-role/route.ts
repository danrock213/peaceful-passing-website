// app/api/set-role/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const validRoles = ['user', 'vendor', 'admin'];

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const role = body.role;

  if (!role || !validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  try {
    await clerkClient.users.updateUserMetadata(userId, {
      unsafeMetadata: { role },
    });

    return NextResponse.json({ message: `Role updated to ${role}` });
  } catch (err) {
    console.error('Failed to update role:', err);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
