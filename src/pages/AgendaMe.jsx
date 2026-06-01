import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';

import '../styles/AgendaMe.css';

export default function AgendaMe() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);
    const [agendamentos, setAgendamentos] = useState([]);
    const [mesAtual, setMesAtual] = useState(new Date());
    const [mesNome, setMesNome] = useState('');
    const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Função auxiliar para formatar data corretamente (sem problemas de fuso horário)
    const formatarDataCorreta = (dataString) => {
        if (!dataString) return '';
        const date = new Date(dataString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Função para extrair o dia da data corretamente (sem problemas de fuso horário)
    const extrairDiaDaData = (dataString) => {
        if (!dataString) return null;
        const [ano, mes, dia] = dataString.split('-');
        return parseInt(dia, 10);
    };

    // Função para extrair o nome do dia da semana corretamente
    const extrairDiaSemana = (dataString) => {
        if (!dataString) return '';
        const [ano, mes, dia] = dataString.split('-');
        // Criar data UTC para evitar problemas de fuso
        const dataUTC = new Date(Date.UTC(parseInt(ano), parseInt(mes) - 1, parseInt(dia)));
        return dataUTC.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
    };

    // Função para extrair o número do dia
    const extrairNumeroDia = (dataString) => {
        if (!dataString) return '';
        const [ano, mes, dia] = dataString.split('-');
        return parseInt(dia, 10);
    };

    // Função para extrair o nome do mês
    const extrairNomeMes = (dataString) => {
        if (!dataString) return '';
        const [ano, mes, dia] = dataString.split('-');
        const dataUTC = new Date(Date.UTC(parseInt(ano), parseInt(mes) - 1, parseInt(dia)));
        return dataUTC.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' });
    };

    // Função para corrigir datas nas mensagens
    const corrigirDatasNaMensagem = (mensagem) => {
        if (!mensagem) return mensagem;
        return mensagem.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1');
    };

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
                    foto: medicoData.foto || ''
                });
            }

            // Buscar agendamentos do mês
            await carregarAgendamentos(user.id);
            await carregarNotificacoes(user.id);

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

    // Função para carregar notificações
    const carregarNotificacoes = async (medicoId) => {
        try {
            const { data, error } = await supabase
                .from("notificacoes")
                .select(`
                    *,
                    paciente:paciente_id (
                        id,
                        nome,
                        foto
                    )
                `)
                .eq("usuario_id", medicoId)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                const notificacoesProcessadas = data.map(notif => {
                    let mensagemCorrigida = notif.mensagem || '';
                    mensagemCorrigida = corrigirDatasNaMensagem(mensagemCorrigida);
                    
                    return {
                        id: notif.id,
                        title: notif.titulo,
                        message: mensagemCorrigida,
                        type: notif.tipo,
                        read: notif.lida,
                        time: formatarDataCorreta(notif.created_at),
                        pacienteNome: notif.paciente?.nome || null
                    };
                });
                
                setNotifications(notificacoesProcessadas);
            }
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        }
    };

    // Função para marcar notificação como lida
    const marcarNotificacaoLida = async (id) => {
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);
    };

    const carregarAgendamentos = async (medicoId) => {
        try {
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

    // Funções de notificação
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        await marcarNotificacaoLida(id);
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        
        for (const id of unreadIds) {
            await marcarNotificacaoLida(id);
        }
    };

    const closeNotifications = () => {
        setShowNotifications(false);
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'consulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                        <path d="M5 3h14"/>
                        <path d="M12 3v9"/>
                    </svg>
                );
            case 'teleconsulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m9 8 5 4-5 4V8z"/>
                    </svg>
                );
            case 'pagamento':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="6" width="20" height="12" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                        <circle cx="16" cy="14" r="1"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                );
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'teleconsulta': return 'teleconsulta';
            case 'pagamento': return 'pagamento';
            default: return 'sistema';
        }
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
                    <button onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/');
                    }}>Desconectar</button>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="agenda-content">
                <div className="agenda-header">
                    <div className="agenda-title-center">
                        <h1>MINHA AGENDA</h1>
                    </div>
                    <div className="header-actions">
                        <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                            <div className="notification-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL DE NOTIFICAÇÕES */}
                {showNotifications && (
                    <div className="notification-modal-overlay" onClick={closeNotifications}>
                        <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="notification-modal-header">
                                <h3>Notificações</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {unreadCount > 0 && (
                                        <button className="mark-all-btn" onClick={markAllAsRead}>
                                            Marcar todas
                                        </button>
                                    )}
                                    <button className="close-modal-btn" onClick={closeNotifications}>
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notif.id)}
                                        >
                                            <div className={`notification-icon-circle ${getTypeClass(notif.type)}`}>
                                                {getTypeIcon(notif.type)}
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-title">
                                                    {notif.title}
                                                </div>
                                                <div className="notification-message">{notif.message}</div>
                                                <div className="notification-time">{notif.time}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-notifications">
                                        <p>Nenhuma notificação no momento</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                                // Usar as funções auxiliares que extraem a data corretamente
                                const diaSemana = extrairDiaSemana(data);
                                const diaNumero = extrairNumeroDia(data);
                                const nomeMes = extrairNomeMes(data);
                                
                                return (
                                    <div key={data} className="appointment-date-group">
                                        <div className="date-header">
                                            <span className="date-day">{diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}</span>
                                            <span className="date-number">{diaNumero} de {nomeMes}</span>
                                        </div>
                                        
                                        {agendamentosPorData[data].map(ag => (
                                            <div key={ag.id} className="appointment-card">
                                                <div className="appointment-time">
                                                    <span className="time">{ag.horario}</span>
                                                </div>
                                                <div className="appointment-details">
                                                    <div className="appointment-header">
                                                        <strong>{ag.paciente}</strong>
                                                        {ag.telefone && <span className="appointment-phone">{ag.telefone}</span>}
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
                                                                {ag.tipo === 'Teleconsulta' ? 'Entrar' : 'Iniciar'}
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