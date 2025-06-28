import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VendorDashboardShell, { VendorListing } from './VendorDashboardShell';

export default async function VendorDashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  if (error || profile?.role !== 'vendor') {
    redirect('/dashboard'); // fallback to user dashboard if not a vendor
  }

  // 🔧 Replace with real Supabase queries later
  const listings: VendorListing[] = [
    { id: 'l1', title: 'Elegant Catering', category: 'Catering', location: 'NYC', active: true },
    { id: 'l2', title: 'Comfort Transport', category: 'Transportation', location: 'NYC', active: false },
  ];
  const stats = { views: 150, leads: 12, approved: true };

  return (
    <VendorDashboardShell
      businessName={user.firstName || user.emailAddresses[0].emailAddress}
      listings={listings}
      stats={stats}
    />
  );
}
