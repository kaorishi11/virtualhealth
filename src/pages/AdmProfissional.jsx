import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmProfissional.css';

import logo from '../images/logo.png';
import iconProfissionais from '../images/icon2.png';

export default function AdminProfissionais() {
    // Dados dos profissionais
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

    const [searchTerm, setSearchTerm] = useState('');

    const getStatusClass = (status) => {
        return status === 'Aceito' ? 'status-aceito' : 'status-negado';
    };

    const handleEdit = (id) => {
        const profissional = profissionais.find(p => p.id === id);
        alert(`✏️ Editar profissional: ${profissional.nome}`);
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir este profissional?`)) {
            setProfissionais(profissionais.filter(p => p.id !== id));
            alert('✅ Profissional excluído com sucesso!');
        }
    };

    const handleNovoProfissional = () => {
        alert('➕ Abrir formulário para novo profissional');
    };

    const filteredProfissionais = profissionais.filter(profissional =>
        profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.registro.toLowerCase().includes(searchTerm.toLowerCase())
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
                                        <li ><Link to="/admin">Visão geral</Link></li>
                                        <li><Link to="/admusuarios">Usuários</Link></li>
                                        <li className="active"><Link to="/admprofissionais">Profissionais</Link></li>
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
                    <h1>Gerenciamento de Profissionais</h1>
                </div>

                {/* Tabela de Profissionais */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>PROFISSIONAIS CADASTRADOS</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar profissional..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                            {filteredProfissionais.map((profissional) => (
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
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Botão Novo Profissional */}
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