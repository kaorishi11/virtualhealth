import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../services/supabase';
import VideoCall from '../components/VideoCall';

import logo from '../images/logo.png';
import '../styles/TeleconsultaPa.css';

export default function TeleconsultaPa() {
    const navigate = useNavigate();
    const [codigoBusca, setCodigoBusca] = useState("");
    const [roomUrl, setRoomUrl] = useState(null);
    const [emChamadaVideo, setEmChamadaVideo] = useState(false);
    const [toast, setToast] = useState(null);
    const [carregando, setCarregando] = useState(false);
    
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
            message: "Copie e cole este link para acessar sua teleconsulta: https://virtualhealth.com/teleconsulta/12345",
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

    const unreadCount = notifications.filter(n => !n.read).length;

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    const buscarConsultaPorCodigo = async (codigo) => {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('consulta_salas')
                .select('sala_url, status, medico_id')
                .eq('codigo', codigo)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    showToast('Código inválido! Verifique e tente novamente.', true);
                } else {
                    throw error;
                }
                return false;
            }
            
            if (data.status === 'aguardando') {
                setRoomUrl(data.sala_url);
                return true;
            } else if (data.status === 'encerrada') {
                showToast('Esta consulta já foi encerrada!', true);
                return false;
            } else {
                showToast('Esta consulta já está em andamento!', true);
                return false;
            }
        } catch (error) {
            console.error('Erro ao buscar consulta:', error);
            showToast('Erro ao conectar. Tente novamente.', true);
            return false;
        } finally {
            setCarregando(false);
        }
    };

    const handleEntrarComCodigo = async () => {
        if (!codigoBusca.trim()) {
            showToast('Digite o código da consulta!', true);
            return;
        }

        if (codigoBusca.length !== 6 || !/^\d+$/.test(codigoBusca)) {
            showToast('Código inválido! Digite 6 dígitos numéricos.', true);
            return;
        }

        const encontrada = await buscarConsultaPorCodigo(codigoBusca);
        if (encontrada) {
            setEmChamadaVideo(true);
        }
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
            case 'consulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                        <path d="M5 3h14"/>
                        <path d="M12 3v9"/>
                    </svg>
                );
            case 'lembrete':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                );
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'lembrete': return 'lembrete';
            default: return 'sistema';
        }
    };

    const consultaInfo = {
        medico: "Dra. Marta",
        especialidade: "Dentista",
        data: "06/02/2026",
        horario: "14h50",
        motivo: "Análise dentária"
    };

    return (
        <div>
            {/* HEADER COM NOTIFICAÇÃO */}
            <div className="header">
                <img src={logo} className="logopaciente" alt="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                        <div className="notification-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
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
                            <h3>Notificações</h3>
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
                                    <p>Nenhuma notificação no momento</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HERO */}
            <div className="teleconsulta-hero">
                <div className="teleconsulta-hero-content">
                    <div className="teleconsulta-hero-text">
                        <h1>TELECONSULTA</h1>
                        <p>Digite o código fornecido pelo seu médico para iniciar a consulta.</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                <div className="teleconsulta-container">
                    {!emChamadaVideo ? (
                        <>
                            <div className="section-title">
                                <h2>ORIENTAÇÕES</h2>
                                <hr />
                                <p>Certifique-se de estar em um ambiente tranquilo e com boa iluminação para uma melhor experiência.</p>
                            </div>

                            <div className="teleconsulta-grid">
                                {/* CARD PARA INSERIR O CÓDIGO */}
                                <div className="link-card">
                                    <h2>ENTRAR NA TELECONSULTA</h2>
                                    <div className="input-group">
                                        <label>Código da consulta (6 dígitos)</label>
                                        <input 
                                            type="text"
                                            placeholder="Ex: 123456"
                                            value={codigoBusca}
                                            onChange={(e) => setCodigoBusca(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            maxLength="6"
                                            disabled={carregando}
                                        />
                                    </div>
                                    <button 
                                        className="btn-entrar" 
                                        onClick={handleEntrarComCodigo}
                                        disabled={carregando || !codigoBusca}
                                    >
                                        {carregando ? "🔍 Verificando..." : "🎥 Entrar na consulta"}
                                    </button>
                                </div>

                                {/* INFORMAÇÕES DA CONSULTA */}
                                <div className="info-card">
                                    <div className="info-card-body">
                                        <h2 className="info-title">INFORMAÇÕES DA CONSULTA</h2>
                                        <div className="info-content">
                                            <div className="info-item">
                                                <span className="info-label">Médico(a):</span>
                                                <span className="info-value destaque">{consultaInfo.medico}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Especialidade:</span>
                                                <span className="info-value">{consultaInfo.especialidade}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Data e hora:</span>
                                                <span className="info-value">{consultaInfo.data}, {consultaInfo.horario}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Motivo:</span>
                                                <span className="info-value">{consultaInfo.motivo}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <VideoCall 
                            roomUrl={roomUrl}
                            userName="Enaldo Santos"
                            isDoctor={false}
                            onCallEnd={() => {
                                setEmChamadaVideo(false);
                                setRoomUrl(null);
                                setCodigoBusca('');
                            }}
                        />
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