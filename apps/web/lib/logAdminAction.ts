// lib/logAdminAction.ts
import { createClient } from './supabase/server';

export async function logAdminAction({
  adminId,
  actionType,
  targetType,
  targetId,
  details = {},
}: {
  adminId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
}) {
  const supabase = createClient();

  const { error } = await supabase.from('admin_logs').insert([
    {
      admin_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details,
    },
  ]);

  if (error) console.error('Failed to log admin action:', error.message);
}
