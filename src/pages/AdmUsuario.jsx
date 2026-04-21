// AdminUsuarios.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmUsuario.css'; 

import logo from '../images/logo.png';

export default function AdminUsuarios() {
    // Dados dos usuários baseado na imagem
    const [usuarios, setUsuarios] = useState([
        { id: 1, nome: 'Vinícius Queiroz', email: 'vinicius@gmail.com', status: 'Inativo', data: '01/03/2026' },
        { id: 2, nome: 'Pedro Lucas', email: 'pedro@gmail.com', status: 'Ativo', data: '05/03/2026' },
        { id: 3, nome: 'Miguel Chagas', email: 'miguel@gmail.com', status: 'Ativo', data: '10/03/2026' },
        { id: 4, nome: 'Giovana Paula', email: 'giovana@gmail.com', status: 'Inativo', data: '20/03/2026' },
    ]);

    const getStatusClass = (status) => {
        return status === 'Ativo' ? 'status-ativo' : 'status-inativo';
    };

    const handleEdit = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        alert(`Editar usuário: ${usuario.nome}`);
        // Aqui você pode abrir um modal ou redirecionar para página de edição
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir este usuário?`)) {
            setUsuarios(usuarios.filter(u => u.id !== id));
            alert('Usuário excluído com sucesso!');
        }
    };

    const handleNovoUsuario = () => {
        alert('➕ Abrir formulário para novo usuário');
        // Aqui você pode abrir um modal ou redirecionar para página de cadastro
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo-area">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <nav className="nav-menu">
                    <Link to="/admin" className="nav-link">Visão geral</Link>
                    <Link to="/admusuarios" className="nav-link">Usuários</Link>
                    <Link to="/admprofissionais" className="nav-link">Profissionais</Link>
                    <Link to="/admconsultas" className="nav-link">Consultas</Link>
                    <Link to="/admmensagens" className="nav-link">Mensagens</Link>
                </nav>
                <button className="logout-btn">Sair</button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Page Header */}
                <div className="page-header">
                    <h1>Dashboard</h1>
                    <p>Gerenciamento de Usuários</p>
                </div>

                {/* Users Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>USUÁRIOS CADASTRADOS</h2>
                        <button className="view-all-btn">Ver tudo</button>
                    </div>

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
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.nome}</td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        <span className={getStatusClass(usuario.status)}>
                                            {usuario.status}
                                        </span>
                                    </td>
                                    <td>{usuario.data}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(usuario.id)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(usuario.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* New User Button */}
                    <div className="new-user-btn">
                        <button className="btn-primary" onClick={handleNovoUsuario}>
                            + Novo Usuário
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}