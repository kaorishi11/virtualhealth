import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

import logo from '../images/logo.png';

import '../styles/DicasMe.css';

export default function DicasMe() {
    const navigate = useNavigate();
    const [novaDica, setNovaDica] = useState({ titulo: '', texto: '' });
    const [toast, setToast] = useState(null);
    const [modalExcluir, setModalExcluir] = useState(null);
    const [modalEditar, setModalEditar] = useState(null);
    const [dicas, setDicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

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

    // Buscar dados do médico logado e suas dicas
    useEffect(() => {
        carregarMedicoEDicas();
    }, []);

    const carregarMedicoEDicas = async () => {
        try {
            setLoading(true);
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) throw userError;
            if (!user) {
                showToast('Usuário não está logado!', true);
                setLoading(false);
                return;
            }

            // Buscar dados do médico
            const { data: medicoData, error: medicoError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single();

            let nomeMedico = 'Médico';
            
            if (medicoError && medicoError.code !== 'PGRST116') {
                throw medicoError;
            }

            if (medicoData) {
                nomeMedico = medicoData.nome;
                setMedico({
                    id: medicoData.id,
                    nome: medicoData.nome,
                    email: user.email,
                    especialidade: medicoData.especialidade || 'Médico',
                    foto: medicoData.foto || ''
                });
            }

            // Buscar dicas
            await carregarDicas(user.id, nomeMedico);
            await carregarNotificacoes(user.id);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    // Função para carregar notificações
    const carregarNotificacoes = async (usuarioId) => {
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
            .eq("usuario_id", usuarioId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (!error && data) {
            const notificacoesProcessadas = data.map(notif => {
                let mensagemCorrigida = notif.mensagem || '';
                mensagemCorrigida = corrigirDatasNaMensagem(mensagemCorrigida);
                
                return {
                    id: notif.id,
                    title: notif.titulo,
                    message: mensagemCorrigida,
                    type: notif.tipo,
                    read: notif.lida,
                    link: notif.link,
                    time: formatarDataCorreta(notif.created_at),
                    pacienteNome: notif.paciente?.nome || null
                };
            });
            setNotifications(notificacoesProcessadas);
        }
    };

    // Função para marcar notificação como lida
    const marcarNotificacaoLida = async (id) => {
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);
    };

    const carregarDicas = async (medicoId, nomeMedico) => {
        try {
            const { data, error } = await supabase
                .from('dicas')
                .select('*')
                .eq('medico_id', medicoId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            let nomeDoMedico = nomeMedico;
            if (!nomeDoMedico) {
                const { data: medicoData } = await supabase
                    .from('usuarios')
                    .select('nome')
                    .eq('id', medicoId)
                    .single();
                if (medicoData) {
                    nomeDoMedico = medicoData.nome;
                } else {
                    nomeDoMedico = 'Médico';
                }
            }

            const dicasFormatadas = data.map(dica => ({
                id: dica.id,
                titulo: dica.titulo || '',
                texto: dica.texto,
                autor: nomeDoMedico,
                especialidade: medico?.especialidade || 'Médico',
                data: formatarData(dica.created_at)
            }));

            setDicas(dicasFormatadas);

        } catch (error) {
            console.error('Erro ao carregar dicas:', error);
            showToast('Erro ao carregar dicas', true);
        }
    };

    const formatarData = (dataISO) => {
        if (!dataISO) return new Date().toLocaleDateString('pt-BR');
        return new Date(dataISO).toLocaleDateString('pt-BR');
    };

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    const getIniciais = (nome) => {
        if (!nome) return '?';
        const nomes = nome.trim().split(' ');
        if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
        return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
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

    const handlePublicarDica = async () => {
        if (novaDica.titulo.trim() === '') {
            showToast('Por favor, escreva um título para a dica!', true);
            return;
        }
        
        if (novaDica.texto.trim() === '') {
            showToast('Por favor, escreva o conteúdo da dica!', true);
            return;
        }

        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                showToast('Usuário não está logado!', true);
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('dicas')
                .insert([
                    {
                        medico_id: user.id,
                        titulo: novaDica.titulo,
                        texto: novaDica.texto,
                        created_at: new Date()
                    }
                ]);

            if (error) throw error;

            const nomeMedico = medico?.nome || 'Médico';
            await carregarDicas(user.id, nomeMedico);
            
            setNovaDica({ titulo: '', texto: '' });
            showToast('Dica publicada com sucesso!', false);

        } catch (error) {
            console.error('Erro ao publicar dica:', error);
            showToast('Erro ao publicar dica: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditarClick = (dica) => {
        console.log('Editando dica:', dica);
        setModalEditar({
            id: dica.id,
            titulo: dica.titulo,
            texto: dica.texto
        });
    };

    const handleConfirmarEditar = async () => {
        if (!modalEditar) return;

        console.log('Salvando edição:', modalEditar);

        if (modalEditar.titulo.trim() === '') {
            showToast('O título não pode estar vazio!', true);
            return;
        }

        if (modalEditar.texto.trim() === '') {
            showToast('O texto da dica não pode estar vazio!', true);
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('dicas')
                .update({
                    titulo: modalEditar.titulo,
                    texto: modalEditar.texto
                })
                .eq('id', modalEditar.id)
                .select();

            if (error) {
                console.error('Erro detalhado do Supabase:', error);
                throw error;
            }

            console.log('Dica atualizada com sucesso:', data);

            const { data: { user } } = await supabase.auth.getUser();
            const nomeMedico = medico?.nome || 'Médico';
            await carregarDicas(user.id, nomeMedico);
            
            showToast('Dica editada com sucesso!', false);
            setModalEditar(null);

        } catch (error) {
            console.error('Erro ao editar dica:', error);
            showToast('Erro ao editar dica: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirClick = (dica) => {
        setModalExcluir(dica);
    };

    const handleConfirmarExcluir = async () => {
        if (!modalExcluir) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('dicas')
                .delete()
                .eq('id', modalExcluir.id);

            if (error) throw error;

            setDicas(dicas.filter(d => d.id !== modalExcluir.id));
            showToast('Dica excluída com sucesso!', false);
            setModalExcluir(null);

        } catch (error) {
            console.error('Erro ao excluir dica:', error);
            showToast('Erro ao excluir dica: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarExcluir = () => {
        setModalExcluir(null);
    };

    const handleCancelarEditar = () => {
        setModalEditar(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    // Funções de notificação
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (id, link) => {
        await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
        setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
        if (link) navigate(link);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        const ids = notifications.map(n => n.id);
        if (ids.length) {
            await supabase.from("notificacoes").update({ lida: true }).in("id", ids);
        }
    };

    const closeNotifications = () => setShowNotifications(false);

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
            default: return 'sistema';
        }
    };

    if (loading && dicas.length === 0 && !medico) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="dicas-container">
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
                        <li><Link to="/perfil-medico">Perfil</Link></li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>ATENDIMENTO</h3>
                    <ul>
                        <li><Link to="/consulta">Iniciar consulta</Link></li>
                        <li className="active"><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="spacer"></div>

                <div className="logout">
                    <button onClick={handleLogout}>Desconectar</button>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content">
                <div className="dicas-header">
                    <div className="dicas-title-center">
                        <h1>DICAS DE SAÚDE</h1>
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
                                            onClick={() => handleNotificationClick(notif.id, notif.link)}
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

                {/* ÁREA DE PUBLICAÇÃO */}
                <div className="publicar-dica">
                    <h2>PUBLICAR DICAS</h2>
                    <div className="editor-area">
                        <input 
                            type="text"
                            className="titulo-input"
                            placeholder="Título da dica"
                            value={novaDica.titulo}
                            onChange={(e) => setNovaDica(prev => ({ ...prev, titulo: e.target.value }))}
                            disabled={loading}
                        />
                        <textarea 
                            placeholder="Escreva sua dica aqui..."
                            value={novaDica.texto}
                            onChange={(e) => setNovaDica(prev => ({ ...prev, texto: e.target.value }))}
                            rows="5"
                            disabled={loading}
                        />
                    </div>
                    <div className="btn-publicar-wrapper">
                        <button 
                            className="btn-publicar" 
                            onClick={handlePublicarDica}
                            disabled={loading}
                        >
                            {loading ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                </div>

                {/* SEÇÃO ÚLTIMAS DICAS */}
                <div className="ultimas-dicas-section">
                    <h2>ÚLTIMAS DICAS PUBLICADAS</h2>
                    <div className="dicas-cards-grid">
                        {dicas.length === 0 ? (
                            <div className="nenhuma-dica">
                                <p>Nenhuma dica publicada ainda.</p>
                                <p>Seja o primeiro a compartilhar uma dica!</p>
                            </div>
                        ) : (
                            dicas.map((dica) => (
                                <div key={dica.id} className="dica-card">
                                    <div className="card-actions">
                                        <button 
                                            className="btn-editar"
                                            onClick={() => handleEditarClick(dica)}
                                            title="Editar dica"
                                            disabled={loading}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
                                                <path d="M4 20h16"/>
                                            </svg>
                                        </button>
                                        <button 
                                            className="btn-excluir"
                                            onClick={() => handleExcluirClick(dica)}
                                            title="Excluir dica"
                                            disabled={loading}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <h3 className="dica-titulo">{dica.titulo}</h3>
                                    <p className="dica-texto">{dica.texto}</p>
                                    <div className="dica-footer">
                                        <div className="dica-autor">
                                            <span className="autor-nome">{dica.autor}</span>
                                            <span className="autor-profissao">{dica.especialidade}</span>
                                        </div>
                                        <div className="dica-data">{dica.data}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE EXCLUSÃO */}
            {modalExcluir && (
                <div className="modal-overlay" onClick={handleCancelarExcluir}>
                    <div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-confirmar-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444', margin: '0 auto' }}>
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </div>
                        <h3>Excluir Dica</h3>
                        <p>Tem certeza que deseja excluir esta dica?</p>
                        <div className="modal-botoes">
                            <button className="btn-cancelar" onClick={handleCancelarExcluir}>
                                Cancelar
                            </button>
                            <button className="btn-confirmar-excluir" onClick={handleConfirmarExcluir}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO */}
            {modalEditar && (
                <div className="modal-overlay" onClick={handleCancelarEditar}>
                    <div className="modal-editar" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-editar-header">
                            <h3>Editar Dica</h3>
                            <button className="close-modal" onClick={handleCancelarEditar}>×</button>
                        </div>
                        <div className="modal-editar-body">
                            <input 
                                type="text"
                                className="modal-titulo-input"
                                placeholder="Título da dica"
                                value={modalEditar.titulo}
                                onChange={(e) => setModalEditar(prev => ({ ...prev, titulo: e.target.value }))}
                            />
                            <textarea 
                                className="modal-texto-input"
                                placeholder="Texto da dica"
                                rows="6"
                                value={modalEditar.texto}
                                onChange={(e) => setModalEditar(prev => ({ ...prev, texto: e.target.value }))}
                            />
                        </div>
                        <div className="modal-editar-footer">
                            <button className="btn-cancelar" onClick={handleCancelarEditar}>
                                Cancelar
                            </button>
                            <button className="btn-salvar" onClick={handleConfirmarEditar}>
                                Salvar alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast && (
                <div className={`toast ${toast.isError ? 'error' : ''}`}>
                    <span className="toast-icon">{toast.isError ? '⚠️' : '✓'}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            <style jsx>{`
                .dicas-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 0 16px;
                    position: relative;
                }

                .dicas-title-center {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                }

                .dicas-title-center h1 {
                    font-size: 28px;
                    color: #1a2a3a;
                    margin: 0;
                    font-weight: 600;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-left: auto;
                }

                .notification-wrapper {
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                .notification-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    color: #9A9A9A;
                }

                .notification-icon:hover {
                    background: rgba(154, 154, 154, 0.1);
                    transform: scale(1.1);
                }

                .notification-icon svg {
                    width: 22px;
                    height: 22px;
                    stroke: #9A9A9A;
                    transition: stroke 0.3s ease;
                }

                .notification-icon:hover svg {
                    stroke: #209FD5;
                }

                .notification-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                    box-shadow: 0 0 0 2px white;
                    animation: pulse 1s infinite;
                }

                .notification-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.2s ease;
                }

                .notification-modal {
                    background: white;
                    border-radius: 24px;
                    width: 90%;
                    max-width: 480px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s ease;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                .notification-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .notification-modal-header h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1a2a3a;
                    margin: 0;
                }

                .close-modal-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #94a3b8;
                    transition: color 0.2s;
                    padding: 0 8px;
                }

                .close-modal-btn:hover {
                    color: #1a2a3a;
                }

                .mark-all-btn {
                    background: none;
                    border: none;
                    color: #1976d2;
                    font-size: 0.7rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 6px 10px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .mark-all-btn:hover {
                    background: #e3f2fd;
                }

                .notification-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .notification-item {
                    display: flex;
                    gap: 14px;
                    padding: 14px 20px;
                    border-bottom: 1px solid #f0f2f5;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .notification-item:hover {
                    background: #f8fafc;
                }

                .notification-item.unread {
                    background: #f0f7ff;
                }

                .notification-item.unread:hover {
                    background: #e8f0fe;
                }

                .notification-icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: #f1f5f9;
                }

                .notification-icon-circle svg {
                    width: 20px;
                    height: 20px;
                    stroke: #9A9A9A;
                }

                .notification-icon-circle.consulta {
                    background: #e0f2fe;
                }

                .notification-icon-circle.consulta svg {
                    stroke: #0284c7;
                }

                .notification-icon-circle.teleconsulta {
                    background: #e0e7ff;
                }

                .notification-icon-circle.teleconsulta svg {
                    stroke: #4f46e5;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #1a2a3a;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .notification-message {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .notification-time {
                    font-size: 0.6rem;
                    color: #94a3b8;
                }

                .no-notifications {
                    text-align: center;
                    padding: 48px 24px;
                    color: #94a3b8;
                }

                .paciente-name-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .dicas-header {
                        flex-direction: column;
                        align-items: center;
                        gap: 16px;
                        padding-top: 16px;
                    }

                    .dicas-title-center {
                        position: relative;
                        left: 0;
                        transform: none;
                        margin-bottom: 10px;
                    }

                    .header-actions {
                        margin-left: 0;
                        justify-content: center;
                    }

                                       .dicas-title-center h1 {
                        font-size: 24px;
                    }

                    .notification-modal {
                        width: 95%;
                        max-height: 85vh;
                    }
                }

                @media (max-width: 480px) {
                    .dicas-title-center h1 {
                        font-size: 20px;
                    }

                    .notification-item {
                        padding: 12px 16px;
                        gap: 10px;
                    }

                    .notification-icon-circle {
                        width: 35px;
                        height: 35px;
                    }

                    .notification-icon-circle svg {
                        width: 18px;
                        height: 18px;
                    }
                }
            `}</style>
        </div>
    );
}