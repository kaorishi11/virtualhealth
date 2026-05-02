import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';
import fotoPaciente from '../images/foto2.png';

import '../styles/ConsultaMe.css';

export default function ConsultaMe() {
    const [anotacoes, setAnotacoes] = useState('');
    const [prontuarioSalvo, setProntuarioSalvo] = useState(false);
    const [toast, setToast] = useState(null);
    const [showModalCodigo, setShowModalCodigo] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    
    // Estados da câmera
    const [cameraAtiva, setCameraAtiva] = useState(false);
    const [microfoneAtivo, setMicrofoneAtivo] = useState(true);
    const [cameraPermissao, setCameraPermissao] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Gerar código aleatório para consulta
    const gerarCodigoConsulta = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const [codigoConsulta, setCodigoConsulta] = useState(gerarCodigoConsulta());

    // Iniciar câmera ao carregar a página
    useEffect(() => {
        iniciarCamera();
        
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const iniciarCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            streamRef.current = stream;
            setCameraAtiva(true);
            setMicrofoneAtivo(true);
            setCameraPermissao(true);
            setErrorMessage('');
            
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            setCameraPermissao(false);
            setCameraAtiva(false);
            
            if (error.name === 'NotAllowedError') {
                setErrorMessage('Permissão negada. Por favor, permita o acesso à câmera e microfone.');
            } else if (error.name === 'NotFoundError') {
                setErrorMessage('Nenhuma câmera encontrada no dispositivo.');
            } else {
                setErrorMessage('Não foi possível acessar a câmera. Verifique as permissões.');
            }
        }
    };

    const desligarCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = false;
                setCameraAtiva(false);
            }
        }
    };

    const ligarCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = true;
                setCameraAtiva(true);
            }
        } else {
            iniciarCamera();
        }
    };

    const desligarMicrofone = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = false;
                setMicrofoneAtivo(false);
            }
        }
    };

    const ligarMicrofone = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = true;
                setMicrofoneAtivo(true);
            }
        }
    };

    const alternarCamera = () => {
        if (cameraAtiva) {
            desligarCamera();
        } else {
            ligarCamera();
        }
    };

    const alternarMicrofone = () => {
        if (microfoneAtivo) {
            desligarMicrofone();
        } else {
            ligarMicrofone();
        }
    };

    const encerrarChamada = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraAtiva(false);
        setMicrofoneAtivo(false);
        setCameraPermissao(false);
        
        // Mostrar toast de chamada encerrada
        setToast({
            type: 'end',
            message: 'Chamada encerrada'
        });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSalvarProntuario = () => {
        if (anotacoes.trim() === '') {
            alert('Por favor, escreva suas anotações antes de salvar o prontuário!');
            return;
        }
        setProntuarioSalvo(true);
        
        setToast({
            type: 'success',
            message: 'Prontuário salvo com sucesso!'
        });
        setTimeout(() => setToast(null), 3000);
        setTimeout(() => setProntuarioSalvo(false), 3000);
    };

    const handleEnviarCodigo = () => {
        // Gerar novo código a cada envio
        setCodigoConsulta(gerarCodigoConsulta());
        setShowModalCodigo(true);
    };

    const handleConfirmarEnvio = () => {
        setShowModalCodigo(false);
        setCodigoEnviado(true);
        
        // Mostrar toast de sucesso
        setToast({
            type: 'success',
            message: `Código ${codigoConsulta} enviado para Enaldo Santos com sucesso!`
        });
        setTimeout(() => setToast(null), 4000);
        
        // Resetar o estado do botão após 3 segundos
        setTimeout(() => setCodigoEnviado(false), 3000);
    };

    const handleCopiarCodigo = () => {
        navigator.clipboard.writeText(codigoConsulta);
        setToast({
            type: 'success',
            message: `Código ${codigoConsulta} copiado para a área de transferência!`
        });
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <div className="consulta-container">
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
                        <li className="active"><Link to="/consulta">Iniciar consulta</Link></li>
                        <li><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="logout">
                    <Link to="/">Desconectar</Link>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content">
                <div className="consulta-header">
                    <h1>TELECONSULTA</h1>
                </div>

                <div className="consulta-grid">
                    {/* ÁREA DE VÍDEO - TELA GRANDE DO PACIENTE */}
                    <div className="video-area">
                        <div className="video-card">
                            <div className="video-container-paciente">
                                <div className="paciente-placeholder">
                                    <div className="paciente-placeholder-icon"></div>
                                    <p>Aguardando paciente conectar...</p>
                                    <p style={{ fontSize: '12px', marginTop: '8px' }}>A câmera do paciente aparecerá aqui</p>
                                </div>
                                
                                <div className="doctor-pip">
                                    {cameraPermissao ? (
                                        <>
                                            <video 
                                                ref={videoRef} 
                                                autoPlay 
                                                playsInline 
                                                muted
                                            />
                                            <div className="doctor-label">Você</div>
                                        </>
                                    ) : (
                                        <div className="doctor-pip-placeholder">
                                            <span></span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="camera-status">
                                    <span className="status-dot"></span>
                                    <span>{cameraAtiva ? 'Chamada ativa' : 'Câmera desligada'}</span>
                                </div>
                            </div>
                            
                            <div className="video-controls">
                                <button 
                                    className={`control-btn ${!cameraAtiva ? 'camera-off' : ''}`}
                                    onClick={alternarCamera}
                                >
                                    {cameraAtiva ? 'Desligar Câmera' : 'Ligar Câmera'}
                                </button>
                                <button 
                                    className={`control-btn ${!microfoneAtivo ? 'mic-off' : ''}`}
                                    onClick={alternarMicrofone}
                                >
                                    {microfoneAtivo ? 'Desligar Micro' : 'Ligar Micro'}
                                </button>
                                <button className="control-btn end-call" onClick={encerrarChamada}>
                                    Encerrar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA DO PACIENTE */}
                    <div className="paciente-area">
                        <div className="paciente-card">
                            <div className="paciente-header">
                                <img src={fotoPaciente} alt="Paciente" className="paciente-foto-grande" />
                                <div className="paciente-info">
                                    <h2>Enaldo Santos</h2>
                                    <p>32 anos · 1º consulta</p>
                                </div>
                            </div>

                            <div className="consulta-detalhes">
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Motivo:</span>
                                    <span className="detalhe-valor destaque">Excesso de cáries no dente</span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Horário:</span>
                                    <span className="detalhe-valor">14h50</span>
                                </div>
                            </div>

                            {/* BOTÃO DE ENVIAR CÓDIGO */}
                            <button 
                                className={`btn-enviar-codigo ${codigoEnviado ? 'enviado' : ''}`}
                                onClick={handleEnviarCodigo}
                            >
                                {codigoEnviado ? '✓ ENVIADO!' : 'Enviar código para consulta para Enaldo Santos'}
                            </button>

                            <div className="anotacoes-area">
                                <label>FAÇA SUAS ANOTAÇÕES</label>
                                <textarea 
                                    placeholder="Digite aqui suas observações sobre a consulta..."
                                    value={anotacoes}
                                    onChange={(e) => setAnotacoes(e.target.value)}
                                    rows="6"
                                />
                            </div>

                            <button className="btn-salvar" onClick={handleSalvarProntuario}>
                                {prontuarioSalvo ? '✓ PRONTUÁRIO SALVO!' : 'Salvar prontuário'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMAÇÃO DO CÓDIGO */}
            {showModalCodigo && (
                <div className="modal-codigo" onClick={() => setShowModalCodigo(false)}>
                    <div className="modal-codigo-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Código de Acesso</h3>
                        <p>Envie este código para o paciente <strong>Enaldo Santos</strong> para ele entrar na consulta</p>
                        
                        <div className="codigo-container">
                            <div className="codigo">{codigoConsulta}</div>
                        </div>
                        
                        <div className="modal-botoes">
                            <button className="btn-copiar" onClick={handleCopiarCodigo}>
                                Copiar código
                            </button>
                            <button className="btn-fechar-modal" onClick={() => setShowModalCodigo(false)}>
                                Cancelar
                            </button>
                        </div>
                        
                        <button 
                            className="btn-enviar-codigo" 
                            onClick={handleConfirmarEnvio}
                            style={{ marginTop: '20px', marginBottom: '0' }}
                        >
                            Enviar para Enaldo Santos
                        </button>
                    </div>
                </div>
            )}

            {/* TOAST DE NOTIFICAÇÃO */}
            {toast && (
                <div className="toast-notification success">
                    <span className="toast-icon">{toast.type === 'success' ? '✓' : '📞'}</span>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}