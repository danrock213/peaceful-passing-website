export interface Message {
  id: string;
  vendor_id: string; // Supabase relationship
  sender: string;
  sender_type: 'user' | 'vendor'; // or 'admin' if needed
  content: string;
  date: string; // ISO string
  read: boolean;
}
