export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          stock: number
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          stock: number
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          category?: string
          stock?: number
        }
      }
      orders: {
        Row: {
          id: number
          created_at: string
          user_id: string
          status: string
          total: number
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          status: string
          total: number
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          status?: string
          total?: number
        }
      }
      order_items: {
        Row: {
          id: number
          created_at: string
          order_id: number
          product_id: number
          quantity: number
          price: number
        }
        Insert: {
          id?: number
          created_at?: string
          order_id: number
          product_id: number
          quantity: number
          price: number
        }
        Update: {
          id?: number
          created_at?: string
          order_id?: number
          product_id?: number
          quantity?: number
          price?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          address: string | null
          phone: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name: string
          address?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          address?: string | null
          phone?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}