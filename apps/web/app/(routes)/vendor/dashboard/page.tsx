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

  const displayName = user.firstName || user.emailAddresses?.[0]?.emailAddress || 'Vendor';

  // Handle empty listing state
  if (!listings || listings.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Welcome to your Vendor Dashboard</h2>
        <p className="mb-4">You haven’t created a vendor listing yet.</p>
        <a
          href="/vendor/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Listing
        </a>
      </div>
    );
  }

  return (
    <VendorDashboardShell
      businessName={displayName}
      listings={listings.map((v) => ({
        id: v.id,
        title: v.name,
        category: v.category,
        location: v.location,
        active: v.approved,
      }))}
      stats={{
        views: listings.length * 10,
        leads: listings.length * 2,
        approved: listings.every((v) => v.approved),
      }}
    />
  );
}
