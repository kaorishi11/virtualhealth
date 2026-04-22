import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';

import "../styles/AgendamentosMedicos.css";

export default function AgendamentosMedicos() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(1); // 0 = Janeiro, 1 = Fevereiro, etc.
    
    const months = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    
    const appointmentsByMonth = {
        0: [], // Janeiro - sem agendamentos
        1: [ // Fevereiro
            {
                id: 1,
                dia: 1,
                medico: "Dr. Andrey",
                especialidade: "Oftalmologista",
                tipo: "Teleconsulta",
                horario: "08:00",
                duracao: "30 min",
                local: "",
                status: "confirmado",
                statusText: "Confirmado",
                botao: "Entrar",
                botaoAcao: "entrar"
            },
            {
                id: 2,
                dia: 14,
                medico: "Dra. Marta",
                especialidade: "Dentista",
                tipo: "Presencial",
                horario: "10:00",
                duracao: "",
                local: "Hospital Policlinico",
                status: "agendando",
                statusText: "Agendando",
                botao: "Cancelar",
                botaoAcao: "cancelar"
            },
            {
                id: 3,
                dia: 19,
                medico: "Dra. Sheila",
                especialidade: "Ginecologista",
                tipo: "Presencial",
                horario: "09:00",
                duracao: "",
                local: "Fusam Caçapava",
                status: "resolvido",
                statusText: "Resolvido",
                botao: "Ver relatório",
                botaoAcao: "relatorio"
            }
        ],
        2: [], // Março
        3: [], // Abril
        4: [], // Maio
        5: [], // Junho
        6: [], // Julho
        7: [], // Agosto
        8: [], // Setembro
        9: [], // Outubro
        10: [], // Novembro
        11: []  // Dezembro
    };

    const goToPreviousMonth = () => {
        if (currentMonth > 0) {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth < 11) {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleButtonClick = (acao, medico) => {
        if (acao === "entrar") {
            alert(`Entrando na consulta com ${medico}`);
        } else if (acao === "cancelar") {
            if (window.confirm(`Deseja cancelar a consulta com ${medico}?`)) {
                alert(`Consulta com ${medico} cancelada`);
            }
        } else if (acao === "relatorio") {
            alert(`Abrindo relatório da consulta com ${medico}`);
        }
    };

    const currentAppointments = appointmentsByMonth[currentMonth] || [];

    return (
        <div className="agenda-container">

            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} className="logoperfil" alt="logo" />
                    <p className="nav-title">Configuração</p>
                </div>

                <h3>CONTA</h3>
                <ul>
                    <li><Link to="/perfil"><img src={icon1} alt="icon"/> Configuração de perfil</Link></li>
                    <li className="active"><Link to="/agendamento"><img src={icon2} alt="icon"/> Agendamentos médicos</Link></li>
                </ul>

                <h3>PREFERÊNCIAS</h3>
                <ul>
                    <li><Link to="/notificacoes"><img src={icon3} alt="icon"/> Notificações</Link></li>
                </ul>

                <h3>NAVEGAÇÕES</h3>
                <ul>
                    <li><Link to="/home-paciente"><img src={icon4} alt="icon"/> Voltar para o início</Link></li>
                </ul>

                <p className="logout"><Link to="/">Desconectar</Link></p>
            </div>

            {/* CONTEÚDO */}
            <div className="agenda-content">
                <h1>AGENDAMENTOS MÉDICOS</h1>

                {/* MÊS COM SETAS */}
                <div className="mes-container">
                    <div className="mes-header">
                        <button className="month-nav-btn" onClick={goToPreviousMonth} disabled={currentMonth === 0}>
                            ◀
                        </button>
                        <h2>{months[currentMonth]}</h2>
                        <button className="month-nav-btn" onClick={goToNextMonth} disabled={currentMonth === 11}>
                            ▶
                        </button>
                    </div>
                    
                    {/* LISTA DE AGENDAMENTOS */}
                    <div className="appointments-list">
                        {currentAppointments.length > 0 ? (
                            currentAppointments.map((app) => (
                                <div key={app.id} className="appointment-card">
                                    <div className="appointment-day">
                                        <span className="day-number">{app.dia}</span>
                                    </div>
                                    <div className="appointment-details">
                                        <div className="appointment-header">
                                            <strong>{app.medico}</strong> – {app.especialidade}
                                        </div>
                                        <div className="appointment-info">
                                            {app.tipo} - {app.horario}
                                            {app.duracao && ` - ${app.duracao}`}
                                            {app.local && <span className="appointment-local"> - {app.local}</span>}
                                        </div>
                                    </div>
                                    <div className="appointment-status">
                                        <span className={`status-badge status-${app.status}`}>
                                            {app.statusText}
                                        </span>
                                    </div>
                                    <div className="appointment-action">
                                        <button 
                                            className={`action-btn btn-${app.botaoAcao}`}
                                            onClick={() => handleButtonClick(app.botaoAcao, app.medico)}
                                        >
                                            {app.botao}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-appointments">
                                <p>Nenhum agendamento para este mês</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}