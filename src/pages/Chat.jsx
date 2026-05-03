import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Chat.css";

// Imagens
import logo from "../images/logo.png";
import robochat from "../images/robochat.png";
import certinho from "../images/certinho.png";
import wats from "../images/wats.png";
import insta from "../images/insta.png";
import local from "../images/local.png";
import tell from "../images/tel.png";
import gmail from "../images/gmail.png";
import tempo from "../images/tempo.png";

export default function ChatMedico() {
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "doctor",
            text: "Olá! sou seu médico virtual. Como posso ajudar você hoje?",
            time: "Agora"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([]);
    const messagesEndRef = useRef(null);

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
            title: "Lembrete de medicação",
            message: "Não se esqueça de tomar seu medicamento às 20h.",
            time: "Há 5 horas",
            read: false,
            type: "lembrete"
        },
        {
            id: 3,
            title: "Link para teleconsulta",
            message: "Copie e cole este link para acessar sua teleconsulta: https://virtualhealth.com/teleconsulta/12345",
            time: "2 min atrás",
            read: true,
            type: "teleconsulta"
        },
        {
            id: 4,
            title: "Confirme sua consulta",
            message: "Por favor, confirme sua presença na consulta de amanhã.",
            time: "Ontem",
            read: true,
            type: "lembrete"
        },
        {
            id: 5,
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

    // TÓPICOS COM ÍCONES SVG PROFISSIONAIS
    const topics = [
        { 
            id: "pressao", 
            label: "Pressão arterial", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            )
        },
        { 
            id: "sintomas", 
            label: "Sintomas", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                    <path d="M5 3h14"/>
                    <path d="M12 3v9"/>
                </svg>
            )
        },
        { 
            id: "exames", 
            label: "Meus exames", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
            )
        },
        { 
            id: "agendar", 
            label: "Agendar Consulta", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <circle cx="12" cy="15" r="1"/>
                    <circle cx="16" cy="15" r="1"/>
                    <circle cx="8" cy="15" r="1"/>
                </svg>
            )
        },
        { 
            id: "dicas", 
            label: "Dicas de saúde", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
                </svg>
            )
        }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleTopicToggle = (topicId, topicLabel) => {
        setSelectedTopics(prev => {
            if (prev.includes(topicId)) {
                return prev.filter(id => id !== topicId);
            } else {
                return [...prev, topicId];
            }
        });

        const isSelected = selectedTopics.includes(topicId);
        
        if (!isSelected) {
            const userMessage = {
                id: Date.now(),
                type: "user",
                text: topicLabel
            };
            
            let doctorResponse = "";
            switch (topicId) {
                case "pressao":
                    doctorResponse = "Sobre pressão arterial: é importante medir regularmente. Valores ideais são abaixo de 12 por 8. Como estão suas medições?";
                    break;
                case "sintomas":
                    doctorResponse = "Conte-me mais sobre seus sintomas. Quando começaram? Qual a intensidade?";
                    break;
                case "exames":
                    doctorResponse = "Você pode acessar seus exames na área do paciente. Precisa de ajuda para interpretar algum resultado?";
                    break;
                case "agendar":
                    doctorResponse = "Para agendar uma consulta, clique no botão 'Fazer Consulta' no menu superior ou vá até a página de Clínicas.";
                    break;
                case "dicas":
                    doctorResponse = "Dicas de saúde: mantenha alimentação balanceada, pratique exercícios regularmente, beba água e tenha boas noites de sono!";
                    break;
                default:
                    doctorResponse = "Como posso ajudar você com isso?";
            }
            
            const doctorMessage = {
                id: Date.now() + 1,
                type: "doctor",
                text: doctorResponse
            };
            
            setMessages(prev => [...prev, userMessage, doctorMessage]);
        }
    };

    const handleSendMessage = () => {
        if (inputValue.trim() === "") return;

        const userMessage = {
            id: Date.now(),
            type: "user",
            text: inputValue
        };

        let doctorResponse = "Obrigado por compartilhar. Estou analisando sua mensagem. Recomendo agendar uma consulta presencial ou por teleconsulta para uma avaliação mais detalhada. Como posso ajudar mais?";

        if (selectedTopics.includes("sintomas")) {
            const texto = inputValue.toLowerCase();

            if (texto.includes("dor de cabeça") || texto.includes("dores de cabeça")) {
                doctorResponse = "Dores de cabeça podem ter várias causas, como estresse, falta de sono, desidratação ou até problemas de visão. É importante observar a frequência e intensidade. Se for algo constante ou muito forte, procure um médico para avaliação mais detalhada.";
            }
        }

        const doctorMessage = {
            id: Date.now() + 1,
            type: "doctor",
            text: doctorResponse
        };

        setMessages(prev => [...prev, userMessage, doctorMessage]);
        setInputValue("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div>
            {/* HEADER COM NOTIFICAÇÕES */}
            <div className="header">
                <img src={logo} className="logochat" alt="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Ícone de notificação - SVG */}
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
                                    <div className="no-notifications-icon">📭</div>
                                    <p>Nenhuma notificação no momento</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CHAT PRINCIPAL */}
            <div className="chat-container">
                <div className="chat-card">
                    {/* HEADER DO CHAT */}
                    <div className="chat-header">
                        <h1>CONVERSE COM O SEU <span>MÉDICO VIRTUAL!</span></h1>
                    </div>

                    {/* MENSAGENS */}
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                {msg.type === "doctor" ? (
                                    <div className="doctor-message">
                                        <div className="doctor-avatar"><img src={robochat} alt="avatar"/></div>
                                        <div className="message-bubble">
                                            <p>{msg.text}</p>
                                            <div className="doctor-name">Dr. Virtual Health</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="user-message">
                                        <div className="user-bubble">
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* TÓPICOS/OPÇÕES COM ÍCONES SVG */}
                    <div className="topics-section">
                        <div className="topics-title">Escolha um dos temas abaixo ou me conte o que está sentindo:</div>
                        <div className="topics-grid">
                            {topics.map((topic) => (
                                <div 
                                    key={topic.id}
                                    className={`topic-item ${selectedTopics.includes(topic.id) ? "selected" : ""}`}
                                    onClick={() => handleTopicToggle(topic.id, topic.label)}
                                >
                                    <span className="topic-icon">{topic.icon}</span>
                                    <span>{topic.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* INPUT DE MENSAGEM */}
                    <div className="chat-input-area">
                        <div className="input-wrapper">
                            <textarea
                                className="chat-input"
                                placeholder="Digite sua mensagem aqui..."
                                rows="2"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button className="send-btn" onClick={handleSendMessage}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                                Enviar
                            </button>
                        </div>
                    </div>

                    {/* AVISO LEGAL */}
                    <div className="disclaimer">
                        <p>⚠️ Esse chat não substitui as avaliações médicas presenciais. Em caso de emergência, procure um serviço de saúde imediatamente.</p>
                    </div>
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