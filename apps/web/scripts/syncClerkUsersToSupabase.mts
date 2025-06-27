import { clerkClient } from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface ClerkUser {
  id: string;
  publicMetadata?: { role?: string };
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  createdAt: number; // number timestamp from Clerk SDK v5
}

async function fetchAllUsers(): Promise<ClerkUser[]> {
  const response = await clerkClient.users.getUserList({ limit: 1000 });
  return response.data;
}

async function upsertProfiles(users: ClerkUser[]) {
  for (const user of users) {
    const profile = {
      id: user.id,
      role: user.publicMetadata?.role || 'user',
      full_name:
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.fullName ||
        'Unknown',
      created_at: new Date(user.createdAt).toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(profile, {
      onConflict: 'id',
    });

    if (error) {
      console.error(`Failed to upsert user ${user.id}:`, error.message);
    } else {
      console.log(`Upserted user ${user.id} (${profile.full_name})`);
    }
  }
}

async function main() {
  console.log('Fetching users from Clerk...');
  const users = await fetchAllUsers();
  console.log(`Fetched ${users.length} users.`);

  console.log('Uploading users to Supabase...');
  await upsertProfiles(users);

  console.log('Done syncing users.');
}

main().catch((err) => {
  console.error('Error in syncing users:', err);
  process.exit(1);
});
