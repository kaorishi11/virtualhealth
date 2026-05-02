import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    const [mensagem, setMensagem] = useState("");

    // STATES DAS NOTIFICAÇÕES
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Nova consulta agendada",
            message: "Sua consulta com Dr. Lucas Ferraz foi agendada para amanhã às 14h.",
            time: "Há 2 horas",
            read: false,
            type: "consulta"
        },
        {
            id: 2,
            title: "Link para teleconsulta",
            message: "Copie e cole este link para acessar sua teleconsulta: https://virtualhealth.com/teleconsulta/12345",
            time: "2 min atrás",
            read: true,
            type: "teleconsulta"
        },
        {
            id: 3,
            title: "Confirme sua consulta",
            message: "Por favor, confirme sua presença na consulta de amanhã.",
            time: "Ontem",
            read: true,
            type: "lembrete"
        },
        {
            id: 4,
            title: "Novo especialista disponível",
            message: "Agora você pode agendar consultas com Drª Ana Souza - Neurologista.",
            time: "2 dias atrás",
            read: true,
            type: "sistema"
        }
    ]);

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

    const handleSubmit = () => {
        if (!nome || !mensagem) {
            alert("Preencha todos os campos!");
            return;
        }

        alert(`Mensagem enviada!\n\nNome: ${nome}\nMensagem: ${mensagem}`);
        setNome("");
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
                    />

                    <label>SUA MENSAGEM</label>
                    <textarea
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
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