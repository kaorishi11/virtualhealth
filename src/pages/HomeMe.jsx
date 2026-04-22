import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';
import icon1 from '../images/agenda1.png';
import icon2 from '../images/agenda2.png';
import icontempo from '../images/icontempo.png';
import atencao from '../images/atencao.png';

// Importando as fotos dos pacientes
import foto1 from '../images/foto1.png';
import foto2 from '../images/foto2.png';
import foto3 from '../images/foto3.png';
import foto4 from '../images/foto4.png';

import '../styles/HomeMe.css';

export default function HomeMe() {
    // Dados das consultas do dia com fotos
    const consultasHoje = [
        { 
            nome: "Maria Helena", 
            tipo: "1º consulta", 
            horario: "08h00", 
            modalidade: "Online", 
            botao: null,
            foto: foto1
        },
        { 
            nome: "Enaldo Santos", 
            tipo: "Retorno", 
            horario: "08h00", 
            modalidade: "Presencial", 
            botao: "Iniciar",
            foto: foto2
        },
        { 
            nome: "Luiza Helena", 
            tipo: "Acompanhamento", 
            horario: "14h30", 
            modalidade: "Presencial", 
            botao: "Ver",
            foto: foto3
        },
        { 
            nome: "Gabriel Jorge", 
            tipo: "Avaliação", 
            horario: "15h00", 
            modalidade: "Online", 
            botao: "Ver",
            foto: foto4
        }
    ];

    // Dias do calendário com destaque para o dia atual (18)
    const semanas = [
        { dom: 2, seg: 3, ter: 4, qua: 5, qui: 6, sex: 7, sab: 8 },
        { dom: 9, seg: 10, ter: 11, qua: 12, qui: 13, sex: 14, sab: 15 },
        { dom: 16, seg: 17, ter: 18, qua: 19, qui: 20, sex: 21, sab: 22 },
        { dom: 23, seg: 24, ter: 25, qua: 26, qui: 27, sex: 28, sab: 1 }
    ];

    // Consulta semanal
    const diasSemana = [
        { dia: "SEG", presencial: true, tele: false },
        { dia: "TER", presencial: false, tele: true },
        { dia: "QUA", presencial: true, tele: false },
        { dia: "QUI", presencial: false, tele: true },
        { dia: "SEX", presencial: true, tele: false },
        { dia: "SÁB", presencial: false, tele: false }
    ];

    return (
        <div className="dashboard-container">
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
                            <li className="active"><Link to="/home-medico">Visão geral</Link></li>
                            <li><Link to="/agenda"><img src={planilha} alt="icon"/>Minha agenda</Link></li>
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
                <div className='welcome-header'>
                    <h1>SEJA BEM VINDA, <span>MARTA RODRIGUEZ</span></h1>
                    <p>Veja o que você tem hoje!</p>
                </div>

                {/* CARDS DE ESTATÍSTICAS */}
                <div className='stats-cards'>
                    <div className='stat-card'>
                        <img src={icon1} alt='Consultas' />
                        <div className='stat-info'>
                            <h4>Consultas hoje</h4>
                            <p>5</p>
                        </div>
                    </div>
                    <div className='stat-card'>
                        <img src={icon2} alt='Pacientes' />
                        <div className='stat-info'>
                            <h4>Pacientes este mês</h4>
                            <p>38</p>
                        </div>
                    </div>
                    <div className='stat-card'>
                        <img src={icontempo} alt='Aguardando' />
                        <div className='stat-info'>
                            <h4>Aguardando</h4>
                            <p>2</p>
                        </div>
                    </div>
                    <div className='stat-card'>
                        <img src={atencao} alt='Exames' />
                        <div className='stat-info'>
                            <h4>Exames pendentes</h4>
                            <p>3</p>
                        </div>
                    </div>
                </div>

                {/* CONSULTAS E CALENDÁRIO */}
                <div className='consultas-calendario'>
                    {/* CONSULTAS DE HOJE */}
                    <div className='consultas-hoje'>
                        <div className='section-header'>
                            <img src={icontempo} alt='tempo' />
                            <h2>CONSULTAS DE HOJE</h2>
                        </div>

                        <div className='consultas-lista'>
                            {consultasHoje.map((consulta, index) => (
                                <div key={index} className='consulta-item'>
                                    <div className='consulta-info-wrapper'>
                                        <img src={consulta.foto} alt={consulta.nome} className='consulta-foto' />
                                        <div className='consulta-dados'>
                                            <h4>{consulta.nome}</h4>
                                            <p>{consulta.tipo}</p>
                                            <div className='consulta-meta'>
                                                <span className='horario'>{consulta.horario}</span>
                                                <span className={`modalidade ${consulta.modalidade.toLowerCase()}`}>
                                                    {consulta.modalidade}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {consulta.botao && (
                                        <button className={`btn-consulta ${consulta.botao.toLowerCase()}`}>
                                            {consulta.botao}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CALENDÁRIO E CONSULTA SEMANAL */}
                    <div className='calendario-side'>
                        {/* CALENDÁRIO MENSAL */}
                        <div className='calendario-mensal'>
                            <h3 className='calendario-titulo'>CALENDÁRIO</h3>
                            <div className='calendario-header'>
                                <div className='weekdays'>
                                    <span>DOM</span><span>SEG</span><span>TER</span>
                                    <span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
                                </div>
                            </div>
                            <div className='calendario-dias'>
                                {semanas.map((semana, idx) => (
                                    <div key={idx} className='week-row'>
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
                        </div>

                        {/* CONSULTA SEMANAL */}
                        <div className='consulta-semanal'>
                            <h3>CONSULTA SEMANAL</h3>
                            <div className='tipos-atendimento'>
                                <div className='tipo'>
                                    <span className='dot presencial'></span>
                                    <span>PRESENCIAL</span>
                                </div>
                                <div className='tipo'>
                                    <span className='dot tele'></span>
                                    <span>Tele</span>
                                </div>
                            </div>
                            <div className='dias-semana'>
                                {diasSemana.map((dia, idx) => (
                                    <div key={idx} className='dia-item'>
                                        <span className='dia-nome'>{dia.dia}</span>
                                        <div className='indicadores'>
                                            {dia.presencial && <span className='indicador presencial'></span>}
                                            {dia.tele && <span className='indicador tele'></span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}