// AdminConsultas.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmConsulta.css';

export default function AdminConsultas() {
    // Dados das consultas baseado na imagem
    const [consultas, setConsultas] = useState([
        { 
            id: 1, 
            profissional: 'Vinícius Queiroz', 
            especialidade: 'Oftalmologista', 
            paciente: 'Lana', 
            status: 'Pendente', 
            data: '01/03/2026', 
            horario: '09:10' 
        },
        { 
            id: 2, 
            profissional: 'Pedro Lucas', 
            especialidade: 'Dentista', 
            paciente: 'Larissa', 
            status: 'Concluída', 
            data: '05/03/2026', 
            horario: '09:10' 
        },
        { 
            id: 3, 
            profissional: 'Miguel Chagas', 
            especialidade: 'Ginecologista', 
            paciente: 'Magali', 
            status: 'Concluída', 
            data: '10/03/2025', 
            horario: '09:10' 
        },
        { 
            id: 4, 
            profissional: 'Giovana Paula', 
            especialidade: 'Nutricionista', 
            paciente: 'Mônica', 
            status: 'Cancelada', 
            data: '20/03/2026', 
            horario: '09:10' 
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const getStatusClass = (status) => {
        switch(status) {
            case 'Pendente': return 'status-pendente';
            case 'Concluída': return 'status-concluida';
            case 'Cancelada': return 'status-cancelada';
            default: return '';
        }
    };

    const handleEdit = (id) => {
        const consulta = consultas.find(c => c.id === id);
        alert(`✏️ Editar consulta de ${consulta.paciente} com Dr(a). ${consulta.profissional}`);
        // Aqui você pode abrir um modal ou redirecionar para página de edição
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir esta consulta?`)) {
            setConsultas(consultas.filter(c => c.id !== id));
            alert('✅ Consulta excluída com sucesso!');
        }
    };

    const handleViewAll = () => {
        alert('📋 Ver todas as consultas');
        // Aqui você pode redirecionar para página com todas as consultas
    };

    // Filtrar consultas baseado no termo de busca
    const filteredConsultas = consultas.filter(consulta =>
        consulta.profissional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <p>Gerenciamento de Consultas</p>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <div className="search-input">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="view-all-btn" onClick={handleViewAll}>
                        Ver tudo &gt;
                    </button>
                </div>

                {/* Consultations Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>CONSULTAS</h2>
                    </div>

                    <table className="consultas-table">
                        <thead>
                            <tr>
                                <th>PROFISSIONAL</th>
                                <th>ESPECIALIDADE</th>
                                <th>PACIENTE</th>
                                <th>STATUS</th>
                                <th>DATA</th>
                                <th>HORÁRIO</th>
                                <th>AÇÃO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConsultas.map((consulta) => (
                                <tr key={consulta.id}>
                                    <td>{consulta.profissional}</td>
                                    <td>{consulta.especialidade}</td>
                                    <td>{consulta.paciente}</td>
                                    <td>
                                        <span className={getStatusClass(consulta.status)}>
                                            {consulta.status}
                                        </span>
                                    </td>
                                    <td>{consulta.data}</td>
                                    <td>{consulta.horario}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(consulta.id)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(consulta.id)}
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