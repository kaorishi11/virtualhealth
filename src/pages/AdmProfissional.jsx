import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSidebar";


export default function AdminProfissionais() {
    const [profissionais, setProfissionais] = useState([
        { id: 1, nome: 'Vinícius Queiroz', especialidade: 'Oftalmologista', status: 'Negado', data: '01/03/2026', telefone: '(12) 99800-0726', registro: 'CRM-SP 123456' },
        { id: 2, nome: 'Pedro Lucas', especialidade: 'Dentista', status: 'Aceito', data: '05/03/2026', telefone: '(12) 99800-0726', registro: 'CRO-MG 45678' },
        { id: 3, nome: 'Miguel Chagas', especialidade: 'Psicólogo', status: 'Aceito', data: '10/03/2025', telefone: '(12) 99800-0726', registro: 'CRP-06/98765' },
        { id: 4, nome: 'Giovana Paula', especialidade: 'Nutricionista', status: 'Negado', data: '20/03/2026', telefone: '(12) 99800-0726', registro: 'CRM-SP 123456' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const totalProfissionais = profissionais.length;
    const aceitos = profissionais.filter(p => p.status === 'Aceito').length;
    const negados = profissionais.filter(p => p.status === 'Negado').length;

    const getStatusClass = (status) => status === 'Aceito' ? 'status-aceito' : 'status-negado';

    const handleEdit = (id) => {
        const profissional = profissionais.find(p => p.id === id);
        alert(`✏️ Editar profissional: ${profissional.nome}`);
    };

    const handleDelete = (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir este profissional?')) {
            setProfissionais(profissionais.filter(p => p.id !== id));
            alert('✅ Profissional excluído com sucesso!');
        }
    };

    const handleNovoProfissional = () => {
        alert('➕ Abrir formulário para novo profissional');
    };

    const filteredProfissionais = profissionais.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.registro.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section"><h1>Gerenciamento de Profissionais</h1></div>

               <div className="stats-cards grid-3">
    {/* Total - Ícone de pessoas */}
    <div className="stat-card">
        <div className="stat-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        </div>
        <div className="stat-info">
            <h3>Total</h3>
            <div className="stat-number">{totalProfissionais}</div>
            <span className="stat-label">Cadastrados</span>
        </div>
    </div>

    {/* Aceitos - Ícone de check dentro do círculo */}
    <div className="stat-card">
        <div className="stat-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        </div>
        <div className="stat-info">
            <h3>Aceitos</h3>
            <div className="stat-number">{aceitos}</div>
            <span className="stat-label">Aprovados</span>
        </div>
    </div>

    {/* Negados - Ícone de X dentro do círculo */}
    <div className="stat-card">
        <div className="stat-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </div>
        <div className="stat-info">
            <h3>Negados</h3>
            <div className="stat-number">{negados}</div>
            <span className="stat-label">Reprovados</span>
        </div>
    </div>
</div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>PROFISSIONAIS CADASTRADOS</h2>
                        <div className="search-wrapper">
                            <input type="text" placeholder="Buscar profissional..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="profissionais-table">
                            <thead><tr><th>PROFISSIONAL</th><th>ESPECIALIDADE</th><th>STATUS</th><th>DATA</th><th>TELEFONE</th><th>REGISTRO</th><th>AÇÃO</th></tr></thead>
                            <tbody>
                                {filteredProfissionais.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.nome}</td><td>{p.especialidade}</td>
                                        <td><span className={getStatusClass(p.status)}>{p.status}</span></td>
                                        <td>{p.data}</td><td>{p.telefone}</td><td>{p.registro}</td>
                                        <td className="action-buttons">
                                            <button className="edit-btn" onClick={() => handleEdit(p.id)}>Editar</button>
                                            <button className="delete-btn" onClick={() => handleDelete(p.id)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="new-profissional-btn"><button className="btn-primary" onClick={handleNovoProfissional}>+ Novo Profissional</button></div>
                </div>
            </main>
        </div>
    );
}