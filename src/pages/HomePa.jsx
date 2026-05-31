import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

import logo from '../images/logo.png';
import email from '../images/login (2).png';
import cell from '../images/cell.png';
import escudo from '../images/escudo.png';
import robo from '../images/robo.png';
import msg from '../images/msg.png';
import doutor from '../images/med.png';
import video from '../images/video.mp4';
import home from '../images/homepac.png';
import certinho from '../images/certinho.png';
import wats from '../images/wats.png';
import insta from '../images/insta.png';
import local from '../images/local.png';
import tell from '../images/tel.png';
import gmail from '../images/gmail.png';
import tempo from '../images/tempo.png';

import '../styles/HomePa.css';

export default function HomePa() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [dicas, setDicas] = useState([]);
    const [openFaq, setOpenFaq] = useState(null);
    const [indexDica, setIndexDica] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        async function carregarDados() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate("/");
                return;
            }

            setUsuario(user);
            await buscarNotificacoes(user.id);
            await buscarFaqs();
            await buscarDicas();
        }

        carregarDados();
    }, []);

    async function buscarNotificacoes(userId) {
        const { data, error } = await supabase
            .from("notificacoes")
            .select("*")
            .eq("usuario_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar notificações:", error);
            return;
        }

        setNotifications(data || []);
    }

    async function buscarFaqs() {
        const { data, error } = await supabase
            .from("faq")
            .select("*");

        if (error) {
            console.error("Erro ao buscar FAQs:", error);
            return;
        }

        setFaqs(data || []);
    }

    async function buscarDicas() {
        const { data, error } = await supabase
            .from("dicas")
            .select(`
                id,
                titulo,
                texto,
                created_at,
                usuarios:medico_id (
                    nome,
                    especialidade,
                    foto
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar dicas:", error);
            return;
        }

        const dicasFormatadas = data.map(item => ({
            id: item.id,
            titulo: item.titulo,
            texto: item.texto,
            nome: item.usuarios?.nome || "Especialista",
            especialidade: item.usuarios?.especialidade || "",
            imagem: item.usuarios?.foto || doutor
        }));

        setDicas(dicasFormatadas);
    }

    function toggleFaq(index) {
        setOpenFaq(openFaq === index ? null : index);
    }

    const nextDica = () => {
        setIndexDica((prev) => {
            if (prev + 2 >= dicas.length) {
                return 0;
            }
            return prev + 1;
        });
    };

    const prevDica = () => {
        setIndexDica((prev) => {
            if (prev === 0) {
                return Math.max(dicas.length - 2, 0);
            }
            return prev - 1;
        });
    };

    const unreadCount = notifications.filter(n => !n.lida).length;

    const handleNotificationClick = async (id) => {
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);

        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, lida: true } : notif
            )
        );
    };

    const markAllAsRead = async () => {
        if (!usuario) return;
        
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("usuario_id", usuario.id);

        setNotifications(prev =>
            prev.map(notif => ({ ...notif, lida: true }))
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

    const handleImageError = (e) => {
        e.target.src = doutor;
    };

    return (
        <div className="home-container">
            {/* HEADER */}
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

            {/* MODAL NOTIFICAÇÕES */}
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
                                        className={`notification-item ${!notif.lida ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif.id)}
                                    >
                                        <div className={`notification-icon-circle ${getTypeClass(notif.tipo)}`}>
                                            {getTypeIcon(notif.tipo)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.titulo}</div>
                                            <div className="notification-message">{notif.mensagem}</div>
                                            <div className="notification-time">
                                                {new Date(notif.created_at).toLocaleDateString("pt-BR")}
                                            </div>
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
            <div className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>
                            SEJA BEM VINDO AO <br /><span>VIRTUAL HEALTH</span>
                        </h1>
                        <p>
                            Tudo que você precisa para cuidar da sua saúde em um só lugar
                            <br /> — rápido, seguro e acessível.
                        </p>
                    </div>
                </div>
            </div>

            {/* APP */}
            <div className="app-section">
                <h2>Conheça nosso aplicativo</h2>
                <hr />
                <p className="app-subtitle">
                    Tudo que você precisa para cuidar da sua saúde em um só lugar.
                </p>

                <div className="cards">
                    <div className="card1">
                        <img src={cell} alt="celular" />
                        <p>Acesse pelo celular, tablet ou computador em todas as plataformas digitais.</p>
                    </div>

                    <div className="card2">
                        <img src={escudo} alt="segurança" />
                        <p>Segurança e privacidade garantidas para os dados de todos os usuários.</p>
                    </div>

                    <div className="card1">
                        <img src={robo} alt="ia" />
                        <p>Fácil acesso a informações e exames com Inteligência Artificial (Chatbot).</p>
                    </div>

                    <div className="card2">
                        <img src={msg} alt="mensagem" />
                        <p>A equipe Virtual Health responde suas dúvidas com atenção e rapidez.</p>
                    </div>
                </div>
            </div>

            {/* PROPÓSITO */}
            <div className="purpose-section">
                <h2>Nosso propósito</h2>
                <hr />
                <p>
                    Criamos uma plataforma acessível, humana e tecnológica que coloca o paciente no centro.
                </p>
                <video className="video" controls>
                    <source src={video} type="video/mp4" />
                </video>
            </div>

            <hr className="hr1"/>
            <img src={home} className="propaganda" alt="propaganda" />
            <hr className="hr2"/>

            {/* DICAS DOS ESPECIALISTAS */}
            <div className="experts-section">
                <h2>Dicas dos Especialistas</h2>
                <hr />
                {dicas.length > 0 ? (
                    <div className="carousel-container">
                        <button className="arrow left" onClick={prevDica}>❮</button>
                        <div className="experts-cards">
                            {dicas.slice(indexDica, indexDica + 2).map((item, i) => (
                                <div className="expert-card" key={item.id || i}>
                                    <h3 className="expert-title">{item.titulo}</h3>
                                    <p className="expert-text">{item.texto}</p>
                                    <div className="expert-footer">
                                        <div className="perfil">
                                            <img 
                                                src={item.imagem} 
                                                alt={item.nome}
                                                onError={handleImageError}
                                            />
                                            <strong>
                                                {item.nome} {item.especialidade && `- ${item.especialidade}`}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="arrow right" onClick={nextDica}>❯</button>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', padding: '40px' }}>
                        Em breve teremos dicas dos nossos especialistas!
                    </p>
                )}
            </div>

            <hr className="hr3"/>

            {/* FAQ - Versão do segundo arquivo */}
            <div className="faq-section">
                <h2>Perguntas frequentes</h2>
                <hr />

                <div className="faq-grid">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item ${openFaq === index ? "open" : ""}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="faq-question">
                                {faq.pergunta}
                                <span className="plus-icon">+</span>
                            </div>
                            <div className="faq-answer">
                                {faq.resposta}
                            </div>
                        </div>
                    ))}
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
                        <li><img src={gmail} className="certo" alt="email"/> Email: virtualhealth@gmail.com</li>
                        <li><img src={tempo} className="certo" alt="horario"/> Horário: 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}