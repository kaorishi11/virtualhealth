// src/services/roomService.jsx
export async function createConsultationRoom(codigo, medicoId, pacienteId) {
  try {
    // Opção 1: Usar um serviço de proxy (recomendo o Cors Anywhere para teste)
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_DAILY_API_KEY_AQUI', // Coloque sua key aqui
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
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar sala')
    }

    const roomData = await response.json()
    
    return {
      success: true,
      roomUrl: roomData.url,
      roomName: roomData.name
    }
  } catch (error) {
    console.error('Erro no serviço de sala:', error)
    throw error
  }
}