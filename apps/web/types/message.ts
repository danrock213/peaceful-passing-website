export interface Message {
  id: string;
  vendor_id: string;
  sender: string;
  sender_type: 'user' | 'vendor';  // new field
  content: string;
  date: string;
  read: boolean;                  // new field
}
