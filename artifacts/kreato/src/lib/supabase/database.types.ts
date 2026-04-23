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
          role: "creator" | "buyer";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: "creator" | "buyer";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
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
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          handle: string;
          country: string;
          product_type: string;
          fdusd_wallet?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          handle?: string;
          country?: string;
          product_type?: string;
          fdusd_wallet?: string | null;
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
