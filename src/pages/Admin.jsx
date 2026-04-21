// AdminDashboard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';

// Placeholder imports - substitua pelos caminhos reais das suas imagens
import logo from '../images/logo.png';
import adm1 from '../images/adm1.png';
import adm2 from '../images/adm2.png';
import adm3 from '../images/adm3.png';

export default function AdminDashboard() {
    const monthlyData = [
        { month: 'Jan', conclusions: '2.4%', consultations: 1532, partners: 67 },
        { month: 'Fev', conclusions: '1.5%', consultations: 0, partners: 0 },
        { month: 'Mar', conclusions: '3.0%', consultations: 0, partners: 0 },
        { month: 'Abril', conclusions: '2.8%', consultations: 0, partners: 0 },
        { month: 'Maio', conclusions: '2.6%', consultations: 0, partners: 0 },
    ];

    const [consultations, setConsultations] = useState([
        { id: 1, name: 'Vinícius Queiroz', date: '15/03/2025', status: 'Pendente', type: 'Urologista' },
        { id: 2, name: 'Pedro Lucas', date: '01/03/2026', status: 'Realizada', type: 'Dentista' },
        { id: 3, name: 'Miguel Chagas', date: '03/03/2026', status: 'Realizada', type: 'Nutricionista' },
        { id: 4, name: 'Giovana Paula', date: '21/03/2026', status: 'Cancelada', type: 'Ginecologista' },
    ]);

    const getStatusClass = (status) => {
        switch(status) {
            case 'Pendente': return 'status-pendente';
            case 'Realizada': return 'status-realizada';
            case 'Cancelada': return 'status-cancelada';
            default: return '';
        }
    };

    const handleEdit = (id) => {
        const consult = consultations.find(c => c.id === id);
        alert(`Editar consulta de ${consult.name}`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
            setConsultations(consultations.filter(c => c.id !== id));
            alert('Consulta excluída com sucesso!');
        }
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
                    <Link to="/" className="nav-link">Mensagens</Link>
                </nav>
                <button className="logout-btn">Sair</button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1>Bem-vindo de volta, Admin!</h1>
                    <button className="search-btn">Buscar...</button>
                </div>

                {/* Cards */}
                <div className="cards-grid">
                    <div className="card">
                        <div className="card-icon">
                            <img src={adm1} alt="Usuários" />
                        </div>
                        <div className="card-content">
                            <h2>Usuários ativos</h2>
                            <div className="number">1532</div>
                            <div className="trend"><span>-2,4%</span> este mês</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-icon">
                            <img src={adm2} alt="Consultas" />
                        </div>
                        <div className="card-content">
                            <h2>Consultas do dia</h2>
                            <div className="number">67</div>
                            <div className="pending"><span>8</span> pendentes</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-icon">
                            <img src={adm3} alt="Concluídas" />
                        </div>
                        <div className="card-content">
                            <h2>Consultas concluídas</h2>
                            <div className="number">32</div>
                            <div className="total-completed">Consultas concluídas (geral)</div>
                        </div>
                    </div>
                </div>

                {/* Monthly Chart */}
                <div className="chart-section">
                    <div className="chart-header">
                        <h2>MENSAL</h2>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                                <span>Conclusões (%)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#94a3b8' }}></div>
                                <span>Consultas</span>
                            </div>
                        </div>
                    </div>
                    <div className="bars-container">
                        {monthlyData.map((data, idx) => (
                            <div key={idx} className="bar-item">
                                <div 
                                    className={`bar month-${idx + 1}`}
                                    style={{ 
                                        height: data.consultations > 0 ? `${Math.min(data.consultations / 30, 80)}px` : '28px',
                                        backgroundColor: data.consultations > 0 ? '#94a3b8' : '#3b82f6'
                                    }}
                                ></div>
                                <div className="bar-label">{data.month}</div>
                                <div className="bar-stats">
                                    {data.conclusions} <br />
                                    {data.consultations > 0 ? `${data.consultations}` : '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Consultations Table */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>CONSULTAS RECENTES</h2>
                        <button className="view-all-btn">Ver tudo</button>
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
                            {consultations.map((consult) => (
                                <tr key={consult.id}>
                                    <td>{consult.name}</td>
                                    <td>{consult.date}</td>
                                    <td>
                                        <span className={getStatusClass(consult.status)}>
                                            {consult.status}
                                        </span>
                                    </td>
                                    <td>{consult.type}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(consult.id)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(consult.id)}
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