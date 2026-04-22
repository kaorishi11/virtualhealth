import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdmMensagem.css';

import logo from '../images/logo.png';
import iconMensagens from '../images/icon3.png';

export default function AdminMensagens() {
    // Dados das mensagens
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

    const [searchTerm, setSearchTerm] = useState('');

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
    };

    const handleDelete = (id) => {
        if (window.confirm(`⚠️ Tem certeza que deseja excluir esta mensagem?`)) {
            setMensagens(mensagens.filter(m => m.id !== id));
            alert('✅ Mensagem excluída com sucesso!');
        }
    };

    const handleRocketAction = (id) => {
        const mensagem = mensagens.find(m => m.id === id);
        alert(`🚀 Responder mensagem de ${mensagem.nome}`);
    };

    const filteredMensagens = mensagens.filter(mensagem =>
        mensagem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mensagem.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Estatísticas
    const totalMensagens = mensagens.length;
    const mensagensPendentes = mensagens.filter(m => m.status === 'Pendente').length;
    const mensagensVistas = mensagens.filter(m => m.status === 'Visto').length;
    const mensagensExcluidas = mensagens.filter(m => m.status === 'Excluída').length;

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
                                       <li><Link to="/admconsultas">Consultas</Link></li>
                                       <li className="active"><Link to="/admmensagens">Mensagens</Link></li>
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
                    <h1>Gerenciamento de Mensagens</h1>
                </div>

                {/* Tabela de Mensagens */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>MENSAGENS RECEBIDAS</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar mensagem..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                            {filteredMensagens.map((mensagem) => (
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
                                            Responder
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(mensagem.id)}
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