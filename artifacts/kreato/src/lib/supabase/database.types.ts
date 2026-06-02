export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          instagram: string | null;
          country: string | null;
          role: "creator" | "buyer";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          instagram?: string | null;
          country?: string | null;
          role?: "creator" | "buyer";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          instagram?: string | null;
          country?: string | null;
          role?: "creator" | "buyer";
          created_at?: string;
        };
        Relationships: [];
      };
      creators: {
        Row: {
          id: string;
          full_name: string;
          handle: string;
          country: string;
          product_type: string;
          fdusd_wallet: string | null;
          bio: string | null;
          avatar_url: string | null;
          instagram: string | null;
          twitter: string | null;
          tiktok: string | null;
          youtube: string | null;
          stripe_account_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          handle: string;
          country: string;
          product_type: string;
          fdusd_wallet?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          instagram?: string | null;
          twitter?: string | null;
          tiktok?: string | null;
          youtube?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          handle?: string;
          country?: string;
          product_type?: string;
          fdusd_wallet?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          instagram?: string | null;
          twitter?: string | null;
          tiktok?: string | null;
          youtube?: string | null;
          stripe_account_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payment_links: {
        Row: {
          id: string;
          client_name: string;
          client_email: string;
          project_name: string;
          amount: number;
          description: string | null;
          deposit_percentage: number | null;
          is_recurring: boolean;
          billing_cycle: string | null;
          due_date: string;
          status: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          client_email: string;
          project_name: string;
          amount: number;
          description?: string | null;
          deposit_percentage?: number | null;
          is_recurring?: boolean;
          billing_cycle?: string | null;
          due_date: string;
          status?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          client_email?: string;
          project_name?: string;
          amount?: number;
          description?: string | null;
          deposit_percentage?: number | null;
          is_recurring?: boolean;
          billing_cycle?: string | null;
          due_date?: string;
          status?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string | null;
          product_type: string;
          price: number;
          billing_type: "one_time" | "monthly";
          telegram_link: string | null;
          telegram_bot_token: string | null;
          file_url: string | null;
          file_name: string | null;
          booking_url: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description?: string | null;
          product_type: string;
          price: number;
          billing_type: "one_time" | "monthly";
          telegram_link?: string | null;
          telegram_bot_token?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          booking_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          description?: string | null;
          product_type?: string;
          price?: number;
          billing_type?: "one_time" | "monthly";
          telegram_link?: string | null;
          telegram_bot_token?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          booking_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          }
        ];
      };
      course_sections: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          title?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_sections_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      course_lessons: {
        Row: {
          id: string;
          section_id: string;
          product_id: string;
          title: string;
          content: string | null;
          video_url: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          product_id: string;
          title: string;
          content?: string | null;
          video_url?: string | null;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          product_id?: string;
          title?: string;
          content?: string | null;
          video_url?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_lessons_section_id_fkey";
            columns: ["section_id"];
            referencedRelation: "course_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_lessons_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          product_id: string;
          creator_id: string;
          buyer_name: string;
          buyer_email: string;
          buyer_country: string;
          buyer_telegram: string;
          amount: number;
          status: "pending" | "paid" | "failed" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          creator_id: string;
          buyer_name: string;
          buyer_email: string;
          buyer_country: string;
          buyer_telegram: string;
          amount: number;
          status?: "pending" | "paid" | "failed" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          creator_id?: string;
          buyer_name?: string;
          buyer_email?: string;
          buyer_country?: string;
          buyer_telegram?: string;
          amount?: number;
          status?: "pending" | "paid" | "failed" | "cancelled";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
