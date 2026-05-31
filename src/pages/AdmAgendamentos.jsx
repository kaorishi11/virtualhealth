import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminAgendamentos() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ 
        total: 0, 
        agendadas: 0, 
        concluidas: 0, 
        canceladas: 0,
        presencial: 0,
        teleconsulta: 0
    });

    // States para o modal de edição de status
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [novoStatus, setNovoStatus] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    // States para o modal de detalhes
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDetails, setSelectedDetails] = useState(null);

    useEffect(() => {
        carregarAgendamentos();
    }, []);

    const carregarAgendamentos = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('agendamentos')
                .select(`
                    *,
                    paciente:paciente_id(id, nome, foto, telefone, email),
                    medico:medico_id(id, nome, especialidade, crm, foto)
                `)
                .order('data_consulta', { ascending: false });

            if (error) throw error;

            console.log('Agendamentos carregados:', data);

            const agendamentosFormatados = data.map(ag => ({
                id: ag.id,
                paciente_id: ag.paciente_id,
                paciente_nome: ag.paciente?.nome || 'Paciente não encontrado',
                paciente_foto: ag.paciente?.foto,
                paciente_telefone: ag.paciente?.telefone || '-',
                paciente_email: ag.paciente?.email || '-',
                medico_id: ag.medico_id,
                medico_nome: ag.medico?.nome || 'Médico não encontrado',
                medico_especialidade: ag.medico?.especialidade || '-',
                medico_crm: ag.medico?.crm || '-',
                medico_foto: ag.medico?.foto,
                tipo: ag.tipo,
                data_consulta: ag.data_consulta,
                data_formatada: new Date(ag.data_consulta).toLocaleDateString('pt-BR'),
                horario: ag.horario?.substring(0, 5) || '-',
                status: ag.status,
                link_teleconsulta: ag.link_teleconsulta,
                created_at: ag.created_at,
                data_criacao: new Date(ag.created_at).toLocaleDateString('pt-BR')
            }));
            
            setAgendamentos(agendamentosFormatados);
            
            // Calcular estatísticas
            const agendadas = agendamentosFormatados.filter(a => a.status === 'agendada').length;
            const concluidas = agendamentosFormatados.filter(a => a.status === 'concluida').length;
            const canceladas = agendamentosFormatados.filter(a => a.status === 'cancelada').length;
            const presencial = agendamentosFormatados.filter(a => a.tipo === 'presencial').length;
            const teleconsulta = agendamentosFormatados.filter(a => a.tipo === 'teleconsulta').length;
            
            setEstatisticas({
                total: agendamentosFormatados.length,
                agendadas,
                concluidas,
                canceladas,
                presencial,
                teleconsulta
            });
            
        } catch (err) {
            console.error('Erro ao carregar agendamentos:', err);
            alert('Erro ao carregar agendamentos. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = (agendamento) => {
        setSelectedAgendamento(agendamento);
        setNovoStatus(agendamento.status);
        setShowStatusModal(true);
    };

    const handleConfirmarStatus = async () => {
        if (!selectedAgendamento || !novoStatus) return;
        
        setModalLoading(true);
        try {
            const { error } = await supabase
                .from('agendamentos')
                .update({ status: novoStatus })
                .eq('id', selectedAgendamento.id);

            if (error) throw error;

            alert(`Status atualizado para ${getStatusText(novoStatus)} com sucesso!`);
            
            setShowStatusModal(false);
            setSelectedAgendamento(null);
            await carregarAgendamentos();
            
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            alert('Erro ao atualizar status: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewDetails = (agendamento) => {
        setSelectedDetails(agendamento);
        setShowDetailsModal(true);
    };

    const handleOpenLink = (link) => {
        if (link) {
            window.open(link, '_blank');
        } else {
            alert('Link da teleconsulta não disponível');
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'agendada': return 'status-agendada';
            case 'concluida': return 'status-concluida';
            case 'cancelada': return 'status-cancelada';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'agendada': return 'Agendada';
            case 'concluida': return 'Concluída';
            case 'cancelada': return 'Cancelada';
            default: return status;
        }
    };

    const getTipoIcon = (tipo) => {
        return tipo === 'teleconsulta' ? '💻' : '🏥';
    };

    const getTipoText = (tipo) => {
        return tipo === 'teleconsulta' ? 'Online' : 'Presencial';
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarAgendamentos = async () => {
            if (searchTerm.trim() === '') {
                carregarAgendamentos();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('agendamentos')
                    .select(`
                        *,
                        paciente:paciente_id(id, nome, foto, telefone, email),
                        medico:medico_id(id, nome, especialidade, crm, foto)
                    `)
                    .or(`paciente.nome.ilike.%${searchTerm}%,medico.nome.ilike.%${searchTerm}%,medico.especialidade.ilike.%${searchTerm}%`);

                if (error) throw error;

                const agendamentosFormatados = (data || []).map(ag => ({
                    id: ag.id,
                    paciente_id: ag.paciente_id,
                    paciente_nome: ag.paciente?.nome || 'Paciente não encontrado',
                    paciente_foto: ag.paciente?.foto,
                    paciente_telefone: ag.paciente?.telefone || '-',
                    paciente_email: ag.paciente?.email || '-',
                    medico_id: ag.medico_id,
                    medico_nome: ag.medico?.nome || 'Médico não encontrado',
                    medico_especialidade: ag.medico?.especialidade || '-',
                    medico_crm: ag.medico?.crm || '-',
                    medico_foto: ag.medico?.foto,
                    tipo: ag.tipo,
                    data_consulta: ag.data_consulta,
                    data_formatada: new Date(ag.data_consulta).toLocaleDateString('pt-BR'),
                    horario: ag.horario?.substring(0, 5) || '-',
                    status: ag.status,
                    link_teleconsulta: ag.link_teleconsulta,
                    created_at: ag.created_at,
                    data_criacao: new Date(ag.created_at).toLocaleDateString('pt-BR')
                }));
                
                setAgendamentos(agendamentosFormatados);
                
            } catch (err) {
                console.error('Erro ao buscar agendamentos:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarAgendamentos();
            } else {
                carregarAgendamentos();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    if (loading && agendamentos.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando agendamentos...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="main-content">
                <div className="welcome-section">
                    <h1>Gerenciamento de Agendamentos</h1>
                    <p>Gerencie todas as consultas agendadas na plataforma</p>
                </div>

                <div className="stats-cards grid-6">
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
                            <div className="stat-number">{estatisticas.total}</div>
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
                            <h3>Agendadas</h3>
                            <div className="stat-number">{estatisticas.agendadas}</div>
                            <span className="stat-label pending-badge">Pendentes</span>
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
                            <div className="stat-number">{estatisticas.concluidas}</div>
                            <span className="stat-label completed-badge">Realizadas</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Canceladas</h3>
                            <div className="stat-number">{estatisticas.canceladas}</div>
                            <span className="stat-label">Canceladas</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Presencial</h3>
                            <div className="stat-number">{estatisticas.presencial}</div>
                            <span className="stat-label">Consultas</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m9 8 5 4-5 4V8z"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Teleconsulta</h3>
                            <div className="stat-number">{estatisticas.teleconsulta}</div>
                            <span className="stat-label">Online</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>TODOS OS AGENDAMENTOS</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar por paciente, médico ou especialidade..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="agendamentos-table">
                            <thead>
                                <tr>
                                    <th>PACIENTE</th>
                                    <th>MÉDICO</th>
                                    <th>ESPECIALIDADE</th>
                                    <th>DATA</th>
                                    <th>HORÁRIO</th>
                                    <th>TIPO</th>
                                    <th>STATUS</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agendamentos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhum agendamento encontrado para esta busca' : 'Nenhum agendamento cadastrado ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    agendamentos.map(ag => (
                                        <tr key={ag.id}>
                                            <td>
                                                <div className="user-cell">
                                                    {ag.paciente_foto ? (
                                                        <img src={ag.paciente_foto} alt="" className="avatar-small" />
                                                    ) : (
                                                        <div className="avatar-small-iniciais" style={{ backgroundColor: '#3b82f6' }}>
                                                            {ag.paciente_nome?.charAt(0) || 'P'}
                                                        </div>
                                                    )}
                                                    <span>{ag.paciente_nome}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="user-cell">
                                                    {ag.medico_foto ? (
                                                        <img src={ag.medico_foto} alt="" className="avatar-small" />
                                                    ) : (
                                                        <div className="avatar-small-iniciais" style={{ backgroundColor: '#1a6b6f' }}>
                                                            {ag.medico_nome?.charAt(0) || 'M'}
                                                        </div>
                                                    )}
                                                    <span>{ag.medico_nome}</span>
                                                </div>
                                            </td>
                                            <td>{ag.medico_especialidade}</td>
                                            <td>{ag.data_formatada}</td>
                                            <td>{ag.horario}</td>
                                            <td>
                                                <span className={`tipo-badge ${ag.tipo}`}>
                                                    {ag.tipo === 'teleconsulta' ? 'Online' : 'Presencial'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={getStatusClass(ag.status)}>
                                                    {getStatusText(ag.status)}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                <button className="view-btn" onClick={() => handleViewDetails(ag)}>
                                                    Detalhes
                                                </button>
                                                <button className="edit-btn" onClick={() => handleChangeStatus(ag)}>
                                                    Alterar Status
                                                </button>
                                                {ag.tipo === 'teleconsulta' && ag.link_teleconsulta && (
                                                    <button className="link-btn" onClick={() => handleOpenLink(ag.link_teleconsulta)}>
                                                        Acessar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL DE ALTERAÇÃO DE STATUS */}
            {showStatusModal && selectedAgendamento && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Alterar Status da Consulta</h2>
                            <button 
                                onClick={() => setShowStatusModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="modal-info" style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                            <p><strong>Paciente:</strong> {selectedAgendamento.paciente_nome}</p>
                            <p><strong>Médico:</strong> {selectedAgendamento.medico_nome}</p>
                            <p><strong>Data:</strong> {selectedAgendamento.data_formatada} às {selectedAgendamento.horario}</p>
                            <p><strong>Tipo:</strong> {selectedAgendamento.tipo === 'teleconsulta' ? 'Online' : 'Presencial'}</p>
                        </div>

                        <div className="form-group">
                            <label>Novo Status</label>
                            <select 
                                value={novoStatus} 
                                onChange={(e) => setNovoStatus(e.target.value)}
                                className="status-select-modal"
                            >
                                <option value="agendada">Agendada</option>
                                <option value="concluida">Concluída</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowStatusModal(false)}>
                                Cancelar
                            </button>
                            <button type="button" onClick={handleConfirmarStatus} disabled={modalLoading}>
                                {modalLoading ? 'Salvando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE DETALHES */}
            {showDetailsModal && selectedDetails && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Detalhes da Consulta</h2>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="details-section">
                            <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Paciente</h3>
                            <div className="details-row">
                                <span className="details-label">Nome:</span>
                                <span className="details-value">{selectedDetails.paciente_nome}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Telefone:</span>
                                <span className="details-value">{selectedDetails.paciente_telefone}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Email:</span>
                                <span className="details-value">{selectedDetails.paciente_email}</span>
                            </div>

                            <h3 style={{ color: 'var(--primary-color)', marginTop: '20px', marginBottom: '15px' }}>Médico</h3>
                            <div className="details-row">
                                <span className="details-label">Nome:</span>
                                <span className="details-value">{selectedDetails.medico_nome}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Especialidade:</span>
                                <span className="details-value">{selectedDetails.medico_especialidade}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">CRM:</span>
                                <span className="details-value">{selectedDetails.medico_crm}</span>
                            </div>

                            <h3 style={{ color: 'var(--primary-color)', marginTop: '20px', marginBottom: '15px' }}>Consulta</h3>
                            <div className="details-row">
                                <span className="details-label">Data:</span>
                                <span className="details-value">{selectedDetails.data_formatada}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Horário:</span>
                                <span className="details-value">{selectedDetails.horario}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Tipo:</span>
                                <span className="details-value">{selectedDetails.tipo === 'teleconsulta' ? 'Online' : 'Presencial'}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Status:</span>
                                <span className={`details-status ${getStatusClass(selectedDetails.status)}`}>
                                    {getStatusText(selectedDetails.status)}
                                </span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Data Cadastro:</span>
                                <span className="details-value">{selectedDetails.data_criacao}</span>
                            </div>

                            {selectedDetails.tipo === 'teleconsulta' && selectedDetails.link_teleconsulta && (
                                <div className="details-row">
                                    <span className="details-label">Link:</span>
                                    <button className="link-details-btn" onClick={() => handleOpenLink(selectedDetails.link_teleconsulta)}>
                                        Acessar Teleconsulta
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowDetailsModal(false)}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}