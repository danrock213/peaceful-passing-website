import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from './DashboardShell';
import type { ChecklistItem, Vendor, Event, Activity } from '@/types/dashboard';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user role:', error.message);
  }

  const role = profile?.role ?? 'user';

  // Redirect away from /dashboard if this user shouldn't be here
  if (role === 'vendor') redirect('/vendor/dashboard');
  if (role === 'admin') redirect('/admin/dashboard');

  // Default: user
  const { data: userTributes } = await supabase
    .from('tributes')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const checklist: ChecklistItem[] = [
    { id: '1', title: 'Notify family members', dueDate: '2025-06-20', checked: false },
    { id: '2', title: 'Book funeral home', dueDate: '2025-06-22', checked: false },
    { id: '3', title: 'Arrange transportation', dueDate: '2025-06-23', checked: true },
    { id: '4', title: 'Order flowers', dueDate: '2025-06-25', checked: false },
  ];

  const vendors: Vendor[] = [
    { id: 'v1', name: 'Sunrise Funeral Home', type: 'Funeral Home', booked: true },
    { id: 'v2', name: 'Peaceful Florists', type: 'Florist', booked: false },
    { id: 'v3', name: 'Memorial Transport', type: 'Transportation', booked: true },
  ];

  const allVendorTypes = ['Funeral Home', 'Florist', 'Transportation', 'Crematorium', 'Grief Counselor'];

  const events: Event[] = [
    { id: 'e1', title: 'Memorial Service', date: '2025-07-01' },
    { id: 'e2', title: 'Reception', date: '2025-07-01' },
  ];

  const activities: Activity[] = [
    { id: 'a1', message: 'You created a new tribute for Jane Doe.', date: '2025-06-10T10:00:00Z' },
    { id: 'a2', message: 'Vendor "Sunrise Funeral Home" was booked.', date: '2025-06-12T15:00:00Z' },
  ];

  return (
    <DashboardShell
      firstName={user.firstName ?? undefined}
      tributes={userTributes ?? []}
      checklist={checklist}
      vendors={vendors}
      allVendorTypes={allVendorTypes}
      events={events}
      activities={activities}
    />
  );
}
