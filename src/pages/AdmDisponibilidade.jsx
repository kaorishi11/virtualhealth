import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminDisponibilidade() {
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ total: 0, ativos: 0, inativos: 0 });

    // States para o modal
    const [showModal, setShowModal] = useState(false);
    const [editingDisponibilidade, setEditingDisponibilidade] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        medico_id: '',
        dia_semana: '',
        horario_inicio: '',
        horario_fim: '',
        ativo: true
    });

    const diasSemana = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Segunda-feira' },
        { value: 2, label: 'Terça-feira' },
        { value: 3, label: 'Quarta-feira' },
        { value: 4, label: 'Quinta-feira' },
        { value: 5, label: 'Sexta-feira' },
        { value: 6, label: 'Sábado' }
    ];

    // Carregar dados
    useEffect(() => {
        carregarDisponibilidades();
        carregarMedicos();
    }, []);

    const carregarDisponibilidades = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('medico_disponibilidade')
                .select(`
                    *,
                    medico:medico_id(nome, especialidade, crm)
                `)
                .order('dia_semana', { ascending: true });

            if (error) throw error;

            console.log('Disponibilidades carregadas:', data);

            const disponibilidadesFormatadas = data.map(disp => ({
                id: disp.id,
                medico_id: disp.medico_id,
                medico_nome: disp.medico?.nome || 'Médico não encontrado',
                medico_especialidade: disp.medico?.especialidade || '-',
                medico_crm: disp.medico?.crm || '-',
                dia_semana: disp.dia_semana,
                dia_semana_nome: diasSemana.find(d => d.value === disp.dia_semana)?.label || 'Desconhecido',
                horario_inicio: disp.horario_inicio?.substring(0, 5) || '-',
                horario_fim: disp.horario_fim?.substring(0, 5) || '-',
                ativo: disp.ativo
            }));
            
            setDisponibilidades(disponibilidadesFormatadas);
            
            const ativos = disponibilidadesFormatadas.filter(d => d.ativo === true).length;
            setEstatisticas({
                total: disponibilidadesFormatadas.length,
                ativos: ativos,
                inativos: disponibilidadesFormatadas.length - ativos
            });
            
        } catch (err) {
            console.error('Erro ao carregar disponibilidades:', err);
            alert('Erro ao carregar disponibilidades. Tente novamente mais tarde.');
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            medico_id: '',
            dia_semana: '',
            horario_inicio: '',
            horario_fim: '',
            ativo: true
        });
        setEditingDisponibilidade(null);
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data, error } = await supabase
                .from('medico_disponibilidade')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setEditingDisponibilidade(data);
            setFormData({
                medico_id: data.medico_id || '',
                dia_semana: data.dia_semana || '',
                horario_inicio: data.horario_inicio?.substring(0, 5) || '',
                horario_fim: data.horario_fim?.substring(0, 5) || '',
                ativo: data.ativo !== undefined ? data.ativo : true
            });
            setShowModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar disponibilidade:', err);
            alert('Erro ao buscar dados da disponibilidade: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir esta disponibilidade?')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('medico_disponibilidade')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarDisponibilidades();
                
                alert('✅ Disponibilidade excluída com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir disponibilidade:', err);
                alert('❌ Erro ao excluir disponibilidade: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleToggleStatus = async (id, ativo) => {
        try {
            const { error } = await supabase
                .from('medico_disponibilidade')
                .update({ ativo: !ativo })
                .eq('id', id);

            if (error) throw error;
            
            await carregarDisponibilidades();
            
            alert(`✅ Disponibilidade ${!ativo ? 'ativada' : 'desativada'} com sucesso!`);
        } catch (err) {
            console.error('Erro ao alterar status:', err);
            alert('❌ Erro ao alterar status: ' + err.message);
        }
    };

    const handleSalvarDisponibilidade = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.medico_id || formData.dia_semana === '' || !formData.horario_inicio || !formData.horario_fim) {
                alert('Por favor, preencha todos os campos obrigatórios: Médico, Dia da Semana, Horário Início e Horário Fim');
                setModalLoading(false);
                return;
            }

            // Validar horários
            if (formData.horario_inicio >= formData.horario_fim) {
                alert('O horário de início deve ser menor que o horário de fim');
                setModalLoading(false);
                return;
            }

            const dadosDisponibilidade = {
                medico_id: formData.medico_id,
                dia_semana: parseInt(formData.dia_semana),
                horario_inicio: formData.horario_inicio,
                horario_fim: formData.horario_fim,
                ativo: formData.ativo
            };

            if (editingDisponibilidade) {
                // MODO EDIÇÃO
                const { error: updateError } = await supabase
                    .from('medico_disponibilidade')
                    .update(dadosDisponibilidade)
                    .eq('id', editingDisponibilidade.id);

                if (updateError) throw updateError;

                alert('✅ Disponibilidade atualizada com sucesso!');
                
            } else {
                // MODO CRIAÇÃO - Verificar se já existe disponibilidade para este médico neste dia
                const { data: existing, error: checkError } = await supabase
                    .from('medico_disponibilidade')
                    .select('*')
                    .eq('medico_id', formData.medico_id)
                    .eq('dia_semana', parseInt(formData.dia_semana));

                if (checkError) throw checkError;

                if (existing && existing.length > 0) {
                    alert('⚠️ Este médico já possui disponibilidade cadastrada para este dia da semana!');
                    setModalLoading(false);
                    return;
                }

                const { error: insertError } = await supabase
                    .from('medico_disponibilidade')
                    .insert([dadosDisponibilidade]);

                if (insertError) throw insertError;

                alert('✅ Disponibilidade cadastrada com sucesso!');
            }
            
            setShowModal(false);
            resetForm();
            await carregarDisponibilidades();
            
        } catch (err) {
            console.error('Erro ao salvar disponibilidade:', err);
            alert(`❌ Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarDisponibilidades = async () => {
            if (searchTerm.trim() === '') {
                carregarDisponibilidades();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('medico_disponibilidade')
                    .select(`
                        *,
                        medico:medico_id(nome, especialidade, crm)
                    `)
                    .or(`medico.nome.ilike.%${searchTerm}%,medico.especialidade.ilike.%${searchTerm}%`);

                if (error) throw error;

                const disponibilidadesFormatadas = (data || []).map(disp => ({
                    id: disp.id,
                    medico_id: disp.medico_id,
                    medico_nome: disp.medico?.nome || 'Médico não encontrado',
                    medico_especialidade: disp.medico?.especialidade || '-',
                    medico_crm: disp.medico?.crm || '-',
                    dia_semana: disp.dia_semana,
                    dia_semana_nome: diasSemana.find(d => d.value === disp.dia_semana)?.label || 'Desconhecido',
                    horario_inicio: disp.horario_inicio?.substring(0, 5) || '-',
                    horario_fim: disp.horario_fim?.substring(0, 5) || '-',
                    ativo: disp.ativo
                }));
                
                setDisponibilidades(disponibilidadesFormatadas);
                
            } catch (err) {
                console.error('Erro ao buscar disponibilidades:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarDisponibilidades();
            } else {
                carregarDisponibilidades();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const getDiaSemanaClasse = (dia) => {
        const classes = {
            0: 'domingo',
            1: 'segunda',
            2: 'terca',
            3: 'quarta',
            4: 'quinta',
            5: 'sexta',
            6: 'sabado'
        };
        return classes[dia] || '';
    };

    if (loading && disponibilidades.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando disponibilidades...</p>
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
                    <h1>Gerenciamento de Disponibilidade</h1>
                    <p>Gerencie os horários de atendimento dos médicos</p>
                </div>

                <div className="stats-cards grid-3">
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
                            <span className="stat-label">Horários cadastrados</span>
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
                            <h3>Ativos</h3>
                            <div className="stat-number">{estatisticas.ativos}</div>
                            <span className="stat-label">Em atendimento</span>
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
                            <h3>Inativos</h3>
                            <div className="stat-number">{estatisticas.inativos}</div>
                            <span className="stat-label">Indisponíveis</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>HORÁRIOS DE ATENDIMENTO</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar por médico ou especialidade..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="disponibilidade-table">
                            <thead>
                                <tr>
                                    <th>MÉDICO</th>
                                    <th>ESPECIALIDADE</th>
                                    <th>CRM</th>
                                    <th>DIA DA SEMANA</th>
                                    <th>HORÁRIO</th>
                                    <th>STATUS</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disponibilidades.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhuma disponibilidade encontrada para esta busca' : 'Nenhum horário de atendimento cadastrado ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    disponibilidades.map(disp => (
                                        <tr key={disp.id}>
                                            <td><strong>{disp.medico_nome}</strong></td>
                                            <td>{disp.medico_especialidade}</td>
                                            <td>{disp.medico_crm}</td>
                                            <td>
                                                <span className={`dia-semana-badge ${getDiaSemanaClasse(disp.dia_semana)}`}>
                                                    {disp.dia_semana_nome}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="horario-badge">
                                                    {disp.horario_inicio} - {disp.horario_fim}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={disp.ativo ? 'status-ativo' : 'status-inativo'}>
                                                    {disp.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                <button 
                                                    className={`status-toggle-btn ${disp.ativo ? 'btn-desativar' : 'btn-ativar'}`}
                                                    onClick={() => handleToggleStatus(disp.id, disp.ativo)}
                                                >
                                                    {disp.ativo ? 'Desativar' : 'Ativar'}
                                                </button>
                                                <button className="edit-btn" onClick={() => handleEdit(disp.id)}>
                                                    Editar
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(disp.id)}>
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
                            setShowModal(true);
                        }}>
                            + Novo Horário
                        </button>
                    </div>
                </div>
            </main>

            {/* MODAL DE CADASTRO/EDIÇÃO */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    resetForm();
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingDisponibilidade ? '✏️ Editar Horário' : '📝 Novo Horário'}</h2>
                            <button 
                                onClick={() => {
                                    setShowModal(false);
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
                        
                        <form onSubmit={handleSalvarDisponibilidade}>
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
                                <label>DIA DA SEMANA *</label>
                                <select 
                                    name="dia_semana" 
                                    value={formData.dia_semana} 
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione o dia</option>
                                    {diasSemana.map(dia => (
                                        <option key={dia.value} value={dia.value}>
                                            {dia.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>HORÁRIO INÍCIO *</label>
                                    <input
                                        type="time"
                                        name="horario_inicio"
                                        value={formData.horario_inicio}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>HORÁRIO FIM *</label>
                                    <input
                                        type="time"
                                        name="horario_fim"
                                        value={formData.horario_fim}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        checked={formData.ativo}
                                        onChange={handleInputChange}
                                    />
                                    Ativo (disponível para agendamento)
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={modalLoading}>
                                    {modalLoading ? 'Salvando...' : (editingDisponibilidade ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}