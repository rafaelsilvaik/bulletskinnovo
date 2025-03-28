export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      heroes: {
        Row: {
          id: number
          name: string
          icon_url: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          icon_url?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          icon_url?: string | null
          description?: string | null
          created_at?: string
        }
      }
      skins: {
        Row: {
          id: number
          hero_id: number
          name: string
          image_url: string | null
          rarity: string | null
          created_at: string
        }
        Insert: {
          id?: number
          hero_id: number
          name: string
          image_url?: string | null
          rarity?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          hero_id?: number
          name?: string
          image_url?: string | null
          rarity?: string | null
          created_at?: string
        }
      }
      user_skins: {
        Row: {
          id: number
          user_id: string
          skin_id: number
          collected_at: string
        }
        Insert: {
          id?: number
          user_id: string
          skin_id: number
          collected_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          skin_id?: number
          collected_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: number
          name: string
          type: string
          hero_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          type: string
          hero_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: string
          hero_id?: number | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: number
          room_id: number
          user_id: string
          content: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          room_id: number
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          room_id?: number
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: number
          name: string
          description: string | null
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon_url?: string | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: number
          user_id: string
          achievement_id: number
          unlocked_at: string
        }
        Insert: {
          id?: number
          user_id: string
          achievement_id: number
          unlocked_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          achievement_id?: number
          unlocked_at?: string
        }
      }
    }
  }
}

