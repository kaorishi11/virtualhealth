import { useState } from 'react';
import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';
import fotoPaciente from '../images/foto2.png';

import '../styles/ConsultaMe.css';

export default function ConsultaMe() {
    const [anotacoes, setAnotacoes] = useState('');
    const [prontuarioSalvo, setProntuarioSalvo] = useState(false);

    const handleSalvarProntuario = () => {
        if (anotacoes.trim() === '') {
            alert('Por favor, escreva suas anotações antes de salvar o prontuário!');
            return;
        }
        setProntuarioSalvo(true);
        alert('Prontuário salvo com sucesso!');
        setTimeout(() => setProntuarioSalvo(false), 3000);
    };

    const handleEntrarVideo = () => {
        alert('Entrando na vídeo-chamada...');
    };

    return (
        <div className="consulta-container">
            {/* SIDEBAR */}
            <div className='sidebar'>
                <div className="sidebar-logo">
                    <img src={logo} alt='Logo' className='logo-medico' />
                </div>
                
                {/* PERFIL DO MÉDICO COM LINK */}
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
                            <li><Link to="/agenda"><img src={planilha} alt="icon"/>Minha agenda</Link></li>
                        </ul>
                    </div>

                    <div className='menu-section'>
                        <h3>ATENDIMENTO</h3>
                        <ul>
                            <li className="active"><Link to="/consulta">Iniciar consulta</Link></li>
                            <li><Link to="/dicas"><img src={planisaude} alt="icon"/>Dicas de saúde</Link></li>
                        </ul>
                    </div>
                
                    <div className="logout">
                        <Link to="/">Desconectar</Link>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL - continua igual */}
            <div className='main-content'>
                <div className='consulta-header'>
                    <h1>TELECONSULTA</h1>
                </div>

                <div className='consulta-grid'>
                    <div className='video-area'>
                        <div className='medico-card'>
                            <div className='medico-info'>
                                <img src={doutora} alt="Dra Marta" className='medico-foto' />
                                <div className='medico-dados'>
                                    <h3>Dra Marta</h3>
                                    <p>(Você)</p>
                                </div>
                            </div>
                            <button className="btn-video" onClick={handleEntrarVideo}>
                                Entrar na vídeo-chamada
                            </button>
                        </div>
                    </div>

                    <div className='paciente-area'>
                        <div className='paciente-card'>
                            <div className='paciente-header'>
                                <img src={fotoPaciente} alt="Paciente" className='paciente-foto-grande' />
                                <div className='paciente-info'>
                                    <h2>Enaldo Santos</h2>
                                    <p>32 anos · 1º consulta</p>
                                </div>
                            </div>

                            <div className='consulta-detalhes'>
                                <div className='detalhe-item'>
                                    <span className="detalhe-label">Motivo:</span>
                                    <span className="detalhe-valor destaque">Excesso de cáries no dente</span>
                                </div>
                                <div className='detalhe-item'>
                                    <span className="detalhe-label">Horário:</span>
                                    <span className="detalhe-valor">14h50</span>
                                </div>
                            </div>

                            <div className='anotacoes-area'>
                                <label>FAÇA SUAS ANOTAÇÕES</label>
                                <textarea 
                                    placeholder="Digite aqui suas observações sobre a consulta..."
                                    value={anotacoes}
                                    onChange={(e) => setAnotacoes(e.target.value)}
                                    rows="6"
                                />
                            </div>

                            <button className="btn-salvar" onClick={handleSalvarProntuario}>
                                {prontuarioSalvo ? '✓ PRONTUÁRIO SALVO!' : 'Salvar prontuário'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}