import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminConsultas() {
    const [salas, setSalas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ 
        total: 0, 
        aguardando: 0, 
        aguardando_medico: 0,
        ativa: 0, 
        finalizada: 0
    });

    // States para o modal de detalhes
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSala, setSelectedSala] = useState(null);

    // States para o modal de criação/edição
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingSala, setEditingSala] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        codigo: '',
        medico_id: '',
        paciente_id: '',
        agendamento_id: '',
        sala_url: '',
        status: 'aguardando'
    });

    // States para médicos e pacientes
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);

    useEffect(() => {
        carregarSalas();
        carregarMedicos();
        carregarPacientes();
        carregarAgendamentos();
    }, []);

    const carregarSalas = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('consulta_salas')
                .select(`
                    *,
                    medico:medico_id(id, nome, especialidade, crm),
                    paciente:paciente_id(id, nome, telefone),
                    agendamento:agendamento_id(id, data_consulta, horario)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const salasFormatadas = data.map(sala => ({
                id: sala.id,
                codigo: sala.codigo,
                medico_id: sala.medico_id,
                medico_nome: sala.medico?.nome || 'Médico não encontrado',
                medico_especialidade: sala.medico?.especialidade || '-',
                medico_crm: sala.medico?.crm || '-',
                paciente_id: sala.paciente_id,
                paciente_nome: sala.paciente?.nome || 'Paciente não encontrado',
                paciente_telefone: sala.paciente?.telefone || '-',
                agendamento_id: sala.agendamento_id,
                agendamento_data: sala.agendamento?.data_consulta || '-',
                agendamento_horario: sala.agendamento?.horario?.substring(0, 5) || '-',
                sala_url: sala.sala_url,
                status: sala.status,
                created_at: sala.created_at,
                data_criacao: new Date(sala.created_at).toLocaleDateString('pt-BR'),
                updated_at: sala.updated_at
            }));
            
            setSalas(salasFormatadas);
            
            const aguardando = salasFormatadas.filter(s => s.status === 'aguardando').length;
            const aguardando_medico = salasFormatadas.filter(s => s.status === 'aguardando_medico').length;
            const ativa = salasFormatadas.filter(s => s.status === 'ativa').length;
            const finalizada = salasFormatadas.filter(s => s.status === 'finalizada').length;
            
            setEstatisticas({
                total: salasFormatadas.length,
                aguardando,
                aguardando_medico,
                ativa,
                finalizada
            });
            
        } catch (err) {
            console.error('Erro ao carregar salas:', err);
            alert('Erro ao carregar salas de consulta. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const carregarMedicos = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id, nome, especialidade, crm')
                .eq('tipo', 'medico')
                .order('nome');

            if (error) throw error;
            setMedicos(data || []);
        } catch (err) {
            console.error('Erro ao carregar médicos:', err);
        }
    };

    const carregarPacientes = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id, nome, telefone')
                .eq('tipo', 'paciente')
                .order('nome');

            if (error) throw error;
            setPacientes(data || []);
        } catch (err) {
            console.error('Erro ao carregar pacientes:', err);
        }
    };

    const carregarAgendamentos = async () => {
        try {
            const { data, error } = await supabase
                .from('agendamentos')
                .select('id, data_consulta, horario, tipo, status')
                .eq('status', 'agendada')
                .order('data_consulta', { ascending: false });

            if (error) throw error;
            setAgendamentos(data || []);
        } catch (err) {
            console.error('Erro ao carregar agendamentos:', err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            codigo: '',
            medico_id: '',
            paciente_id: '',
            agendamento_id: '',
            sala_url: '',
            status: 'aguardando'
        });
        setEditingSala(null);
    };

    const gerarCodigoAleatorio = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        setFormData(prev => ({ ...prev, codigo }));
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data, error } = await supabase
                .from('consulta_salas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setEditingSala(data);
            setFormData({
                codigo: data.codigo || '',
                medico_id: data.medico_id || '',
                paciente_id: data.paciente_id || '',
                agendamento_id: data.agendamento_id || '',
                sala_url: data.sala_url || '',
                status: data.status || 'aguardando'
            });
            setShowFormModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar sala:', err);
            alert('Erro ao buscar dados da sala: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta sala de consulta?')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('consulta_salas')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarSalas();
                
                alert('Sala de consulta excluída com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir sala:', err);
                alert('Erro ao excluir sala: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleViewDetails = (sala) => {
        setSelectedSala(sala);
        setShowDetailsModal(true);
    };

    const handleSalvarSala = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.codigo || !formData.medico_id || !formData.sala_url) {
                alert('Por favor, preencha os campos obrigatórios: Código, Médico e URL da Sala');
                setModalLoading(false);
                return;
            }

            const dadosSala = {
                codigo: formData.codigo.toUpperCase(),
                medico_id: formData.medico_id,
                paciente_id: formData.paciente_id || null,
                agendamento_id: formData.agendamento_id || null,
                sala_url: formData.sala_url,
                status: formData.status
            };

            if (editingSala) {
                const { error: updateError } = await supabase
                    .from('consulta_salas')
                    .update(dadosSala)
                    .eq('id', editingSala.id);

                if (updateError) throw updateError;
                alert('Sala de consulta atualizada com sucesso!');
                
            } else {
                const { data: existing, error: checkError } = await supabase
                    .from('consulta_salas')
                    .select('codigo')
                    .eq('codigo', formData.codigo.toUpperCase());

                if (checkError) throw checkError;

                if (existing && existing.length > 0) {
                    alert('Este código já está em uso. Por favor, gere um código diferente.');
                    setModalLoading(false);
                    return;
                }

                const { error: insertError } = await supabase
                    .from('consulta_salas')
                    .insert([dadosSala]);

                if (insertError) throw insertError;
                alert('Sala de consulta cadastrada com sucesso!');
            }
            
            setShowFormModal(false);
            resetForm();
            await carregarSalas();
            
        } catch (err) {
            console.error('Erro ao salvar sala:', err);
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenSala = (url) => {
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('URL da sala não disponível');
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'aguardando': return 'status-aguardando';
            case 'aguardando_medico': return 'status-aguardando-medico';
            case 'ativa': return 'status-ativa';
            case 'finalizada': return 'status-finalizada';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'aguardando': return 'Aguardando';
            case 'aguardando_medico': return 'Aguardando Médico';
            case 'ativa': return 'Ativa';
            case 'finalizada': return 'Finalizada';
            default: return status;
        }
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarSalas = async () => {
            if (searchTerm.trim() === '') {
                carregarSalas();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('consulta_salas')
                    .select(`
                        *,
                        medico:medico_id(id, nome, especialidade, crm),
                        paciente:paciente_id(id, nome, telefone),
                        agendamento:agendamento_id(id, data_consulta, horario)
                    `)
                    .or(`codigo.ilike.%${searchTerm}%,medico.nome.ilike.%${searchTerm}%,paciente.nome.ilike.%${searchTerm}%`);

                if (error) throw error;

                const salasFormatadas = (data || []).map(sala => ({
                    id: sala.id,
                    codigo: sala.codigo,
                    medico_id: sala.medico_id,
                    medico_nome: sala.medico?.nome || 'Médico não encontrado',
                    medico_especialidade: sala.medico?.especialidade || '-',
                    medico_crm: sala.medico?.crm || '-',
                    paciente_id: sala.paciente_id,
                    paciente_nome: sala.paciente?.nome || 'Paciente não encontrado',
                    paciente_telefone: sala.paciente?.telefone || '-',
                    agendamento_id: sala.agendamento_id,
                    agendamento_data: sala.agendamento?.data_consulta || '-',
                    agendamento_horario: sala.agendamento?.horario?.substring(0, 5) || '-',
                    sala_url: sala.sala_url,
                    status: sala.status,
                    created_at: sala.created_at,
                    data_criacao: new Date(sala.created_at).toLocaleDateString('pt-BR')
                }));
                
                setSalas(salasFormatadas);
                
            } catch (err) {
                console.error('Erro ao buscar salas:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarSalas();
            } else {
                carregarSalas();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    if (loading && salas.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando salas de consulta...</p>
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
                    <h1>Gerenciamento de Salas de Consulta</h1>
                    <p>Gerencie as salas de videoconferência para teleconsultas</p>
                </div>

                <div className="stats-cards grid-5">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total</h3>
                            <div className="stat-number">{estatisticas.total}</div>
                            <span className="stat-label">Salas</span>
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
                            <h3>Aguardando</h3>
                            <div className="stat-number">{estatisticas.aguardando}</div>
                            <span className="stat-label">Paciente</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 12V8H4v4M12 4v4M4 8h16"/>
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Aguardando</h3>
                            <div className="stat-number">{estatisticas.aguardando_medico}</div>
                            <span className="stat-label">Médico</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Ativas</h3>
                            <div className="stat-number">{estatisticas.ativa}</div>
                            <span className="stat-label">Em andamento</span>
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
                            <h3>Finalizadas</h3>
                            <div className="stat-number">{estatisticas.finalizada}</div>
                            <span className="stat-label">Concluídas</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>SALAS DE CONSULTA</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar por código, médico ou paciente..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="salas-table">
                            <thead>
                                <tr>
                                    <th>CÓDIGO</th>
                                    <th>MÉDICO</th>
                                    <th>PACIENTE</th>
                                    <th>AGENDAMENTO</th>
                                    <th>STATUS</th>
                                    <th>DATA CRIAÇÃO</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhuma sala encontrada para esta busca' : 'Nenhuma sala de consulta cadastrada ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    salas.map(sala => (
                                        <tr key={sala.id}>
                                            <td>
                                                <span className="codigo-badge">{sala.codigo}</span>
                                            </td>
                                            <td>
                                                {sala.medico_nome}<br/><small>{sala.medico_especialidade}</small>
                                            </td>
                                            <td>
                                                {sala.paciente_nome}<br/><small>{sala.paciente_telefone}</small>
                                            </td>
                                            <td>
                                                {sala.agendamento_data !== '-' ? (
                                                    <span className="agendamento-info">
                                                        {sala.agendamento_data} às {sala.agendamento_horario}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <span className={getStatusClass(sala.status)}>
                                                    {getStatusText(sala.status)}
                                                </span>
                                            </td>
                                            <td>{sala.data_criacao}</td>
                                            <td className="action-buttons">
                                                <button className="view-btn" onClick={() => handleViewDetails(sala)}>
                                                    Detalhes
                                                </button>
                                                <button className="edit-btn" onClick={() => handleEdit(sala.id)}>
                                                    Editar
                                                </button>
                                                {sala.sala_url && (
                                                    <button className="link-btn" onClick={() => handleOpenSala(sala.sala_url)}>
                                                        Acessar
                                                    </button>
                                                )}
                                                <button className="delete-btn" onClick={() => handleDelete(sala.id)}>
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button className="btn-primary" onClick={() => {
                            resetForm();
                            gerarCodigoAleatorio();
                            setShowFormModal(true);
                        }}>
                            Nova Sala
                        </button>
                    </div>
                </div>
            </main>

            {/* MODAL DE DETALHES */}
            {showDetailsModal && selectedSala && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Detalhes da Sala</h2>
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
                            <div className="details-row">
                                <span className="details-label">Código:</span>
                                <span className="details-value codigo-destaque">{selectedSala.codigo}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Médico:</span>
                                <span className="details-value">{selectedSala.medico_nome}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Especialidade:</span>
                                <span className="details-value">{selectedSala.medico_especialidade}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">CRM:</span>
                                <span className="details-value">{selectedSala.medico_crm}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Paciente:</span>
                                <span className="details-value">{selectedSala.paciente_nome}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Telefone:</span>
                                <span className="details-value">{selectedSala.paciente_telefone}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Agendamento:</span>
                                <span className="details-value">{selectedSala.agendamento_data} às {selectedSala.agendamento_horario}</span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Status:</span>
                                <span className={`details-status ${getStatusClass(selectedSala.status)}`}>
                                    {getStatusText(selectedSala.status)}
                                </span>
                            </div>
                            <div className="details-row">
                                <span className="details-label">URL da Sala:</span>
                                <button className="link-details-btn" onClick={() => handleOpenSala(selectedSala.sala_url)}>
                                    Acessar Sala
                                </button>
                            </div>
                            <div className="details-row">
                                <span className="details-label">Data Criação:</span>
                                <span className="details-value">{selectedSala.data_criacao}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowDetailsModal(false)}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {showFormModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingSala ? 'Editar Sala' : 'Nova Sala de Consulta'}</h2>
                            <button 
                                onClick={() => {
                                    setShowFormModal(false);
                                    resetForm();
                                }}
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
                        
                        <form onSubmit={handleSalvarSala}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                                <div className="form-group">
                                    <label>CÓDIGO DA SALA *</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Ex: ABC123"
                                        maxLength="6"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <button type="button" className="btn-secondary" onClick={gerarCodigoAleatorio} style={{ padding: '10px 16px' }}>
                                        Gerar Código
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>MÉDICO *</label>
                                <select 
                                    name="medico_id" 
                                    value={formData.medico_id} 
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione um médico</option>
                                    {medicos.map(medico => (
                                        <option key={medico.id} value={medico.id}>
                                            {medico.nome} - {medico.especialidade} ({medico.crm || 'Sem CRM'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>PACIENTE</label>
                                <select 
                                    name="paciente_id" 
                                    value={formData.paciente_id} 
                                    onChange={handleInputChange}
                                >
                                    <option value="">Selecione um paciente</option>
                                    {pacientes.map(paciente => (
                                        <option key={paciente.id} value={paciente.id}>
                                            {paciente.nome} - {paciente.telefone || 'Sem telefone'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>AGENDAMENTO</label>
                                <select 
                                    name="agendamento_id" 
                                    value={formData.agendamento_id} 
                                    onChange={handleInputChange}
                                >
                                    <option value="">Selecione um agendamento</option>
                                    {agendamentos.map(ag => (
                                        <option key={ag.id} value={ag.id}>
                                            {new Date(ag.data_consulta).toLocaleDateString('pt-BR')} às {ag.horario?.substring(0, 5)} - {ag.tipo === 'teleconsulta' ? 'Online' : 'Presencial'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>URL DA SALA *</label>
                                <input
                                    type="url"
                                    name="sala_url"
                                    value={formData.sala_url}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                />
                                <small style={{ color: '#666', fontSize: '11px' }}>
                                    Insira a URL da sala de videoconferência (Google Meet, Zoom, etc.)
                                </small>
                            </div>

                            <div className="form-group">
                                <label>STATUS</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleInputChange}
                                >
                                    <option value="aguardando">Aguardando Paciente</option>
                                    <option value="aguardando_medico">Aguardando Médico</option>
                                    <option value="ativa">Ativa (Em andamento)</option>
                                    <option value="finalizada">Finalizada</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => {
                                    setShowFormModal(false);
                                    resetForm();
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={modalLoading}>
                                    {modalLoading ? 'Salvando...' : (editingSala ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}