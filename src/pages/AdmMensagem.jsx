// AdminMensagens.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmMensagem.css';

export default function AdminMensagens() {
    // Dados das mensagens baseado na imagem
    const [mensagens, setMensagens] = useState([
        { 
            id: 1, 
            nome: 'Vinícius Queiroz', 
            status: 'Pendente', 
            data: '01/03/2026', 
            mensagem: 'A plataforma está incrível!' 
        },
        { 
            id: 2, 
            nome: 'Pedro Lucas', 
            status: 'Visto', 
            data: '05/03/2026', 
            mensagem: 'Muito bom atendimento' 
        },
        { 
            id: 3, 
            nome: 'Miguel Chagas', 
            status: 'Visto', 
            data: '10/03/2025', 
            mensagem: 'Parabéns' 
        },
        { 
            id: 4, 
            nome: 'Giovana Paula', 
            status: 'Excluída', 
            data: '20/03/2026', 
            mensagem: '****** c******' 
        },
    ]);

    const getStatusClass = (status) => {
        switch(status) {
            case 'Pendente': return 'status-pendente';
            case 'Visto': return 'status-visto';
            case 'Excluída': return 'status-excluida';
            default: return '';
        }
    };

    const isMensagemCensurada = (mensagem) => {
        return mensagem.includes('*');
    };

    const handleEdit = (id) => {
        const mensagem = mensagens.find(m => m.id === id);
        alert(`✏️ Editar mensagem de ${mensagem.nome}`);
        // Aqui você pode abrir um modal ou redirecionar para página de edição
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir esta mensagem?`)) {
            setMensagens(mensagens.filter(m => m.id !== id));
            alert('✅ Mensagem excluída com sucesso!');
        }
    };

    const handleRocketAction = (id) => {
        const mensagem = mensagens.find(m => m.id === id);
        alert(`🚀 Ação rápida para mensagem de ${mensagem.nome}`);
        // Aqui você pode implementar uma ação rápida (responder, encaminhar, etc)
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
                    <p>Gerenciamento de Mensagens</p>
                </div>

                {/* Messages Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>MENSAGENS</h2>
                    </div>

                    <table className="mensagens-table">
                        <thead>
                            <tr>
                                <th>NOME</th>
                                <th>STATUS</th>
                                <th>DATA</th>
                                <th>MENSAGEM</th>
                                <th>AÇÃO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mensagens.map((mensagem) => (
                                <tr key={mensagem.id}>
                                    <td>{mensagem.nome}</td>
                                    <td>
                                        <span className={getStatusClass(mensagem.status)}>
                                            {mensagem.status}
                                        </span>
                                    </td>
                                    <td>{mensagem.data}</td>
                                    <td className={isMensagemCensurada(mensagem.mensagem) ? 'mensagem-censurada' : ''}>
                                        {mensagem.mensagem}
                                    </td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(mensagem.id)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="rocket-btn"
                                            onClick={() => handleRocketAction(mensagem.id)}
                                        >
                                            🚀
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(mensagem.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}