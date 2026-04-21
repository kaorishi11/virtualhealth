// AdminProfissionais.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmProfissional.css'; 

import logo from '../images/logo.png';

export default function AdminProfissionais() {
    // Dados dos profissionais baseado na imagem
    const [profissionais, setProfissionais] = useState([
        { 
            id: 1, 
            nome: 'Vinícius Queiroz', 
            especialidade: 'Oftalmologista', 
            status: 'Negado', 
            data: '01/03/2026', 
            telefone: '(12) 99800-0726', 
            registro: 'CRM-SP 123456' 
        },
        { 
            id: 2, 
            nome: 'Pedro Lucas', 
            especialidade: 'Dentista', 
            status: 'Aceito', 
            data: '05/03/2026', 
            telefone: '(12) 99800-0726', 
            registro: 'CRO-MG 45678' 
        },
        { 
            id: 3, 
            nome: 'Miguel Chagas', 
            especialidade: 'Psicólogo', 
            status: 'Aceito', 
            data: '10/03/2025', 
            telefone: '(12) 99800-0726', 
            registro: 'CRP-06/98765' 
        },
        { 
            id: 4, 
            nome: 'Giovana Paula', 
            especialidade: 'Nutricionista', 
            status: 'Negado', 
            data: '20/03/2026', 
            telefone: '(12) 99800-0726', 
            registro: 'CRM-SP 123456' 
        },
    ]);

    const getStatusClass = (status) => {
        return status === 'Aceito' ? 'status-aceito' : 'status-negado';
    };

    const handleEdit = (id) => {
        const profissional = profissionais.find(p => p.id === id);
        alert(`✏️ Editar profissional: ${profissional.nome}`);
        // Aqui você pode abrir um modal ou redirecionar para página de edição
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir este profissional?`)) {
            setProfissionais(profissionais.filter(p => p.id !== id));
            alert('✅ Profissional excluído com sucesso!');
        }
    };

    const handleNovoProfissional = () => {
        alert('➕ Abrir formulário para novo profissional');
        // Aqui você pode abrir um modal ou redirecionar para página de cadastro
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo-area">
                    <h2>VIRTUAL HEALTH</h2>
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
                    <p>Gerenciamento de Profissionais</p>
                </div>

                {/* Professionals Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>PROFISSIONAIS CADASTRADOS</h2>
                        <button className="view-all-btn">Ver tudo &gt;</button>
                    </div>

                    <table className="profissionais-table">
                        <thead>
                            <tr>
                                <th>PROFISSIONAL</th>
                                <th>ESPECIALIDADE</th>
                                <th>STATUS</th>
                                <th>DATA</th>
                                <th>TELEFONE</th>
                                <th>REGISTRO</th>
                                <th>AÇÃO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profissionais.map((profissional) => (
                                <tr key={profissional.id}>
                                    <td>{profissional.nome}</td>
                                    <td>{profissional.especialidade}</td>
                                    <td>
                                        <span className={getStatusClass(profissional.status)}>
                                            {profissional.status}
                                        </span>
                                    </td>
                                    <td>{profissional.data}</td>
                                    <td>{profissional.telefone}</td>
                                    <td>{profissional.registro}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(profissional.id)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(profissional.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* New Professional Button */}
                    <div className="new-profissional-btn">
                        <button className="btn-primary" onClick={handleNovoProfissional}>
                            + Novo Profissional
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}