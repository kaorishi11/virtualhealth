import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSidebar";

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([
        { id: 1, nome: 'Vinícius Queiroz', email: 'vinicius@gmail.com', status: 'Inativo', data: '01/03/2026' },
        { id: 2, nome: 'Pedro Lucas', email: 'pedro@gmail.com', status: 'Ativo', data: '05/03/2026' },
        { id: 3, nome: 'Miguel Chagas', email: 'miguel@gmail.com', status: 'Ativo', data: '10/03/2026' },
        { id: 4, nome: 'Giovana Paula', email: 'giovana@gmail.com', status: 'Inativo', data: '20/03/2026' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const totalUsuarios = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'Ativo').length;
    const inativos = usuarios.filter(u => u.status === 'Inativo').length;

    const getStatusClass = (status) => status === 'Ativo' ? 'status-ativo' : 'status-inativo';

    const handleEdit = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        alert(`Editar usuário: ${usuario.nome}`);
    };

    const handleDelete = (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir este usuário?')) {
            setUsuarios(usuarios.filter(u => u.id !== id));
            alert('Usuário excluído com sucesso!');
        }
    };

    const handleNovoUsuario = () => {
        alert('➕ Abrir formulário para novo usuário');
    };

    const filteredUsuarios = usuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section"><h1>Gerenciamento de Usuários</h1></div>

                <div className="stats-cards grid-3">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total</h3>
                            <div className="stat-number">{totalUsuarios}</div>
                            <span className="stat-label">Cadastrados</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Ativos</h3>
                            <div className="stat-number">{ativos}</div>
                            <span className="stat-label">Aprovados</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Inativos</h3>
                            <div className="stat-number">{inativos}</div>
                            <span className="stat-label">Reprovados</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>USUÁRIOS CADASTRADOS</h2>
                        <div className="search-wrapper">
                            <input type="text" placeholder="Buscar usuário..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>NOME</th>
                                    <th>E-MAIL</th>
                                    <th>STATUS</th>
                                    <th>DATA</th>
                                    <th>AÇÃO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsuarios.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.nome} </td>
                                        <td>{u.email} </td>
                                        <td><span className={getStatusClass(u.status)}>{u.status}</span> </td>
                                        <td>{u.data} </td>
                                        <td className="action-buttons">
                                            <button className="edit-btn" onClick={() => handleEdit(u.id)}>Editar</button>
                                            <button className="delete-btn" onClick={() => handleDelete(u.id)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="new-user-btn"><button className="btn-primary" onClick={handleNovoUsuario}>+ Novo Usuário</button></div>
                </div>
            </main>
        </div>
    );
}