import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Chat.css";

// Imagens
import logo from "../images/logo.png";
import certinho from "../images/certinho.png";
import wats from "../images/wats.png";
import insta from "../images/insta.png";
import local from "../images/local.png";
import tell from "../images/tel.png";
import gmail from "../images/gmail.png";
import tempo from "../images/tempo.png";

export default function ChatMedico() {
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

    const topics = [
        { id: "pressao", label: "Pressão arterial" },
        { id: "sintomas", label: "Sintomas" },
        { id: "exames", label: "Meus exames" },
        { id: "agendar", label: "Agendar Consulta" },
        { id: "dicas", label: "Dicas de saúde" }
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

        // Adiciona mensagem do usuário sobre o tópico selecionado
        const isSelected = selectedTopics.includes(topicId);
        
        if (!isSelected) {
            // Usuário selecionou o tópico
            const userMessage = {
                id: Date.now(),
                type: "user",
                text: topicLabel
            };
            
            // Resposta do médico
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

        // Mensagem do usuário
        const userMessage = {
            id: Date.now(),
            type: "user",
            text: inputValue
        };

        // Resposta automática do médico
        const doctorMessage = {
            id: Date.now() + 1,
            type: "doctor",
            text: "Obrigado por compartilhar. Estou analisando sua mensagem. Recomendo agendar uma consulta presencial ou por teleconsulta para uma avaliação mais detalhada. Como posso ajudar mais?"
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
            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logo" alt="logo" />
                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                </div>
                <button className="consulta-btn">Fazer Consulta</button>
            </div>

            {/* CHAT PRINCIPAL */}
            <div className="chat-container">
                <div className="chat-card">
                    {/* HEADER DO CHAT */}
                    <div className="chat-header">
                        <h1>CONVERSE COM O SEU <span>MÉDICO VIRTUAL!</span></h1>
                        <p>Olá! sou seu médico virtual. Como posso ajudar você hoje?</p>
                    </div>

                    {/* MENSAGENS */}
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                {msg.type === "doctor" ? (
                                    <div className="doctor-message">
                                        <div className="doctor-avatar">👨‍⚕️</div>
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

                    {/* TÓPICOS/OPÇÕES */}
                    <div className="topics-section">
                        <div className="topics-title">Escolha um dos temas abaixo ou me conte o que está sentindo:</div>
                        <div className="topics-grid">
                            {topics.map((topic) => (
                                <label 
                                    key={topic.id} 
                                    className={`topic-item ${selectedTopics.includes(topic.id) ? "selected" : ""}`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTopics.includes(topic.id)}
                                        onChange={() => handleTopicToggle(topic.id, topic.label)}
                                    />
                                    {topic.label}
                                </label>
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

            {/* GRID DE INFORMAÇÕES */}
            <div className="info-grid">
                {/* SERVIÇOS */}
                <div className="info-card">
                    <h3>Serviços</h3>
                    <ul className="services-list">
                        <li>Teleconsulta 24h</li>
                        <li>Agendamento online</li>
                        <li>Especialidades</li>
                        <li>Perguntas frequentes</li>
                    </ul>
                </div>

                {/* VIRTUAL HEALTH */}
                <div className="info-card virtual-card">
                    <div className="virtual-icon">🏥</div>
                    <h3>Virtual Health</h3>
                    <p>Seu médico virtual 24h</p>
                </div>

                {/* CONTATO */}
                <div className="info-card">
                    <h3>Contato</h3>
                    <ul className="contact-list">
                        <li><span className="contact-icon">📍</span> Endereço: Sesi Caçapava SP</li>
                        <li><span className="contact-icon">📞</span> Telefone: (12) 9966-9732</li>
                        <li><span className="contact-icon">✉️</span> Email: virtualhealthassistencia@gmail.com</li>
                        <li><span className="contact-icon">⏰</span> Horário: Equipe 24h</li>
                    </ul>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul>
                        <li><img src={certinho} alt="check" /> Teleconsulta 24h</li>
                        <li><img src={certinho} alt="check" /> Agendamento online</li>
                        <li><img src={certinho} alt="check" /> Especialidades</li>
                        <li><img src={certinho} alt="check" /> Perguntas frequentes</li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Virtual Health</h4>
                    <p>Seu médico virtual 24h</p>
                    <div className="social-icons">
                        <img src={wats} alt="whatsapp" />
                        <img src={insta} alt="instagram" />
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Contato</h4>
                    <ul>
                        <li><img src={local} alt="local" /> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} alt="telefone" /> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} alt="email" /> Email: virtualhealthassistencia@gmail.com</li>
                        <li><img src={tempo} alt="horario" /> Horário: Equipe 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}