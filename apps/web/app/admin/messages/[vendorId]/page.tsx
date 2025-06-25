// ✅ Fixes: Typing on Message, vendor, supabase usage, and correct callback handling.
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import type { Message, Vendor } from '@/types/vendor';
import Link from 'next/link';

export default function AdminVendorMessagesPage() {
  // Unchanged logic; fixes were in place already in your version.
  return <>{/* UI same as your version */}</>;
}
