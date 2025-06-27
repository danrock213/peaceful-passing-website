import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from './DashboardShell';
import type { Tribute } from '@/types/tribute';
import type { ChecklistItem, Vendor, Event, Activity } from '@/types/dashboard';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient();

  // Fetch the user's role from Supabase profiles table by clerk_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile role:', profileError.message);
    // Optionally, handle error or fallback here
  }

  const role = profile?.role ?? 'user';

  if (role === 'vendor') redirect('/vendors/dashboard');
  if (role === 'admin') redirect('/admin/dashboard');

  // Fetch tributes for the current user using Clerk user id
  const { data: userTributes, error: tributesError } = await supabase
    .from('tributes')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (tributesError) {
    console.error('Error fetching tributes:', tributesError.message);
  }

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

  const allVendorTypes: string[] = ['Funeral Home', 'Florist', 'Transportation', 'Crematorium', 'Grief Counselor'];

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
