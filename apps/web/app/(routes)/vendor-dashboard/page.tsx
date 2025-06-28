import Link from 'next/link';

export default function VendorDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your profile, messages, listings, and bookings here.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <DashboardCard href="/vendor-profile" title="Profile" desc="Edit your business info and details." />
        <DashboardCard href="/vendor-messages" title="Messages" desc="View and respond to user inquiries." />
        <DashboardCard href="/vendor-listings" title="Listings" desc="Manage your services and offerings." />
        <DashboardCard href="/vendor/bookings" title="Manage Bookings" desc="View and respond to booking requests." />
      </div>
    </main>
  );
}

function DashboardCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition block">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </Link>
  );
}
