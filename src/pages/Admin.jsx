import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';

// Placeholder imports - substitua pelos caminhos reais das suas imagens
import logo from '../images/logo.png';
import iconUsers from '../images/icon1.png';
import iconConsultas from '../images/icon2.png';
import iconCompleted from '../images/icon3.png';

export default function AdminDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    
    const consultations = [
        { id: 1, name: 'Vinícius Queiroz', date: '15/03/2026', status: 'Pendente', type: 'Urologista' },
        { id: 2, name: 'Pedro Lucas', date: '01/03/2026', status: 'Pendente', type: 'Dentista' },
        { id: 3, name: 'Miguel Chagas', date: '03/03/2026', status: 'Pendente', type: 'Nutricionista' },
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
            {/* Sidebar - HEADER CORRIGIDO */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={logo} alt="Logo" className="logo-medico" />
                </div>

                <div className='menu-lateral'>
                    <div className='menu-section'>
                        <h3>GERAL</h3>
                        <ul>
                            <li className="active"><Link to="/admin">Visão geral</Link></li>
                            <li><Link to="/admusuarios">Usuários</Link></li>
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
                    <h1>Bem-vindo de volta, <span>Gustavo!</span></h1>
                </div>

                {/* Cards com estatísticas */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <img src={iconUsers} alt="Usuários" />
                        </div>
                        <div className="stat-info">
                            <h3>Usuários ativos</h3>
                            <p>1532</p>
                            <span className="trend down">-2,4% este mês</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <img src={iconConsultas} alt="Consultas" />
                        </div>
                        <div className="stat-info">
                            <h3>Consultas do dia</h3>
                            <p>67</p>
                            <span className="pending">8 pendentes</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <img src={iconCompleted} alt="Concluídas" />
                        </div>
                        <div className="stat-info">
                            <h3>Consultas concluídas</h3>
                            <p>32</p>
                            <span className="completed">Consultas concluídas (geral)</span>
                        </div>
                    </div>
                </div>

                {/* Gráfico Mensal */}
                <div className="chart-section">
                    <h2>Mensal</h2>
                    <div className="chart-bars">
                        <div className="bar-item">
                            <div className="bar" style={{ height: '48px' }}></div>
                            <span>Jan</span>
                            <small>2.4%</small>
                        </div>
                        <div className="bar-item">
                            <div className="bar gray" style={{ height: '28px' }}></div>
                            <span>Fev</span>
                            <small>1.5%</small>
                        </div>
                        <div className="bar-item">
                            <div className="bar" style={{ height: '58px' }}></div>
                            <span>Mar</span>
                            <small>3.0%</small>
                        </div>
                        <div className="bar-item">
                            <div className="bar" style={{ height: '52px' }}></div>
                            <span>Abril</span>
                            <small>2.8%</small>
                        </div>
                        <div className="bar-item">
                            <div className="bar" style={{ height: '48px' }}></div>
                            <span>Maio</span>
                            <small>2.6%</small>
                        </div>
                    </div>
                </div>

                {/* Tabela de Consultas Recentes */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>CONSULTAS RECENTES</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className="consultations-table">
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
                                    <td>
                                        <span className={getStatusClass(consult.status)}>
                                            {consult.status}
                                        </span>
                                    </td>
                                    <td>{consult.type}</td>
                                    <td>
                                        <button 
                                            className="view-btn"
                                            onClick={() => handleView(consult.id)}
                                        >
                                            Ver
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