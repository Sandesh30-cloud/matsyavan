import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface SensorReading {
  id: string
  sensor_id: string
  value: number
  unit: string
  quality_score: number
  recorded_at: string
  created_at: string
  sensors?: {
    id: string
    name: string
    type: string
    battery_level: number
    signal_strength: number
  }
}

export function useSensorData(farmId?: string, timeRange: string = '24h') {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSensorData()
  }, [farmId, timeRange])

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sensor-data`
      const params = new URLSearchParams()
      
      if (farmId) params.append('farm_id', farmId)
      params.append('time_range', timeRange)

      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sensor data')
      }

      const data = await response.json()
      setReadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addReading = async (sensorId: string, value: number, unit: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sensor-data`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sensor_id: sensorId,
          value,
          unit
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add sensor reading')
      }

      // Refresh data after adding
      await fetchSensorData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return {
    readings,
    loading,
    error,
    refetch: fetchSensorData,
    addReading
  }
}