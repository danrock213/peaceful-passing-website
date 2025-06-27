import { clerkClient } from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 🧠 Attempt to load .env.local from current dir and monorepo root as fallback
const envPathLocal = path.resolve(process.cwd(), '.env.local');
const envPathRoot = path.resolve(process.cwd(), '../../.env.local');

if (fs.existsSync(envPathLocal)) {
  dotenv.config({ path: envPathLocal });
  console.log('Loaded env from:', envPathLocal);
} else if (fs.existsSync(envPathRoot)) {
  dotenv.config({ path: envPathRoot });
  console.log('Loaded env from:', envPathRoot);
} else {
  console.warn('⚠️ No .env.local file found in known locations.');
}

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required Supabase environment variables!');
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
  createdAt: number; // timestamp in milliseconds
}

async function fetchAllUsers(): Promise<ClerkUser[]> {
  const response = await clerkClient.users.getUserList({ limit: 1000 });
  return response.data;
}

async function upsertProfiles(users: ClerkUser[]) {
  for (const user of users) {
    const profile = {
      clerk_id: user.id, // ✅ use new `clerk_id` column
      role: user.publicMetadata?.role || 'user',
      full_name:
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.fullName ||
        'Unknown',
      created_at: new Date(user.createdAt).toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(profile, {
      onConflict: 'clerk_id', // ✅ conflict on the Clerk string ID
    });

    if (error) {
      console.error(`❌ Failed to upsert user ${user.id}:`, error.message);
    } else {
      console.log(`✅ Upserted user ${user.id} (${profile.full_name})`);
    }
  }
}

async function main() {
  console.log('🔄 Fetching users from Clerk...');
  const users = await fetchAllUsers();
  console.log(`👥 Fetched ${users.length} users.`);

  console.log('⬆️ Uploading users to Supabase...');
  await upsertProfiles(users);

  console.log('✅ Done syncing users.');
}

main().catch((err) => {
  console.error('❌ Error in syncing users:', err);
  process.exit(1);
});
