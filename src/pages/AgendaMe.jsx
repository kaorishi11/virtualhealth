import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';

import '../styles/AgendaMe.css';

export default function AgendaMe() {
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);
    const [agendamentos, setAgendamentos] = useState([]);
    const [mesAtual, setMesAtual] = useState(new Date());
    const [mesNome, setMesNome] = useState('');
    const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

    // Buscar dados do médico e agendamentos
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
                    foto: medicoData.foto || ''
                });
            }

            // Buscar agendamentos do mês
            await carregarAgendamentos(user.id);

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

    const carregarAgendamentos = async (medicoId) => {
        try {
            // Pegar primeiro e último dia do mês
            const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
            const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
            
            const dataInicio = primeiroDia.toISOString().split('T')[0];
            const dataFim = ultimoDia.toISOString().split('T')[0];

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
                .gte('data_consulta', dataInicio)
                .lte('data_consulta', dataFim)
                .order('data_consulta', { ascending: true })
                .order('horario', { ascending: true });

            if (error) throw error;

            // Formatar agendamentos
            const agendamentosFormatados = data.map(ag => ({
                id: ag.id,
                paciente: ag.paciente?.nome || 'Paciente',
                telefone: ag.paciente?.telefone || '',
                data: ag.data_consulta,
                horario: ag.horario,
                tipo: ag.tipo === 'presencial' ? 'Presencial' : 'Teleconsulta',
                status: ag.status,
                link_teleconsulta: ag.link_teleconsulta
            }));

            setAgendamentos(agendamentosFormatados);
            
            // Atualizar nome do mês
            const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long' });
            setMesNome(nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1));
            setAnoAtual(mesAtual.getFullYear());

        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar agendamentos',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const mesAnterior = () => {
        setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
    };

    const proximoMes = () => {
        setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
    };

    const handleCancelarAgendamento = async (agendamento) => {
        const result = await Swal.fire({
            title: 'Cancelar agendamento',
            text: `Tem certeza que deseja cancelar o agendamento de ${agendamento.paciente}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Sim, cancelar',
            cancelButtonText: 'Voltar'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('agendamentos')
                .update({ status: 'cancelada' })
                .eq('id', agendamento.id);

            if (error) throw error;

            // Atualizar lista
            setAgendamentos(prev => prev.map(ag => 
                ag.id === agendamento.id ? { ...ag, status: 'cancelada' } : ag
            ));

            Swal.fire({
                icon: 'success',
                title: 'Cancelado!',
                text: 'Agendamento cancelado com sucesso!',
                confirmButtonColor: '#6366f1',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Erro ao cancelar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao cancelar agendamento',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConcluirAgendamento = async (agendamento) => {
        const result = await Swal.fire({
            title: 'Concluir consulta',
            text: `Marcar consulta de ${agendamento.paciente} como concluída?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Sim, concluir',
            cancelButtonText: 'Voltar'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('agendamentos')
                .update({ status: 'concluida' })
                .eq('id', agendamento.id);

            if (error) throw error;

            setAgendamentos(prev => prev.map(ag => 
                ag.id === agendamento.id ? { ...ag, status: 'concluida' } : ag
            ));

            Swal.fire({
                icon: 'success',
                title: 'Concluída!',
                text: 'Consulta marcada como concluída!',
                confirmButtonColor: '#6366f1',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Erro ao concluir:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao concluir consulta',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEntrarConsulta = (agendamento) => {
        if (agendamento.tipo === 'Teleconsulta' && agendamento.link_teleconsulta) {
            window.open(agendamento.link_teleconsulta, '_blank');
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Consulta Presencial',
                text: `Paciente: ${agendamento.paciente}\nHorário: ${agendamento.horario}\nCompareça ao consultório.`,
                confirmButtonColor: '#6366f1'
            });
        }
    };

    // Funções para a navbar (igual ao DicasMe)
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

    const getStatusBadge = (status) => {
        switch(status) {
            case 'agendada':
                return <span className="status-badge status-agendada">Agendada</span>;
            case 'concluida':
                return <span className="status-badge status-concluida">Concluída</span>;
            case 'cancelada':
                return <span className="status-badge status-cancelada">Cancelada</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    if (loading && !medico) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando...</p>
            </div>
        );
    }

    // Agrupar agendamentos por data
    const agendamentosPorData = agendamentos.reduce((acc, ag) => {
        const data = ag.data;
        if (!acc[data]) {
            acc[data] = [];
        }
        acc[data].push(ag);
        return acc;
    }, {});

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
                        <li><Link to="/home-medico">Visão geral</Link></li>
                        <li className='active'><Link to="/agenda">Minha agenda</Link></li>
                        <li><Link to="/disponibilidade">Disponibilidade</Link></li>
                        <li><Link to="/notificacoesme">Notificações</Link></li>
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

            {/* CONTEÚDO PRINCIPAL */}
            <div className="agenda-content">
                <h1>MINHA AGENDA</h1>

                <div className="mes-container">
                    <div className="mes-header">
                        <button className="month-nav-btn" onClick={mesAnterior}>
                            ◀ Anterior
                        </button>
                        <h2>{mesNome} {anoAtual}</h2>
                        <button className="month-nav-btn" onClick={proximoMes}>
                            Próximo ▶
                        </button>
                    </div>

                    <div className="appointments-list">
                        {Object.keys(agendamentosPorData).length === 0 ? (
                            <div className="no-appointments">
                                <p>Nenhum agendamento para este mês</p>
                                <p>Os agendamentos aparecerão aqui quando houver consultas marcadas.</p>
                            </div>
                        ) : (
                            Object.keys(agendamentosPorData).sort().map(data => {
                                const dataObj = new Date(data);
                                const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                                const diaNumero = dataObj.getDate();
                                const mesNome = dataObj.toLocaleDateString('pt-BR', { month: 'long' });
                                
                                return (
                                    <div key={data} className="appointment-date-group">
                                        <div className="date-header">
                                            <span className="date-day">{diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}</span>
                                            <span className="date-number">{diaNumero} de {mesNome}</span>
                                        </div>
                                        
                                        {agendamentosPorData[data].map(ag => (
                                            <div key={ag.id} className="appointment-card">
                                                <div className="appointment-time">
                                                    <span className="time">{ag.horario}</span>
                                                </div>
                                                <div className="appointment-details">
                                                    <div className="appointment-header">
                                                        <strong>{ag.paciente}</strong>
                                                        {ag.telefone && <span className="appointment-phone">📞 {ag.telefone}</span>}
                                                    </div>
                                                    <div className="appointment-info">
                                                        <span className="appointment-type">{ag.tipo}</span>
                                                    </div>
                                                </div>
                                                <div className="appointment-status">
                                                    {getStatusBadge(ag.status)}
                                                </div>
                                                <div className="appointment-action">
                                                    {ag.status === 'agendada' && (
                                                        <>
                                                            <button 
                                                                className="action-btn btn-entrar"
                                                                onClick={() => handleEntrarConsulta(ag)}
                                                            >
                                                                {ag.tipo === 'Teleconsulta' ? '🎥 Entrar' : '📍 Iniciar'}
                                                            </button>
                                                            <button 
                                                                className="action-btn btn-cancelar"
                                                                onClick={() => handleCancelarAgendamento(ag)}
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button 
                                                                className="action-btn btn-concluir"
                                                                onClick={() => handleConcluirAgendamento(ag)}
                                                            >
                                                                ✓ Concluir
                                                            </button>
                                                        </>
                                                    )}
                                                    {ag.status === 'concluida' && (
                                                        <button className="action-btn btn-relatorio" disabled>
                                                            ✓ Consulta Realizada
                                                        </button>
                                                    )}
                                                    {ag.status === 'cancelada' && (
                                                        <button className="action-btn btn-cancelado" disabled>
                                                            ✗ Cancelada
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}