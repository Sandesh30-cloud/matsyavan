import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const alertId = url.searchParams.get('id')
    const farmId = url.searchParams.get('farm_id')
    const status = url.searchParams.get('status')

    switch (req.method) {
      case 'GET':
        let query = supabaseClient
          .from('alerts')
          .select(`
            *,
            sensors(id, name, type),
            farms(id, name)
          `)
          .order('created_at', { ascending: false })

        if (farmId) {
          query = query.eq('farm_id', farmId)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query.limit(100)

        if (error) throw error

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        if (!alertId) {
          throw new Error('Alert ID is required for updates')
        }

        const updateData = await req.json()
        
        const { data, error } = await supabaseClient
          .from('alerts')
          .update({
            status: updateData.status,
            acknowledged_by: updateData.status === 'acknowledged' ? updateData.user_id : null,
            acknowledged_at: updateData.status === 'acknowledged' ? new Date().toISOString() : null,
            resolved_at: updateData.status === 'resolved' ? new Date().toISOString() : null,
          })
          .eq('id', alertId)
          .select()

        if (error) throw error

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        if (!alertId) {
          throw new Error('Alert ID is required for deletion')
        }

        const { error: deleteError } = await supabaseClient
          .from('alerts')
          .delete()
          .eq('id', alertId)

        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ success: true }), {
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