import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone?: string
          company?: string
          role: 'admin' | 'manager' | 'technician' | 'observer'
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string
          company?: string
          role?: 'admin' | 'manager' | 'technician' | 'observer'
          avatar_url?: string
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string
          company?: string
          role?: 'admin' | 'manager' | 'technician' | 'observer'
          avatar_url?: string
        }
      }
      farms: {
        Row: {
          id: string
          name: string
          location?: string
          description?: string
          owner_id: string
          latitude?: number
          longitude?: number
          area_hectares?: number
          fish_species?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          location?: string
          description?: string
          owner_id: string
          latitude?: number
          longitude?: number
          area_hectares?: number
          fish_species?: string[]
        }
        Update: {
          name?: string
          location?: string
          description?: string
          latitude?: number
          longitude?: number
          area_hectares?: number
          fish_species?: string[]
        }
      }
      sensors: {
        Row: {
          id: string
          farm_id: string
          name: string
          type: 'temperature' | 'ph' | 'dissolved_oxygen' | 'ammonia' | 'nitrate' | 'turbidity' | 'salinity'
          model?: string
          serial_number?: string
          location_description?: string
          battery_level: number
          signal_strength: number
          is_active: boolean
          last_reading_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          farm_id: string
          name: string
          type: 'temperature' | 'ph' | 'dissolved_oxygen' | 'ammonia' | 'nitrate' | 'turbidity' | 'salinity'
          model?: string
          serial_number?: string
          location_description?: string
          battery_level?: number
          signal_strength?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          model?: string
          location_description?: string
          battery_level?: number
          signal_strength?: number
          is_active?: boolean
          last_reading_at?: string
        }
      }
      sensor_readings: {
        Row: {
          id: string
          sensor_id: string
          value: number
          unit: string
          quality_score: number
          recorded_at: string
          created_at: string
        }
        Insert: {
          sensor_id: string
          value: number
          unit: string
          quality_score?: number
          recorded_at?: string
        }
        Update: {
          value?: number
          unit?: string
          quality_score?: number
        }
      }
      alerts: {
        Row: {
          id: string
          farm_id: string
          sensor_id?: string
          type: 'critical' | 'warning' | 'info'
          parameter: string
          current_value?: number
          threshold_value?: number
          message: string
          status: 'active' | 'acknowledged' | 'resolved'
          acknowledged_by?: string
          acknowledged_at?: string
          resolved_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          farm_id: string
          sensor_id?: string
          type: 'critical' | 'warning' | 'info'
          parameter: string
          current_value?: number
          threshold_value?: number
          message: string
          status?: 'active' | 'acknowledged' | 'resolved'
        }
        Update: {
          status?: 'active' | 'acknowledged' | 'resolved'
          acknowledged_by?: string
          acknowledged_at?: string
          resolved_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark'
          email_alerts: boolean
          sms_alerts: boolean
          push_notifications: boolean
          critical_only: boolean
          daily_reports: boolean
          weekly_reports: boolean
          temperature_min: number
          temperature_max: number
          ph_min: number
          ph_max: number
          oxygen_min: number
          oxygen_max: number
          ammonia_min: number
          ammonia_max: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'light' | 'dark'
          email_alerts?: boolean
          sms_alerts?: boolean
          push_notifications?: boolean
          critical_only?: boolean
          daily_reports?: boolean
          weekly_reports?: boolean
          temperature_min?: number
          temperature_max?: number
          ph_min?: number
          ph_max?: number
          oxygen_min?: number
          oxygen_max?: number
          ammonia_min?: number
          ammonia_max?: number
        }
        Update: {
          theme?: 'light' | 'dark'
          email_alerts?: boolean
          sms_alerts?: boolean
          push_notifications?: boolean
          critical_only?: boolean
          daily_reports?: boolean
          weekly_reports?: boolean
          temperature_min?: number
          temperature_max?: number
          ph_min?: number
          ph_max?: number
          oxygen_min?: number
          oxygen_max?: number
          ammonia_min?: number
          ammonia_max?: number
        }
      }
    }
  }
}