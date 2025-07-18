import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  const supabase = createClient();

  // Fetch role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  const name = user.firstName || 'Admin';

  // Fetch vendors
  const { data: allVendorsRaw, error: vendorError } = await supabase
    .from('vendors')
    .select('status');

  const allVendors = allVendorsRaw ?? [];
  const totalVendors = allVendors.length;
  const pendingVendors = allVendors.filter((v) => v.status === 'pending').length;

  // Fetch tributes
  const { data: tributeData } = await supabase
    .from('tributes')
    .select('approved');

  const pendingTributes = (tributeData ?? []).filter((t) => t.approved === null).length;

  // Fetch users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Fetch pending bookings
  const { data: bookingsRaw } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('status', 'pending')
    .order('date', { ascending: false })
    .limit(5);

  const bookings = bookingsRaw ?? [];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-[#1D3557] mb-6">Welcome, {name} 👋</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Pending Vendors" value={pendingVendors} link="/admin/vendors" />
        <StatCard label="Total Vendors" value={totalVendors} />
        <StatCard label="Pending Tributes" value={pendingTributes} link="/admin/pending-approvals" />
        <StatCard label="Registered Users" value={totalUsers ?? 0} />
      </section>

      <section className="bg-white shadow-md p-6 rounded-lg border border-gray-100 mb-10">
        <h2 className="text-xl font-semibold text-[#1D3557] mb-4">Quick Actions</h2>
        <ul className="space-y-2">
          <li><Link href="/admin/vendors" className="text-[#1D3557] hover:underline">→ Review Vendor Submissions</Link></li>
          <li><Link href="/admin/pending-approvals" className="text-[#1D3557] hover:underline">→ Review Tribute Approvals</Link></li>
          <li><Link href="/admin/bookings" className="text-[#1D3557] hover:underline">→ Review Booking Requests</Link></li>
          <li><Link href="/admin/activity" className="text-[#1D3557] hover:underline">→ View Admin Activity Log</Link></li>
          <li><Link href="/vendors/new" className="text-[#1D3557] hover:underline">→ Add a Vendor (manually)</Link></li>
        </ul>
      </section>

      {bookings.length > 0 && (
        <section className="bg-white shadow-md p-6 rounded-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-[#1D3557] mb-4">Pending Booking Requests</h2>
          <ul className="space-y-4">
            {bookings.map((req) => (
              <li
                key={req.id}
                className="p-4 border rounded bg-gray-50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="font-semibold">{req.name} ({req.email})</p>
                  <p className="text-sm text-gray-600">Vendor ID: <code>{req.vendor_id}</code></p>
                  <p className="text-sm text-gray-500">Requested on {new Date(req.date).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <form action={`/admin/actions/approve-booking?id=${req.id}&status=accepted`} method="post">
                    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">Approve</button>
                  </form>
                  <form action={`/admin/actions/approve-booking?id=${req.id}&status=rejected`} method="post">
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  link,
}: {
  label: string;
  value: number;
  link?: string;
}) {
  const content = (
    <div className="p-4 rounded-lg shadow bg-white border border-gray-200 text-center">
      <p className="text-2xl font-bold text-[#1D3557]">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}
