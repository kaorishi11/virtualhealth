// Esta é uma API Route para o Vite (usando Express ou similar)
// Se você estiver usando apenas frontend, pode usar uma Edge Function do Supabase

export default async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { codigo, medicoId, pacienteId } = req.body

  // Verificar se a API key do Daily está configurada
  const DAILY_API_KEY = process.env.VITE_DAILY_API_KEY

  if (!DAILY_API_KEY) {
    return res.status(500).json({ error: 'API key do Daily não configurada' })
  }

  try {
    // Criar sala no Daily.co
    const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `consulta-${codigo}-${Date.now()}`,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          lang: 'pt',
          max_participants: 2,
          enable_network_ui: true,
          enable_prejoin_ui: true,
        },
      }),
    })

    const roomData = await dailyResponse.json()

    if (!dailyResponse.ok) {
      throw new Error(roomData.error || 'Erro ao criar sala')
    }

    // Retornar a URL da sala
    return res.status(200).json({
      success: true,
      roomUrl: roomData.url,
      roomName: roomData.name
    })

  } catch (error) {
    console.error('Erro ao criar sala:', error)
    return res.status(500).json({ 
      error: 'Erro ao criar sala de videoconferência',
      details: error.message 
    })
  }
}