import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Alert {
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
  sensors?: {
    id: string
    name: string
    type: string
  }
  farms?: {
    id: string
    name: string
  }
}

export function useAlerts(farmId?: string, status?: string) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [farmId, status])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alerts`
      const params = new URLSearchParams()
      
      if (farmId) params.append('farm_id', farmId)
      if (status) params.append('status', status)

      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }

      const data = await response.json()
      setAlerts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateAlert = async (alertId: string, status: 'acknowledged' | 'resolved', userId?: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alerts?id=${alertId}`
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          user_id: userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update alert')
      }

      // Refresh alerts after update
      await fetchAlerts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alerts?id=${alertId}`
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete alert')
      }

      // Refresh alerts after deletion
      await fetchAlerts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    updateAlert,
    deleteAlert
  }
}