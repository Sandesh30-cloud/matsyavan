import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface SensorReading {
  sensor_id: string
  value: number
  unit: string
  recorded_at?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const sensorId = url.searchParams.get('sensor_id')
    const farmId = url.searchParams.get('farm_id')
    const timeRange = url.searchParams.get('time_range') || '24h'

    switch (req.method) {
      case 'GET':
        if (sensorId) {
          // Get readings for specific sensor
          const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select('*')
            .eq('sensor_id', sensorId)
            .gte('recorded_at', getTimeRangeStart(timeRange))
            .order('recorded_at', { ascending: false })
            .limit(1000)

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (farmId) {
          // Get latest readings for all sensors in a farm
          const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select(`
              *,
              sensors!inner(
                id,
                name,
                type,
                farm_id,
                battery_level,
                signal_strength
              )
            `)
            .eq('sensors.farm_id', farmId)
            .gte('recorded_at', getTimeRangeStart(timeRange))
            .order('recorded_at', { ascending: false })

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Get all recent readings
          const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select(`
              *,
              sensors!inner(
                id,
                name,
                type,
                farm_id,
                battery_level,
                signal_strength
              )
            `)
            .gte('recorded_at', getTimeRangeStart(timeRange))
            .order('recorded_at', { ascending: false })
            .limit(1000)

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Insert new sensor reading
        const reading: SensorReading = await req.json()
        
        const { data, error } = await supabaseClient
          .from('sensor_readings')
          .insert([{
            sensor_id: reading.sensor_id,
            value: reading.value,
            unit: reading.unit,
            recorded_at: reading.recorded_at || new Date().toISOString()
          }])
          .select()

        if (error) throw error

        // Check for alerts based on the new reading
        await checkAndCreateAlerts(supabaseClient, reading)

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders 
        })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function getTimeRangeStart(timeRange: string): string {
  const now = new Date()
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  }
}

async function checkAndCreateAlerts(supabaseClient: any, reading: SensorReading) {
  try {
    // Get sensor info and user preferences
    const { data: sensor } = await supabaseClient
      .from('sensors')
      .select('*, farms!inner(*)')
      .eq('id', reading.sensor_id)
      .single()

    if (!sensor) return

    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', sensor.farms.owner_id)
      .single()

    if (!preferences) return

    let alertType = null
    let message = ''
    let thresholdValue = null

    // Check thresholds based on sensor type
    switch (sensor.type) {
      case 'temperature':
        if (reading.value < preferences.temperature_min || reading.value > preferences.temperature_max) {
          alertType = reading.value < preferences.temperature_min - 2 || reading.value > preferences.temperature_max + 2 ? 'critical' : 'warning'
          message = `Temperature ${reading.value}°C is outside optimal range (${preferences.temperature_min}-${preferences.temperature_max}°C)`
          thresholdValue = reading.value < preferences.temperature_min ? preferences.temperature_min : preferences.temperature_max
        }
        break
      case 'ph':
        if (reading.value < preferences.ph_min || reading.value > preferences.ph_max) {
          alertType = reading.value < preferences.ph_min - 0.5 || reading.value > preferences.ph_max + 0.5 ? 'critical' : 'warning'
          message = `pH level ${reading.value} is outside optimal range (${preferences.ph_min}-${preferences.ph_max})`
          thresholdValue = reading.value < preferences.ph_min ? preferences.ph_min : preferences.ph_max
        }
        break
      case 'dissolved_oxygen':
        if (reading.value < preferences.oxygen_min || reading.value > preferences.oxygen_max) {
          alertType = reading.value < preferences.oxygen_min - 1 ? 'critical' : 'warning'
          message = `Dissolved oxygen ${reading.value} mg/L is outside optimal range (${preferences.oxygen_min}-${preferences.oxygen_max} mg/L)`
          thresholdValue = reading.value < preferences.oxygen_min ? preferences.oxygen_min : preferences.oxygen_max
        }
        break
      case 'ammonia':
        if (reading.value > preferences.ammonia_max) {
          alertType = reading.value > preferences.ammonia_max + 0.2 ? 'critical' : 'warning'
          message = `Ammonia level ${reading.value} ppm exceeds maximum threshold (${preferences.ammonia_max} ppm)`
          thresholdValue = preferences.ammonia_max
        }
        break
    }

    // Create alert if threshold is violated
    if (alertType) {
      await supabaseClient
        .from('alerts')
        .insert([{
          farm_id: sensor.farm_id,
          sensor_id: reading.sensor_id,
          type: alertType,
          parameter: sensor.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          current_value: reading.value,
          threshold_value: thresholdValue,
          message: message,
          status: 'active'
        }])
    }
  } catch (error) {
    console.error('Error checking alerts:', error)
  }
}