import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estatisticas, setEstatisticas] = useState({ total: 0, ativos: 0, inativos: 0 });
    
    // States para o modal
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        cpf: '',
        foto: ''
    });

    // Carregar usuários do tipo 'paciente'
    useEffect(() => {
        carregarUsuarios();
        carregarEstatisticas();
    }, []);

    const carregarUsuarios = async () => {
        try {
            setLoading(true);
            
            // Buscar usuários da tabela usuarios (agora com email)
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('tipo', 'paciente')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const usuariosFormatados = data.map(user => ({
                id: user.id,
                nome: user.nome,
                email: user.email || 'Email não informado', // Agora vem da tabela!
                telefone: user.telefone || 'Não informado',
                cpf: user.cpf || 'Não informado',
                foto: user.foto || null,
                status: 'Ativo',
                data: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'
            }));
            
            setUsuarios(usuariosFormatados);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            setError('Erro ao carregar usuários. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const carregarEstatisticas = async () => {
        try {
            const { count: total, error: totalError } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('tipo', 'paciente');

            if (totalError) throw totalError;

            setEstatisticas({
                total: total || 0,
                ativos: total || 0,
                inativos: 0
            });
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
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
            nome: '',
            email: '',
            senha: '',
            telefone: '',
            cpf: '',
            foto: ''
        });
        setEditingUser(null);
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', id)
                .single();

            if (usuarioError) throw usuarioError;
            
            setEditingUser(usuarioData);
            setFormData({
                nome: usuarioData.nome || '',
                email: usuarioData.email || '', // Email vem da tabela
                senha: '',
                telefone: usuarioData.telefone || '',
                cpf: usuarioData.cpf || '',
                foto: usuarioData.foto || ''
            });
            setShowModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar usuário:', err);
            alert('Erro ao buscar dados do usuário: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir este usuário? Esta ação é irreversível!')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('usuarios')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarUsuarios();
                await carregarEstatisticas();
                
                alert('✅ Usuário excluído com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir usuário:', err);
                alert('❌ Erro ao excluir usuário: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleSalvarUsuario = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.nome || !formData.email) {
                alert('Por favor, preencha os campos obrigatórios: Nome e Email');
                setModalLoading(false);
                return;
            }

            if (!editingUser && !formData.senha) {
                alert('Por favor, preencha a senha para novo usuário');
                setModalLoading(false);
                return;
            }

            if (editingUser) {
                // MODO EDIÇÃO - Atualizar usuário existente
                const { error: updateError } = await supabase
                    .from('usuarios')
                    .update({
                        nome: formData.nome,
                        email: formData.email, // Atualiza email na tabela
                        telefone: formData.telefone || null,
                        cpf: formData.cpf || null,
                        foto: formData.foto || null
                    })
                    .eq('id', editingUser.id);

                if (updateError) throw updateError;

                // Se tiver senha, atualizar no auth
                if (formData.senha && formData.senha.length >= 6) {
                    const { error: passwordError } = await supabase.auth.updateUser({
                        password: formData.senha
                    });
                    if (passwordError) throw passwordError;
                }

                alert('✅ Usuário atualizado com sucesso!');
                
            } else {
                // MODO CRIAÇÃO - Criar novo usuário
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            nome: formData.nome,
                            tipo: 'paciente'
                        }
                    }
                });

                if (authError) throw authError;

                if (!authData.user) throw new Error('Erro ao criar usuário');

                // Inserir na tabela usuarios com o email
                const { error: insertError } = await supabase
                    .from('usuarios')
                    .insert([{
                        id: authData.user.id,
                        tipo: 'paciente',
                        nome: formData.nome,
                        email: formData.email, // SALVA O EMAIL NA TABELA
                        telefone: formData.telefone || null,
                        cpf: formData.cpf || null,
                        foto: formData.foto || null
                    }]);

                if (insertError) throw insertError;

                alert('✅ Paciente cadastrado com sucesso!');
            }
            
            setShowModal(false);
            resetForm();
            await carregarUsuarios();
            await carregarEstatisticas();
            
        } catch (err) {
            console.error('Erro ao salvar usuário:', err);
            alert(`❌ Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarUsuarios = async () => {
            if (searchTerm.trim() === '') {
                carregarUsuarios();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('tipo', 'paciente')
                    .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const usuariosFormatados = data.map(user => ({
                    id: user.id,
                    nome: user.nome,
                    email: user.email || 'Email não informado',
                    telefone: user.telefone || 'Não informado',
                    cpf: user.cpf || 'Não informado',
                    foto: user.foto || null,
                    status: 'Ativo',
                    data: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'
                }));
                
                setUsuarios(usuariosFormatados);
            } catch (err) {
                console.error('Erro ao buscar usuários:', err);
                setError('Erro ao buscar usuários');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarUsuarios();
            } else {
                carregarUsuarios();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const getStatusClass = (status) => {
        return status === 'Ativo' ? 'status-ativo' : 'status-inativo';
    };

    if (loading && usuarios.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando pacientes...</p>
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
                    <h1>Gerenciamento de Pacientes</h1>
                    <p>Gerenciando apenas pacientes (não profissionais e não administradores)</p>
                </div>

                <div className="stats-cards grid-3">
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
                            <div className="stat-number">{estatisticas.total}</div>
                            <span className="stat-label">Pacientes Cadastrados</span>
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
                            <span className="stat-label">Pacientes Ativos</span>
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
                            <span className="stat-label">Pacientes Inativos</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>PACIENTES CADASTRADOS</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar paciente por nome, email ou CPF..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>NOME</th>
                                    <th>EMAIL</th>
                                    <th>TELEFONE</th>
                                    <th>CPF</th>
                                    <th>STATUS</th>
                                    <th>DATA CADASTRO</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhum paciente encontrado para esta busca' : 'Nenhum paciente cadastrado ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    usuarios.map(u => (
                                        <tr key={u.id}>
                                            <td><strong>{u.nome}</strong></td>
                                            <td>{u.email}</td> {/* AGORA O EMAIL APARECE! */}
                                            <td>{u.telefone}</td>
                                            <td>{u.cpf}</td>
                                            <td>
                                                <span className={getStatusClass(u.status)}>{u.status}</span>
                                            </td>
                                            <td>{u.data}</td>
                                            <td className="action-buttons">
                                                <button 
                                                    className="edit-btn" 
                                                    onClick={() => handleEdit(u.id)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="delete-btn" 
                                                    onClick={() => handleDelete(u.id)}
                                                >
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
                            + Novo Paciente
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingUser ? 'Editar Paciente' : 'Novo Paciente'}</h2>
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
                        
                        <form onSubmit={handleSalvarUsuario}>
                            <div className="form-group">
                                <label>NOME COMPLETO *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite o nome completo"
                                />
                            </div>

                            <div className="form-group">
                                <label>EMAIL *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite o email"
                                />
                            </div>

                            <div className="form-group">
                                <label>{editingUser ? 'NOVA SENHA (opcional)' : 'SENHA *'}</label>
                                <input
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleInputChange}
                                    required={!editingUser}
                                    placeholder={editingUser ? 'Deixe em branco para manter a mesma' : 'Digite a senha (mínimo 6 caracteres)'}
                                />
                                {editingUser && (
                                    <small style={{ color: '#666', fontSize: '11px' }}>
                                        Preencha apenas se quiser alterar a senha
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label>TELEFONE</label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleInputChange}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="form-group">
                                <label>CPF</label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleInputChange}
                                    placeholder="000.000.000-00"
                                />
                            </div>

                            <div className="form-group">
                                <label>URL DA FOTO</label>
                                <input
                                    type="text"
                                    name="foto"
                                    value={formData.foto}
                                    onChange={handleInputChange}
                                    placeholder="https://exemplo.com/foto.jpg"
                                />
                                <small style={{ color: '#666', fontSize: '11px' }}>
                                    Insira uma URL válida de imagem
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
                                    {modalLoading ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}