import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import VideoCall from '../components/VideoCall';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import fotoPaciente from '../images/foto2.png';

import '../styles/ConsultaMe.css';

export default function ConsultaMe() {
    const navigate = useNavigate();
    const [anotacoes, setAnotacoes] = useState('');
    const [prontuarioSalvo, setProntuarioSalvo] = useState(false);
    const [toast, setToast] = useState(null);
    const [roomUrl, setRoomUrl] = useState(null);
    const [emChamadaVideo, setEmChamadaVideo] = useState(false);
    const [codigoConsulta, setCodigoConsulta] = useState('');
    const [codigoBusca, setCodigoBusca] = useState('');
    const [salaId, setSalaId] = useState(null);
    const [medicoId, setMedicoId] = useState(null);
    const [pacienteId, setPacienteId] = useState(null);
    const [consultaAtual, setConsultaAtual] = useState(null);
    const [pacienteInfo, setPacienteInfo] = useState(null);
    const [codigoGerado, setCodigoGerado] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [criandoSala, setCriandoSala] = useState(false);
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    // Estados da câmera
    const [cameraAtiva, setCameraAtiva] = useState(false);
    const [microfoneAtivo, setMicrofoneAtivo] = useState(true);
    const [cameraPermissao, setCameraPermissao] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        carregarDadosMedico();
    }, []);

    useEffect(() => {
        if (medicoId) {
            buscarProximaConsulta();
            carregarNotificacoes();
        }
    }, [medicoId]);

    async function carregarNotificacoes() {
        if (!medicoId) return;

        const { data, error } = await supabase
            .from("notificacoes")
            .select("*")
            .eq("usuario_id", medicoId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("Erro ao buscar notificações:", error);
            return;
        }

        if (data) {
            setNotifications(data.map(n => ({
                id: n.id,
                title: n.titulo,
                message: n.mensagem,
                type: n.tipo,
                read: n.lida,
                link: n.link,
                time: new Date(n.created_at).toLocaleDateString('pt-BR')
            })));
        }
    }

    const carregarDadosMedico = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                navigate("/");
                return;
            }

            const { data: medico } = await supabase
                .from("usuarios")
                .select("id, nome, especialidade, foto")
                .eq("id", user.id)
                .single();

            if (medico) {
                setMedicoId(medico.id);
            }
        } catch (error) {
            console.error("Erro ao carregar médico:", error);
        }
    };

    const buscarProximaConsulta = async () => {
        if (!medicoId) return;

        try {
            const hoje = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from("agendamentos")
                .select(`
                    id,
                    data_consulta,
                    horario,
                    tipo,
                    link_teleconsulta,
                    status,
                    paciente_id,
                    usuarios:paciente_id (
                        id,
                        nome,
                        telefone,
                        data_nascimento,
                        foto
                    )
                `)
                .eq("medico_id", medicoId)
                .eq("tipo", "teleconsulta")
                .eq("status", "agendada")
                .order("data_consulta", { ascending: true })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const consulta = data[0];
                setConsultaAtual(consulta);
                
                if (consulta.usuarios) {
                    setPacienteInfo(consulta.usuarios);
                    setPacienteId(consulta.paciente_id);
                }
                
                // Verificar se já existe sala
                const { data: salaExistente } = await supabase
                    .from("consulta_salas")
                    .select("id, codigo, sala_url, status")
                    .eq("agendamento_id", consulta.id)
                    .maybeSingle();
                
                if (salaExistente) {
                    setSalaId(salaExistente.id);
                    setCodigoConsulta(salaExistente.codigo);
                    setRoomUrl(salaExistente.sala_url);
                    setCodigoGerado(true);
                } else {
                    // Criar sala automaticamente
                    await criarSalaAutomaticamente(consulta.id, consulta.paciente_id);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar próxima consulta:", error);
        }
    };

    const criarSalaAutomaticamente = async (agendamentoId, pacienteIdConsulta) => {
    setCriandoSala(true);

    try {
        const novoCodigo = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const salaUrl = `https://meet.jit.si/VirtualHealth_${novoCodigo}`;

        const payload = {
            codigo: novoCodigo,
            medico_id: medicoId,
            paciente_id: pacienteIdConsulta,
            agendamento_id: agendamentoId,
            sala_url: salaUrl,
            status: 'aguardando_medico'
        };

        console.log("PAYLOAD SALA:", payload);

        const { data, error } = await supabase
            .from('consulta_salas')
            .insert(payload)
            .select();

        console.log("DATA:", data);
        console.log("ERROR:", error);

        if (error) throw error;

        const sala = data[0];

        setSalaId(sala.id);
        setCodigoConsulta(sala.codigo);
        setRoomUrl(sala.sala_url);
        setCodigoGerado(true);

        setToast({
            type: 'success',
            message: `Sala criada ${sala.codigo}`
        });

    } catch (err) {
        console.error("ERRO COMPLETO:", err);

        setToast({
            type: 'error',
            message: err.message
        });
    } finally {
        setCriandoSala(false);
    }
};

    // FUNÇÃO PRINCIPAL - INICIAR VIDEOCHAMADA
    const iniciarChamadaVideo = () => {
        console.log("=== INICIANDO VIDEOCHAMADA ===");
        console.log("roomUrl atual:", roomUrl);
        
        if (!roomUrl) {
            setToast({ type: 'error', message: 'URL da sala não disponível. Aguarde a criação da sala.' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        
        setEmChamadaVideo(true);
        
        // Desliga a câmera local
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // ENTRAR POR CÓDIGO DIGITADO
    const entrarPorCodigo = async () => {
        if (!codigoBusca || !codigoBusca.trim()) {
            setToast({ type: 'error', message: 'Digite o código da consulta!' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const codigoLimpo = codigoBusca.toUpperCase().trim();
        
        if (codigoLimpo.length !== 6) {
            setToast({ type: 'error', message: 'Código inválido! Digite 6 caracteres.' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setCarregando(true);
        
        try {
            const { data: sala, error } = await supabase
                .from('consulta_salas')
                .select('sala_url, status, medico_id')
                .eq('codigo', codigoLimpo)
                .single();

            if (error) {
                setToast({ type: 'error', message: 'Código não encontrado!' });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            if (sala.medico_id !== medicoId) {
                setToast({ type: 'error', message: 'Este código não pertence às suas consultas!' });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            setRoomUrl(sala.sala_url);
            setCodigoConsulta(codigoLimpo);
            setCodigoGerado(true);
            
            // Iniciar a videochamada automaticamente
            setEmChamadaVideo(true);
            
        } catch (error) {
            console.error('Erro:', error);
            setToast({ type: 'error', message: 'Erro ao conectar.' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setCarregando(false);
        }
    };

    const handleCopiarCodigo = () => {
        navigator.clipboard.writeText(codigoConsulta);
        setToast({ type: 'success', message: `Código ${codigoConsulta} copiado!` });
        setTimeout(() => setToast(null), 2000);
    };

    const handleSalvarProntuario = async () => {
        if (anotacoes.trim() === '') {
            alert('Por favor, escreva suas anotações antes de salvar!');
            return;
        }
        
        try {
            const { error } = await supabase
                .from('prontuarios')
                .insert({
                    consulta_id: salaId || consultaAtual?.id,
                    medico_id: medicoId,
                    paciente_id: pacienteId,
                    anotacoes: anotacoes,
                });
            
            if (error) throw error;
            
            setProntuarioSalvo(true);
            setToast({ type: 'success', message: 'Prontuário salvo com sucesso!' });
            setTimeout(() => setToast(null), 3000);
            setTimeout(() => setProntuarioSalvo(false), 3000);
        } catch (error) {
            console.error('Erro:', error);
            setToast({ type: 'error', message: 'Erro ao salvar prontuário' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    // ==================== NOTIFICAÇÕES ====================
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (id, link) => {
        await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
        setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
        if (link) navigate(link);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        const ids = notifications.map(n => n.id);
        if (ids.length) {
            await supabase.from("notificacoes").update({ lida: true }).in("id", ids);
        }
    };

    const closeNotifications = () => setShowNotifications(false);

    const getTypeIcon = (type) => {
        switch(type) {
            case 'consulta':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9H9l-3-9H2"/><path d="M5 3h14"/><path d="M12 3v9"/></svg>;
            case 'teleconsulta':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m9 8 5 4-5 4V8z"/></svg>;
            default:
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'teleconsulta': return 'teleconsulta';
            default: return 'sistema';
        }
    };

    // Iniciar câmera
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setCameraAtiva(true);
            setMicrofoneAtivo(true);
            setCameraPermissao(true);
        } catch (error) {
            setCameraPermissao(false);
            setCameraAtiva(false);
            setErrorMessage('Permita acesso à câmera e microfone.');
        }
    };

    const alternarCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !cameraAtiva;
                setCameraAtiva(!cameraAtiva);
            }
        }
    };

    const alternarMicrofone = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !microfoneAtivo;
                setMicrofoneAtivo(!microfoneAtivo);
            }
        }
    };

    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return '';
        const nascimento = new Date(dataNascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesDiff = hoje.getMonth() - nascimento.getMonth();
        if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) idade--;
        return `${idade} anos`;
    };

    return (
        <div className="consulta-container">
            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                <div className="medico-section">
                    <img src={pacienteInfo?.foto || doutora} alt="Médico" className="medico-img" />
                    <div className="medico-info">
                        <h4>Dr(a). {pacienteInfo?.nome?.split(' ')[0] || "Médico"}</h4>
                        <p>Especialista</p>
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

                <div className="spacer"></div>

                <div className="logout">
                    <Link to="/">Desconectar</Link>
                </div>
            </div>
            
            {/* HEADER SUPERIOR COM NOTIFICAÇÕES */}
            <div className="top-header">
                <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                    <div className="notification-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </div>
                </div>
            </div>

            {/* MODAL NOTIFICAÇÕES */}
            {showNotifications && (
                <div className="notification-modal-overlay" onClick={closeNotifications}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notification-modal-header">
                            <h3>Notificações</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {unreadCount > 0 && <button className="mark-all-btn" onClick={markAllAsRead}>Marcar todas</button>}
                                <button className="close-modal-btn" onClick={closeNotifications}>×</button>
                            </div>
                        </div>
                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => handleNotificationClick(notif.id, notif.link)} style={{ cursor: 'pointer' }}>
                                        <div className={`notification-icon-circle ${getTypeClass(notif.type)}`}>{getTypeIcon(notif.type)}</div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications"><p>Nenhuma notificação</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content">
                <div className="consulta-header">
                    <h1>TELECONSULTA</h1>
                    {consultaAtual && (
                        <p className="consulta-info">
                            Consulta: {new Date(consultaAtual.data_consulta).toLocaleDateString('pt-BR')} às {consultaAtual.horario}
                        </p>
                    )}
                </div>

                {!emChamadaVideo ? (
                    <div className="consulta-grid">
                        {/* ÁREA DE VÍDEO */}
                        <div className="video-area">
                            <div className="video-card">
                                <div className="video-container-paciente">
                                    <div className="paciente-placeholder">
                                        <div className="paciente-placeholder-icon"></div>
                                        <p>Aguardando paciente conectar...</p>
                                    </div>
                                    
                                    <div className="doctor-pip">
                                        {cameraPermissao ? (
                                            <>
                                                <video ref={videoRef} autoPlay playsInline muted />
                                                <div className="doctor-label">Você</div>
                                            </>
                                        ) : (
                                            <div className="doctor-pip-placeholder">
                                                <span>📹</span>
                                                <p>{errorMessage || "Câmera desligada"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="video-controls">
                                    <button className={`control-btn ${!cameraAtiva ? 'camera-off' : ''}`} onClick={alternarCamera}>
                                        {cameraAtiva ? '📷 Desligar' : '📷 Ligar'}
                                    </button>
                                    <button className={`control-btn ${!microfoneAtivo ? 'mic-off' : ''}`} onClick={alternarMicrofone}>
                                        {microfoneAtivo ? '🎤 Desligar' : '🎤 Ligar'}
                                    </button>
                                </div>

                                {/* CÓDIGO GERADO */}
                                {codigoGerado && codigoConsulta && (
                                    <div className="codigo-sala-card">
                                        <p>Código da consulta</p>
                                        <div className="codigo-grande">{codigoConsulta}</div>
                                        <button className="btn-copiar-codigo" onClick={handleCopiarCodigo}>
                                            📋 Copiar código
                                        </button>
                                        <p className="codigo-instrucao">Compartilhe este código com o paciente</p>
                                    </div>
                                )}

                                {/* BOTÃO INICIAR VIDEOCHAMADA - SÓ FUNCIONA QUANDO roomUrl EXISTE */}
                                {roomUrl ? (
                                    <button className="btn-iniciar-video" onClick={iniciarChamadaVideo}>
                                        🎥 Iniciar Videochamada
                                    </button>
                                ) : (
                                    <button className="btn-iniciar-video" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                        {criandoSala ? "🔄 Criando sala..." : "⏳ Aguardando sala..."}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ÁREA DO PACIENTE */}
                        <div className="paciente-area">
                            <div className="paciente-card">
                                <div className="paciente-header">
                                    <img src={pacienteInfo?.foto || fotoPaciente} alt="Paciente" className="paciente-foto-grande" />
                                    <div className="paciente-info">
                                        <h2>{pacienteInfo?.nome || "Aguardando paciente"}</h2>
                                        {pacienteInfo?.data_nascimento && <p>{calcularIdade(pacienteInfo.data_nascimento)}</p>}
                                    </div>
                                </div>

                                {/* CARD PARA DIGITAR CÓDIGO - BOTÃO FUNCIONANDO */}
                                <div className="entrada-codigo-card">
                                    <h4>🔑 Entrar por código</h4>
                                    <div className="input-group-codigo">
                                        <input 
                                            type="text"
                                            className="codigo-input"
                                            placeholder="Digite o código"
                                            value={codigoBusca}
                                            onChange={(e) => setCodigoBusca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                            maxLength="6"
                                        />
                                        <button className="btn-entrar-codigo" onClick={entrarPorCodigo}>
                                            🎥 Entrar
                                        </button>
                                    </div>
                                </div>

                                <div className="anotacoes-area">
                                    <label>📝 FAÇA SUAS ANOTAÇÕES</label>
                                    <textarea 
                                        placeholder="Digite suas observações..."
                                        value={anotacoes}
                                        onChange={(e) => setAnotacoes(e.target.value)}
                                        rows="5"
                                    />
                                </div>

                                <button className="btn-salvar" onClick={handleSalvarProntuario}>
                                    {prontuarioSalvo ? '✓ SALVO!' : '💾 Salvar prontuário'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <VideoCall 
                        roomUrl={roomUrl}
                        userName={`Dr(a). ${pacienteInfo?.nome?.split(' ')[0] || "Médico"}`}
                        isDoctor={true}
                        onCallEnd={() => {
                            setEmChamadaVideo(false);
                            iniciarCamera();
                            if (salaId) {
                                supabase.from('consulta_salas').update({ status: 'finalizada' }).eq('id', salaId);
                            }
                        }}
                    />
                )}
            </div>

            {/* TOAST */}
            {toast && (
                <div className={`toast-notification ${toast.type === 'error' ? 'error' : 'success'}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            <style>{`
                .top-header { position: fixed; top: 20px; right: 30px; z-index: 100; }
                .notification-wrapper { cursor: pointer; position: relative; }
                .notification-icon { background: white; padding: 10px; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
                .notification-badge { position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; display: flex; align-items: center; justify-content: center; }
                .codigo-sala-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 15px; margin-top: 15px; text-align: center; color: white; }
                .codigo-grande { font-size: 32px; font-weight: bold; letter-spacing: 5px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin: 10px 0; }
                .btn-copiar-codigo { background: rgba(255,255,255,0.2); border: none; padding: 8px 16px; border-radius: 8px; color: white; cursor: pointer; font-weight: bold; }
                .entrada-codigo-card { background: #f0f4f8; border-radius: 12px; padding: 15px; margin: 15px 0; }
                .input-group-codigo { display: flex; gap: 10px; }
                .codigo-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center; font-weight: bold; }
                .btn-entrar-codigo { background: #2c7da0; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
                .btn-entrar-codigo:hover { background: #1f5e7a; }
                .btn-iniciar-video { width: 100%; margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
                .btn-iniciar-video:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
}