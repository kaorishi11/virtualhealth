import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminFAQ() {
    const [faqs, setFaqs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ total: 0 });

    // States para o modal
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        pergunta: '',
        resposta: ''
    });

    // Carregar FAQs
    useEffect(() => {
        carregarFaqs();
    }, []);

    const carregarFaqs = async () => {
        try {
            setLoading(true);
            
            // Buscar todas as FAQs sem depender de created_at
            const { data, error } = await supabase
                .from('faq')
                .select('*');

            if (error) throw error;

            console.log('FAQs carregadas do banco:', data);

            if (data && data.length > 0) {
                const faqsFormatados = data.map(faq => ({
                    id: faq.id,
                    pergunta: faq.pergunta,
                    resposta: faq.resposta
                }));
                
                setFaqs(faqsFormatados);
                setEstatisticas({ total: faqsFormatados.length });
            } else {
                setFaqs([]);
                setEstatisticas({ total: 0 });
            }
            
        } catch (err) {
            console.error('Erro ao carregar FAQs:', err);
            setFaqs([]);
            setEstatisticas({ total: 0 });
        } finally {
            setLoading(false);
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
            pergunta: '',
            resposta: ''
        });
        setEditingFaq(null);
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data, error } = await supabase
                .from('faq')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setEditingFaq(data);
            setFormData({
                pergunta: data.pergunta || '',
                resposta: data.resposta || ''
            });
            setShowModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar FAQ:', err);
            alert('Erro ao buscar dados da pergunta: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir esta pergunta? Esta ação é irreversível!')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('faq')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarFaqs();
                
                alert('Pergunta excluída com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir FAQ:', err);
                alert('Erro ao excluir pergunta: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleSalvarFaq = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.pergunta || !formData.resposta) {
                alert('Por favor, preencha os campos obrigatórios: Pergunta e Resposta');
                setModalLoading(false);
                return;
            }

            if (editingFaq) {
                // MODO EDIÇÃO
                const { error: updateError } = await supabase
                    .from('faq')
                    .update({
                        pergunta: formData.pergunta,
                        resposta: formData.resposta
                    })
                    .eq('id', editingFaq.id);

                if (updateError) throw updateError;

                alert('Pergunta atualizada com sucesso!');
                
            } else {
                // MODO CRIAÇÃO
                const { error: insertError } = await supabase
                    .from('faq')
                    .insert([{
                        pergunta: formData.pergunta,
                        resposta: formData.resposta
                    }]);

                if (insertError) throw insertError;

                alert('Pergunta cadastrada com sucesso!');
            }
            
            setShowModal(false);
            resetForm();
            await carregarFaqs();
            
        } catch (err) {
            console.error('Erro ao salvar FAQ:', err);
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarFaqs = async () => {
            if (searchTerm.trim() === '') {
                carregarFaqs();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('faq')
                    .select('*')
                    .or(`pergunta.ilike.%${searchTerm}%,resposta.ilike.%${searchTerm}%`);

                if (error) throw error;

                if (data && data.length > 0) {
                    const faqsFormatados = data.map(faq => ({
                        id: faq.id,
                        pergunta: faq.pergunta,
                        resposta: faq.resposta
                    }));
                    setFaqs(faqsFormatados);
                } else {
                    setFaqs([]);
                }
            } catch (err) {
                console.error('Erro ao buscar FAQs:', err);
                setFaqs([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarFaqs();
            } else {
                carregarFaqs();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    if (loading && faqs.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando perguntas frequentes...</p>
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
                    <h1>Gerenciamento de FAQ</h1>
                    <p>Gerencie as perguntas frequentes da plataforma</p>
                </div>

                <div className="stats-cards grid-1">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total de Perguntas</h3>
                            <div className="stat-number">{estatisticas.total}</div>
                            <span className="stat-label">FAQs cadastradas</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>PERGUNTAS FREQUENTES</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar pergunta ou resposta..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="faq-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>PERGUNTA</th>
                                    <th style={{ width: '60%' }}>RESPOSTA</th>
                                    <th style={{ width: '10%' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhuma pergunta encontrada para esta busca' : 'Nenhuma pergunta cadastrada ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    faqs.map(faq => (
                                        <tr key={faq.id}>
                                            <td className="faq-pergunta-cell">
                                                <strong>{faq.pergunta}</strong>
                                            </td>
                                            <td className="faq-resposta-cell">
                                                <div className="faq-resposta-preview">
                                                    {faq.resposta.length > 200 
                                                        ? faq.resposta.substring(0, 200) + '...' 
                                                        : faq.resposta}
                                                </div>
                                            </td>
                                            <td className="action-buttons">
                                                <button className="edit-btn" onClick={() => handleEdit(faq.id)}>
                                                    Editar
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(faq.id)}>
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
                            + Nova Pergunta
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingFaq ? '✏️ Editar Pergunta' : '📝 Nova Pergunta'}</h2>
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
                        
                        <form onSubmit={handleSalvarFaq}>
                            <div className="form-group">
                                <label>PERGUNTA *</label>
                                <textarea
                                    name="pergunta"
                                    value={formData.pergunta}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite a pergunta frequente"
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>RESPOSTA *</label>
                                <textarea
                                    name="resposta"
                                    value={formData.resposta}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite a resposta detalhada"
                                    rows={6}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={modalLoading}>
                                    {modalLoading ? 'Salvando...' : (editingFaq ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}