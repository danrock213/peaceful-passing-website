// scripts/syncClerkUsersToSupabase.ts
import { clerkClient, type User } from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 🧠 Attempt to load .env.local from current dir and monorepo root as fallback
const envPathLocal = path.resolve(process.cwd(), '.env.local');
const envPathRoot = path.resolve(process.cwd(), '../../.env.local');

if (fs.existsSync(envPathLocal)) {
  dotenv.config({ path: envPathLocal });
  console.log('📦 Loaded env from:', envPathLocal);
} else if (fs.existsSync(envPathRoot)) {
  dotenv.config({ path: envPathRoot });
  console.log('📦 Loaded env from:', envPathRoot);
} else {
  console.warn('⚠️ No .env.local file found in known locations.');
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 SUPABASE_URL:', SUPABASE_URL);
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8) + '...');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchAllUsers(): Promise<User[]> {
  const response = await clerkClient.users.getUserList({ limit: 1000 });
  return response.data;
}

async function upsertProfiles(users: User[]) {
  for (const user of users) {
    const email = user.emailAddresses?.[0]?.emailAddress ?? null;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.fullName || 'Unknown';
    const createdAt = new Date(user.createdAt).toISOString();

    const profile = {
      clerk_id: user.id, // ✅ Use string Clerk ID
      role: user.publicMetadata?.role || 'user',
      full_name: fullName,
      email,
      created_at: createdAt,
    };

    const { error } = await supabase.from('profiles').upsert(profile, {
      onConflict: 'clerk_id',
    });

    if (error) {
      console.error(`❌ Failed to upsert user ${user.id}:`, error.message);
    } else {
      console.log(`✅ Synced user ${user.id} (${fullName})`);
    }
  }
}

async function main() {
  try {
    console.log('🔄 Fetching users from Clerk...');
    const users = await fetchAllUsers();
    console.log(`👥 Fetched ${users.length} users.`);

    console.log('⬆️ Uploading users to Supabase...');
    await upsertProfiles(users);

    console.log('✅ Done syncing users.');
  } catch (err) {
    console.error('❌ Error syncing users:', err);
    process.exit(1);
  }
}

main();
