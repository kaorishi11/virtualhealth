import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';
import icon1 from '../images/agenda1.png';
import icon2 from '../images/agenda2.png';
import icontempo from '../images/icontempo.png';
import atencao from '../images/atencao.png';

import foto1 from '../images/foto1.png';
import foto2 from '../images/foto2.png';
import foto3 from '../images/foto3.png';
import foto4 from '../images/foto4.png';

import '../styles/HomeMe.css';

export default function HomeMe() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [tooltipData, setTooltipData] = useState(null);

    const consultasSemanais = [
        { dia: 'SEG', presencial: 8, online: 5 },
        { dia: 'TER', presencial: 6, online: 7 },
        { dia: 'QUA', presencial: 9, online: 4 },
        { dia: 'QUI', presencial: 5, online: 8 },
        { dia: 'SEX', presencial: 10, online: 6 },
        { dia: 'SÁB', presencial: 4, online: 3 }
    ];

    const maxConsultas = Math.max(...consultasSemanais.flatMap(d => [d.presencial, d.online]));
    const alturaMaxima = 90;

    const showToastMessage = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    const handleIniciarConsulta = (nome) => {
        showToastMessage(`🩺 Consulta com ${nome} iniciada!`);
        setTimeout(() => navigate('/consulta'), 1000);
    };

    const handleVerConsulta = (nome) => {
        showToastMessage(`📋 Detalhes da consulta de ${nome}`);
    };

    const consultasHoje = [
        { nome: "Maria Helena", tipo: "1ª consulta", horario: "08h00", modalidade: "Online", botao: "Ver", foto: foto1 },
        { nome: "Enaldo Santos", tipo: "Retorno", horario: "09h00", modalidade: "Presencial", botao: "Iniciar", foto: foto2 },
        { nome: "Luiza Helena", tipo: "Acompanhamento", horario: "14h30", modalidade: "Presencial", botao: "Ver", foto: foto3 },
        { nome: "Gabriel Jorge", tipo: "Avaliação", horario: "15h00", modalidade: "Online", botao: "Ver", foto: foto4 }
    ];

    const todasConsultas = [
        ...consultasHoje,
        { nome: "Ana Paula", tipo: "Retorno", horario: "16h30", modalidade: "Presencial" },
        { nome: "Carlos Eduardo", tipo: "1ª consulta", horario: "17h00", modalidade: "Online" },
    ];

    const semanas = [
        { dom: 2, seg: 3, ter: 4, qua: 5, qui: 6, sex: 7, sab: 8 },
        { dom: 9, seg: 10, ter: 11, qua: 12, qui: 13, sex: 14, sab: 15 },
        { dom: 16, seg: 17, ter: 18, qua: 19, qui: 20, sex: 21, sab: 22 },
        { dom: 23, seg: 24, ter: 25, qua: 26, qui: 27, sex: 28, sab: 29 }
    ];

    return (
        <div className="dashboard-container">
            {/* SIDEBAR ESTILO PERFIL DO PACIENTE */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                {/* Seção do médico com foto - organizada */}
                <div className="medico-section">
                    <div className="medico-avatar">
                        <img src={doutora} alt="Dra. Marta" className="medico-img" />
                    </div>
                    <div className="medico-info">
                        <h4>Dra. Marta</h4>
                        <p>Dentista</p>
                    </div>
                </div>

                <div className="nav-section">
                    <h3>GERAL</h3>
                    <ul>
                        <li className="active"><Link to="/home-medico">Visão geral</Link></li>
                        <li><Link to="/agenda">Minha agenda</Link></li>
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

            {/* MAIN CONTENT */}
            <div className="main-content">
                <div className="welcome-header">
                    <h1>SEJA BEM VINDA, <span>MARTA RODRIGUEZ</span></h1>
                    <p>Veja o que você tem hoje!</p>
                </div>

                <div className="stats-cards">
                    <div className="stat-card">
                        <img src={icon1} alt="" />
                        <div className="stat-info">
                            <h4>Consultas hoje</h4>
                            <p>5</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <img src={icon2} alt="" />
                        <div className="stat-info">
                            <h4>Pacientes este mês</h4>
                            <p>38</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <img src={icontempo} alt="" />
                        <div className="stat-info">
                            <h4>Aguardando</h4>
                            <p>2</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <img src={atencao} alt="" />
                        <div className="stat-info">
                            <h4>Exames pendentes</h4>
                            <p>3</p>
                        </div>
                    </div>
                </div>

                <div className="consultas-calendario">
                    <div className="consultas-hoje">
                        <div className="section-header">
                            <div className="section-header-left">
                                <img src={icontempo} alt="" />
                                <h2>CONSULTAS DE HOJE</h2>
                            </div>
                            <div className="ver-todas" onClick={() => setShowModal(true)}>Ver todas</div>
                        </div>

                        <div className="consultas-lista">
                            {consultasHoje.map((consulta, index) => (
                                <div key={index} className="consulta-item">
                                    <div className="consulta-info-wrapper">
                                        <img src={consulta.foto} alt="" className="consulta-foto" />
                                        <div className="consulta-dados">
                                            <h4>{consulta.nome}</h4>
                                            <p>{consulta.tipo}</p>
                                            <div className="consulta-meta">
                                                <span className="horario">{consulta.horario}</span>
                                                <span className={`modalidade ${consulta.modalidade.toLowerCase()}`}>
                                                    {consulta.modalidade}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        className={`btn-consulta ${consulta.botao.toLowerCase()}`}
                                        onClick={() => consulta.botao === 'Iniciar' 
                                            ? handleIniciarConsulta(consulta.nome) 
                                            : handleVerConsulta(consulta.nome)}
                                    >
                                        {consulta.botao}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="calendario-side">
                        <div className="calendario-mensal">
                            <h3 className="calendario-titulo">CALENDÁRIO</h3>
                            <div className="weekdays">
                                <span>DOM</span><span>SEG</span><span>TER</span>
                                <span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
                            </div>
                            {semanas.map((semana, idx) => (
                                <div key={idx} className="week-row">
                                    <span className={semana.dom === 18 ? 'dia-atual' : ''}>{semana.dom}</span>
                                    <span className={semana.seg === 18 ? 'dia-atual' : ''}>{semana.seg}</span>
                                    <span className={semana.ter === 18 ? 'dia-atual' : ''}>{semana.ter}</span>
                                    <span className={semana.qua === 18 ? 'dia-atual' : ''}>{semana.qua}</span>
                                    <span className={semana.qui === 18 ? 'dia-atual' : ''}>{semana.qui}</span>
                                    <span className={semana.sex === 18 ? 'dia-atual' : ''}>{semana.sex}</span>
                                    <span className={semana.sab === 18 ? 'dia-atual' : ''}>{semana.sab}</span>
                                </div>
                            ))}
                        </div>

                        <div className="consulta-semanal">
                            <h3>CONSULTA SEMANAL</h3>
                            <div className="tipos-atendimento">
                                <div className="tipo"><span className="dot presencial"></span><span>Presencial</span></div>
                                <div className="tipo"><span className="dot tele"></span><span>Tele</span></div>
                            </div>

                            <div className="grafico-barras">
                                {consultasSemanais.map((dia, index) => {
                                    const alturaPresencial = (dia.presencial / maxConsultas) * alturaMaxima;
                                    const alturaOnline = (dia.online / maxConsultas) * alturaMaxima;
                                    return (
                                        <div key={index} className="barra-item">
                                            <div className="barras-duplas">
                                                <div 
                                                    className="barra-presencial"
                                                    style={{ height: `${alturaPresencial}px` }}
                                                    onMouseEnter={() => setTooltipData({ tipo: 'Presencial', valor: dia.presencial, dia: dia.dia })}
                                                    onMouseLeave={() => setTooltipData(null)}
                                                >
                                                    {tooltipData?.dia === dia.dia && tooltipData?.tipo === 'Presencial' && (
                                                        <div className="tooltip-grafico">{tooltipData.valor}</div>
                                                    )}
                                                </div>
                                                <div 
                                                    className="barra-online"
                                                    style={{ height: `${alturaOnline}px` }}
                                                    onMouseEnter={() => setTooltipData({ tipo: 'Online', valor: dia.online, dia: dia.dia })}
                                                    onMouseLeave={() => setTooltipData(null)}
                                                >
                                                    {tooltipData?.dia === dia.dia && tooltipData?.tipo === 'Online' && (
                                                        <div className="tooltip-grafico">{tooltipData.valor}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <span>{dia.dia}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="legendas-finais">
                                <div className="legenda-final"><div className="legenda-cor presencial"></div><span>Presencial</span></div>
                                <div className="legenda-final"><div className="legenda-cor tele"></div><span>Tele</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Todas as Consultas</h2>
                            <button className="modal-fechar" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-lista">
                            {todasConsultas.map((consulta, index) => (
                                <div key={index} className="modal-consulta-item">
                                    <h4>{consulta.nome}</h4>
                                    <p>{consulta.tipo}</p>
                                    <div className="modal-meta">
                                        <span className="horario">{consulta.horario}</span>
                                        <span className={`modalidade ${consulta.modalidade.toLowerCase()}`}>
                                            {consulta.modalidade}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}