import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Contato.css";

// Imagens
import logo from "../images/logo.png";
import email from '../images/email.png';
import certinho from "../images/certinho.png";
import wats from "../images/wats.png";
import insta from "../images/insta.png";
import local from "../images/local.png";
import tell from "../images/tel.png";
import gmail from "../images/gmail.png";
import tempo from "../images/tempo.png";

export default function Contato() {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "O que é a Virtual Health?",
            answer: "A Virtual Health é uma plataforma de telemedicina que conecta pacientes a médicos especialistas de forma rápida, segura e acessível, 24 horas por dia."
        },
        {
            question: "A Virtual Health substitui um médico presencial?",
            answer: "A Virtual Health complementa o atendimento médico, oferecendo consultas online para casos que não necessitam de exames físicos presenciais. Em casos de emergência, procure um serviço presencial."
        },
        {
            question: "Preciso pagar para usar?",
            answer: "Sim, as consultas têm um valor acessível a partir de R$60,00. Não há mensalidade, você paga apenas pelas consultas que realizar."
        },
        {
            question: "Posso usar para qualquer sintoma?",
            answer: "Nossos médicos podem ajudar com diversos sintomas. Porém, em casos de emergência (dor no peito, falta de ar, etc), procure imediatamente um serviço de emergência presencial."
        },
        {
            question: "Como funciona o agendamento?",
            answer: "Você pode agendar sua consulta diretamente pelo site, escolhendo o especialista, data e horário disponível. O link da teleconsulta será enviado por email."
        },
        {
            question: "Meus dados estão seguros?",
            answer: "Sim! Seguimos a LGPD (Lei Geral de Proteção de Dados) e utilizamos criptografia para proteger todas as suas informações."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
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

            {/* HERO - igual imagem */}
            <div className="contato-hero">
                <h1>POSSUI ALGUMA <span>DÚVIDA?</span> NOS CONTATE</h1>
                <p>
                    Nossa equipe está <strong>pronta para te ajudar</strong>, com <strong>rapidez e segurança</strong>
                </p>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="contato-content">
                {/* GRID 3 COLUNAS: SERVIÇOS | VIRTUAL HEALTH | CONTATO */}
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
                        <div className="social-icons" style={{ justifyContent: "center", marginTop: "24px" }}>
                            <img src={wats} alt="whatsapp" />
                            <img src={insta} alt="instagram" />
                        </div>
                    </div>

                    {/* CONTATO */}
                    <div className="info-card">
                        <h3>Contato</h3>
                        <ul className="contact-list">
                            <li>
                                <span className="contact-icon">📍</span>
                                <span>Endereço: Sesi Caçapava SP</span>
                            </li>
                            <li>
                                <span className="contact-icon">📞</span>
                                <span>Telefone: (12) 9966-9732</span>
                            </li>
                            <li>
                                <span className="contact-icon">✉️</span>
                                <span>Email: virtualhealthassistencia@gmail.com</span>
                            </li>
                            <li>
                                <span className="contact-icon">⏰</span>
                                <span>Horário: Equipe 24h</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* SEÇÃO DE PERGUNTAS FREQUENTES (FAQ) */}
                <div className="faq-section">
                    <h2>Perguntas <span>Frequentes</span></h2>
                    <p className="faq-subtitle">Tire suas dúvidas sobre nossos serviços</p>

                    <div className="faq-grid">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item ${openFaq === index ? "open" : ""}`}
                                onClick={() => toggleFaq(index)}
                            >
                                <div className="faq-question">
                                    {faq.question}
                                    <span className="plus-icon">+</span>
                                </div>
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BOTÃO DE CONTATO */}
                    <div className="contact-button-section">
                        <button className="btn-contato" onClick={() => window.location.href = "mailto:virtualhealthassistencia@gmail.com"}>
                            📧 Fale Conosco
                        </button>
                    </div>
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