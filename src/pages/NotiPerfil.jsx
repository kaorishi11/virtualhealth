import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';

import "../styles/Notificacoes.css";

export default function Notificacoes() {
    const [notifications, setNotifications] = useState({
        lembreteConsulta: true,
        confirmacaoAgendamento: true,
        dicasSaude: false,
        resultadosExames: true
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="notificacoes-container">

            {/* SIDEBAR */}
            <div className="navbar">
                <img src={logo} className="logoperfil" alt="logo" />
                <p className="nav-title">Configuração</p>

                <h3>CONTA</h3>
                <ul>
                    <li><Link to="/perfil"><img src={icon1} alt="icon"/> Configuração de perfil</Link></li>
                    <li><Link to="/agendamento"><img src={icon2} alt="icon"/> Agendamentos médicos</Link></li>
                </ul>

                <h3>PREFERÊNCIAS</h3>
                <ul>
                    <li className="active"><Link to="/notificacoes"><img src={icon3} alt="icon"/> Notificações</Link></li>
                </ul>

                <h3>NAVEGAÇÕES</h3>
                <ul>
                    <li><Link to="/home-paciente"><img src={icon4} alt="icon"/> Voltar para o início</Link></li>
                </ul>

                <p className="logout"><Link to="/">Desconectar</Link></p>
            </div>

            {/* CONTEÚDO */}
            <div className="notificacoes-content">
                <h1>PREFERÊNCIAS DE NOTIFICAÇÃO</h1>

                <div className="notificacoes-card">
                    {/* Lembrete de consulta */}
                    <div className="notificacao-item">
                        <div className="notificacao-info">
                            <h3>Lembrete de consulta</h3>
                            <p>Receber aviso 30 minutos antes da consulta</p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={notifications.lembreteConsulta}
                                onChange={() => handleToggle("lembreteConsulta")}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {/* Confirmação de agendamento */}
                    <div className="notificacao-item">
                        <div className="notificacao-info">
                            <h3>Confirmação de agendamento</h3>
                            <p>Notificar quando uma consulta for confirmada</p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={notifications.confirmacaoAgendamento}
                                onChange={() => handleToggle("confirmacaoAgendamento")}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {/* Dicas de saúde */}
                    <div className="notificacao-item">
                        <div className="notificacao-info">
                            <h3>Dicas de saúde</h3>
                            <p>Receber dicas diárias dos médicos</p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={notifications.dicasSaude}
                                onChange={() => handleToggle("dicasSaude")}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {/* Resultados de exames */}
                    <div className="notificacao-item">
                        <div className="notificacao-info">
                            <h3>Resultados de exames</h3>
                            <p>Avisar quando novos exames estiverem disponíveis</p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={notifications.resultadosExames}
                                onChange={() => handleToggle("resultadosExames")}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                {/* Botão salvar */}
                <div className="save-container">
                    <button className="save-btn" onClick={() => alert("Preferências salvas com sucesso!")}>
                        Salvar preferências
                    </button>
                </div>
            </div>
        </div>
    );
}