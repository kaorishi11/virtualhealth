import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSidebar";


export default function AdminDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    
    const consultations = [
        { id: 1, name: 'Vinícius Queiroz', date: '15/03/2026', status: 'Pendente', type: 'Urologista' },
        { id: 2, name: 'Pedro Lucas', date: '01/03/2026', status: 'Realizada', type: 'Dentista' },
        { id: 3, name: 'Miguel Chagas', date: '03/03/2026', status: 'Realizada', type: 'Nutricionista' },
        { id: 4, name: 'Giovana Paula', date: '21/03/2026', status: 'Cancelada', type: 'Ginecologista' },
    ];

    const getStatusClass = (status) => {
        switch(status) {
            case 'Pendente': return 'status-pendente';
            case 'Realizada': return 'status-realizada';
            case 'Cancelada': return 'status-cancelada';
            default: return '';
        }
    };

    const handleView = (id) => {
        const consult = consultations.find(c => c.id === id);
        alert(`Ver detalhes da consulta de ${consult.name}`);
    };

    const filteredConsultations = consultations.filter(consult =>
        consult.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <AdminSidebar />
            {/* MAIN CONTENT */}
            <main className="main-content">
                <div className="welcome-section">
                    <h1>Bem-vindo de volta, <span>Gustavo!</span></h1>
                </div>

                {/* Cards com estatísticas */}
                <div className="stats-cards grid-3">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Usuários ativos</h3>
                            <div className="stat-number">1.532</div>
                            <span className="stat-label trend-down">-2,4% este mês</span>
                        </div>
                    </div>

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
                            <h3>Consultas do dia</h3>
                            <div className="stat-number">67</div>
                            <span className="stat-label pending-badge">8 pendentes</span>
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
                            <h3>Consultas concluídas</h3>
                            <div className="stat-number">32</div>
                            <span className="stat-label completed-badge">Este mês</span>
                        </div>
                    </div>
                </div>

                {/* Gráfico Mensal */}
                <div className="chart-section">
                    <h2>MENSAL</h2>
                    
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="legend-color concluidas"></div>
                            <span>Consultas concluídas</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color pendentes"></div>
                            <span>Consultas pendentes</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color canceladas"></div>
                            <span>Consultas canceladas</span>
                        </div>
                    </div>

                    <div className="chart-bars">
                        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai'].map((mes, idx) => (
                            <div key={idx} className="bar-item">
                                <div className="bar-group">
                                    <div className="bar concluidas" style={{ height: `${[48, 16, 56, 72, 48][idx]}px` }}></div>
                                    <div className="bar pendentes" style={{ height: `${[36, 40, 32, 48, 24][idx]}px` }}></div>
                                    <div className="bar canceladas" style={{ height: `${[42, 24, 40, 40, 32][idx]}px` }}></div>
                                </div>
                                <span className="bar-label">{mes}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabela de Consultas Recentes */}
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

                    <div style={{ overflowX: 'auto' }}>
                        <table className="consultas-table">
                            <thead>
                                <tr>
                                    <th>NOME</th>
                                    <th>DATA</th>
                                    <th>STATUS</th>
                                    <th>TIPO</th>
                                    <th>AÇÃO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConsultations.map((consult) => (
                                    <tr key={consult.id}>
                                        <td>{consult.name}</td>
                                        <td>{consult.date}</td>
                                        <td><span className={getStatusClass(consult.status)}>{consult.status}</span></td>
                                        <td>{consult.type}</td>
                                        <td><button className="view-btn" onClick={() => handleView(consult.id)}>Ver</button></td>
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