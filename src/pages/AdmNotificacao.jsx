import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminNotificacoes() {
    const [notificacoes, setNotificacoes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ 
        total: 0, 
        lidas: 0, 
        naoLidas: 0,
        consultas: 0,
        teleconsultas: 0,
        sistema: 0
    });

    // States para o modal
    const [showModal, setShowModal] = useState(false);
    const [editingNotificacao, setEditingNotificacao] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        usuario_id: '',
        titulo: '',
        mensagem: '',
        tipo: 'sistema',
        lida: false
    });

    useEffect(() => {
        carregarNotificacoes();
        carregarUsuarios();
    }, []);

    const carregarNotificacoes = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('notificacoes')
                .select(`
                    *,
                    usuario:usuario_id(id, nome, email, foto)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const notificacoesFormatadas = data.map(notif => ({
                id: notif.id,
                usuario_id: notif.usuario_id,
                usuario_nome: notif.usuario?.nome || 'Usuário não encontrado',
                usuario_email: notif.usuario?.email || '-',
                usuario_foto: notif.usuario?.foto,
                titulo: notif.titulo,
                mensagem: notif.mensagem,
                tipo: notif.tipo,
                lida: notif.lida,
                created_at: notif.created_at,
                data_formatada: new Date(notif.created_at).toLocaleDateString('pt-BR'),
                hora_formatada: new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }));
            
            setNotificacoes(notificacoesFormatadas);
            
            const lidas = notificacoesFormatadas.filter(n => n.lida === true).length;
            const naoLidas = notificacoesFormatadas.filter(n => n.lida === false).length;
            const consultas = notificacoesFormatadas.filter(n => n.tipo === 'consulta').length;
            const teleconsultas = notificacoesFormatadas.filter(n => n.tipo === 'teleconsulta').length;
            const sistema = notificacoesFormatadas.filter(n => n.tipo === 'sistema').length;
            
            setEstatisticas({
                total: notificacoesFormatadas.length,
                lidas,
                naoLidas,
                consultas,
                teleconsultas,
                sistema
            });
            
        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
            alert('Erro ao carregar notificações. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const carregarUsuarios = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id, nome, email, tipo')
                .in('tipo', ['paciente', 'medico'])
                .order('nome');

            if (error) throw error;
            setUsuarios(data || []);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            usuario_id: '',
            titulo: '',
            mensagem: '',
            tipo: 'sistema',
            lida: false
        });
        setEditingNotificacao(null);
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data, error } = await supabase
                .from('notificacoes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setEditingNotificacao(data);
            setFormData({
                usuario_id: data.usuario_id || '',
                titulo: data.titulo || '',
                mensagem: data.mensagem || '',
                tipo: data.tipo || 'sistema',
                lida: data.lida || false
            });
            setShowModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar notificação:', err);
            alert('Erro ao buscar dados da notificação: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('notificacoes')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarNotificacoes();
                
                alert('Notificação excluída com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir notificação:', err);
                alert('Erro ao excluir notificação: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleMarcarLida = async (id, lida) => {
        try {
            const { error } = await supabase
                .from('notificacoes')
                .update({ lida: !lida })
                .eq('id', id);

            if (error) throw error;
            
            await carregarNotificacoes();
            
            alert(`Notificação ${!lida ? 'marcada como lida' : 'marcada como não lida'} com sucesso!`);
        } catch (err) {
            console.error('Erro ao marcar notificação:', err);
            alert('Erro ao marcar notificação: ' + err.message);
        }
    };

    const handleSalvarNotificacao = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.usuario_id || !formData.titulo || !formData.mensagem) {
                alert('Por favor, preencha os campos obrigatórios: Usuário, Título e Mensagem');
                setModalLoading(false);
                return;
            }

            const dadosNotificacao = {
                usuario_id: formData.usuario_id,
                titulo: formData.titulo,
                mensagem: formData.mensagem,
                tipo: formData.tipo,
                lida: formData.lida,
                created_at: new Date()
            };

            if (editingNotificacao) {
                const { error: updateError } = await supabase
                    .from('notificacoes')
                    .update(dadosNotificacao)
                    .eq('id', editingNotificacao.id);

                if (updateError) throw updateError;
                alert('Notificação atualizada com sucesso!');
                
            } else {
                const { error: insertError } = await supabase
                    .from('notificacoes')
                    .insert([dadosNotificacao]);

                if (insertError) throw insertError;
                alert('Notificação enviada com sucesso!');
            }
            
            setShowModal(false);
            resetForm();
            await carregarNotificacoes();
            
        } catch (err) {
            console.error('Erro ao salvar notificação:', err);
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    const getTipoClass = (tipo) => {
        switch(tipo) {
            case 'consulta': return 'tipo-consulta';
            case 'teleconsulta': return 'tipo-teleconsulta';
            case 'sistema': return 'tipo-sistema';
            default: return '';
        }
    };

    const getTipoTexto = (tipo) => {
        switch(tipo) {
            case 'consulta': return 'Consulta';
            case 'teleconsulta': return 'Teleconsulta';
            case 'sistema': return 'Sistema';
            default: return tipo;
        }
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarNotificacoes = async () => {
            if (searchTerm.trim() === '') {
                carregarNotificacoes();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('notificacoes')
                    .select(`
                        *,
                        usuario:usuario_id(id, nome, email, foto)
                    `)
                    .or(`titulo.ilike.%${searchTerm}%,mensagem.ilike.%${searchTerm}%,usuario.nome.ilike.%${searchTerm}%`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const notificacoesFormatadas = (data || []).map(notif => ({
                    id: notif.id,
                    usuario_id: notif.usuario_id,
                    usuario_nome: notif.usuario?.nome || 'Usuário não encontrado',
                    usuario_email: notif.usuario?.email || '-',
                    usuario_foto: notif.usuario?.foto,
                    titulo: notif.titulo,
                    mensagem: notif.mensagem,
                    tipo: notif.tipo,
                    lida: notif.lida,
                    created_at: notif.created_at,
                    data_formatada: new Date(notif.created_at).toLocaleDateString('pt-BR'),
                    hora_formatada: new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                }));
                
                setNotificacoes(notificacoesFormatadas);
                
            } catch (err) {
                console.error('Erro ao buscar notificações:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarNotificacoes();
            } else {
                carregarNotificacoes();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    if (loading && notificacoes.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando notificações...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section">
                    <h1>Gerenciamento de Notificações</h1>
                    <p>Envie e gerencie notificações para usuários da plataforma</p>
                </div>

                <div className="stats-cards grid-6">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total</h3>
                            <div className="stat-number">{estatisticas.total}</div>
                            <span className="stat-label">Notificações</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Lidas</h3>
                            <div className="stat-number">{estatisticas.lidas}</div>
                            <span className="stat-label completed-badge">Visualizadas</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Não Lidas</h3>
                            <div className="stat-number">{estatisticas.naoLidas}</div>
                            <span className="stat-label pending-badge">Pendentes</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                                <path d="M5 3h14"/>
                                <path d="M12 3v9"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Consultas</h3>
                            <div className="stat-number">{estatisticas.consultas}</div>
                            <span className="stat-label">Notificações</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m9 8 5 4-5 4V8z"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Teleconsultas</h3>
                            <div className="stat-number">{estatisticas.teleconsultas}</div>
                            <span className="stat-label">Notificações</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Sistema</h3>
                            <div className="stat-number">{estatisticas.sistema}</div>
                            <span className="stat-label">Notificações</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>TODAS AS NOTIFICAÇÕES</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar por título, mensagem ou usuário..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <button className="btn-primary" onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}>
                            Nova Notificação
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="notificacoes-table">
                            <thead>
                                <tr>
                                    <th>USUÁRIO</th>
                                    <th>TÍTULO</th>
                                    <th>MENSAGEM</th>
                                    <th>TIPO</th>
                                    <th>STATUS</th>
                                    <th>DATA</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notificacoes.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhuma notificação encontrada para esta busca' : 'Nenhuma notificação cadastrada ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    notificacoes.map(notif => (
                                        <tr key={notif.id} className={!notif.lida ? 'notificacao-nao-lida' : ''}>
                                            <td>
                                                <div className="user-cell">
                                                    {notif.usuario_foto ? (
                                                        <img src={notif.usuario_foto} alt="" className="avatar-small" />
                                                    ) : (
                                                        <div className="avatar-small-iniciais" style={{ backgroundColor: '#3b82f6' }}>
                                                            {notif.usuario_nome?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong>{notif.usuario_nome}</strong>
                                                        <br />
                                                        <small>{notif.usuario_email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><strong>{notif.titulo}</strong></td>
                                            <td>
                                                <div className="mensagem-preview">
                                                    {notif.mensagem.length > 100 
                                                        ? notif.mensagem.substring(0, 100) + '...' 
                                                        : notif.mensagem}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`tipo-badge ${getTipoClass(notif.tipo)}`}>
                                                    {getTipoTexto(notif.tipo)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={notif.lida ? 'status-lida' : 'status-nao-lida'}>
                                                    {notif.lida ? 'Lida' : 'Não lida'}
                                                </span>
                                            </td>
                                            <td>
                                                {notif.data_formatada}<br/>
                                                <small>{notif.hora_formatada}</small>
                                            </td>
                                            <td className="action-buttons">
                                                <button 
                                                    className={`status-toggle-btn ${notif.lida ? 'btn-marcar-nao-lida' : 'btn-marcar-lida'}`}
                                                    onClick={() => handleMarcarLida(notif.id, notif.lida)}
                                                >
                                                    {notif.lida ? 'Marcar não lida' : 'Marcar lida'}
                                                </button>
                                                <button className="edit-btn" onClick={() => handleEdit(notif.id)}>
                                                    Editar
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(notif.id)}>
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL DE NOTIFICAÇÃO */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    resetForm();
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingNotificacao ? 'Editar Notificação' : 'Nova Notificação'}</h2>
                            <button 
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSalvarNotificacao}>
                            <div className="form-group">
                                <label>USUÁRIO *</label>
                                <select 
                                    name="usuario_id" 
                                    value={formData.usuario_id} 
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione um usuário</option>
                                    {usuarios.map(usuario => (
                                        <option key={usuario.id} value={usuario.id}>
                                            {usuario.nome} - {usuario.email} ({usuario.tipo === 'paciente' ? 'Paciente' : 'Médico'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>TÍTULO *</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite o título da notificação"
                                />
                            </div>

                            <div className="form-group">
                                <label>MENSAGEM *</label>
                                <textarea
                                    name="mensagem"
                                    value={formData.mensagem}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite a mensagem da notificação"
                                    rows={4}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>TIPO</label>
                                <select 
                                    name="tipo" 
                                    value={formData.tipo} 
                                    onChange={handleInputChange}
                                >
                                    <option value="sistema">Sistema</option>
                                    <option value="consulta">Consulta</option>
                                    <option value="teleconsulta">Teleconsulta</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="lida"
                                        checked={formData.lida}
                                        onChange={handleInputChange}
                                    />
                                    Marcar como lida
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={modalLoading}>
                                    {modalLoading ? 'Salvando...' : (editingNotificacao ? 'Atualizar' : 'Enviar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}