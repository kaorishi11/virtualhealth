import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmUsuario.css';

import logo from '../images/logo.png';
import iconUsers from '../images/icon1.png';

export default function AdminUsuarios() {
    // Dados dos usuários
    const [usuarios, setUsuarios] = useState([
        { id: 1, nome: 'Vinícius Queiroz', email: 'vinicius@gmail.com', status: 'Inativo', data: '01/03/2026' },
        { id: 2, nome: 'Pedro Lucas', email: 'pedro@gmail.com', status: 'Ativo', data: '05/03/2026' },
        { id: 3, nome: 'Miguel Chagas', email: 'miguel@gmail.com', status: 'Ativo', data: '10/03/2026' },
        { id: 4, nome: 'Giovana Paula', email: 'giovana@gmail.com', status: 'Inativo', data: '20/03/2026' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const getStatusClass = (status) => {
        return status === 'Ativo' ? 'status-ativo' : 'status-inativo';
    };

    const handleEdit = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        alert(`Editar usuário: ${usuario.nome}`);
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir este usuário?`)) {
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
            {/* Sidebar - mesmo estilo do AdminDashboard */}
            <aside className="sidebar">
                            <div className="sidebar-logo">
                                <img src={logo} alt="Logo" className="logo-medico" />
                            </div>
            
                            <div className='menu-lateral'>
                                <div className='menu-section'>
                                    <h3>GERAL</h3>
                                    <ul>
                                        <li><Link to="/admin">Visão geral</Link></li>
                                        <li className="active"><Link to="/admusuarios">Usuários</Link></li>
                                        <li><Link to="/admprofissionais">Profissionais</Link></li>
                                        <li><Link to="/admconsultas">Consultas</Link></li>
                                        <li><Link to="/admmensagens">Mensagens</Link></li>
                                    </ul>
                                </div>
                            
                                <div className="logout">
                                    <Link to="/">Desconectar</Link>
                                </div>
                            </div>
                        </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1>Gerenciamento de Usuários</h1>
                </div>

                {/* Tabela de Usuários */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>USUÁRIOS CADASTRADOS</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar usuário..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                            {filteredUsuarios.map((usuario) => (
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
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Botão Novo Usuário */}
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