// types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          vendor_id: string;
          sender: string;
          sender_type: 'user' | 'vendor' | 'admin';
          content: string;
          date: string;
          read: boolean;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          vendor_id: string;
          author: string;
          rating: number;
          comment: string;
          date: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          email: string;
          // Add other fields from your schema
        };
        Insert: Partial<Database['public']['Tables']['vendors']['Row']>;
        Update: Partial<Database['public']['Tables']['vendors']['Row']>;
      };
    };
  };
}
