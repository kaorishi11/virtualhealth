import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminProfissionais() {
    const [profissionais, setProfissionais] = useState([]);
    const [clinicas, setClinicas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estatisticas, setEstatisticas] = useState({ total: 0, aceitos: 0, negados: 0 });
    
    // States para o modal
    const [showModal, setShowModal] = useState(false);
    const [editingProfissional, setEditingProfissional] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        genero: '',
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        cpf: '',
        crm: '',
        especialidade: '',
        universidade: '',
        ano_formacao: '',
        preco_consulta: '',
        clinica_id: '',
        foto: ''
    });

    // Carregar dados
    useEffect(() => {
        carregarProfissionais();
        carregarClinicas();
        carregarEstatisticas();
    }, []);

    const carregarProfissionais = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('usuarios')
                .select(`
                    *,
                    clinica:clinica_id(nome)
                `)
                .eq('tipo', 'medico')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const profissionaisFormatados = data.map(prof => ({
                id: prof.id,
                nome: prof.nome,
                email: prof.email || 'Email não informado',
                especialidade: prof.especialidade || 'Não informada',
                status: prof.status === 'negado' ? 'Negado' : 'Aceito',
                data: prof.created_at ? new Date(prof.created_at).toLocaleDateString('pt-BR') : 'Data não disponível',
                telefone: prof.telefone || 'Não informado',
                crm: prof.crm || 'Não informado',
                cpf: prof.cpf || 'Não informado',
                genero: prof.genero || 'Não informado',
                cep: prof.cep || 'Não informado',
                logradouro: prof.logradouro || 'Não informado',
                bairro: prof.bairro || 'Não informado',
                cidade: prof.cidade || 'Não informado',
                estado: prof.estado || 'Não informado',
                universidade: prof.universidade || 'Não informado',
                ano_formacao: prof.ano_formacao || 'Não informado',
                preco_consulta: prof.preco_consulta || 90,
                clinica_nome: prof.clinica?.nome || 'Sem clínica',
                clinica_id: prof.clinica_id,
                foto: prof.foto || null
            }));
            
            setProfissionais(profissionaisFormatados);
        } catch (err) {
            console.error('Erro ao carregar profissionais:', err);
            setError('Erro ao carregar profissionais. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const carregarClinicas = async () => {
        try {
            const { data, error } = await supabase
                .from('clinicas')
                .select('id, nome')
                .order('nome');

            if (error) throw error;
            setClinicas(data || []);
        } catch (err) {
            console.error('Erro ao carregar clínicas:', err);
        }
    };

    const carregarEstatisticas = async () => {
        try {
            const { count: total, error: totalError } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('tipo', 'medico');

            if (totalError) throw totalError;

            setEstatisticas({
                total: total || 0,
                aceitos: total || 0,
                negados: 0
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
            genero: '',
            cep: '',
            logradouro: '',
            bairro: '',
            cidade: '',
            estado: '',
            cpf: '',
            crm: '',
            especialidade: '',
            universidade: '',
            ano_formacao: '',
            preco_consulta: '',
            clinica_id: '',
            foto: ''
        });
        setEditingProfissional(null);
    };

    const handleEdit = async (id) => {
        try {
            setModalLoading(true);
            
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setEditingProfissional(data);
            setFormData({
                nome: data.nome || '',
                email: data.email || '',
                senha: '',
                telefone: data.telefone || '',
                genero: data.genero || '',
                cep: data.cep || '',
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.cidade || '',
                estado: data.estado || '',
                cpf: data.cpf || '',
                crm: data.crm || '',
                especialidade: data.especialidade || '',
                universidade: data.universidade || '',
                ano_formacao: data.ano_formacao || '',
                preco_consulta: data.preco_consulta || '',
                clinica_id: data.clinica_id || '',
                foto: data.foto || ''
            });
            setShowModal(true);
            
        } catch (err) {
            console.error('Erro ao buscar profissional:', err);
            alert('Erro ao buscar dados do profissional: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('⚠️ Tem certeza que deseja excluir este profissional? Esta ação é irreversível!')) {
            try {
                setModalLoading(true);
                
                const { error } = await supabase
                    .from('usuarios')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                
                await carregarProfissionais();
                await carregarEstatisticas();
                
                alert('✅ Profissional excluído com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir profissional:', err);
                alert('❌ Erro ao excluir profissional: ' + err.message);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleSalvarProfissional = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        
        try {
            if (!formData.nome || !formData.email) {
                alert('Por favor, preencha os campos obrigatórios: Nome e Email');
                setModalLoading(false);
                return;
            }

            if (!editingProfissional && !formData.senha) {
                alert('Por favor, preencha a senha para novo profissional');
                setModalLoading(false);
                return;
            }

            // Preparar dados para salvar
            const dadosProfissional = {
                tipo: 'medico',
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone || null,
                genero: formData.genero || null,
                cep: formData.cep || null,
                logradouro: formData.logradouro || null,
                bairro: formData.bairro || null,
                cidade: formData.cidade || null,
                estado: formData.estado || null,
                cpf: formData.cpf || null,
                crm: formData.crm || null,
                especialidade: formData.especialidade || null,
                universidade: formData.universidade || null,
                ano_formacao: formData.ano_formacao ? parseInt(formData.ano_formacao) : null,
                preco_consulta: formData.preco_consulta ? parseFloat(formData.preco_consulta) : 90,
                clinica_id: formData.clinica_id || null,
                foto: formData.foto || null
            };

            if (editingProfissional) {
                // MODO EDIÇÃO
                const { error: updateError } = await supabase
                    .from('usuarios')
                    .update(dadosProfissional)
                    .eq('id', editingProfissional.id);

                if (updateError) throw updateError;

                // Se tiver senha, atualizar no auth
                if (formData.senha && formData.senha.length >= 6) {
                    const { error: passwordError } = await supabase.auth.updateUser({
                        password: formData.senha
                    });
                    if (passwordError) throw passwordError;
                }

                alert('✅ Profissional atualizado com sucesso!');
                
            } else {
                // MODO CRIAÇÃO
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            nome: formData.nome,
                            tipo: 'medico'
                        }
                    }
                });

                if (authError) throw authError;

                if (!authData.user) throw new Error('Erro ao criar profissional');

                // Inserir na tabela usuarios
                const { error: insertError } = await supabase
                    .from('usuarios')
                    .insert([{
                        id: authData.user.id,
                        ...dadosProfissional
                    }]);

                if (insertError) throw insertError;

                alert('✅ Profissional cadastrado com sucesso!');
            }
            
            setShowModal(false);
            resetForm();
            await carregarProfissionais();
            await carregarEstatisticas();
            
        } catch (err) {
            console.error('Erro ao salvar profissional:', err);
            alert(`❌ Erro ao salvar: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    const getStatusClass = (status) => {
        return status === 'Aceito' ? 'status-aceito' : 'status-negado';
    };

    // Busca em tempo real
    useEffect(() => {
        const buscarProfissionais = async () => {
            if (searchTerm.trim() === '') {
                carregarProfissionais();
                return;
            }

            try {
                setLoading(true);
                
                const { data, error } = await supabase
                    .from('usuarios')
                    .select(`
                        *,
                        clinica:clinica_id(nome)
                    `)
                    .eq('tipo', 'medico')
                    .or(`nome.ilike.%${searchTerm}%,especialidade.ilike.%${searchTerm}%,crm.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const profissionaisFormatados = data.map(prof => ({
                    id: prof.id,
                    nome: prof.nome,
                    email: prof.email || 'Email não informado',
                    especialidade: prof.especialidade || 'Não informada',
                    status: 'Aceito',
                    data: prof.created_at ? new Date(prof.created_at).toLocaleDateString('pt-BR') : 'Data não disponível',
                    telefone: prof.telefone || 'Não informado',
                    crm: prof.crm || 'Não informado',
                    cpf: prof.cpf || 'Não informado',
                    genero: prof.genero || 'Não informado',
                    cep: prof.cep || 'Não informado',
                    universidade: prof.universidade || 'Não informado',
                    ano_formacao: prof.ano_formacao || 'Não informado',
                    preco_consulta: prof.preco_consulta || 90,
                    clinica_nome: prof.clinica?.nome || 'Sem clínica',
                    foto: prof.foto || null
                }));
                
                setProfissionais(profissionaisFormatados);
            } catch (err) {
                console.error('Erro ao buscar profissionais:', err);
                setError('Erro ao buscar profissionais');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                buscarProfissionais();
            } else {
                carregarProfissionais();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    if (loading && profissionais.length === 0) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="main-content">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando profissionais...</p>
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
                    <h1>Gerenciamento de Profissionais</h1>
                    <p>Gerenciando médicos e especialistas da plataforma</p>
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
                            <span className="stat-label">Cadastrados</span>
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
                            <h3>Aceitos</h3>
                            <div className="stat-number">{estatisticas.aceitos}</div>
                            <span className="stat-label">Aprovados</span>
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
                            <h3>Negados</h3>
                            <div className="stat-number">{estatisticas.negados}</div>
                            <span className="stat-label">Reprovados</span>
                        </div>
                    </div>
                </div>

                <div className="table-section">
                    <div className="table-header">
                        <h2>PROFISSIONAIS CADASTRADOS</h2>
                        <div className="search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar profissional por nome, especialidade, CRM ou email..." 
                                className="search-input" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="profissionais-table">
                            <thead>
                                <tr>
                                    <th>PROFISSIONAL</th>
                                    <th>EMAIL</th>
                                    <th>ESPECIALIDADE</th>
                                    <th>CRM</th>
                                    <th>TELEFONE</th>
                                    <th>PREÇO</th>
                                    <th>CLÍNICA</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profissionais.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                            {searchTerm ? 'Nenhum profissional encontrado para esta busca' : 'Nenhum profissional cadastrado ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    profissionais.map(p => (
                                        <tr key={p.id}>
                                            <td><strong>{p.nome}</strong></td>
                                            <td>{p.email}</td>
                                            <td>{p.especialidade}</td>
                                            <td>{p.crm}</td>
                                            <td>{p.telefone}</td>
                                            <td>R$ {p.preco_consulta}</td>
                                            <td>{p.clinica_nome}</td>
                                            <td className="action-buttons">
                                                <button className="edit-btn" onClick={() => handleEdit(p.id)}>
                                                    Editar
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(p.id)}>
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
                            + Novo Profissional
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{editingProfissional ? '✏️ Editar Profissional' : '📝 Novo Profissional'}</h2>
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
                        
                        <form onSubmit={handleSalvarProfissional} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                            {/* Dados Pessoais */}
                            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Dados Pessoais</h3>
                            
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
                                    disabled={editingProfissional}
                                />
                                {editingProfissional && (
                                    <small style={{ color: '#666', fontSize: '11px' }}>
                                        O email não pode ser alterado
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label>{editingProfissional ? 'NOVA SENHA (opcional)' : 'SENHA *'}</label>
                                <input
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleInputChange}
                                    required={!editingProfissional}
                                    placeholder={editingProfissional ? 'Deixe em branco para manter a mesma' : 'Digite a senha (mínimo 6 caracteres)'}
                                />
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
                                <label>GÊNERO</label>
                                <select name="genero" value={formData.genero} onChange={handleInputChange}>
                                    <option value="">Selecione...</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="outro">Outro</option>
                                </select>
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

                            {/* Dados Profissionais */}
                            <h3 style={{ marginBottom: '15px', marginTop: '20px', color: 'var(--primary-color)' }}>Dados Profissionais</h3>

                            <div className="form-group">
                                <label>CRM</label>
                                <input
                                    type="text"
                                    name="crm"
                                    value={formData.crm}
                                    onChange={handleInputChange}
                                    placeholder="CRM-XX 000000"
                                />
                            </div>

                            <div className="form-group">
                                <label>ESPECIALIDADE</label>
                                <input
                                    type="text"
                                    name="especialidade"
                                    value={formData.especialidade}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Cardiologista, Pediatra..."
                                />
                            </div>

                            <div className="form-group">
                                <label>UNIVERSIDADE</label>
                                <input
                                    type="text"
                                    name="universidade"
                                    value={formData.universidade}
                                    onChange={handleInputChange}
                                    placeholder="Nome da universidade"
                                />
                            </div>

                            <div className="form-group">
                                <label>ANO DE FORMAÇÃO</label>
                                <input
                                    type="number"
                                    name="ano_formacao"
                                    value={formData.ano_formacao}
                                    onChange={handleInputChange}
                                    placeholder="AAAA"
                                    min="1950"
                                    max="2030"
                                />
                            </div>

                            <div className="form-group">
                                <label>PREÇO DA CONSULTA (R$)</label>
                                <input
                                    type="number"
                                    name="preco_consulta"
                                    value={formData.preco_consulta}
                                    onChange={handleInputChange}
                                    placeholder="90.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>CLÍNICA</label>
                                <select name="clinica_id" value={formData.clinica_id} onChange={handleInputChange}>
                                    <option value="">Selecione uma clínica</option>
                                    {clinicas.map(clinica => (
                                        <option key={clinica.id} value={clinica.id}>
                                            {clinica.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Endereço */}
                            <h3 style={{ marginBottom: '15px', marginTop: '20px', color: 'var(--primary-color)' }}>Endereço</h3>

                            <div className="form-group">
                                <label>CEP</label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleInputChange}
                                    placeholder="00000-000"
                                />
                            </div>

                            <div className="form-group">
                                <label>LOGRADOURO</label>
                                <input
                                    type="text"
                                    name="logradouro"
                                    value={formData.logradouro}
                                    onChange={handleInputChange}
                                    placeholder="Rua, Avenida..."
                                />
                            </div>

                            <div className="form-group">
                                <label>BAIRRO</label>
                                <input
                                    type="text"
                                    name="bairro"
                                    value={formData.bairro}
                                    onChange={handleInputChange}
                                    placeholder="Bairro"
                                />
                            </div>

                            <div className="form-group">
                                <label>CIDADE</label>
                                <input
                                    type="text"
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleInputChange}
                                    placeholder="Cidade"
                                />
                            </div>

                            <div className="form-group">
                                <label>ESTADO</label>
                                <input
                                    type="text"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleInputChange}
                                    placeholder="UF"
                                    maxLength={2}
                                />
                            </div>

                            {/* Foto */}
                            <h3 style={{ marginBottom: '15px', marginTop: '20px', color: 'var(--primary-color)' }}>Foto</h3>

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
                                    {modalLoading ? 'Salvando...' : (editingProfissional ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}