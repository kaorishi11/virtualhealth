import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSidebar";


export default function AdminMensagens() {
    const [mensagens, setMensagens] = useState([
        { id: 1, nome: 'Vinícius Queiroz', status: 'Pendente', data: '01/03/2026', mensagem: 'A plataforma está incrível!' },
        { id: 2, nome: 'Pedro Lucas', status: 'Visto', data: '05/03/2026', mensagem: 'Muito bom atendimento' },
        { id: 3, nome: 'Miguel Chagas', status: 'Visto', data: '10/03/2025', mensagem: 'Parabéns' },
        { id: 4, nome: 'Giovana Paula', status: 'Excluída', data: '20/03/2026', mensagem: '****** c******' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const totalMensagens = mensagens.length;
    const mensagensPendentes = mensagens.filter(m => m.status === 'Pendente').length;
    const mensagensVistas = mensagens.filter(m => m.status === 'Visto').length;
    const mensagensExcluidas = mensagens.filter(m => m.status === 'Excluída').length;

    const getStatusClass = (status) => {
        if (status === 'Pendente') return 'status-pendente';
        if (status === 'Visto') return 'status-visto';
        return 'status-excluida';
    };

    const isMensagemCensurada = (msg) => msg.includes('*');

    const handleEdit = (id) => alert(`✏️ Editar mensagem`);
    const handleDelete = (id) => { if (window.confirm('⚠️ Tem certeza?')) setMensagens(mensagens.filter(m => m.id !== id)); };
    const handleRocket = (id) => alert(`🚀 Responder mensagem`);

    const filteredMensagens = mensagens.filter(m =>
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
           <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section"><h1>Gerenciamento de Mensagens</h1></div>

                <div className="stats-cards grid-4">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total</h3>
                            <div className="stat-number">{totalMensagens}</div>
                            <span className="stat-label">Mensagens</span>
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
                            <h3>Pendentes</h3>
                            <div className="stat-number">{mensagensPendentes}</div>
                            <span className="stat-label">Aguardando</span>
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
                            <h3>Vistas</h3>
                            <div className="stat-number">{mensagensVistas}</div>
                            <span className="stat-label">Visualizadas</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Excluídas</h3>
                            <div className="stat-number">{mensagensExcluidas}</div>
                            <span className="stat-label">Removidas</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>MENSAGENS RECEBIDAS</h2>
                        <div className="search-wrapper">
                            <input type="text" placeholder="Buscar mensagem..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="mensagens-table">
                            <thead><tr><th>NOME</th><th>STATUS</th><th>DATA</th><th>MENSAGEM</th><th>AÇÃO</th></tr></thead>
                            <tbody>
                                {filteredMensagens.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.nome}</td>
                                        <td><span className={getStatusClass(m.status)}>{m.status}</span></td>
                                        <td>{m.data}</td>
                                        <td className={isMensagemCensurada(m.mensagem) ? 'mensagem-censurada' : ''}>{m.mensagem}</td>
                                        <td className="action-buttons">
                                            <button className="edit-btn" onClick={() => handleEdit(m.id)}>Editar</button>
                                            <button className="rocket-btn" onClick={() => handleRocket(m.id)}>Responder</button>
                                            <button className="delete-btn" onClick={() => handleDelete(m.id)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}