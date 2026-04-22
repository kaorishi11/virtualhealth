import { useState } from 'react';
import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';

import foto1 from '../images/foto1.png';
import foto2 from '../images/foto2.png';
import foto4 from '../images/foto4.png';

import '../styles/AgendaMe.css';

export default function AgendaMe() {
    const [currentDate, setCurrentDate] = useState({
        diaSemana: "SEX",
        dia: 6,
        mes: "FEVEREIRO"
    });

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

    // Dados dos agendamentos
    const agendamentos = [
        {
            horario: "08H00",
            duracao: "30 min",
            paciente: "Maria Helena",
            procedimento: "Revisão de lentes",
            tipo: "1ª consulta",
            modalidade: "Online",
            status: null,
            botoes: [],
            foto: foto1
        },
        {
            horario: "10H20",
            duracao: "30 min",
            paciente: "Gabriel Jorge",
            procedimento: "Check-up visual retorna",
            tipo: "",
            modalidade: "Presencial",
            status: null,
            botoes: ["Iniciar", "Cancelar"],
            foto: foto2
        },
        {
            horario: "11H40",
            duracao: "30 min",
            paciente: "Maria Helena",
            procedimento: "Revisão de lentes",
            tipo: "1ª consulta",
            modalidade: "Online",
            status: null,
            botoes: ["Prontuário", "Realizada"],
            foto: foto4
        }
    ];

    const handleBotaoClick = (botao, paciente) => {
        alert(`${botao} clicado para ${paciente}`);
    };

    const handleFiltroClick = (filtro) => {
        alert(`Filtrar por: ${filtro}`);
    };

    return (
        <div className="agenda-container">
            {/* SIDEBAR */}
            <div className='sidebar'>
                <div className="sidebar-logo">
                    <img src={logo} alt='Logo' className='logo-medico' />
                </div>
                
                <Link to="/perfil-medico" className="perfil-link">
                    <div className='perfil-medico'>
                        <img src={doutora} alt='Doutora' className='avatar-medico' />
                        <h2>Dra. Marta</h2>
                        <p>Dentista</p>
                    </div>
                </Link>

                <div className='menu-lateral'>
                    <div className='menu-section'>
                        <h3>GERAL</h3>
                        <ul>
                            <li><Link to="/home-medico">Visão geral</Link></li>
                            <li className="active"><Link to="/agenda"><img src={planilha} alt="icon"/>Minha agenda</Link></li>
                        </ul>
                    </div>

                    <div className='menu-section'>
                        <h3>ATENDIMENTO</h3>
                        <ul>
                            <li><Link to="/consulta">Iniciar consulta</Link></li>
                            <li><Link to="/dicas"><img src={planisaude} alt="icon"/>Dicas de saúde</Link></li>
                        </ul>
                    </div>
                
                    <div className="logout">
                        <Link to="/">Desconectar</Link>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className='main-content'>
                <div className='agenda-header'>
                    <h1>MINHA AGENDA</h1>
                </div>

                {/* SELETOR DE DATA COM SETINHAS FUNCIONAIS */}
                <div className='data-selector'>
                    <button className="seta-btn" onClick={voltarData}>◀</button>
                    <div className="data-info">
                        <span className="dia-semana">{currentDate.diaSemana}</span>
                        <span className="dia-numero"> - {currentDate.dia}</span>
                        <span className="mes"> DE {currentDate.mes}</span>
                    </div>
                    <button className="seta-btn" onClick={avancarData}>▶</button>
                </div>

                {/* FILTROS */}
                <div className='filtros'>
                    <button className="filtro-btn" onClick={() => handleFiltroClick("Todos")}>Todos</button>
                    <button className="filtro-btn online" onClick={() => handleFiltroClick("Online")}>Online</button>
                    <button className="filtro-btn presencial" onClick={() => handleFiltroClick("Presencial")}>Presencial</button>
                </div>

                {/* LISTA DE AGENDAMENTOS */}
                <div className='agendamentos-lista'>
                    {agendamentos.map((agenda, index) => (
                        <div key={index} className='agendamento-card'>
                            {/* Horário e duração */}
                            <div className='agendamento-horario'>
                                <span className="horario-principal">{agenda.horario}</span>
                                <span className="duracao">{agenda.duracao}</span>
                            </div>

                            {/* Informações do paciente */}
                            <div className='agendamento-paciente'>
                                <img src={agenda.foto} alt={agenda.paciente} className="paciente-foto" />
                                <div className="paciente-dados">
                                    <h3>{agenda.paciente}</h3>
                                    <p>{agenda.procedimento}</p>
                                </div>
                            </div>

                            {/* Tags e botões */}
                            <div className='agendamento-footer'>
                                <div className='agendamento-tags'>
                                    {agenda.tipo && <span className="tag tipo">{agenda.tipo}</span>}
                                    <span className={`tag modalidade ${agenda.modalidade.toLowerCase()}`}>
                                        {agenda.modalidade}
                                    </span>
                                </div>
                                <div className='agendamento-botoes'>
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}