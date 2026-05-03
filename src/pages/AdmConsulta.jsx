import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSidebar";


export default function AdminConsultas() {
    const [consultas, setConsultas] = useState([
        { id: 1, profissional: 'Vinícius Queiroz', especialidade: 'Oftalmologista', paciente: 'Lana Silva', status: 'Pendente', data: '01/03/2026', horario: '09:10' },
        { id: 2, profissional: 'Pedro Lucas', especialidade: 'Dentista', paciente: 'Larissa Costa', status: 'Concluída', data: '05/03/2026', horario: '09:10' },
        { id: 3, profissional: 'Miguel Chagas', especialidade: 'Ginecologista', paciente: 'Magali Souza', status: 'Concluída', data: '10/03/2025', horario: '09:10' },
        { id: 4, profissional: 'Giovana Paula', especialidade: 'Nutricionista', paciente: 'Mônica Santos', status: 'Cancelada', data: '20/03/2026', horario: '09:10' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const totalConsultas = consultas.length;
    const consultasPendentes = consultas.filter(c => c.status === 'Pendente').length;
    const consultasConcluidas = consultas.filter(c => c.status === 'Concluída').length;
    const consultasCanceladas = consultas.filter(c => c.status === 'Cancelada').length;

    const getStatusClass = (status) => {
        if (status === 'Pendente') return 'status-pendente';
        if (status === 'Concluída') return 'status-concluida';
        return 'status-cancelada';
    };

    const handleEdit = (id) => alert(`✏️ Editar consulta`);
    const handleDelete = (id) => { if (window.confirm('⚠️ Tem certeza?')) setConsultas(consultas.filter(c => c.id !== id)); };

    const filteredConsultas = consultas.filter(c =>
        c.profissional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.paciente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
           <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section"><h1>Gerenciamento de Consultas</h1></div>

                <div className="stats-cards grid-4">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total</h3>
                            <div className="stat-number">{totalConsultas}</div>
                            <span className="stat-label">Consultas</span>
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
                            <div className="stat-number">{consultasPendentes}</div>
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
                            <h3>Concluídas</h3>
                            <div className="stat-number">{consultasConcluidas}</div>
                            <span className="stat-label">Finalizadas</span>
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
                            <h3>Canceladas</h3>
                            <div className="stat-number">{consultasCanceladas}</div>
                            <span className="stat-label">Removidas</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>CONSULTAS RECENTES</h2>
                        <div className="search-wrapper">
                            <input type="text" placeholder="Buscar consulta..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="consultas-table">
                            <thead><tr><th>PROFISSIONAL</th><th>ESPECIALIDADE</th><th>PACIENTE</th><th>STATUS</th><th>DATA</th><th>HORÁRIO</th><th>AÇÃO</th></tr></thead>
                            <tbody>
                                {filteredConsultas.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.profissional}</td><td>{c.especialidade}</td><td>{c.paciente}</td>
                                        <td><span className={getStatusClass(c.status)}>{c.status}</span></td>
                                        <td>{c.data}</td><td>{c.horario}</td>
                                        <td className="action-buttons">
                                            <button className="edit-btn" onClick={() => handleEdit(c.id)}>Editar</button>
                                            <button className="delete-btn" onClick={() => handleDelete(c.id)}>Excluir</button>
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