import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';

import '../styles/Disponibilidade.css';

export default function Disponibilidade() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({
        dia_semana: '',
        horario_inicio: '',
        horario_fim: ''
    });
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const diasSemana = [
        { id: 0, nome: 'Domingo' },
        { id: 1, nome: 'Segunda-feira' },
        { id: 2, nome: 'Terça-feira' },
        { id: 3, nome: 'Quarta-feira' },
        { id: 4, nome: 'Quinta-feira' },
        { id: 5, nome: 'Sexta-feira' },
        { id: 6, nome: 'Sábado' }
    ];

    // Função para formatar horário
    const formatarHorario = (horario) => {
        if (!horario) return '';
        return horario.substring(0, 5);
    };

    // Função auxiliar para formatar data corretamente
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

    // Função para corrigir datas nas mensagens
    const corrigirDatasNaMensagem = (mensagem) => {
        if (!mensagem) return mensagem;
        return mensagem.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1');
    };

    useEffect(() => {
        carregarDados();
    }, []);

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

            await carregarDisponibilidades(user.id);
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

    const carregarDisponibilidades = async (medicoId) => {
        try {
            const { data, error } = await supabase
                .from('medico_disponibilidade')
                .select('*')
                .eq('medico_id', medicoId)
                .eq('ativo', true)
                .order('dia_semana', { ascending: true })
                .order('horario_inicio', { ascending: true });

            if (error) throw error;

            setDisponibilidades(data || []);
        } catch (error) {
            console.error('Erro ao carregar disponibilidades:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar disponibilidades',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const handleAdicionar = () => {
        if (!formData.dia_semana || !formData.horario_inicio || !formData.horario_fim) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Preencha todos os campos!',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        if (formData.horario_inicio >= formData.horario_fim) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'O horário de início deve ser menor que o horário de fim!',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        setEditando({ id: null, dia_semana: formData.dia_semana });
        handleSalvar();
    };

    const handleSalvar = async () => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (editando && editando.id) {
                const { error } = await supabase
                    .from('medico_disponibilidade')
                    .update({
                        dia_semana: parseInt(formData.dia_semana),
                        horario_inicio: formData.horario_inicio,
                        horario_fim: formData.horario_fim
                    })
                    .eq('id', editando.id);

                if (error) throw error;

                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Disponibilidade atualizada!',
                    confirmButtonColor: '#6366f1',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const conflito = disponibilidades.some(d => 
                    d.dia_semana === parseInt(formData.dia_semana) &&
                    ((formData.horario_inicio >= d.horario_inicio && formData.horario_inicio < d.horario_fim) ||
                     (formData.horario_fim > d.horario_inicio && formData.horario_fim <= d.horario_fim) ||
                     (formData.horario_inicio <= d.horario_inicio && formData.horario_fim >= d.horario_fim))
                );

                if (conflito) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Conflito de horário!',
                        text: 'Já existe uma disponibilidade neste horário!',
                        confirmButtonColor: '#6366f1'
                    });
                    setLoading(false);
                    return;
                }

                const { error } = await supabase
                    .from('medico_disponibilidade')
                    .insert({
                        medico_id: user.id,
                        dia_semana: parseInt(formData.dia_semana),
                        horario_inicio: formData.horario_inicio,
                        horario_fim: formData.horario_fim,
                        ativo: true
                    });

                if (error) throw error;

                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Disponibilidade adicionada!',
                    confirmButtonColor: '#6366f1',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            setFormData({ dia_semana: '', horario_inicio: '', horario_fim: '' });
            setEditando(null);
            await carregarDisponibilidades(user.id);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao salvar disponibilidade',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (disponibilidade) => {
        setFormData({
            dia_semana: disponibilidade.dia_semana.toString(),
            horario_inicio: disponibilidade.horario_inicio,
            horario_fim: disponibilidade.horario_fim
        });
        setEditando({ id: disponibilidade.id, dia_semana: disponibilidade.dia_semana });
    };

    const handleExcluir = async (id) => {
        const result = await Swal.fire({
            title: 'Excluir horário?',
            text: 'Tem certeza que deseja excluir esta disponibilidade?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('medico_disponibilidade')
                .update({ ativo: false })
                .eq('id', id);

            if (error) throw error;

            const { data: { user } } = await supabase.auth.getUser();
            await carregarDisponibilidades(user.id);

            Swal.fire({
                icon: 'success',
                title: 'Excluído!',
                text: 'Disponibilidade removida com sucesso!',
                confirmButtonColor: '#6366f1',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Erro ao excluir:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao excluir disponibilidade',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        setFormData({ dia_semana: '', horario_inicio: '', horario_fim: '' });
        setEditando(null);
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

    const getNomeDia = (dia) => {
        const diaObj = diasSemana.find(d => d.id === dia);
        return diaObj ? diaObj.nome : '';
    };

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

    const disponibilidadesPorDia = {};
    disponibilidades.forEach(disp => {
        if (!disponibilidadesPorDia[disp.dia_semana]) {
            disponibilidadesPorDia[disp.dia_semana] = [];
        }
        disponibilidadesPorDia[disp.dia_semana].push(disp);
    });

    if (loading && !medico) {
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
                        <li><Link to="/home-medico">Visão geral</Link></li>
                        <li><Link to="/agenda">Minha agenda</Link></li>
                        <li className="active"><Link to="/disponibilidade">Disponibilidade</Link></li>
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
            <div className="disponibilidade-content">
                <div className="disponibilidade-header">
                    <div className="disponibilidade-title-center">
                        <h1>MINHA DISPONIBILIDADE</h1>
                        <p className="subtitle">Defina os horários que você está disponível para atendimento</p>
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

                {/* FORMULÁRIO */}
                <div className="form-card">
                    <h2>{editando ? 'Editar Horário' : 'Adicionar Horário'}</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Dia da semana</label>
                            <select
                                value={formData.dia_semana}
                                onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                                disabled={loading}
                            >
                                <option value="">Selecione o dia</option>
                                {diasSemana.map(dia => (
                                    <option key={dia.id} value={dia.id}>{dia.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Horário de início</label>
                            <input
                                type="time"
                                value={formData.horario_inicio}
                                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Horário de fim</label>
                            <input
                                type="time"
                                value={formData.horario_fim}
                                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group actions">
                            <button 
                                className="btn-salvar" 
                                onClick={handleAdicionar}
                                disabled={loading}
                            >
                                {editando ? 'Atualizar' : 'Adicionar'}
                            </button>
                            {editando && (
                                <button 
                                    className="btn-cancelar" 
                                    onClick={handleCancelar}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* LISTA DE DISPONIBILIDADES */}
                <div className="disponibilidade-list">
                    <h2>Horários cadastrados</h2>
                    {Object.keys(disponibilidadesPorDia).length === 0 ? (
                        <div className="no-data">
                            <p>Nenhum horário cadastrado</p>
                            <p>Adicione seus horários de disponibilidade acima.</p>
                        </div>
                    ) : (
                        diasSemana.map(dia => {
                            const horarios = disponibilidadesPorDia[dia.id];
                            if (!horarios || horarios.length === 0) return null;
                            
                            return (
                                <div key={dia.id} className="dia-group">
                                    <h3 className="dia-titulo">{dia.nome}</h3>
                                    <div className="horarios-grid">
                                        {horarios.map(horario => (
                                            <div key={horario.id} className="horario-card">
                                                <div className="horario-info">
                                                    <span className="horario">
                                                        {formatarHorario(horario.horario_inicio)} - {formatarHorario(horario.horario_fim)}
                                                    </span>
                                                </div>
                                                <div className="horario-actions">
                                                    <button 
                                                        className="btn-editar"
                                                        onClick={() => handleEditar(horario)}
                                                        disabled={loading}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn-excluir"
                                                        onClick={() => handleExcluir(horario.id)}
                                                        disabled={loading}
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}