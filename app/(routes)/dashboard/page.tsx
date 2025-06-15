import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>

      {/* Links to main sections */}
      <nav className="mb-8 space-x-4">
        <Link href="/checklist" className="text-blue-600 hover:underline">
          Checklist
        </Link>
        <Link href="/vendors" className="text-blue-600 hover:underline">
          Vendor Directory
        </Link>
        <Link href="/obituary-site" className="text-blue-600 hover:underline">
          Obituary Website
        </Link>
        <Link href="/messages" className="text-blue-600 hover:underline">
          Messages
        </Link>
      </nav>

      {/* Vendor Sign In / Sign Up Link */}
      <div className="mt-10 text-center">
        <Link href="/vendor-auth" className="text-sm text-blue-600 hover:underline">
          Vendor Sign In / Sign Up
        </Link>
      </div>
    </main>
  );
}
