// supabase/functions/create-room/index.js
// Isso é uma Edge Function do Supabase, não um arquivo do frontend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
const DAILY_API_URL = 'https://api.daily.co/v1'

Deno.serve(async (req) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers
    })
  }

  try {
    const { codigo, medicoId, pacienteId } = await req.json()

    if (!DAILY_API_KEY) {
      throw new Error('API key do Daily não configurada')
    }

    // Criar sala no Daily.co
    const roomName = `consulta-${codigo}-${Date.now()}`
    const dailyResponse = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          lang: 'pt',
          max_participants: 2,
          enable_network_ui: true,
          enable_prejoin_ui: true,
          exp: Math.floor(Date.now() / 1000) + 7200, // Expira em 2 horas
        },
      }),
    })

    const roomData = await dailyResponse.json()

    if (!dailyResponse.ok) {
      throw new Error(roomData.error || 'Erro ao criar sala')
    }

    return new Response(JSON.stringify({
      success: true,
      roomUrl: roomData.url,
      roomName: roomData.name
    }), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Erro ao criar sala:', error)
    return new Response(JSON.stringify({
      error: 'Erro ao criar sala de videoconferência',
      details: error.message
    }), {
      status: 500,
      headers
    })
  }
})