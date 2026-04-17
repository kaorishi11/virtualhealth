import { useState } from "react";
import { Link } from "react-router-dom";

import logo from '../images/logo.png';
import email from '../images/email.png';
import medico from '../images/medicofoto.png';
import cell from '../images/cell.png';
import escudo from '../images/escudo.png';
import robo from '../images/robo.png';
import msg from '../images/msg.png';

import doutora from '../images/Dra. Beatriz.png';
import doutor from '../images/Dr. Lucas.png';

import mais from '../images/mais.png';

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

    return (
        <div className="home-container">

            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                </div>

                <button className="consulta-btn">Fazer Consulta</button>
            </div>

            {/* HERO */}
            <div className="hero">
                <div className="hero-content">

                    <div className="hero-text">
                        <h1>
                            SEJA BEM VINDO AO <span>VIRTUAL HEALTH</span>
                        </h1>
                        <p>
                            Tudo que você precisa para cuidar da sua saúde em um só lugar — rápido, seguro e acessível.
                        </p>
                    </div>

                    <img src={medico} className="medico-img" />

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
                    <div className="card">
                        <img src={cell} />
                        <p>Acesse pelo celular, tablet ou computador.</p>
                    </div>

                    <div className="card">
                        <img src={escudo} />
                        <p>Segurança e privacidade garantidas.</p>
                    </div>

                    <div className="card">
                        <img src={robo} />
                        <p>IA para ajudar você com exames.</p>
                    </div>

                    <div className="card">
                        <img src={msg} />
                        <p>Suporte rápido e eficiente.</p>
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
                    <source src="/video.mp4" type="video/mp4" />
                </video>
            </div>

            {/* ESPECIALISTAS */}
            <div className="experts-section">
                <h2>Dicas dos especialistas</h2>
                <hr />

                <div className="experts-cards">

                    <div className="expert-card">
                        <img src={doutora} />
                        <div>
                            <p className="expert-text">
                                Manter vínculos sociais melhora o bem-estar.
                            </p>
                            <p className="expert-name">
                                Dra. Beatriz Lacerda - Psicóloga
                            </p>
                        </div>
                    </div>

                    <div className="expert-card">
                        <img src={doutor} />
                        <div>
                            <p className="expert-text">
                                Exercícios ajudam na saúde física.
                            </p>
                            <p className="expert-name">
                                Dr. Lucas Ferraz - Medicina do Esporte
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* FAQ */}
            <div className="faq-section">
                <h2>Perguntas frequentes</h2>
                <hr />

                {[
                    "O que é a Virtual Health?",
                    "A Virtual Health substitui um médico?",
                    "Preciso pagar?",
                    "Posso usar para qualquer sintoma?"
                ].map((pergunta, i) => (
                    <div className={`faq-item ${openIndex === i ? "open" : ""}`} key={i}>

                        <div className="faq-header" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                            <span>{pergunta}</span>
                            <img src={mais} />
                        </div>

                        <div className="faq-answer">
                            <p>Resposta da pergunta.</p>
                        </div>

                    </div>
                ))}
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