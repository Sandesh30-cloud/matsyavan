import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ReportRequest {
  farm_id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  parameters: string[]
  date_from: string
  date_to: string
  format: 'csv' | 'pdf' | 'json'
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
    const reportId = url.searchParams.get('id')
    const farmId = url.searchParams.get('farm_id')

    switch (req.method) {
      case 'GET':
        if (reportId) {
          // Get specific report
          const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Get all reports for farm
          let query = supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })

          if (farmId) {
            query = query.eq('farm_id', farmId)
          }

          const { data, error } = await query.limit(50)

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        const reportRequest: ReportRequest = await req.json()
        
        // Create report record
        const { data: report, error: reportError } = await supabaseClient
          .from('reports')
          .insert([{
            farm_id: reportRequest.farm_id,
            name: reportRequest.name,
            type: reportRequest.type,
            parameters: reportRequest.parameters,
            date_from: reportRequest.date_from,
            date_to: reportRequest.date_to,
            status: 'generating'
          }])
          .select()
          .single()

        if (reportError) throw reportError

        // Generate report data
        const reportData = await generateReportData(supabaseClient, reportRequest)
        
        // Format report based on requested format
        let formattedData: string
        let contentType: string
        let fileExtension: string

        switch (reportRequest.format) {
          case 'csv':
            formattedData = formatAsCSV(reportData)
            contentType = 'text/csv'
            fileExtension = 'csv'
            break
          case 'pdf':
            // For PDF generation, you would typically use a library like jsPDF
            // For now, we'll return JSON and indicate PDF generation would happen here
            formattedData = JSON.stringify(reportData, null, 2)
            contentType = 'application/json'
            fileExtension = 'json'
            break
          default:
            formattedData = JSON.stringify(reportData, null, 2)
            contentType = 'application/json'
            fileExtension = 'json'
        }

        // In a real implementation, you would upload the file to storage
        // For now, we'll just return the data and update the report status
        const { error: updateError } = await supabaseClient
          .from('reports')
          .update({
            status: 'completed',
            file_size_bytes: new Blob([formattedData]).size
          })
          .eq('id', report.id)

        if (updateError) throw updateError

        return new Response(formattedData, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${reportRequest.name}.${fileExtension}"`
          },
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

async function generateReportData(supabaseClient: any, request: ReportRequest) {
  const { data: sensorReadings, error } = await supabaseClient
    .from('sensor_readings')
    .select(`
      *,
      sensors!inner(
        id,
        name,
        type,
        farm_id
      )
    `)
    .eq('sensors.farm_id', request.farm_id)
    .gte('recorded_at', request.date_from)
    .lte('recorded_at', request.date_to)
    .order('recorded_at', { ascending: true })

  if (error) throw error

  // Filter by requested parameters
  const filteredReadings = sensorReadings.filter((reading: any) => 
    request.parameters.includes(reading.sensors.type) || 
    request.parameters.includes('all')
  )

  // Get alerts for the same period
  const { data: alerts } = await supabaseClient
    .from('alerts')
    .select('*')
    .eq('farm_id', request.farm_id)
    .gte('created_at', request.date_from)
    .lte('created_at', request.date_to)
    .order('created_at', { ascending: true })

  // Calculate statistics
  const stats = calculateStatistics(filteredReadings)

  return {
    report_info: {
      name: request.name,
      type: request.type,
      farm_id: request.farm_id,
      date_from: request.date_from,
      date_to: request.date_to,
      parameters: request.parameters,
      generated_at: new Date().toISOString()
    },
    statistics: stats,
    sensor_readings: filteredReadings,
    alerts: alerts || [],
    summary: {
      total_readings: filteredReadings.length,
      total_alerts: alerts?.length || 0,
      critical_alerts: alerts?.filter((a: any) => a.type === 'critical').length || 0,
      warning_alerts: alerts?.filter((a: any) => a.type === 'warning').length || 0
    }
  }
}

function calculateStatistics(readings: any[]) {
  const statsByType: { [key: string]: any } = {}

  readings.forEach(reading => {
    const type = reading.sensors.type
    if (!statsByType[type]) {
      statsByType[type] = {
        values: [],
        unit: reading.unit
      }
    }
    statsByType[type].values.push(reading.value)
  })

  Object.keys(statsByType).forEach(type => {
    const values = statsByType[type].values
    statsByType[type] = {
      ...statsByType[type],
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
      latest: values[values.length - 1]
    }
  })

  return statsByType
}

function formatAsCSV(data: any): string {
  const lines = ['Timestamp,Sensor Type,Sensor Name,Value,Unit']
  
  data.sensor_readings.forEach((reading: any) => {
    lines.push([
      reading.recorded_at,
      reading.sensors.type,
      reading.sensors.name,
      reading.value,
      reading.unit
    ].join(','))
  })

  return lines.join('\n')
}