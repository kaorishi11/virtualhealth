import { useState } from 'react';
import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';

import '../styles/DicasMe.css';

export default function DicasMe() {
    const [novaDica, setNovaDica] = useState('');
    const [toast, setToast] = useState(null);
    const [modalExcluir, setModalExcluir] = useState(null);
    const [dicas, setDicas] = useState([
        {
            id: 1,
            texto: "O ideal é escovar os dentes pelo menos três vezes ao dia, principalmente antes de dormir, pois durante a noite a produção de saliva diminui e as bactérias se proliferam com mais facilidade.",
            autor: "Dra Marta",
            profissao: "Dentista",
            data: "15/02/2026",
            avaliacao: 4
        },
        {
            id: 2,
            texto: "É fundamental visitar o dentista regularmente, pelo menos a cada seis meses, para fazer avaliações e limpezas profissionais. Pequenos cuidados diários fazem uma grande diferença na saúde do seu sorriso.",
            autor: "Dra Marta",
            profissao: "Dentista",
            data: "10/02/2026",
            avaliacao: 4
        }
    ]);

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    const handlePublicarDica = () => {
        if (novaDica.trim() === '') {
            showToast('Por favor, escreva uma dica antes de publicar!', true);
            return;
        }

        const novaDicaObj = {
            id: Date.now(),
            texto: novaDica,
            autor: "Dra Marta",
            profissao: "Dentista",
            data: new Date().toLocaleDateString('pt-BR'),
            avaliacao: 4
        };

        setDicas([novaDicaObj, ...dicas]);
        setNovaDica('');
        showToast('Dica publicada com sucesso!', false);
    };

    const handleExcluirClick = (dica) => {
        setModalExcluir(dica);
    };

    const handleConfirmarExcluir = () => {
        if (modalExcluir) {
            setDicas(dicas.filter(d => d.id !== modalExcluir.id));
            showToast(`Dica "${modalExcluir.texto.substring(0, 50)}..." excluída com sucesso!`, false);
            setModalExcluir(null);
        }
    };

    const handleCancelarExcluir = () => {
        setModalExcluir(null);
    };

    // Função para renderizar as estrelas
    const renderEstrelas = (avaliacao) => {
        const estrelas = [];
        for (let i = 1; i <= 5; i++) {
            estrelas.push(
                <span key={i} className={`estrela ${i <= avaliacao ? 'preenchida' : ''}`}>
                    ★
                </span>
            );
        }
        return estrelas;
    };

    return (
        <div className="dicas-container">
            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                <div className="medico-section">
                    <img src={doutora} alt="Dra. Marta" className="medico-img" />
                    <div className="medico-info">
                        <h4>Dra. Marta</h4>
                        <p>Dentista</p>
                    </div>
                </div>

                <div className="nav-section">
                    <h3>GERAL</h3>
                    <ul>
                        <li><Link to="/home-medico">Visão geral</Link></li>
                        <li><Link to="/agenda">Minha agenda</Link></li>
                    </ul>
                </div>

                <div className="nav-section">
                    <h3>ATENDIMENTO</h3>
                    <ul>
                        <li><Link to="/consulta">Iniciar consulta</Link></li>
                        <li className="active"><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="logout">
                    <Link to="/">Desconectar</Link>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content">
                <div className="dicas-header">
                    <h1>DICAS DE SAÚDE</h1>
                </div>

                {/* ÁREA DE PUBLICAÇÃO */}
                <div className="publicar-dica">
                    <h2>PUBLICAR DICAS</h2>
                    <div className="editor-area">
                        <textarea 
                            placeholder="Escrever..."
                            value={novaDica}
                            onChange={(e) => setNovaDica(e.target.value)}
                            rows="5"
                        />
                    </div>
                    <div className="btn-publicar-wrapper">
                        <button className="btn-publicar" onClick={handlePublicarDica}>
                            Publicar
                        </button>
                    </div>
                </div>

                {/* SEÇÃO ÚLTIMAS DICAS */}
                <div className="ultimas-dicas-section">
                    <h2>ÚLTIMAS DICAS PUBLICADAS</h2>
                    <div className="dicas-cards-grid">
                        {dicas.map((dica) => (
                            <div key={dica.id} className="dica-card">
                                <button 
                                    className="btn-excluir"
                                    onClick={() => handleExcluirClick(dica)}
                                    title="Excluir dica"
                                >
                                    🗑️
                                </button>
                                <p className="dica-texto">{dica.texto}</p>
                                <div className="dica-footer">
                                    <div className="dica-autor">
                                        <span className="autor-nome">{dica.autor}</span>
                                        <span className="autor-profissao">{dica.profissao}</span>
                                    </div>
                                    <div className="dica-avaliacao">
                                        {renderEstrelas(dica.avaliacao)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {modalExcluir && (
                <div className="modal-overlay" onClick={handleCancelarExcluir}>
                    <div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-confirmar-icon">🗑️</div>
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