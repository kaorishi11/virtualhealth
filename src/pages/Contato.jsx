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
            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logocontato"/>

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                </div>

                <button className="consulta-btn" onClick={() => navigate("/chat")}>
                    Fazer Consulta
                </button>
                <Link to="/perfil">
                    <img src={emailheader} className="email" />
                </Link>
            </div>

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