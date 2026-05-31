import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminMensagens() {
    const [mensagens, setMensagens] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pendentes: 0,
        vistas: 0,
        excluidas: 0
    });

    useEffect(() => {
        carregarMensagens();
    }, []);

    const carregarMensagens = async () => {
        setLoading(true);
        try {
            // Buscar mensagens da tabela contatos
            const { data, error } = await supabase
                .from('contatos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('Mensagens carregadas:', data);

            // Formatar as mensagens (agora com campo lida)
            const mensagensFormatadas = data.map(msg => ({
                id: msg.id,
                nome: msg.nome,
                status: msg.lida ? 'Visto' : 'Pendente',
                data: new Date(msg.created_at).toLocaleDateString('pt-BR'),
                mensagem: msg.mensagem,
                email: msg.email,
                lida: msg.lida || false,
                created_at: msg.created_at
            }));

            setMensagens(mensagensFormatadas);
            
            // Atualizar estatísticas
            const total = mensagensFormatadas.length;
            const pendentes = mensagensFormatadas.filter(m => !m.lida).length;
            const vistas = mensagensFormatadas.filter(m => m.lida).length;
            
            setStats({
                total,
                pendentes,
                vistas,
                excluidas: 0
            });
            
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            alert('Erro ao carregar mensagens: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (status === 'Pendente') return 'status-pendente';
        if (status === 'Visto') return 'status-visto';
        return 'status-excluida';
    };

    const isMensagemCensurada = (msg) => msg?.includes('*') || false;

    const handleMarcarComoVisto = async (id) => {
        try {
            // Atualizar no banco
            const { error } = await supabase
                .from('contatos')
                .update({ lida: true })
                .eq('id', id);

            if (error) throw error;

            // Atualizar localmente
            setMensagens(mensagens.map(msg => 
                msg.id === id ? { ...msg, status: 'Visto', lida: true } : msg
            ));
            
            // Atualizar stats
            setStats({
                ...stats,
                pendentes: stats.pendentes - 1,
                vistas: stats.vistas + 1
            });

            alert('✅ Mensagem marcada como vista!');
        } catch (error) {
            console.error('Erro ao marcar como visto:', error);
            alert('Erro ao marcar mensagem: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir esta mensagem?')) {
            try {
                const { error } = await supabase
                    .from('contatos')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // Remover da lista local
                const novasMensagens = mensagens.filter(m => m.id !== id);
                setMensagens(novasMensagens);
                
                // Atualizar stats
                const total = novasMensagens.length;
                const pendentes = novasMensagens.filter(m => !m.lida).length;
                const vistas = novasMensagens.filter(m => m.lida).length;
                
                setStats({
                    total,
                    pendentes,
                    vistas,
                    excluidas: stats.excluidas + 1
                });

                alert('✅ Mensagem excluída com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir mensagem:', error);
                alert('Erro ao excluir mensagem: ' + error.message);
            }
        }
    };

    const filteredMensagens = mensagens.filter(m =>
        m.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section">
                    <h1>Gerenciamento de Mensagens</h1>
                    <p>Visualize e gerencie as mensagens dos usuários</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando mensagens...</p>
                    </div>
                ) : (
                    <>
                        <div className="stats-cards grid-4">
                            {/* Card Total */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Total</h3>
                                    <div className="stat-number">{stats.total}</div>
                                    <span className="stat-label">Mensagens</span>
                                </div>
                            </div>

                            {/* Card Pendentes */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Pendentes</h3>
                                    <div className="stat-number">{stats.pendentes}</div>
                                    <span className="stat-label pending-badge">Não lidas</span>
                                </div>
                            </div>

                            {/* Card Vistas */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Vistas</h3>
                                    <div className="stat-number">{stats.vistas}</div>
                                    <span className="stat-label completed-badge">Lidas</span>
                                </div>
                            </div>

                            {/* Card Excluídas */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Excluídas</h3>
                                    <div className="stat-number">{stats.excluidas}</div>
                                    <span className="stat-label">Removidas</span>
                                </div>
                            </div>
                        </div>

                        <div className="table-section">
                            <div className="table-header">
                                <h2>MENSAGENS RECEBIDAS</h2>
                                <div className="search-wrapper">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nome, email ou mensagem..." 
                                        className="search-input" 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table className="mensagens-table">
                                    <thead>
                                        <tr>
                                            <th>NOME</th>
                                            <th>EMAIL</th>
                                            <th>STATUS</th>
                                            <th>DATA</th>
                                            <th>MENSAGEM</th>
                                            <th>AÇÃO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMensagens.length > 0 ? (
                                            filteredMensagens.map(m => (
                                                <tr key={m.id} className={!m.lida ? 'mensagem-pendente' : ''}>
                                                    <td>{m.nome}</td>
                                                    <td>{m.email || '-'}</td>
                                                    <td><span className={getStatusClass(m.status)}>{m.status}</span></td>
                                                    <td>{m.data}</td>
                                                    <td className={isMensagemCensurada(m.mensagem) ? 'mensagem-censurada' : ''}>
                                                        {m.mensagem}
                                                    </td>
                                                    <td className="action-buttons">
                                                        {!m.lida && (
                                                            <button 
                                                                className="view-btn" 
                                                                onClick={() => handleMarcarComoVisto(m.id)}
                                                            >
                                                                Marcar visto
                                                            </button>
                                                        )}
                                                        <button 
                                                            className="delete-btn" 
                                                            onClick={() => handleDelete(m.id)}
                                                        >
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Nenhuma mensagem encontrada
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}