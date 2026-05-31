import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
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
            text: "Olá! 👋\n\nSou o assistente médico virtual da Virtual Health.\n\nComo posso ajudar você hoje? Descreva seus sintomas ou faça perguntas sobre saúde. Lembre-se: não dou diagnósticos definitivos, mas posso ajudar com informações e orientações! 😊",
            time: "Agora"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pacienteId, setPacienteId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Função para buscar paciente logado
    async function buscarPacienteLogado() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                navigate("/login");
                return;
            }

            const { data: usuario } = await supabase
                .from("usuarios")
                .select("id, tipo")
                .eq("id", user.id)
                .single();

            if (usuario && usuario.tipo === 'paciente') {
                setPacienteId(usuario.id);
            } else if (usuario && usuario.tipo === 'medico') {
                navigate("/home-medico");
            }
        } catch (error) {
            console.error("Erro ao buscar paciente:", error);
            navigate("/login");
        }
    }

    // Função para carregar notificações do banco
    async function carregarNotificacoes() {
        if (!pacienteId) return;

        const { data: notificacoes, error } = await supabase
            .from("notificacoes")
            .select("*")
            .eq("usuario_id", pacienteId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("Erro ao carregar notificações:", error);
            return;
        }

        if (notificacoes) {
            setNotifications(notificacoes.map(n => ({
                id: n.id,
                title: n.titulo,
                message: n.mensagem,
                type: n.tipo,
                read: n.lida,
                time: new Date(n.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            })));
        }
    }

    // Função para marcar notificação como lida
    const marcarNotificacaoLida = async (id) => {
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);
    };

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
                            content: "Você é um assistente médico virtual da Virtual Health. Regras: 1) Nunca dê diagnósticos definitivos 2) Sempre recomende procurar um médico presencial para casos graves 3) Seja atencioso e profissional 4) Responda em português 5) Seja claro e objetivo 6) Dê dicas de saúde preventiva quando apropriado 7) Use emojis ocasionalmente para tornar a conversa mais amigável"
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

    useEffect(() => {
        buscarPacienteLogado();
    }, []);

    useEffect(() => {
        if (pacienteId) {
            carregarNotificacoes();
            
            // Inscrever para notificações em tempo real
            const subscription = supabase
                .channel('notificacoes-realtime')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notificacoes',
                    filter: `usuario_id=eq.${pacienteId}`
                }, (payload) => {
                    const novaNotificacao = {
                        id: payload.new.id,
                        title: payload.new.titulo,
                        message: payload.new.mensagem,
                        type: payload.new.tipo,
                        read: false,
                        time: new Date(payload.new.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    };
                    setNotifications(prev => [novaNotificacao, ...prev]);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [pacienteId]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === "" || isLoading) return;

        // Adicionar mensagem do usuário com animação
        const userMessage = {
            id: Date.now(),
            type: "user",
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        const userQuestion = inputValue;
        setInputValue("");
        setIsLoading(true);

        // Adicionar indicador de digitação com animação
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
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, doctorMessage]);
        setIsLoading(false);
        
        // Focar no input após enviar
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Funções de notificação
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        await marcarNotificacaoLida(id);
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        
        for (const id of unreadIds) {
            await marcarNotificacaoLida(id);
        }
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
                        <p className="chat-subtitle">💬 Atendimento 24h - Respostas rápidas e inteligentes</p>
                    </div>

                    {/* MENSAGENS COM ANIMAÇÕES */}
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div 
                                key={msg.id} 
                                className={`message-wrapper ${msg.type === "doctor" ? "doctor-wrapper" : "user-wrapper"} animate-message`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {msg.type === "doctor" ? (
                                    <div className="doctor-message">
                                        <div className="doctor-avatar">
                                            <img src={robochat} alt="avatar"/>
                                            <div className="online-dot"></div>
                                        </div>
                                        <div className="message-bubble">
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                            <div className="message-footer">
                                                <span className="doctor-name">Dr. Virtual Health</span>
                                                <span className="message-time">{msg.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : msg.type === "typing" ? (
                                    <div className="doctor-message">
                                        <div className="doctor-avatar">
                                            <img src={robochat} alt="avatar"/>
                                        </div>
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="user-message">
                                        <div className="user-bubble">
                                            <p>{msg.text}</p>
                                            <div className="message-footer">
                                                <span className="message-time">{msg.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT DE MENSAGEM COM ANIMAÇÃO */}
                    <div className="chat-input-area">
                        <div className="input-wrapper">
                            <textarea
                                ref={inputRef}
                                className="chat-input"
                                placeholder="Digite sua mensagem aqui... (Pressione Enter para enviar)"
                                rows="2"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                            <button 
                                className={`send-btn ${isLoading ? 'loading' : ''}`} 
                                onClick={handleSendMessage} 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="send-loading">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13"/>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                        </svg>
                                        <span>Enviar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* SUGESTÕES RÁPIDAS */}
                    <div className="quick-suggestions">
                        <p className="suggestions-title">Perguntas frequentes:</p>
                        <div className="suggestions-grid">
                            <button 
                                className="suggestion-btn"
                                onClick={() => {
                                    setInputValue("Estou com dor de cabeça há 2 dias, o que devo fazer?");
                                    inputRef.current?.focus();
                                }}
                            >
                                Dor de cabeça
                            </button>
                            <button 
                                className="suggestion-btn"
                                onClick={() => {
                                    setInputValue("Quais são os sintomas de gripe?");
                                    inputRef.current?.focus();
                                }}
                            >
                                Sintomas de gripe
                            </button>
                            <button 
                                className="suggestion-btn"
                                onClick={() => {
                                    setInputValue("Como posso controlar minha pressão arterial?");
                                    inputRef.current?.focus();
                                }}
                            >
                                Pressão arterial
                            </button>
                            <button 
                                className="suggestion-btn"
                                onClick={() => {
                                    setInputValue("Quando devo procurar um médico de emergência?");
                                    inputRef.current?.focus();
                                }}
                            >
                                Quando ir ao médico
                            </button>
                        </div>
                    </div>

                    {/* AVISO LEGAL */}
                    <div className="disclaimer">
                        <p>⚠️ Este chat não substitui avaliações médicas presenciais. Em caso de emergência, procure um serviço de saúde imediatamente.</p>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul>
                        <li><img src={certinho} className="certo" alt="check"/> Teleconsulta 24h</li>
                        <li><img src={certinho} className="certo" alt="check"/> Agendamento online</li>
                        <li><img src={certinho} className="certo" alt="check"/> Especialidades</li>
                        <li><img src={certinho} className="certo" alt="check"/> Perguntas frequentes</li>
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
                        <li><img src={local} className="certo" alt="local"/> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} className="certo" alt="telefone"/> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} className="certo" alt="email"/> Email: Virtualhealth@gmail.com</li>
                        <li><img src={tempo} className="certo" alt="horario"/> Horário: 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}