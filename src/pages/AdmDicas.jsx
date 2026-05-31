import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminDicas() {
    const [dicas, setDicas] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ total: 0 });

    // States para o modal
    const [showModal, setShowModal] = useState(false);
    const [editingDica, setEditingDica] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        medico_id: '',
        titulo: '',
        texto: ''
    });

    useEffect(() => {
        carregarDicas();
        carregarMedicos();
    }, []);

    const carregarDicas = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('dicas')
                .select(`
                    *,
                    medico:medico_id(id, nome, especialidade, foto)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('Dicas carregadas:', data);

            const dicasFormatadas = data.map(dica => ({
                id: dica.id,
                medico_id: dica.medico_id,
                medico_nome: dica.medico?.nome || 'Admin',
                medico_especialidade: dica.medico?.especialidade || '-',
                medico_foto: dica.medico?.foto,
                titulo: dica.titulo,
                texto: dica.texto,
                created_at: dica.created_at,
                data_formatada: new Date(dica.created_at).toLocaleDateString('pt-BR')
            }));
            
            setDicas(dicasFormatadas);
            setEstatisticas({ total: dicasFormatadas.length });
            
        } catch (err) {
            console.error('Erro ao carregar dicas:', err);
            alert('Erro ao carregar dicas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const carregarMedicos = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id, nome, especialidade')
                .eq('tipo', 'medico')
                .order('nome');

            if (error) throw error;
            setMedicos(data || []);
        } catch (err) {
            console.error('Erro ao carregar médicos:', err);
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
            medico_id: '',
            titulo: '',
            texto: ''
        });
        setEditingDica(null);
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data, error } = await supabase
                .from('dicas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setEditingDica(data);
            setFormData({
                medico_id: data.medico_id || '',
                titulo: data.titulo || '',
                texto: data.texto || ''
            });
            setShowModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar dica:', err);
            alert('Erro ao buscar dados da dica: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir esta dica?')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('dicas')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarDicas();
                
                alert('✅ Dica excluída com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir dica:', err);
                alert('❌ Erro ao excluir dica: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleSalvarDica = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.titulo || !formData.texto) {
                alert('Por favor, preencha os campos obrigatórios: Título e Texto');
                setModalLoading(false);
                return;
            }

            const dadosDica = {
                titulo: formData.titulo,
                texto: formData.texto,
                medico_id: formData.medico_id || null,
                created_at: new Date()
            };

            if (editingDica) {
                const { error: updateError } = await supabase
                    .from('dicas')
                    .update(dadosDica)
                    .eq('id', editingDica.id);

                if (updateError) throw updateError;
                alert('✅ Dica atualizada com sucesso!');
                
            } else {
                const { error: insertError } = await supabase
                    .from('dicas')
                    .insert([dadosDica]);

                if (insertError) throw insertError;
                alert('✅ Dica cadastrada com sucesso!');
            }
            
            setShowModal(false);
            resetForm();
            await carregarDicas();
            
        } catch (err) {
            console.error('Erro ao salvar dica:', err);
            alert(`❌ Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarDicas = async () => {
            if (searchTerm.trim() === '') {
                carregarDicas();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('dicas')
                    .select(`
                        *,
                        medico:medico_id(id, nome, especialidade, foto)
                    `)
                    .or(`titulo.ilike.%${searchTerm}%,texto.ilike.%${searchTerm}%,medico.nome.ilike.%${searchTerm}%`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const dicasFormatadas = (data || []).map(dica => ({
                    id: dica.id,
                    medico_id: dica.medico_id,
                    medico_nome: dica.medico?.nome || 'Admin',
                    medico_especialidade: dica.medico?.especialidade || '-',
                    medico_foto: dica.medico?.foto,
                    titulo: dica.titulo,
                    texto: dica.texto,
                    created_at: dica.created_at,
                    data_formatada: new Date(dica.created_at).toLocaleDateString('pt-BR')
                }));
                
                setDicas(dicasFormatadas);
                
            } catch (err) {
                console.error('Erro ao buscar dicas:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarDicas();
            } else {
                carregarDicas();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    if (loading && dicas.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando dicas de saúde...</p>
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
                    <h1>Gerenciamento de Dicas de Saúde</h1>
                    <p>Gerencie as dicas de saúde da plataforma</p>
                </div>

                <div className="stats-cards grid-1">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total de Dicas</h3>
                            <div className="stat-number">{estatisticas.total}</div>
                            <span className="stat-label">Dicas cadastradas</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>DICAS DE SAÚDE</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar por título, conteúdo ou médico..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <button className="btn-primary" onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}>
                            + Nova Dica
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="dicas-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '25%' }}>TÍTULO</th>
                                    <th style={{ width: '15%' }}>MÉDICO</th>
                                    <th style={{ width: '45%' }}>CONTEÚDO</th>
                                    <th style={{ width: '10%' }}>DATA</th>
                                    <th style={{ width: '5%' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dicas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhuma dica encontrada para esta busca' : 'Nenhuma dica cadastrada ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    dicas.map(dica => (
                                        <tr key={dica.id}>
                                            <td className="dica-titulo-cell">
                                                <strong>{dica.titulo}</strong>
                                            </td>
                                            <td>
                                                <div className="medico-info">
                                                    {dica.medico_foto ? (
                                                        <img src={dica.medico_foto} alt="" className="avatar-small" />
                                                    ) : (
                                                        <div className="avatar-small-iniciais" style={{ backgroundColor: '#1a6b6f' }}>
                                                            {dica.medico_nome?.charAt(0) || 'A'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong>{dica.medico_nome}</strong>
                                                        <br />
                                                        <small>{dica.medico_especialidade}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="dica-texto-cell">
                                                <div className="dica-texto-preview">
                                                    {dica.texto.length > 150 
                                                        ? dica.texto.substring(0, 150) + '...' 
                                                        : dica.texto}
                                                </div>
                                            </td>
                                            <td className="dica-data-cell">{dica.data_formatada}</td>
                                            <td className="action-buttons">
                                                <button className="edit-btn" onClick={() => handleEdit(dica.id)}>
                                                    Editar
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(dica.id)}>
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL DE CADASTRO/EDIÇÃO */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    resetForm();
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingDica ? 'Editar Dica' : 'Nova Dica de Saúde'}</h2>
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
                        
                        <form onSubmit={handleSalvarDica}>
                            <div className="form-group">
                                <label>MÉDICO (OPCIONAL)</label>
                                <select 
                                    name="medico_id" 
                                    value={formData.medico_id} 
                                    onChange={handleInputChange}
                                >
                                    <option value="">Selecione um médico (opcional)</option>
                                    {medicos.map(medico => (
                                        <option key={medico.id} value={medico.id}>
                                            {medico.nome} - {medico.especialidade}
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: '#666', fontSize: '11px' }}>
                                    Deixe em branco para dicas gerais (sem médico associado)
                                </small>
                            </div>

                            <div className="form-group">
                                <label>TÍTULO *</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite o título da dica"
                                />
                            </div>

                            <div className="form-group">
                                <label>CONTEÚDO *</label>
                                <textarea
                                    name="texto"
                                    value={formData.texto}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite o conteúdo da dica de saúde"
                                    rows={6}
                                    style={{ resize: 'vertical' }}
                                />
                                <small style={{ color: '#666', fontSize: '11px' }}>
                                    Escreva uma dica útil e informativa para os usuários
                                </small>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={modalLoading}>
                                    {modalLoading ? 'Salvando...' : (editingDica ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}