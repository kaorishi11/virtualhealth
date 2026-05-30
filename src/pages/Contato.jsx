import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

import "../styles/Contato.css";

// Imagens
import logo from "../images/logo.png";
import emailheader from "../images/login (2).png";
import certinho from "../images/certinho.png";
import wats from "../images/wats.png";
import insta from "../images/insta.png";
import local from "../images/local.png";
import tell from "../images/tel.png";
import gmail from "../images/gmail.png";
import tempo from "../images/tempo.png";

export default function Contato() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // STATES DAS NOTIFICAÇÕES
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
    buscarUsuario();
}, []);

async function buscarUsuario() {
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    setEmail(user.email || "");

    // busca nome na tabela usuarios
    const { data } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", user.id)
        .single();

    if (data) {
        setNome(data.nome);
    }
}

    // FUNÇÕES DAS NOTIFICAÇÕES
    const unreadCount = notifications.filter(n => !n.read).length;

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

    // Ícones SVG para cada tipo de notificação
    const getTypeIcon = (type) => {
        switch(type) {
            case 'consulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                        <path d="M5 3h14"/>
                        <path d="M12 3v9"/>
                    </svg>
                );
            case 'lembrete':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                );
            case 'teleconsulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m9 8 5 4-5 4V8z"/>
                    </svg>
                );
            case 'sistema':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            case 'teleconsulta': return 'teleconsulta';
            case 'sistema': return 'sistema';
            default: return 'sistema';
        }
    };

    // Função para mostrar toast
    const showToastMessage = (message, isError = false) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const handleSubmit = async () => {
    if (!mensagem) {
        showToastMessage("Digite uma mensagem!", true);
        return;
    }

    const { error } = await supabase
        .from("contatos")
        .insert([
            {
                nome,
                email,
                mensagem
            }
        ]);

    if (error) {
        console.error(error);
        showToastMessage("Erro ao enviar mensagem!", true);
        return;
    }

    showToastMessage("Mensagem enviada com sucesso!");

    setMensagem("");
};

    return (
        <div>
            {/* HEADER COM NOTIFICAÇÕES */}
            <div className="header">
                <img src={logo} className="logocontato" alt="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Ícone de notificação */}
                    <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                        <div className="notification-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            {/* TOAST DE MENSAGEM ENVIADA */}
            {showToast && (
                <div className={`toast-message ${toastMessage.includes('sucesso') ? 'success' : 'error'}`}>
                    <span className="toast-icon">{toastMessage.includes('sucesso') ? '✓' : '⚠️'}</span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* CONTAINER */}
            <div className="contato-container">

                {/* ESQUERDA */}
                <div className="contato-left">
                    <h1>
                        POSSUI <br />
                        <span>ALGUMA DÚVIDA?</span><br />
                        NOS CONTATE
                        <hr/>
                    </h1>

                    <p>
                        Nossa equipe está <strong>pronta para te ajudar</strong>, com <strong>rapidez e segurança</strong>
                    </p>
                </div>

                {/* DIREITA */}
                <div className="contato-right">
                    <label>NOME COMPLETO</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Digite seu nome completo"
                    />

                    <label>EMAIL</label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                    />

                    <label>SUA MENSAGEM</label>
                    <textarea
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        placeholder="Digite sua mensagem aqui..."
                    ></textarea>

                    <button onClick={handleSubmit}>Enviar</button>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul>
                        <li><img src={certinho} className="certo"/> Teleconsulta 24h</li>
                        <li><img src={certinho} className="certo"/> Agendamento online</li>
                        <li><img src={certinho} className="certo"/> Especialidades</li>
                        <li><img src={certinho} className="certo"/> Perguntas frequentes</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Virtual Health</h4>
                    <p>Seu médico virtual 24h</p>
                    <div className="social">
                        <img src={wats} className="img" alt="whatsapp"/>
                        <img src={insta} alt="instagram"/>
                    </div>
                </div>
                <div className="footer-column">
                    <h4>Contato</h4>
                    <ul>
                        <li><img src={local} className="certo"/> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} className="certo"/> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} className="certo"/> Email: Virtualhealth@gmail.com</li>
                        <li><img src={tempo} className="certo"/> Horário: 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}