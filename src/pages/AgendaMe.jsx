import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';

import foto1 from '../images/foto1.png';
import foto2 from '../images/foto2.png';
import foto3 from '../images/foto3.png';
import foto4 from '../images/foto4.png';

import '../styles/AgendaMe.css';

export default function AgendaMe() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState({
        diaSemana: "SEX",
        dia: 6,
        mes: "FEVEREIRO"
    });
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");

    // Dados dos agendamentos - SOMENTE PARA O DIA 6
    const agendamentosPorData = {
        6: [
            {
                horario: "08H00",
                duracao: "30 min",
                paciente: "Maria Helena",
                procedimento: "Revisão de lentes",
                tipo: "1ª consulta",
                modalidade: "Online",
                status: "Confirmado", // Status Confirmado
                botoes: ["Entrar"], // Botão Entrar que redireciona
                foto: foto1
            },
            {
                horario: "10H20",
                duracao: "30 min",
                paciente: "Gabriel Jorge",
                procedimento: "Check-up visual - retorno",
                tipo: "Retorno",
                modalidade: "Presencial",
                status: "Cancelado", // Status Cancelado
                botoes: [], // Sem botões
                foto: foto2
            },
            {
                horario: "11H40",
                duracao: "30 min",
                paciente: "Maria Helena",
                procedimento: "Revisão de lentes",
                tipo: "1ª consulta",
                modalidade: "Online",
                status: "Realizada",
                botoes: ["Prontuário"], // Apenas Prontuário
                foto: foto3
            },
            {
                horario: "14H00",
                duracao: "30 min",
                paciente: "Enaldo Santos",
                procedimento: "Retorno - avaliação",
                tipo: "Retorno",
                modalidade: "Presencial",
                status: "Confirmado", // Status Confirmado
                botoes: [], // Sem botões
                foto: foto4
            }
        ]
    };

    // Funções para navegar entre as datas
    const voltarData = () => {
        setCurrentDate(prev => {
            let novoSemana = prev.diaSemana;
            let novoDia = prev.dia - 1;
            let novoMes = prev.mes;
            
            if (novoDia < 1) {
                if (prev.mes === "FEVEREIRO") {
                    novoDia = 31;
                    novoMes = "JANEIRO";
                    novoSemana = "QUI";
                } else if (prev.mes === "JANEIRO") {
                    novoDia = 31;
                    novoMes = "DEZEMBRO";
                    novoSemana = "QUI";
                } else if (prev.mes === "MARÇO") {
                    novoDia = 28;
                    novoMes = "FEVEREIRO";
                    novoSemana = "QUI";
                }
            } else {
                const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
                const indexAtual = diasSemana.indexOf(prev.diaSemana);
                novoSemana = diasSemana[(indexAtual - 1 + 7) % 7];
            }
            
            return { diaSemana: novoSemana, dia: novoDia, mes: novoMes };
        });
    };

    const avancarData = () => {
        setCurrentDate(prev => {
            let novoSemana = prev.diaSemana;
            let novoDia = prev.dia + 1;
            let novoMes = prev.mes;
            
            if (novoDia > 31 && prev.mes === "JANEIRO") {
                novoDia = 1;
                novoMes = "FEVEREIRO";
                novoSemana = "SÁB";
            } else if (novoDia > 28 && prev.mes === "FEVEREIRO") {
                novoDia = 1;
                novoMes = "MARÇO";
                novoSemana = "SÁB";
            } else if (novoDia > 31 && prev.mes === "MARÇO") {
                novoDia = 1;
                novoMes = "ABRIL";
                novoSemana = "SÁB";
            } else {
                const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
                const indexAtual = diasSemana.indexOf(prev.diaSemana);
                novoSemana = diasSemana[(indexAtual + 1) % 7];
            }
            
            return { diaSemana: novoSemana, dia: novoDia, mes: novoMes };
        });
    };

    // Buscar agendamentos da data atual
    const agendamentosAtuais = agendamentosPorData[currentDate.dia] || [];

    // Filtrar agendamentos por modalidade
    const agendamentosFiltrados = agendamentosAtuais.filter(agenda => {
        if (filtroAtivo === "Todos") return true;
        if (filtroAtivo === "Online") return agenda.modalidade === "Online";
        if (filtroAtivo === "Presencial") return agenda.modalidade === "Presencial";
        return true;
    });

    const handleBotaoClick = (botao, paciente) => {
        if (botao === "Entrar") {
            // Redireciona para a página de consulta
            navigate('/consulta');
        } else if (botao === "Prontuário") {
            alert(`📋 Abrindo prontuário de ${paciente}`);
        }
    };

    const handleFiltroClick = (filtro) => {
        setFiltroAtivo(filtro);
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        switch(status) {
            case 'Confirmado': return 'status-confirmado';
            case 'Realizada': return 'status-realizada';
            case 'Cancelado': return 'status-cancelado';
            default: return '';
        }
    };

    return (
        <div className="agenda-container">
            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                <div className="medico-section">
                    <img src={doutora} alt="Dra. Marta" className="medico-img" />
                    <div className="medico-info">
                        <h4>Dra. Marta</h4>
                        <p>Dentista</p>
                    </div>
                </div>

                <div className="nav-section">
                    <h3>GERAL</h3>
                    <ul>
                        <li><Link to="/home-medico">Visão geral</Link></li>
                        <li className="active"><Link to="/agenda">Minha agenda</Link></li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>ATENDIMENTO</h3>
                    <ul>
                        <li><Link to="/consulta">Iniciar consulta</Link></li>
                        <li><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="logout">
                    <Link to="/">Desconectar</Link>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content">
                <div className="agenda-header">
                    <h1>MINHA AGENDA</h1>
                </div>

                {/* SELETOR DE DATA */}
                <div className="data-selector">
                    <button className="seta-btn" onClick={voltarData}>◀</button>
                    <div className="data-info">
                        <span className="dia-semana">{currentDate.diaSemana}</span>
                        <span className="dia-numero"> - {currentDate.dia}</span>
                        <span className="mes"> DE {currentDate.mes}</span>
                    </div>
                    <button className="seta-btn" onClick={avancarData}>▶</button>
                </div>

                {/* FILTROS */}
                <div className="filtros">
                    <button 
                        className={`filtro-btn ${filtroAtivo === "Todos" ? 'active' : ''}`}
                        onClick={() => handleFiltroClick("Todos")}
                    >
                        Todos
                    </button>
                    <button 
                        className={`filtro-btn ${filtroAtivo === "Online" ? 'active' : ''}`}
                        onClick={() => handleFiltroClick("Online")}
                    >
                        Online
                    </button>
                    <button 
                        className={`filtro-btn ${filtroAtivo === "Presencial" ? 'active' : ''}`}
                        onClick={() => handleFiltroClick("Presencial")}
                    >
                        Presencial
                    </button>
                </div>

                {/* LISTA DE AGENDAMENTOS */}
                <div className="agendamentos-lista">
                    {agendamentosFiltrados.length > 0 ? (
                        agendamentosFiltrados.map((agenda, index) => (
                            <div key={index} className="agendamento-card">
                                <div className="agendamento-horario">
                                    <span className="horario-principal">{agenda.horario}</span>
                                    <span className="duracao">{agenda.duracao}</span>
                                </div>

                                <div className="agendamento-paciente">
                                    <img src={agenda.foto} alt={agenda.paciente} className="paciente-foto" />
                                    <div className="paciente-dados">
                                        <h3>{agenda.paciente}</h3>
                                        <p>{agenda.procedimento}</p>
                                    </div>
                                </div>

                                <div className="agendamento-footer">
                                    <div className="agendamento-tags">
                                        {agenda.tipo && <span className="tag tipo">{agenda.tipo}</span>}
                                        <span className={`tag modalidade ${agenda.modalidade.toLowerCase()}`}>
                                            {agenda.modalidade}
                                        </span>
                                        {agenda.status && (
                                            <span className={`status-badge ${getStatusClass(agenda.status)}`}>
                                                {agenda.status}
                                            </span>
                                        )}
                                    </div>
                                    {/* Mostra botões apenas se houver */}
                                    {agenda.botoes.length > 0 && (
                                        <div className="agendamento-botoes">
                                            {agenda.botoes.map((botao, idx) => (
                                                <button 
                                                    key={idx} 
                                                    className={`btn-agenda ${botao.toLowerCase()}`}
                                                    onClick={() => handleBotaoClick(botao, agenda.paciente)}
                                                >
                                                    {botao}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <div className="no-results-icon">📅</div>
                            <h3>Nenhum agendamento</h3>
                            <p>Não há consultas agendadas para {currentDate.diaSemana} - {currentDate.dia} de {currentDate.mes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}