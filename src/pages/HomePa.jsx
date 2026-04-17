import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import email from '../images/login (2).png';
import cell from '../images/cell.png';
import escudo from '../images/escudo.png';
import robo from '../images/robo.png';
import msg from '../images/msg.png';

import doutora from '../images/Dra. Beatriz.png';
import doutor from '../images/Dr. Lucas.png';

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
    const [openIndex, setOpenIndex] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);
    const navigate = useNavigate();
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
    function toggleFaq(index) {
    setOpenFaq(openFaq === index ? null : index);
}

    return (
        <div className="home-container">

            {/* HEADER */}
            <div className="header">
                <img src={logo}/>

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                </div>

                <button className="consulta-btn" onClick={() => navigate("/chat")}>
                    Fazer Consulta
                </button>

                <img src={email} className="email" />
            </div>

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
                        <img src={cell} />
                        <p>Acesse pelo celular, tablet ou computador em todas as plataformas digitais.</p>
                    </div>

                    <div className="card">
                        <img src={escudo} />
                        <p>Segurança e privacidade garantidas para os dados de todos os usuários.</p>
                    </div>

                    <div className="card1">
                        <img src={robo} />
                        <p>Fácil acesso a informações e exames com Inteligência Artificial (Chatbot).</p>
                    </div>

                    <div className="card">
                        <img src={msg} />
                        <p>A equipe Virtual Health responde suas dúvidas com atenção e rapidez.</p>
                    </div>
                </div>
            </div>

            <hr className="hr"/>

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

            <img src={home} className="propaganda"/>
            <hr className="hr2"/>

            {/* ESPECIALISTAS */}
            <div className="experts-section">
                <h2>Dicas dos especialistas</h2>
                <hr />

                <div className="experts-cards">

                    <div className="expert-card">
                        <div>
                            <p className="expert-text">
                            Manter vínculos sociais ativos contribui para o bem-estar psicológico. 
                            Escrever pensamentos e sentimentos pode ser uma forma eficaz de organizar emoções e 
                            aliviar tensões. Buscar apoio profissional é sempre a melhor escolha.
                            </p>
                            <img src={doutora} />
                            <p className="expert-name">Dra. Beatriz Lacerda - Psicóloga</p>
                        </div>
                    </div>

                    <div className="expert-card">
                        <div>
                            <p className="expert-text">
                            Atividades de fortalecimento muscular duas vezes por semana ajudam a preservar
                             massa magra e prevenir lesões. Respeitar os limites do próprio corpo e uma alimentação
                              equilibrada são fundamentais.
                            </p>
                            <img src={doutor} />
                            <p className="expert-name">Dr. Lucas Ferraz - Medicina do Esporte</p>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="hr3"/>
            {/* FAQ */}
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
                                    {faq.question}
                                    <span className="plus-icon">+</span>
                                </div>
                                <div className="faq-answer">
                                    {faq.answer}
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
                        <li><img src={certinho} /> Teleconsulta 24h</li>
                        <li><img src={certinho} /> Agendamento online</li>
                        <li><img src={certinho} /> Especialidades</li>
                        <li><img src={certinho} /> Perguntas frequentes</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Virtual Health</h4>
                    <p>Seu médico virtual 24h</p>
                    <div className="social">
                        <img src={wats} />
                        <img src={insta} />
                    </div>
                </div>
                <div className="footer-column">
                    <h4>Contato</h4>
                    <ul>
                        <li><img src={local} /> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} /> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} /> Email: Virtualhealth@gmail.com</li>
                        <li><img src={tempo} /> Horário: 24h</li>
                    </ul>
                </div>

            </footer>
        </div>
    );
}