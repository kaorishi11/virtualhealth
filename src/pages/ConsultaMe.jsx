import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import VideoCall from '../components/VideoCall';

import logo from '../images/logo.png';
import '../styles/ConsultaMe.css';

export default function ConsultaMe() {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [roomUrl, setRoomUrl] = useState(null);
    const [emChamadaVideo, setEmChamadaVideo] = useState(false);
    const [codigoConsulta, setCodigoConsulta] = useState('');
    const [codigoBusca, setCodigoBusca] = useState('');
    const [salaId, setSalaId] = useState(null);
    const [medico, setMedico] = useState(null);
    const [paciente, setPaciente] = useState(null);
    const [consultaAtual, setConsultaAtual] = useState(null);
    const [codigoGerado, setCodigoGerado] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [criandoSala, setCriandoSala] = useState(false);
    const [carregandoDados, setCarregandoDados] = useState(true);
    const [fotoMedicoErro, setFotoMedicoErro] = useState(false);
    const [fotoPacienteErro, setFotoPacienteErro] = useState(false);
    const [modoAtendimento, setModoAtendimento] = useState('espera');
    
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

    // Função auxiliar para formatar data corretamente
    const formatarDataCorreta = (dataString) => {
        if (!dataString) return '';
        const date = new Date(dataString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Função para corrigir datas nas mensagens
    const corrigirDatasNaMensagem = (mensagem) => {
        if (!mensagem) return mensagem;
        return mensagem.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1');
    };

    const getIniciais = (nome) => {
        if (!nome) return '?';
        const nomes = nome.trim().split(' ');
        if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
        return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
    };

    const getCorFundo = (nome) => {
        if (!nome) return '#6366f1';
        
        const cores = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6'
        ];
        
        let hash = 0;
        for (let i = 0; i < nome.length; i++) {
            hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % cores.length;
        return cores[index];
    };

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

    useEffect(() => {
        carregarDadosCompletos();
    }, []);

    const carregarDadosCompletos = async () => {
        try {
            setCarregandoDados(true);
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                console.error("Usuário não logado:", userError);
                navigate("/");
                return;
            }

            const { data: medicoData, error: medicoError } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", user.id)
                .single();

            if (medicoError) {
                console.error("Erro ao buscar médico:", medicoError);
                mostrarToast('error', 'Erro ao carregar dados do médico');
                return;
            }

            if (medicoData) {
                setMedico(medicoData);
            } else {
                mostrarToast('error', 'Perfil de médico não encontrado');
                return;
            }

            const hoje = new Date().toISOString().split('T')[0];

            const { data: consultas, error: consultaError } = await supabase
                .from("agendamentos")
                .select(`
                    id,
                    data_consulta,
                    horario,
                    tipo,
                    status,
                    paciente_id,
                    created_at
                `)
                .eq("medico_id", medicoData.id)
                .eq("tipo", "teleconsulta")
                .eq("status", "agendada")
                .gte("data_consulta", hoje)
                .order("data_consulta", { ascending: true })
                .limit(1);

            if (consultaError) {
                console.error("Erro ao buscar consultas:", consultaError);
                mostrarToast('error', 'Erro ao buscar consultas');
                return;
            }

            if (consultas && consultas.length > 0) {
                const consulta = consultas[0];
                setConsultaAtual(consulta);

                const { data: pacienteData, error: pacienteError } = await supabase
                    .from("usuarios")
                    .select("id, nome, email, telefone, data_nascimento, foto, genero")
                    .eq("id", consulta.paciente_id)
                    .single();

                if (!pacienteError && pacienteData) {
                    setPaciente(pacienteData);
                }

                const { data: salaExistente, error: salaError } = await supabase
                    .from("consulta_salas")
                    .select("*")
                    .eq("agendamento_id", consulta.id)
                    .maybeSingle();

                if (salaExistente) {
                    setSalaId(salaExistente.id);
                    setCodigoConsulta(salaExistente.codigo);
                    setRoomUrl(salaExistente.sala_url);
                    setCodigoGerado(true);
                } else {
                    await criarNovaSala(consulta.id, consulta.paciente_id);
                }
            } else {
                mostrarToast('info', 'Nenhuma teleconsulta agendada para hoje');
            }

            await carregarNotificacoes(medicoData.id);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            mostrarToast('error', 'Erro ao carregar dados: ' + error.message);
        } finally {
            setCarregandoDados(false);
        }
    };

    const criarNovaSala = async (agendamentoId, pacienteId) => {
        setCriandoSala(true);
        
        try {
            const novoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();
            const salaUrl = `https://meet.jit.si/VirtualHealth_${novoCodigo}_${Date.now()}`;

            const { data, error } = await supabase
                .from('consulta_salas')
                .insert({
                    codigo: novoCodigo,
                    medico_id: medico.id,
                    paciente_id: pacienteId,
                    agendamento_id: agendamentoId,
                    sala_url: salaUrl,
                    status: 'aguardando_medico'
                })
                .select();

            if (error) throw error;

            if (data && data[0]) {
                setSalaId(data[0].id);
                setCodigoConsulta(data[0].codigo);
                setRoomUrl(data[0].sala_url);
                setCodigoGerado(true);
                mostrarToast('success', `Sala criada! Código: ${data[0].codigo}`);
            }
        } catch (error) {
            console.error("Erro ao criar sala:", error);
            mostrarToast('error', 'Erro ao criar sala: ' + error.message);
        } finally {
            setCriandoSala(false);
        }
    };

    const carregarNotificacoes = async (usuarioId) => {
        const { data, error } = await supabase
            .from("notificacoes")
            .select(`
                *,
                paciente:paciente_id (
                    id,
                    nome,
                    foto
                )
            `)
            .eq("usuario_id", usuarioId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (!error && data) {
            const notificacoesProcessadas = data.map(notif => {
                let mensagemCorrigida = notif.mensagem || '';
                mensagemCorrigida = corrigirDatasNaMensagem(mensagemCorrigida);
                
                return {
                    id: notif.id,
                    title: notif.titulo,
                    message: mensagemCorrigida,
                    type: notif.tipo,
                    read: notif.lida,
                    link: notif.link,
                    time: formatarDataCorreta(notif.created_at),
                    pacienteNome: notif.paciente?.nome || null
                };
            });
            setNotifications(notificacoesProcessadas);
        }
    };

    const mostrarToast = (tipo, mensagem) => {
        setToast({ type: tipo, message: mensagem });
        setTimeout(() => setToast(null), 3000);
    };

    const entrarPorCodigo = async () => {
        if (!codigoBusca || codigoBusca.trim().length !== 6) {
            mostrarToast('error', 'Digite um código válido de 6 caracteres!');
            return;
        }

        setCarregando(true);
        
        try {
            const { data: sala, error } = await supabase
                .from('consulta_salas')
                .select('sala_url, status, medico_id')
                .eq('codigo', codigoBusca.toUpperCase())
                .single();

            if (error || !sala) {
                mostrarToast('error', 'Código não encontrado!');
                return;
            }

            if (sala.medico_id !== medico?.id) {
                mostrarToast('error', 'Este código não pertence às suas consultas!');
                return;
            }

            setRoomUrl(sala.sala_url);
            setCodigoConsulta(codigoBusca.toUpperCase());
            setCodigoGerado(true);
            iniciarAtendimento();
            
        } catch (error) {
            console.error('Erro:', error);
            mostrarToast('error', 'Erro ao conectar.');
        } finally {
            setCarregando(false);
        }
    };

    const iniciarAtendimento = () => {
        setModoAtendimento('atendendo');
        setEmChamadaVideo(true);
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const handleCopiarCodigo = () => {
        navigator.clipboard.writeText(codigoConsulta);
        mostrarToast('success', `Código ${codigoConsulta} copiado!`);
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
            console.error("Erro ao acessar câmera:", error);
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

    // Funções de notificação
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
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9H9l-3-9H2"/>
                        <path d="M5 3h14"/>
                        <path d="M12 3v9"/>
                    </svg>
                );
            case 'teleconsulta':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m9 8 5 4-5 4V8z"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                );
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'teleconsulta': return 'teleconsulta';
            default: return 'sistema';
        }
    };

    if (carregandoDados) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Carregando dados da consulta...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} alt="Logo" className="logoperfil" />
                </div>

                <div className="medico-section">
                    <div className="medico-img-wrapper">
                        {medico?.foto && !fotoMedicoErro ? (
                            <img 
                                src={medico.foto} 
                                className="medico-img" 
                                alt={medico.nome}
                                onError={() => setFotoMedicoErro(true)}
                            />
                        ) : (
                            <div 
                                className="medico-img-iniciais"
                                style={{ backgroundColor: getCorFundo(medico?.nome) }}
                            >
                                {getIniciais(medico?.nome)}
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
                        <p>{medico?.especialidade || 'Médico'}</p>
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
                        <li className='active'><Link to="/consulta">Iniciar consulta</Link></li>
                        <li><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="spacer"></div>

                <div className="logout">
                    <button onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/');
                    }}>Desconectar</button>
                </div>
            </div>

            {/* MODAL DE NOTIFICAÇÕES */}
            {showNotifications && (
                <div className="notification-modal-overlay" onClick={closeNotifications}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notification-modal-header">
                            <h3>Notificações</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {unreadCount > 0 && (
                                    <button className="mark-all-btn" onClick={markAllAsRead}>
                                        Marcar todas
                                    </button>
                                )}
                                <button className="close-modal-btn" onClick={closeNotifications}>
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif.id, notif.link)}
                                    >
                                        <div className={`notification-icon-circle ${getTypeClass(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">
                                                {notif.title}
                                            </div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications">
                                    <p>Nenhuma notificação no momento</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="main-content">
                <div className="consulta-header">
                    <div className="consulta-title-center">
                        <h1>TELECONSULTA</h1>
                        {consultaAtual && (
                            <p className="consulta-info">
                                Consulta: {new Date(consultaAtual.data_consulta).toLocaleDateString('pt-BR')} às {consultaAtual.horario}
                            </p>
                        )}
                    </div>
                    <div className="header-actions">
                        <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                            <div className="notification-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {modoAtendimento === 'espera' ? (
                    <div className="atendimento-container">
                        <div className="cards-wrapper">

                            {/* Card para inserir código */}
                            <div className="card-inserir">
                                <div className="card-header">
                                    <h2>Iniciar atendimento</h2>
                                </div>
                                <div className="card-body">
                                    <div className="inserir-codigo">
                                        <label>Digite o código do paciente</label>
                                        <div className="input-group">
                                            <input 
                                                type="text"
                                                className="codigo-input"
                                                placeholder="Ex: ABC123"
                                                value={codigoBusca}
                                                onChange={(e) => setCodigoBusca(e.target.value.toUpperCase().slice(0, 6))}
                                                maxLength="6"
                                            />
                                            <button className="btn-iniciar" onClick={entrarPorCodigo} disabled={carregando}>
                                                {carregando ? "Verificando..." : "Iniciar consulta"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card das informações do paciente */}
                            <div className="card-paciente">
                                <div className="card-header">
                                    <h2>Próximo paciente</h2>
                                </div>
                                <div className="card-body">
                                    {paciente ? (
                                        <div className="paciente-info-card">
                                            <div className="paciente-avatar">
                                                {paciente?.foto && !fotoPacienteErro ? (
                                                    <img 
                                                        src={paciente.foto} 
                                                        alt={paciente.nome}
                                                        onError={() => setFotoPacienteErro(true)}
                                                    />
                                                ) : (
                                                    <div 
                                                        className="avatar-iniciais"
                                                        style={{ backgroundColor: getCorFundo(paciente?.nome) }}
                                                    >
                                                        {getIniciais(paciente?.nome)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="paciente-dados">
                                                <h3>{paciente?.nome || "---"}</h3>
                                                <p>Idade: {calcularIdade(paciente?.data_nascimento) || "---"}</p>
                                                <p>Telefone: {paciente?.telefone || "---"}</p>
                                                <p>Email: {paciente?.email || "---"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="sem-paciente">
                                            <p>Aguardando agendamento...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <VideoCall 
                        roomUrl={roomUrl}
                        userName={`Dr(a). ${medico?.nome?.split(' ')[0] || "Médico"}`}
                        isDoctor={true}
                        onCallEnd={() => {
                            setEmChamadaVideo(false);
                            setModoAtendimento('espera');
                            iniciarCamera();
                            if (salaId) {
                                supabase.from('consulta_salas').update({ status: 'finalizada' }).eq('id', salaId);
                            }
                        }}
                    />
                )}
            </div>

            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            <style jsx>{`
                .consulta-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 0 16px;
                    position: relative;
                }

                .consulta-title-center {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                }

                .consulta-title-center h1 {
                    font-size: 28px;
                    color: #1a2a3a;
                    margin: 0;
                    font-weight: 600;
                }

                .consulta-info {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 5px;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-left: auto;
                }

                .notification-wrapper {
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                .notification-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    color: #9A9A9A;
                }

                .notification-icon:hover {
                    background: rgba(154, 154, 154, 0.1);
                    transform: scale(1.1);
                }

                .notification-icon svg {
                    width: 22px;
                    height: 22px;
                    stroke: #9A9A9A;
                    transition: stroke 0.3s ease;
                }

                .notification-icon:hover svg {
                    stroke: #209FD5;
                }

                .notification-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                    box-shadow: 0 0 0 2px white;
                    animation: pulse 1s infinite;
                }

                .notification-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }

                .notification-modal {
                    background: white;
                    border-radius: 24px;
                    width: 90%;
                    max-width: 480px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                .notification-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .notification-modal-header h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1a2a3a;
                    margin: 0;
                }

                .close-modal-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #94a3b8;
                    padding: 0 8px;
                }

                .close-modal-btn:hover {
                    color: #1a2a3a;
                }

                .mark-all-btn {
                    background: none;
                    border: none;
                    color: #1976d2;
                    font-size: 0.7rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 6px 10px;
                    border-radius: 8px;
                }

                .mark-all-btn:hover {
                    background: #e3f2fd;
                }

                .notification-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .notification-item {
                    display: flex;
                    gap: 14px;
                    padding: 14px 20px;
                    border-bottom: 1px solid #f0f2f5;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .notification-item:hover {
                    background: #f8fafc;
                }

                .notification-item.unread {
                    background: #f0f7ff;
                }

                .notification-icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: #f1f5f9;
                }

                .notification-icon-circle svg {
                    width: 20px;
                    height: 20px;
                    stroke: #9A9A9A;
                }

                .notification-icon-circle.consulta {
                    background: #e0f2fe;
                }

                .notification-icon-circle.consulta svg {
                    stroke: #0284c7;
                }

                .notification-icon-circle.teleconsulta {
                    background: #e0e7ff;
                }

                .notification-icon-circle.teleconsulta svg {
                    stroke: #4f46e5;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #1a2a3a;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .notification-message {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .notification-time {
                    font-size: 0.6rem;
                    color: #94a3b8;
                }

                .no-notifications {
                    text-align: center;
                    padding: 48px 24px;
                    color: #94a3b8;
                }

                .paciente-name-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                .atendimento-container {
                    padding: 20px;
                }

                .cards-wrapper {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 24px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .card-acesso,
                .card-inserir,
                .card-paciente {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .card-acesso:hover,
                .card-inserir:hover,
                .card-paciente:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
                }

                .card-header {
                    background: #f8f9fa;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .card-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                }

                .card-body {
                    padding: 20px;
                }

                .codigo-display {
                    text-align: center;
                }

                .codigo-label {
                    display: block;
                    font-size: 14px;
                    color: #6c757d;
                    margin-bottom: 8px;
                }

                .codigo-valor {
                    font-size: 42px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #2c7da0;
                    font-family: monospace;
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                }

                .btn-copiar {
                    background: #2c7da0;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                                }

                .btn-copiar:hover {
                    background: #1f5e7a;
                }

                .codigo-obs {
                    font-size: 12px;
                    color: #6c757d;
                    margin-top: 12px;
                }

                .inserir-codigo label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #495057;
                }

                .input-group {
                    display: flex;
                    gap: 12px;
                }

                .codigo-input {
                    flex: 1;
                    padding: 12px;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    font-size: 16px;
                    text-align: center;
                    font-weight: bold;
                    letter-spacing: 2px;
                }

                .codigo-input:focus {
                    outline: none;
                    border-color: #2c7da0;
                    box-shadow: 0 0 0 3px rgba(44, 125, 160, 0.1);
                }

                .btn-iniciar {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                }

                .btn-iniciar:hover:not(:disabled) {
                    background: #218838;
                }

                .btn-iniciar:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .paciente-info-card {
                    display: flex;
                    gap: 16px;
                }

                .paciente-avatar img,
                .paciente-avatar .avatar-iniciais {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .avatar-iniciais {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: bold;
                    color: white;
                }

                .paciente-dados {
                    flex: 1;
                }

                .paciente-dados h3 {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    color: #2c3e50;
                }

                .paciente-dados p {
                    margin: 4px 0;
                    font-size: 14px;
                    color: #6c757d;
                }

                .sem-paciente {
                    text-align: center;
                    padding: 40px 20px;
                    color: #6c757d;
                }

                .toast-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }

                .toast-notification.success {
                    background: #28a745;
                }

                .toast-notification.error {
                    background: #dc3545;
                }

                .toast-notification.info {
                    background: #17a2b8;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .consulta-header {
                        flex-direction: column;
                        align-items: center;
                        gap: 16px;
                        padding-top: 16px;
                    }

                    .consulta-title-center {
                        position: relative;
                        left: 0;
                        transform: none;
                        margin-bottom: 10px;
                    }

                    .header-actions {
                        margin-left: 0;
                        justify-content: center;
                    }

                    .consulta-title-center h1 {
                        font-size: 24px;
                    }

                    .cards-wrapper {
                        grid-template-columns: 1fr;
                    }
                    
                    .codigo-valor {
                        font-size: 28px;
                        letter-spacing: 4px;
                    }
                    
                    .input-group {
                        flex-direction: column;
                    }
                    
                    .paciente-info-card {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .notification-modal {
                        width: 95%;
                        max-height: 85vh;
                    }
                }

                @media (max-width: 480px) {
                    .consulta-title-center h1 {
                        font-size: 20px;
                    }

                    .notification-item {
                        padding: 12px 16px;
                        gap: 10px;
                    }

                    .notification-icon-circle {
                        width: 35px;
                        height: 35px;
                    }

                    .notification-icon-circle svg {
                        width: 18px;
                        height: 18px;
                    }
                }
            `}</style>
        </div>
    );
}