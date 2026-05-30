import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

import logo from '../images/logo.png';

import '../styles/DicasMe.css';

export default function DicasMe() {
    const [novaDica, setNovaDica] = useState({ titulo: '', texto: '' });
    const [toast, setToast] = useState(null);
    const [modalExcluir, setModalExcluir] = useState(null);
    const [dicas, setDicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medico, setMedico] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);

    // Buscar dados do médico logado e suas dicas
    useEffect(() => {
        carregarMedicoEDicas();
    }, []);

    const carregarMedicoEDicas = async () => {
        try {
            setLoading(true);
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) throw userError;
            if (!user) {
                showToast('Usuário não está logado!', true);
                setLoading(false);
                return;
            }

            // Buscar dados do médico
            const { data: medicoData, error: medicoError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single();

            let nomeMedico = 'Médico';
            
            if (medicoError && medicoError.code !== 'PGRST116') {
                throw medicoError;
            }

            if (medicoData) {
                nomeMedico = medicoData.nome;
                setMedico({
                    id: medicoData.id,
                    nome: medicoData.nome,
                    email: user.email,
                    profissao: 'Dentista',
                    foto: medicoData.foto || ''
                });
            }

            // Buscar dicas passando o nome do médico
            await carregarDicas(user.id, nomeMedico);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const carregarDicas = async (medicoId, nomeMedico) => {
        try {
            const { data, error } = await supabase
                .from('dicas')
                .select('*')
                .eq('medico_id', medicoId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Se não passou o nomeMedico, tenta buscar do banco
            let nomeDoMedico = nomeMedico;
            if (!nomeDoMedico) {
                const { data: medicoData } = await supabase
                    .from('usuarios')
                    .select('nome')
                    .eq('id', medicoId)
                    .single();
                if (medicoData) {
                    nomeDoMedico = medicoData.nome;
                } else {
                    nomeDoMedico = 'Médico';
                }
            }

            const dicasFormatadas = data.map(dica => ({
                id: dica.id,
                titulo: dica.titulo || '',
                texto: dica.texto,
                autor: nomeDoMedico,
                profissao: 'Dentista',
                data: formatarData(dica.created_at),
                avaliacao: 4
            }));

            setDicas(dicasFormatadas);

        } catch (error) {
            console.error('Erro ao carregar dicas:', error);
            showToast('Erro ao carregar dicas', true);
        }
    };

    const formatarData = (dataISO) => {
        if (!dataISO) return new Date().toLocaleDateString('pt-BR');
        return new Date(dataISO).toLocaleDateString('pt-BR');
    };

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    // Funções para mostrar iniciais (igual ao perfil)
    const getIniciais = () => {
        if (!medico?.nome) return '?';
        const nomes = medico.nome.trim().split(' ');
        if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
        return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
    };

    const getCorFundo = () => {
        if (!medico?.nome) return '#6366f1';
        
        const cores = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6'
        ];
        
        let hash = 0;
        for (let i = 0; i < medico.nome.length; i++) {
            hash = medico.nome.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % cores.length;
        return cores[index];
    };

    const handlePublicarDica = async () => {
        if (novaDica.titulo.trim() === '') {
            showToast('Por favor, escreva um título para a dica!', true);
            return;
        }
        
        if (novaDica.texto.trim() === '') {
            showToast('Por favor, escreva o conteúdo da dica!', true);
            return;
        }

        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                showToast('Usuário não está logado!', true);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('dicas')
                .insert([
                    {
                        medico_id: user.id,
                        titulo: novaDica.titulo,
                        texto: novaDica.texto,
                        created_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;

            // Recarregar dicas com o nome do médico atual
            const nomeMedico = medico?.nome || 'Médico';
            await carregarDicas(user.id, nomeMedico);
            
            setNovaDica({ titulo: '', texto: '' });
            showToast('Dica publicada com sucesso!', false);

        } catch (error) {
            console.error('Erro ao publicar dica:', error);
            showToast('Erro ao publicar dica: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirClick = (dica) => {
        setModalExcluir(dica);
    };

    const handleConfirmarExcluir = async () => {
        if (!modalExcluir) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('dicas')
                .delete()
                .eq('id', modalExcluir.id);

            if (error) throw error;

            setDicas(dicas.filter(d => d.id !== modalExcluir.id));
            showToast(`Dica excluída com sucesso!`, false);
            setModalExcluir(null);

        } catch (error) {
            console.error('Erro ao excluir dica:', error);
            showToast('Erro ao excluir dica: ' + error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarExcluir = () => {
        setModalExcluir(null);
    };

    // Função para quebrar o nome em duas linhas
    const getPrimeiroNome = () => {
        if (!medico?.nome) return '';
        const partes = medico.nome.trim().split(' ');
        return partes[0];
    };

    const getSobrenome = () => {
        if (!medico?.nome) return '';
        const partes = medico.nome.trim().split(' ');
        if (partes.length === 1) return '';
        return partes.slice(1).join(' ');
    };

    // Remove a tela de loading - mostra o conteúdo mesmo enquanto carrega
    // if (loading && dicas.length === 0 && !medico) {
    //     return (
    //         <div className="loading-container">
    //             <div className="spinner"></div>
    //             <p>Carregando...</p>
    //         </div>
    //     );
    // }

    return (
        <div className="dicas-container">
            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                <div className="medico-section">
                    <div className="medico-img-wrapper">
                        {medico?.foto && !fotoErro ? (
                            <img 
                                src={medico.foto} 
                                className="medico-img" 
                                alt={medico.nome}
                                onError={() => setFotoErro(true)}
                            />
                        ) : (
                            <div 
                                className="medico-img-iniciais"
                                style={{ backgroundColor: getCorFundo() }}
                            >
                                {getIniciais()}
                            </div>
                        )}
                    </div>
                    <div className="medico-info">
                        <h4>
                            <span className="primeiro-nome">{getPrimeiroNome()}</span>
                            {getSobrenome() && (
                                <span className="sobrenome">{getSobrenome()}</span>
                            )}
                        </h4>
                        <p>Dentista</p>
                    </div>
                </div>

                <div className="nav-section">
                    <h3>GERAL</h3>
                    <ul>
                        <li><Link to="/home-medico">Visão geral</Link></li>
                        <li><Link to="/agenda">Minha agenda</Link></li>
                        <li><Link to="/disponibilidade">Disponibilidade</Link></li>
                        <li><Link to="/perfil-medico">Perfil</Link></li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>ATENDIMENTO</h3>
                    <ul>
                        <li><Link to="/consulta">Iniciar consulta</Link></li>
                        <li className="active"><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="spacer"></div>

                <div className="logout">
                    <Link to="/">Desconectar</Link>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content">
                <div className="dicas-header">
                    <h1>DICAS DE SAÚDE</h1>
                </div>

                {/* ÁREA DE PUBLICAÇÃO COM TÍTULO */}
                <div className="publicar-dica">
                    <h2>PUBLICAR DICAS</h2>
                    <div className="editor-area">
                        <input 
                            type="text"
                            className="titulo-input"
                            placeholder="Título da dica"
                            value={novaDica.titulo}
                            onChange={(e) => setNovaDica(prev => ({ ...prev, titulo: e.target.value }))}
                            disabled={loading}
                        />
                        <textarea 
                            placeholder="Escreva sua dica aqui..."
                            value={novaDica.texto}
                            onChange={(e) => setNovaDica(prev => ({ ...prev, texto: e.target.value }))}
                            rows="5"
                            disabled={loading}
                        />
                    </div>
                    <div className="btn-publicar-wrapper">
                        <button 
                            className="btn-publicar" 
                            onClick={handlePublicarDica}
                            disabled={loading}
                        >
                            {loading ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                </div>

                {/* SEÇÃO ÚLTIMAS DICAS COM TÍTULO */}
                <div className="ultimas-dicas-section">
                    <h2>ÚLTIMAS DICAS PUBLICADAS</h2>
                    <div className="dicas-cards-grid">
                        {dicas.length === 0 ? (
                            <div className="nenhuma-dica">
                                <p>Nenhuma dica publicada ainda.</p>
                                <p>Seja o primeiro a compartilhar uma dica!</p>
                            </div>
                        ) : (
                            dicas.map((dica) => (
                                <div key={dica.id} className="dica-card">
                                    <button 
                                        className="btn-excluir"
                                        onClick={() => handleExcluirClick(dica)}
                                        title="Excluir dica"
                                        disabled={loading}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                        </svg>
                                    </button>
                                    <h3 className="dica-titulo">{dica.titulo}</h3>
                                    <p className="dica-texto">{dica.texto}</p>
                                    <div className="dica-footer">
                                        <div className="dica-autor">
                                            <span className="autor-nome">{dica.autor}</span>
                                            <span className="autor-profissao">{dica.profissao}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {modalExcluir && (
                <div className="modal-overlay" onClick={handleCancelarExcluir}>
                    <div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-confirmar-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444', margin: '0 auto' }}>
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </div>
                        <h3>Excluir Dica</h3>
                        <p>Tem certeza que deseja excluir esta dica?</p>
                        <div className="modal-botoes">
                            <button className="btn-cancelar" onClick={handleCancelarExcluir}>
                                Cancelar
                            </button>
                            <button className="btn-confirmar-excluir" onClick={handleConfirmarExcluir}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast && (
                <div className={`toast ${toast.isError ? 'error' : ''}`}>
                    <span className="toast-icon">{toast.isError ? '⚠️' : '✓'}</span>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}