import { useEffect, useRef, useState } from 'react'
import dailyIframe from '@daily-co/daily-js'

export default function VideoCall({ roomUrl, userName, onCallEnd, isDoctor = false }) {
  const [callFrame, setCallFrame] = useState(null)
  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [callStatus, setCallStatus] = useState('connecting')
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!roomUrl) {
      console.error('Room URL não fornecida')
      setCallStatus('error')
      return
    }

    console.log('Iniciando chamada com URL:', roomUrl)
    
    try {
      // Criar instância do Daily
      const frame = dailyIframe.createFrame(iframeRef.current, {
        showLeaveButton: true,
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: true,
        lang: 'pt',
        twemoji: true,
        showDeveloperInfo: false,
      })

      setCallFrame(frame)

      // Eventos da chamada
      frame.on('joining-meeting', () => {
        console.log('Entrando na reunião...')
        setCallStatus('joining')
      })

      frame.on('joined-meeting', (event) => {
        console.log('Entrou na reunião:', event)
        setIsJoined(true)
        setCallStatus('joined')
        setParticipants(event.participants?.length || 1)
      })

      frame.on('participant-joined', (event) => {
        console.log('Participante entrou:', event)
        setParticipants(prev => prev + 1)
      })

      frame.on('participant-left', (event) => {
        console.log('Participante saiu:', event)
        setParticipants(prev => prev - 1)
      })

      frame.on('left-meeting', () => {
        console.log('Saiu da reunião')
        setIsJoined(false)
        setCallStatus('left')
        if (onCallEnd) onCallEnd()
      })

      frame.on('error', (error) => {
        console.error('Erro na chamada:', error)
        setCallStatus('error')
      })

      // Participar da reunião
      frame.join({
        url: roomUrl,
        userName: userName,
      })

    } catch (error) {
      console.error('Erro ao criar frame:', error)
      setCallStatus('error')
    }

    // Cleanup
    return () => {
      if (callFrame) {
        try {
          callFrame.leave()
          setTimeout(() => callFrame.destroy(), 1000)
        } catch (error) {
          console.error('Erro ao destruir frame:', error)
        }
      }
    }
  }, [roomUrl, userName, onCallEnd])

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        iframeRef.current.requestFullscreen()
      }
    }
  }

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting': return '🔌 Conectando...'
      case 'joining': return '📞 Entrando na chamada...'
      case 'joined': return '📹 Em chamada'
      case 'left': return '⏹️ Chamada encerrada'
      case 'error': return '❌ Erro na conexão'
      default: return '📹 Chamada'
    }
  }

  return (
    <div className="video-call-wrapper" style={{
      width: '100%',
      backgroundColor: '#f5f5f5',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div className="video-call-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        backgroundColor: '#2c3e50',
        color: 'white',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div className="call-info" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span className="call-status" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold'
          }}>
            {getStatusText()}
          </span>
          {isJoined && (
            <span className="participants-count" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '14px'
            }}>
              👥 {participants} participante(s)
            </span>
          )}
        </div>
        <div className="call-controls" style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleFullscreen} 
            className="fullscreen-btn"
            style={{
              padding: '6px 12px',
              backgroundColor: '#34495e',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ⛶ Tela cheia
          </button>
        </div>
      </div>
      
      <div style={{ position: 'relative', backgroundColor: '#000' }}>
        <iframe
          ref={iframeRef}
          title="Video Call"
          allow="camera; microphone; fullscreen; display-capture"
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            backgroundColor: '#1a1a1a'
          }}
        />
      </div>
      
      <div className="video-call-footer" style={{
        padding: '10px 20px',
        backgroundColor: '#ecf0f1',
        textAlign: 'center',
        fontSize: '12px',
        color: '#7f8c8d'
      }}>
        <p className="call-tip">
          💡 Dica: Use fones de ouvido para melhor qualidade de áudio
        </p>
      </div>
    </div>
  )
}