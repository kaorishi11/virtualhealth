import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import '../styles/TeleconsultaPa.css';

export default function TeleconsultaPa() {
    const navigate = useNavigate();
    const [linkConsulta, setLinkConsulta] = useState("");
    const [emChamada, setEmChamada] = useState(false);
    const [toast, setToast] = useState(null);
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Consulta em breve!",
            message: "Sua consulta começa em 10 minutos. Prepare-se!",
            time: "Há 5 minutos",
            read: false,
            type: "consulta"
        },
        {
            id: 2,
            title: "Link de acesso disponível",
            message: "Clique no card ao lado para entrar na sua teleconsulta.",
            time: "Há 30 minutos",
            read: false,
            type: "sistema"
        },
        {
            id: 3,
            title: "Lembrete",
            message: "Teste sua câmera e microfone antes de entrar na consulta.",
            time: "Há 1 hora",
            read: true,
            type: "lembrete"
        }
    ]);

    // Estados da câmera
    const [cameraAtiva, setCameraAtiva] = useState(false);
    const [microfoneAtivo, setMicrofoneAtivo] = useState(true);
    const [cameraPermissao, setCameraPermissao] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    const handleNotificationClick = (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const closeNotifications = () => {
        setShowNotifications(false);
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'consulta': return '🩺';
            case 'lembrete': return '⏰';
            case 'teleconsulta': return '💻';
            case 'sistema': return '📢';
            default: return '📌';
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'lembrete': return 'lembrete';
            case 'teleconsulta': return 'teleconsulta';
            case 'sistema': return 'sistema';
            default: return 'sistema';
        }
    };

    // Iniciar câmera
    const iniciarCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            streamRef.current = stream;
            setCameraAtiva(true);
            setMicrofoneAtivo(true);
            setCameraPermissao(true);
            
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            setCameraPermissao(false);
            setCameraAtiva(false);
            
            if (error.name === 'NotAllowedError') {
                showToast('Permissão negada. Por favor, permita acesso à câmera.', true);
            } else {
                showToast('Não foi possível acessar a câmera.', true);
            }
        }
    };

    const desligarCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = false;
                setCameraAtiva(false);
            }
        }
    };

    const ligarCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = true;
                setCameraAtiva(true);
            }
        } else {
            iniciarCamera();
        }
    };

    const alternarCamera = () => {
        if (cameraAtiva) {
            desligarCamera();
        } else {
            ligarCamera();
        }
    };

    const alternarMicrofone = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !microfoneAtivo;
                setMicrofoneAtivo(!microfoneAtivo);
            }
        }
    };

    const encerrarChamada = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraAtiva(false);
        setEmChamada(false);
        showToast('📞 Chamada encerrada');
    };

    const handleEntrarConsulta = () => {
        if (!linkConsulta.trim()) {
            showToast('Por favor, insira o link da consulta!', true);
            return;
        }
        
        // Validar se é uma URL válida
        if (!linkConsulta.startsWith('http://') && !linkConsulta.startsWith('https://')) {
            showToast('Por favor, insira um link válido (começando com http:// ou https://)', true);
            return;
        }
        
        setEmChamada(true);
        iniciarCamera();
        showToast('✅ Conectado à consulta! Ativando câmera...');
    };

    // Informações da consulta
    const consultaInfo = {
        medico: "Dra. Marta",
        especialidade: "Dentista",
        data: "06/02/2026",
        horario: "14h50",
        paciente: "Enaldo Santos"
    };

    return (
        <div>
            {/* HEADER COM NOTIFICAÇÃO - COMPLETO */}
            <div className="header">
                <img src={logo} className="logopaciente" alt="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Ícone de notificação */}
                    <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                        <div className="notification-icon">
                            🔔
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </div>
                    </div>
                    
                    <button className="consulta-btn" onClick={() => navigate("/chat")}>
                        Fazer Consulta
                    </button>
                </div>
            </div>

            {/* MODAL DE NOTIFICAÇÕES */}
            {showNotifications && (
                <div className="notification-modal-overlay" onClick={closeNotifications}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notification-modal-header">
                            <h3>🔔 Notificações</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {unreadCount > 0 && (
                                    <button className="mark-all-btn" onClick={markAllAsRead}>
                                        Marcar todas
                                    </button>
                                )}
                                <button className="close-modal-btn" onClick={closeNotifications}>
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif.id)}
                                    >
                                        <div className={`notification-icon-circle ${getTypeClass(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications">
                                    <div className="no-notifications-icon">📭</div>
                                    <p>Nenhuma notificação no momento</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HERO DA TELECONSULTA COM IMAGEM */}
            <div className="teleconsulta-hero">
                <div className="teleconsulta-hero-content">
                    <div className="teleconsulta-hero-text">
                        <h1>
                            TELECONSULTA
                        </h1>
                        <p>
                            Insira o link fornecido pelo seu médico para iniciar a consulta.
                        </p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                <div className="teleconsulta-container">
                    <div className="section-title">
                        <h2>ORIENTAÇÕES</h2>
                        <hr />
                        <p>Certifique-se de estar em um ambiente tranquilo e com boa iluminação para uma melhor experiência.</p>
                    </div>

                    <div className="teleconsulta-grid">
                        {/* CARD PARA INSERIR O LINK */}
                        <div className="link-card">
                            <h2>Entrar na consulta</h2>
                            <div className="input-group">
                                <label>Link da consulta</label>
                                <input 
                                    type="text"
                                    placeholder="https://virtualhealth.com/consulta/..."
                                    value={linkConsulta}
                                    onChange={(e) => setLinkConsulta(e.target.value)}
                                    disabled={emChamada}
                                />
                            </div>
                            <button 
                                className="btn-entrar" 
                                onClick={handleEntrarConsulta}
                                disabled={emChamada}
                            >
                                {emChamada ? "🔴 Em chamada..." : "🎥 Entrar na consulta"}
                            </button>
                        </div>

                        {/* INFORMAÇÕES DA CONSULTA - FORMATO VERTICAL */}
                        <div className="info-card">
                            <div className="info-card-header">
                                <h2>Informações da consulta</h2>
                            </div>
                            <div className="info-card-body">
                                <div className="info-card-item">
                                    <div className="info-card-icon">👩‍⚕️</div>
                                    <div className="info-card-content">
                                        <div className="info-card-label">Médico(a)</div>
                                        <div className="info-card-value destaque">{consultaInfo.medico}</div>
                                    </div>
                                </div>
                                <div className="info-card-item">
                                    <div className="info-card-icon">🏥</div>
                                    <div className="info-card-content">
                                        <div className="info-card-label">Especialidade</div>
                                        <div className="info-card-value">{consultaInfo.especialidade}</div>
                                    </div>
                                </div>
                                <div className="info-card-item">
                                    <div className="info-card-icon">👤</div>
                                    <div className="info-card-content">
                                        <div className="info-card-label">Paciente</div>
                                        <div className="info-card-value">{consultaInfo.paciente}</div>
                                    </div>
                                </div>
                                <div className="info-card-item">
                                    <div className="info-card-icon">📅</div>
                                    <div className="info-card-content">
                                        <div className="info-card-label">Data e horário</div>
                                        <div className="info-card-value">{consultaInfo.data} • {consultaInfo.horario}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD DE VÍDEO - APARECE QUANDO ENTRA NA CHAMADA */}
                    {emChamada && (
                        <div className="video-card">
                            <div className="video-container">
                                {cameraPermissao ? (
                                    <>
                                        <video 
                                            ref={videoRef} 
                                            autoPlay 
                                            playsInline 
                                            muted
                                            id="pacienteVideo"
                                        />
                                        <div className="doctor-pip">
                                            <video 
                                                ref={videoRef} 
                                                autoPlay 
                                                playsInline 
                                                muted
                                            />
                                            <div className="doctor-label">Você</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="video-placeholder">
                                        <div className="video-placeholder-icon"></div>
                                        <p>Aguardando conexão com a câmera...</p>
                                    </div>
                                )}
                            </div>
                            <div className="video-controls">
                                <button className="control-btn" onClick={alternarCamera}>
                                    {cameraAtiva ? 'Desligar Câmera' : 'Ligar Câmera'}
                                </button>
                                <button className="control-btn" onClick={alternarMicrofone}>
                                    {microfoneAtivo ? 'Desligar Micro' : 'Ligar Micro'}
                                </button>
                                <button className="control-btn end-call" onClick={encerrarChamada}>
                                    Encerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TOAST */}
            {toast && (
                <div className={`toast ${toast.isError ? 'error' : ''}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}