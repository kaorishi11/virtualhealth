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

// Configuração da API Groq
const GROQ_API_KEY = 'COLE_SUA_CHAVE_GROQ_AQUI';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default function ChatMedico() {
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "doctor",
            text: "Olá! 👋\n\nSou o assistente médico virtual da Virtual Health.\n\nDescreva seus sintomas ou faça perguntas sobre saúde. Lembre-se: não dou diagnósticos definitivos, mas posso ajudar com informações e orientações! 😊",
            time: "Agora"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Estados das notificações
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
        }
    ]);

    // Função para enviar mensagem para a API Groq
    const sendToGroq = async (userMessage) => {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "Você é um assistente médico virtual da Virtual Health. Regras: 1) Nunca dê diagnósticos definitivos 2) Sempre recomende procurar um médico presencial para casos graves 3) Seja atencioso e profissional 4) Responda em português 5) Seja claro e objetivo 6) Dê dicas de saúde preventiva quando apropriado"
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro na API:', errorData);
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resposta da API:', data);
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Erro ao chamar Groq:', error);
            return "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes. Se for uma emergência, procure atendimento médico imediatamente.";
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Tópicos com ícones
    const topics = [
        { 
            id: "pressao", 
            label: "Pressão arterial", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            )
        },
        { 
            id: "sintomas", 
            label: "Sintomas", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
            )
        },
        { 
            id: "agendar", 
            label: "Agendar Consulta", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
                </svg>
            )
        },
        { 
            id: "medicamentos", 
            label: "Medicamentos", 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12H4M12 4v16M4 4h16v16H4z"/>
                </svg>
            )
        }
    ];

    const handleTopicToggle = async (topicId, topicLabel) => {
        setSelectedTopics(prev => {
            if (prev.includes(topicId)) {
                return prev.filter(id => id !== topicId);
            } else {
                return [...prev, topicId];
            }
        });

        const isSelected = selectedTopics.includes(topicId);
        
        if (!isSelected) {
            // Adicionar mensagem do usuário
            const userMessage = {
                id: Date.now(),
                type: "user",
                text: topicLabel,
                time: new Date().toLocaleTimeString()
            };
            
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

            // Construir prompt baseado no tópico
            let prompt = "";
            switch (topicId) {
                case "pressao":
                    prompt = "Me fale sobre pressão arterial, como medir corretamente, valores ideais e dicas para manter controlada.";
                    break;
                case "sintomas":
                    prompt = "Quero entender melhor meus sintomas. O que devo observar e quando devo procurar um médico?";
                    break;
                case "exames":
                    prompt = "Me explique sobre exames médicos preventivos, quais são importantes e com que frequência devo fazer.";
                    break;
                case "agendar":
                    prompt = "Como funciona o agendamento de consultas na Virtual Health? Quais as opções disponíveis?";
                    break;
                case "dicas":
                    prompt = "Me dê dicas de saúde preventiva, alimentação saudável, exercícios e hábitos para uma vida melhor.";
                    break;
                case "medicamentos":
                    prompt = "Me oriente sobre uso correto de medicamentos, cuidados importantes e automedicação.";
                    break;
                default:
                    prompt = topicLabel;
            }

            // Chamar API Groq
            const response = await sendToGroq(prompt);
            
            const doctorMessage = {
                id: Date.now() + 1,
                type: "doctor",
                text: response,
                time: new Date().toLocaleTimeString()
            };
            
            setMessages(prev => [...prev, doctorMessage]);
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() === "" || isLoading) return;

        // Adicionar mensagem do usuário
        const userMessage = {
            id: Date.now(),
            type: "user",
            text: inputValue,
            time: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        const userQuestion = inputValue;
        setInputValue("");
        setIsLoading(true);

        // Adicionar indicador de digitação
        const typingIndicator = {
            id: Date.now() + 1,
            type: "typing",
            text: "...",
            time: "Digitando"
        };
        setMessages(prev => [...prev, typingIndicator]);

        // Chamar API Groq
        const response = await sendToGroq(userQuestion);
        
        // Remover indicador e adicionar resposta
        setMessages(prev => prev.filter(msg => msg.type !== "typing"));
        
        const doctorMessage = {
            id: Date.now() + 2,
            type: "doctor",
            text: response,
            time: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, doctorMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Funções de notificação (mantidas iguais)
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
            case 'teleconsulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m9 8 5 4-5 4V8z"/>
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
            case 'teleconsulta': return 'teleconsulta';
            default: return 'sistema';
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
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                            <div className="doctor-name">Dr. Virtual Health</div>
                                        </div>
                                    </div>
                                ) : msg.type === "typing" ? (
                                    <div className="doctor-message">
                                        <div className="doctor-avatar"><img src={robochat} alt="avatar"/></div>
                                        <div className="message-bubble typing-indicator">
                                            <span>.</span><span>.</span><span>.</span>
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

                    {/* TÓPICOS/OPÇÕES */}
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
                                disabled={isLoading}
                            />
                            <button className="send-btn" onClick={handleSendMessage} disabled={isLoading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                                {isLoading ? "Enviando..." : "Enviar"}
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