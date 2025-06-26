import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'admin') {
    redirect('/');
  }

  const supabase = createClient();

  // Fetch real vendor stats
  const { data: allVendors, error } = await supabase
    .from('vendors')
    .select('status');

  const totalVendors = allVendors?.length || 0;
  const pendingVendors =
    allVendors?.filter((v) => v.status === 'pending').length || 0;

  // ⏳ Still mocked
  const pendingTributes = 2;
  const totalUsers = 103;

  const name = user.firstName || 'Admin';

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-[#1D3557] mb-6">
        Welcome, {name} 👋
      </h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Pending Vendors" value={pendingVendors} link="/admin/vendors" />
        <StatCard label="Total Vendors" value={totalVendors} />
        <StatCard label="Pending Tributes" value={pendingTributes} link="/admin/pending-approvals" />
        <StatCard label="Registered Users" value={totalUsers} />
      </section>

      <section className="bg-white shadow-md p-6 rounded-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-[#1D3557] mb-4">Quick Actions</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/admin/vendors" className="text-[#1D3557] hover:underline">
              → Review Vendor Submissions
            </Link>
          </li>
          <li>
            <Link href="/admin/pending-approvals" className="text-[#1D3557] hover:underline">
              → Review Tribute Approvals
            </Link>
          </li>
          <li>
            <Link href="/vendors/new" className="text-[#1D3557] hover:underline">
              → Add a Vendor (manually)
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

// Reusable stat card
function StatCard({ label, value, link }: { label: string; value: number; link?: string }) {
  const content = (
    <div className="p-4 rounded-lg shadow bg-white border border-gray-200 text-center">
      <p className="text-2xl font-bold text-[#1D3557]">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}
