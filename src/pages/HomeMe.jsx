import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';
import icon1 from '../images/agenda1.png';
import icon2 from '../images/agenda2.png';
import icontempo from '../images/icontempo.png';

import '../styles/HomeMe.css';

export default function HomeMe() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [tooltipData, setTooltipData] = useState(null);
    const [consultasHoje, setConsultasHoje] = useState([]);
    const [consultasSemanais, setConsultasSemanais] = useState([]);
    const [diasCalendario, setDiasCalendario] = useState([]);
    const [mesAtual, setMesAtual] = useState(new Date());
    const [stats, setStats] = useState({
        consultasHoje: 0,
        pacientesMes: 0,
        aguardando: 0
    });

    useEffect(() => {
        carregarDados();
    }, [mesAtual]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) throw userError;
            if (!user) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Usuário não está logado!',
                    confirmButtonColor: '#6366f1'
                });
                navigate('/');
                return;
            }

            // Buscar dados do médico
            const { data: medicoData, error: medicoError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single();

            if (medicoError && medicoError.code !== 'PGRST116') {
                throw medicoError;
            }

            if (medicoData) {
                setMedico({
                    id: medicoData.id,
                    nome: medicoData.nome,
                    email: user.email,
                    especialidade: medicoData.especialidade || 'Médico',
                    foto: medicoData.foto || '',
                    genero: medicoData.genero || 'masculino'
                });
            }

            // Carregar dados
            await carregarConsultasHoje(user.id);
            await carregarEstatisticas(user.id);
            await carregarConsultasSemanais(user.id);
            gerarCalendario();

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar dados',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const carregarConsultasHoje = async (medicoId) => {
        try {
            const hoje = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('agendamentos')
                .select(`
                    *,
                    paciente:usuarios!paciente_id (
                        nome,
                        telefone
                    )
                `)
                .eq('medico_id', medicoId)
                .eq('data_consulta', hoje)
                .eq('status', 'agendada')
                .order('horario', { ascending: true });

            if (error) throw error;

            const consultasFormatadas = data.map(ag => ({
                id: ag.id,
                nome: ag.paciente?.nome || 'Paciente',
                tipo: ag.tipo === 'presencial' ? 'Presencial' : 'Teleconsulta',
                horario: ag.horario,
                modalidade: ag.tipo === 'presencial' ? 'Presencial' : 'Online'
            }));

            setConsultasHoje(consultasFormatadas);
            setStats(prev => ({ ...prev, consultasHoje: consultasFormatadas.length }));

        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
        }
    };

    const carregarEstatisticas = async (medicoId) => {
        try {
            // Pacientes este mês
            const inicioMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
            const fimMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
            
            const inicioMesStr = inicioMes.toISOString().split('T')[0];
            const fimMesStr = fimMes.toISOString().split('T')[0];
            
            const { count: pacientesMes, error: countError } = await supabase
                .from('agendamentos')
                .select('*', { count: 'exact', head: true })
                .eq('medico_id', medicoId)
                .gte('data_consulta', inicioMesStr)
                .lte('data_consulta', fimMesStr);

            if (!countError) {
                setStats(prev => ({ ...prev, pacientesMes: pacientesMes || 0 }));
            }

            // Aguardando (consultas hoje não iniciadas)
            const hoje = new Date().toISOString().split('T')[0];
            const { count: aguardando, error: aguardandoError } = await supabase
                .from('agendamentos')
                .select('*', { count: 'exact', head: true })
                .eq('medico_id', medicoId)
                .eq('data_consulta', hoje)
                .eq('status', 'agendada');

            if (!aguardandoError) {
                setStats(prev => ({ ...prev, aguardando: aguardando || 0 }));
            }

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const carregarConsultasSemanais = async (medicoId) => {
        try {
            // Pegar data de início da semana (segunda-feira)
            const hoje = new Date();
            const diaSemana = hoje.getDay();
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
            
            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + 6);
            
            const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
            const fimSemanaStr = fimSemana.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('agendamentos')
                .select('*')
                .eq('medico_id', medicoId)
                .eq('status', 'agendada')
                .gte('data_consulta', inicioSemanaStr)
                .lte('data_consulta', fimSemanaStr);

            if (error) throw error;

            // Agrupar por dia da semana
            const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            const consultasPorDia = {};
            
            dias.forEach(dia => {
                consultasPorDia[dia] = { presencial: 0, online: 0 };
            });

            data.forEach(ag => {
                const dataObj = new Date(ag.data_consulta);
                const diaIndex = dataObj.getDay();
                // Converter para índice dos dias (SEG=0, TER=1, ...)
                let diaMap;
                if (diaIndex === 1) diaMap = 'SEG';
                else if (diaIndex === 2) diaMap = 'TER';
                else if (diaIndex === 3) diaMap = 'QUA';
                else if (diaIndex === 4) diaMap = 'QUI';
                else if (diaIndex === 5) diaMap = 'SEX';
                else if (diaIndex === 6) diaMap = 'SÁB';
                else return;
                
                if (ag.tipo === 'presencial') {
                    consultasPorDia[diaMap].presencial++;
                } else {
                    consultasPorDia[diaMap].online++;
                }
            });

            const consultasFormatadas = dias.map(dia => ({
                dia,
                presencial: consultasPorDia[dia].presencial,
                online: consultasPorDia[dia].online
            }));

            setConsultasSemanais(consultasFormatadas);

        } catch (error) {
            console.error('Erro ao carregar consultas semanais:', error);
            // Dados mock caso não tenha dados
            setConsultasSemanais([
                { dia: 'SEG', presencial: 0, online: 0 },
                { dia: 'TER', presencial: 0, online: 0 },
                { dia: 'QUA', presencial: 0, online: 0 },
                { dia: 'QUI', presencial: 0, online: 0 },
                { dia: 'SEX', presencial: 0, online: 0 },
                { dia: 'SÁB', presencial: 0, online: 0 }
            ]);
        }
    };

    const gerarCalendario = () => {
        const ano = mesAtual.getFullYear();
        const mes = mesAtual.getMonth();
        
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        
        const diasSemana = primeiroDia.getDay(); // 0 = Domingo
        const totalDias = ultimoDia.getDate();
        
        const dias = [];
        
        // Dias do mês anterior para completar a primeira semana
        const diasMesAnterior = diasSemana;
        const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
        
        for (let i = diasMesAnterior - 1; i >= 0; i--) {
            dias.push({
                dia: ultimoDiaMesAnterior - i,
                mesAtual: false,
                data: new Date(ano, mes - 1, ultimoDiaMesAnterior - i)
            });
        }
        
        // Dias do mês atual
        for (let i = 1; i <= totalDias; i++) {
            const dataAtual = new Date(ano, mes, i);
            const hoje = new Date();
            const isHoje = dataAtual.toDateString() === hoje.toDateString();
            
            dias.push({
                dia: i,
                mesAtual: true,
                isHoje: isHoje,
                data: dataAtual
            });
        }
        
        // Dias do próximo mês para completar o calendário (6 linhas)
        const diasRestantes = 42 - dias.length;
        for (let i = 1; i <= diasRestantes; i++) {
            dias.push({
                dia: i,
                mesAtual: false,
                data: new Date(ano, mes + 1, i)
            });
        }
        
        setDiasCalendario(dias);
    };

    const mudarMes = (incremento) => {
        const novoMes = new Date(mesAtual);
        novoMes.setMonth(mesAtual.getMonth() + incremento);
        setMesAtual(novoMes);
    };

    const showToastMessage = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    const handleIniciarConsulta = async (consulta) => {
        showToastMessage(`🩺 Consulta com ${consulta.nome} iniciada!`);
        setTimeout(() => navigate('/consulta'), 1000);
    };

    const handleVerConsulta = (consulta) => {
        showToastMessage(`📋 Detalhes da consulta de ${consulta.nome}`);
    };

    // Funções para a navbar
    const getIniciais = () => {
        if (!medico?.nome) return '?';
        const nomes = medico.nome.trim().split(' ');
        if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
        return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
    };

    const getCorFundo = () => {
        if (!medico?.nome) return '#6366f1';
        
        const cores = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6'
        ];
        
        let hash = 0;
        for (let i = 0; i < medico.nome.length; i++) {
            hash = medico.nome.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % cores.length;
        return cores[index];
    };

    const getPrimeiroNome = () => {
        if (!medico?.nome) return '';
        const partes = medico.nome.trim().split(' ');
        return partes[0];
    };

    const getSobrenome = () => {
        if (!medico?.nome) return '';
        const partes = medico.nome.trim().split(' ');
        if (partes.length === 1) return '';
        return partes.slice(1).join(' ');
    };

    // Definir saudação baseada no gênero
    const getSaudacao = () => {
        if (!medico?.genero) return 'Bem vindo(a)';
        if (medico.genero === 'feminino') return 'Bem vinda';
        return 'Bem vindo';
    };

    const maxConsultas = consultasSemanais.length > 0 
        ? Math.max(...consultasSemanais.flatMap(d => [d.presencial, d.online]), 1)
        : 1;
    const alturaMaxima = 90;

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                <div className="medico-section">
                    <div className="medico-img-wrapper">
                        {medico?.foto && !fotoErro ? (
                            <img 
                                src={medico.foto} 
                                className="medico-img" 
                                alt={medico.nome}
                                onError={() => setFotoErro(true)}
                            />
                        ) : (
                            <div 
                                className="medico-img-iniciais"
                                style={{ backgroundColor: getCorFundo() }}
                            >
                                {getIniciais()}
                            </div>
                        )}
                    </div>
                    <div className="medico-info">
                        <h4>
                            <span className="primeiro-nome">{getPrimeiroNome()}</span>
                            {getSobrenome() && (
                                <span className="sobrenome">{getSobrenome()}</span>
                            )}
                        </h4>
                        <p>{medico?.especialidade || 'Médico'}</p>
                    </div>
                </div>

                <div className="nav-section">
                    <h3>GERAL</h3>
                    <ul>
                        <li className="active"><Link to="/home-medico">Visão geral</Link></li>
                        <li><Link to="/agenda">Minha agenda</Link></li>
                        <li><Link to="/disponibilidade">Disponibilidade</Link></li>
                        <li><Link to="/perfil-medico">Perfil</Link></li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>ATENDIMENTO</h3>
                    <ul>
                        <li><Link to="/consulta">Iniciar consulta</Link></li>
                        <li><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="spacer"></div>

                <div className="logout">
                    <Link to="/">Desconectar</Link>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                <div className="welcome-header">
                    <h1>{getSaudacao()}, <span>{getPrimeiroNome()}</span></h1>
                    <p>Veja o que você tem hoje!</p>
                </div>

                <div className="stats-cards">
                    <div className="stat-card">
                        <img src={icon1} alt="" />
                        <div className="stat-info">
                            <h4>Consultas hoje</h4>
                            <p>{stats.consultasHoje}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <img src={icon2} alt="" />
                        <div className="stat-info">
                            <h4>Pacientes este mês</h4>
                            <p>{stats.pacientesMes}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <img src={icontempo} alt="" />
                        <div className="stat-info">
                            <h4>Aguardando</h4>
                            <p>{stats.aguardando}</p>
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
                            {consultasHoje.length > 4 && (
                                <div className="ver-todas" onClick={() => setShowModal(true)}>Ver todas</div>
                            )}
                        </div>

                        <div className="consultas-lista">
                            {consultasHoje.slice(0, 4).map((consulta, index) => (
                                <div key={consulta.id || index} className="consulta-item">
                                    <div className="consulta-info-wrapper">
                                        <div className="consulta-foto-iniciais" style={{ backgroundColor: getCorFundo() }}>
                                            {consulta.nome?.charAt(0) || 'P'}
                                        </div>
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
                                        className={`btn-consulta ${consulta.modalidade === 'Presencial' ? 'iniciar' : 'ver'}`}
                                        onClick={() => consulta.modalidade === 'Presencial' 
                                            ? handleIniciarConsulta(consulta) 
                                            : handleVerConsulta(consulta)}
                                    >
                                        {consulta.modalidade === 'Presencial' ? 'Iniciar' : 'Ver'}
                                    </button>
                                </div>
                            ))}
                            {consultasHoje.length === 0 && (
                                <div className="nenhuma-consulta">
                                    <p>Nenhuma consulta agendada para hoje</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="calendario-side">
                        <div className="calendario-mensal">
                            <div className="calendario-header">
                                <button className="mes-nav-btn" onClick={() => mudarMes(-1)}>◀</button>
                                <h3>{meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}</h3>
                                <button className="mes-nav-btn" onClick={() => mudarMes(1)}>▶</button>
                            </div>
                            <div className="weekdays">
                                <span>DOM</span><span>SEG</span><span>TER</span>
                                <span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
                            </div>
                            <div className="calendario-dias">
                                {diasCalendario.map((dia, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`dia-calendario ${!dia.mesAtual ? 'outro-mes' : ''} ${dia.isHoje ? 'dia-hoje' : ''}`}
                                    >
                                        {dia.dia}
                                    </div>
                                ))}
                            </div>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Todas as Consultas</h2>
                            <button className="modal-fechar" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-lista">
                            {consultasHoje.map((consulta, index) => (
                                <div key={consulta.id || index} className="modal-consulta-item">
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

            {/* TOAST */}
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}