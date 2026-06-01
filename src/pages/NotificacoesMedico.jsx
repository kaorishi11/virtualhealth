import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

import logo from '../images/logo.png';
import '../styles/NotificacoesMedico.css';

export default function NotificacoesMedico() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [filter, setFilter] = useState('todas'); // todas, nao_lidas, lidas
    const [fotoErro, setFotoErro] = useState(false); // CORRIGIDO: adicionado estado da foto

    // Funções para iniciais
    const getIniciais = (nome) => {
        if (!nome) return '?';
        const nomes = nome.trim().split(' ');
        if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
        return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
    };

    // CORRIGIDO: função getPrimeiroNome adicionada
    const getPrimeiroNome = () => {
        if (!medico?.nome) return '';
        const partes = medico.nome.trim().split(' ');
        return partes[0];
    };

    // CORRIGIDO: função getSobrenome adicionada
    const getSobrenome = () => {
        if (!medico?.nome) return '';
        const partes = medico.nome.trim().split(' ');
        if (partes.length === 1) return '';
        return partes.slice(1).join(' ');
    };

    const getCorFundo = (nome) => {
        if (!nome) return '#6366f1';
        
        const cores = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6'
        ];
        
        let hash = 0;
        for (let i = 0; i < nome.length; i++) {
            hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % cores.length;
        return cores[index];
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            
            // Pegar usuário logado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                navigate("/");
                return;
            }

            // Buscar dados do médico
            const { data: medicoData, error: medicoError } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", user.id)
                .single();

            if (medicoError) {
                console.error("Erro ao buscar médico:", medicoError);
                return;
            }

            if (medicoData && medicoData.tipo === 'medico') {
                setMedico(medicoData);
                await carregarNotificacoes(medicoData.id);
            } else {
                navigate("/home-paciente");
            }
            
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const carregarNotificacoes = async (medicoId) => {
        try {
            const { data, error } = await supabase
                .from("notificacoes")
                .select("*")
                .eq("usuario_id", medicoId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const notificacoesFormatadas = data.map(notif => ({
                id: notif.id,
                titulo: notif.titulo,
                mensagem: notif.mensagem,
                tipo: notif.tipo,
                lida: notif.lida,
                data: new Date(notif.created_at).toLocaleDateString('pt-BR'),
                hora: new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                link: notif.link
            }));

            setNotifications(notificacoesFormatadas);
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        }
    };

    const marcarComoLida = async (id) => {
        try {
            const { error } = await supabase
                .from("notificacoes")
                .update({ lida: true })
                .eq("id", id);

            if (error) throw error;

            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === id ? { ...notif, lida: true } : notif
                )
            );
        } catch (error) {
            console.error("Erro ao marcar como lida:", error);
        }
    };

    const marcarTodasComoLidas = async () => {
        const naoLidas = notifications.filter(n => !n.lida);
        
        for (const notif of naoLidas) {
            await supabase
                .from("notificacoes")
                .update({ lida: true })
                .eq("id", notif.id);
        }

        setNotifications(prev => 
            prev.map(notif => ({ ...notif, lida: true }))
        );
    };

    const excluirNotificacao = async (id) => {
        try {
            const { error } = await supabase
                .from("notificacoes")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setNotifications(prev => prev.filter(notif => notif.id !== id));
        } catch (error) {
            console.error("Erro ao excluir notificação:", error);
        }
    };

    const excluirTodasLidas = async () => {
        const lidas = notifications.filter(n => n.lida);
        
        for (const notif of lidas) {
            await supabase
                .from("notificacoes")
                .delete()
                .eq("id", notif.id);
        }

        setNotifications(prev => prev.filter(notif => !notif.lida));
    };

    const getTipoIcon = (tipo) => {
        switch(tipo) {
            case 'consulta':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                        <path d="M5 3h14"/>
                        <path d="M12 3v9"/>
                    </svg>
                );
            case 'teleconsulta':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m9 8 5 4-5 4V8z"/>
                    </svg>
                );
            case 'pagamento':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="6" width="20" height="12" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                        <circle cx="16" cy="14" r="1"/>
                    </svg>
                );
            default:
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                );
        }
    };

    const getTipoCor = (tipo) => {
        switch(tipo) {
            case 'consulta': return '#10b981';
            case 'teleconsulta': return '#6366f1';
            case 'pagamento': return '#f59e0b';
            default: return '#6c757d';
        }
    };

    const notificacoesFiltradas = notifications.filter(notif => {
        if (filter === 'nao_lidas') return !notif.lida;
        if (filter === 'lidas') return notif.lida;
        return true;
    });

    const naoLidasCount = notifications.filter(n => !n.lida).length;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando notificações...</p>
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
                                style={{ backgroundColor: getCorFundo(medico?.nome) }}
                            >
                                {getIniciais(medico?.nome)}
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
                        <li><Link to="/disponibilidade">Disponibilidade</Link></li>
                        <li className="active"><Link to="/notificacoesme">Notificações</Link></li>
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
            <div className="main-content">
                <div className="notificacoes-header">
                    <h1>NOTIFICAÇÕES</h1>
                    {naoLidasCount > 0 && (
                        <span className="badge">{naoLidasCount} não lidas</span>
                    )}
                </div>


                {/* LISTA DE NOTIFICAÇÕES */}
                <div className="notificacoes-list">
                    {notificacoesFiltradas.length === 0 ? (
                        <div className="empty-state">
                            <h3>Nenhuma notificação</h3>
                            <p>Você não tem notificações no momento.</p>
                        </div>
                    ) : (
                        notificacoesFiltradas.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`notification-card ${!notif.lida ? 'unread' : ''}`}
                                onClick={() => !notif.lida && marcarComoLida(notif.id)}
                            >
                                <div 
                                    className="notification-icon"
                                    style={{ backgroundColor: getTipoCor(notif.tipo) }}
                                >
                                    {getTipoIcon(notif.tipo)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h3>{notif.titulo}</h3>
                                        <div className="notification-meta">
                                            <span className="date">{notif.data}</span>
                                            <span className="time">{notif.hora}</span>
                                        </div>
                                    </div>
                                    <p className="notification-message">{notif.mensagem}</p>
                                    <div className="notification-footer">
                                        {!notif.lida && (
                                            <span className="unread-badge">Não lida</span>
                                        )}
                                        <button 
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                excluirNotificacao(notif.id);
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}