import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmConsulta.css';

import logo from '../images/logo.png';
import iconConsultas from '../images/icon2.png';

export default function AdminConsultas() {
    // Dados das consultas
    const [consultas, setConsultas] = useState([
        { 
            id: 1, 
            profissional: 'Vinícius Queiroz', 
            especialidade: 'Oftalmologista', 
            paciente: 'Lana Silva', 
            status: 'Pendente', 
            data: '01/03/2026', 
            horario: '09:10' 
        },
        { 
            id: 2, 
            profissional: 'Pedro Lucas', 
            especialidade: 'Dentista', 
            paciente: 'Larissa Costa', 
            status: 'Concluída', 
            data: '05/03/2026', 
            horario: '09:10' 
        },
        { 
            id: 3, 
            profissional: 'Miguel Chagas', 
            especialidade: 'Ginecologista', 
            paciente: 'Magali Souza', 
            status: 'Concluída', 
            data: '10/03/2025', 
            horario: '09:10' 
        },
        { 
            id: 4, 
            profissional: 'Giovana Paula', 
            especialidade: 'Nutricionista', 
            paciente: 'Mônica Santos', 
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
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir esta consulta?`)) {
            setConsultas(consultas.filter(c => c.id !== id));
            alert('✅ Consulta excluída com sucesso!');
        }
    };

    const filteredConsultas = consultas.filter(consulta =>
        consulta.profissional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Estatísticas
    const totalConsultas = consultas.length;
    const consultasPendentes = consultas.filter(c => c.status === 'Pendente').length;
    const consultasConcluidas = consultas.filter(c => c.status === 'Concluída').length;
    const consultasCanceladas = consultas.filter(c => c.status === 'Cancelada').length;

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
                            <li><Link to="/admusuarios">Usuários</Link></li>
                            <li><Link to="/admprofissionais">Profissionais</Link></li>
                            <li className="active"><Link to="/admconsultas">Consultas</Link></li>
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
                    <h1>Gerenciamento de Consultas</h1>
                </div>

                {/* Tabela de Consultas */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>CONSULTAS RECENTES</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar consulta..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                                            Excluir
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