// src/services/roomService.js
export async function createConsultationRoom(codigo, medicoId, pacienteId) {
  // Usar Jitsi Meet - gratuito, sem necessidade de API
  const timestamp = Date.now()
  const nomeSala = `VirtualHealth_${medicoId}_${pacienteId}_${codigo}_${timestamp}`
  const roomUrl = `https://meet.jit.si/${nomeSala}`
  
  return {
    success: true,
    roomUrl: roomUrl,
    roomName: nomeSala
  }
}