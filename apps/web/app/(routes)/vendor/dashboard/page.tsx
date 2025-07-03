import { currentUser } from '@clerk/nextjs/server'; 
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VendorDashboardShell from './VendorDashboardShell';

export default async function VendorDashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient();

  // fetch vendor profile by Clerk ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  if (profileError || profile?.role !== 'vendor') {
    redirect('/dashboard');
  }

  // fetch vendor listings
  const { data: listings, error: vendorError } = await supabase
    .from('vendors')
    .select('id, name, category, location, approved')
    .eq('created_by', user.id);

  if (vendorError) {
    console.error(vendorError.message);
    return <div className="p-6 text-red-600">Error loading vendor data.</div>;
  }

  // Redirect if vendor has no listings yet
  if (!listings || listings.length === 0) {
    redirect('/vendor/new');
  }

  const displayName = user.firstName || user.emailAddresses?.[0]?.emailAddress || 'Vendor';

  return (
    <VendorDashboardShell
      businessName={displayName}
      listings={
        listings.map((v) => ({
          id: v.id,
          title: v.name,
          category: v.category,
          location: v.location,
          active: v.approved,
        }))
      }
      stats={{
        views: listings.length * 10,
        leads: listings.length * 2,
        approved: listings.every((v) => v.approved),
      }}
    />
  );
}
