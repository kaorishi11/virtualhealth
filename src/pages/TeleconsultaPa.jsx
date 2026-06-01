import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../services/supabase';
import VideoCall from '../components/VideoCall';

import logo from '../images/logo.png';
import '../styles/TeleconsultaPa.css';

export default function TeleconsultaPa() {
    const navigate = useNavigate();
    const [codigoBusca, setCodigoBusca] = useState("");
    const [roomUrl, setRoomUrl] = useState(null);
    const [emChamadaVideo, setEmChamadaVideo] = useState(false);
    const [toast, setToast] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [pacienteId, setPacienteId] = useState(null);
    const [proximaConsulta, setProximaConsulta] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [carregandoConsulta, setCarregandoConsulta] = useState(true);
    const [codigoSala, setCodigoSala] = useState(null);
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [processandoCodigoUrl, setProcessandoCodigoUrl] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        if (pacienteId) {
            carregarNotificacoes();
            carregarProximaConsulta();
        }
    }, [pacienteId]);

    async function carregarDados() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                navigate("/");
                return;
            }

            setUsuario(user);

            const { data: usuarioData } = await supabase
                .from("usuarios")
                .select("id, tipo, nome")
                .eq("id", user.id)
                .single();

            if (usuarioData && usuarioData.tipo === 'paciente') {
                setPacienteId(usuarioData.id);
            } else if (usuarioData && usuarioData.tipo === 'medico') {
                navigate("/home-medico");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            navigate("/");
        }
    }

    async function carregarNotificacoes() {
        if (!pacienteId) return;

        const { data, error } = await supabase
            .from("notificacoes")
            .select("*")
            .eq("usuario_id", pacienteId)
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
                time: new Date(n.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            })));
        }
    }

    async function carregarProximaConsulta() {
        if (!pacienteId) {
            setCarregandoConsulta(false);
            return;
        }

        setCarregandoConsulta(true);
        
        try {
            const hoje = new Date().toISOString().split('T')[0];

            // Buscar agendamentos da tabela
            const { data: agendamentos, error: errorAgendamentos } = await supabase
                .from("agendamentos")
                .select(`
                    id,
                    data_consulta,
                    horario,
                    tipo,
                    status,
                    medico_id,
                    created_at
                `)
                .eq("paciente_id", pacienteId)
                .eq("tipo", "teleconsulta")
                .eq("status", "agendada")
                .gte("data_consulta", hoje)
                .order("data_consulta", { ascending: true })
                .order("horario", { ascending: true })
                .limit(1);

            if (errorAgendamentos) {
                console.error("Erro ao buscar agendamentos:", errorAgendamentos);
                setProximaConsulta(null);
                setCarregandoConsulta(false);
                return;
            }

            if (agendamentos && agendamentos.length > 0) {
                const agendamento = agendamentos[0];
                
                // Buscar dados do médico
                const { data: medico, error: errorMedico } = await supabase
                    .from("usuarios")
                    .select("nome, especialidade, foto")
                    .eq("id", agendamento.medico_id)
                    .single();

                // Buscar a sala associada a este agendamento
                const { data: sala, error: salaError } = await supabase
                    .from("consulta_salas")
                    .select("codigo, sala_url")
                    .eq("agendamento_id", agendamento.id)
                    .maybeSingle();

                if (!salaError && sala) {
                    setCodigoSala(sala.codigo);
                }

                // Formatar a data e horário
                const dataFormatada = new Date(agendamento.data_consulta).toLocaleDateString('pt-BR');
                const horarioFormatado = agendamento.horario.substring(0, 5);

                setProximaConsulta({
                    id: agendamento.id,
                    medico: medico?.nome || "Médico não encontrado",
                    especialidade: medico?.especialidade || "Especialidade não informada",
                    foto: medico?.foto,
                    data: dataFormatada,
                    horario: horarioFormatado,
                    codigo: sala?.codigo || null
                });
            } else {
                setProximaConsulta(null);
            }
        } catch (error) {
            console.error("Erro ao carregar próxima consulta:", error);
            setProximaConsulta(null);
        } finally {
            setCarregandoConsulta(false);
        }
    }

    // FUNÇÃO PARA ENTRAR NA CONSULTA POR CÓDIGO
    async function entrarNaConsulta(codigo = null) {
        const codigoFinal = codigo || codigoBusca;
        
        if (!codigoFinal || !codigoFinal.trim()) {
            showToast('Digite o código da consulta!', true);
            return false;
        }

        const codigoLimpo = codigoFinal.toUpperCase().trim();
        
        if (codigoLimpo.length !== 6 || !/^[A-Z0-9]+$/i.test(codigoLimpo)) {
            showToast('Código inválido! Digite 6 caracteres alfanuméricos.', true);
            return false;
        }

        setCarregando(true);
        
        try {
            // Buscar sala pelo código na tabela consulta_salas
            const { data: sala, error } = await supabase
                .from('consulta_salas')
                .select(`
                    id,
                    sala_url,
                    status,
                    medico_id,
                    paciente_id,
                    codigo
                `)
                .eq('codigo', codigoLimpo)
                .single();

            if (error) {
                console.error("Erro ao buscar sala:", error);
                showToast('Código inválido ou consulta não encontrada!', true);
                return false;
            }

            console.log("Sala encontrada:", sala);

            // Verificar se o paciente é o dono ou se a sala está livre
            if (sala.paciente_id && sala.paciente_id !== pacienteId) {
                showToast('Este código não pertence às suas consultas!', true);
                return false;
            }

            // Atualizar paciente_id se estiver vazio
            if (!sala.paciente_id) {
                await supabase
                    .from('consulta_salas')
                    .update({ paciente_id: pacienteId, status: 'ativa' })
                    .eq('id', sala.id);
            }

            console.log('Abrindo sala:', sala.sala_url);

            setRoomUrl(sala.sala_url);
            setEmChamadaVideo(true);
            return true;
            
        } catch (error) {
            console.error('Erro:', error);
            showToast('Erro ao conectar. Verifique o código.', true);
            return false;
        } finally {
            setCarregando(false);
        }
    }

    // Usar o código da próxima consulta
    async function entrarComProximaConsulta() {
        if (!proximaConsulta?.codigo) {
            showToast('Código da consulta não disponível. Entre em contato com o suporte.', true);
            return;
        }
        
        console.log("Entrando na consulta com código:", proximaConsulta.codigo);
        await entrarNaConsulta(proximaConsulta.codigo);
    }

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 3000);
    };

    const handleNotificationClick = async (id, link) => {
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);

        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        
        if (link) {
            navigate(link);
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        
        const idsNotificacoes = notifications.map(n => n.id);
        if (idsNotificacoes.length > 0) {
            await supabase
                .from("notificacoes")
                .update({ lida: true })
                .in("id", idsNotificacoes);
        }
    };

    const closeNotifications = () => setShowNotifications(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div>
            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logopaciente" alt="logo" />
                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                        <div className="notification-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </div>
                    </div>
                    <button className="consulta-btn" onClick={() => navigate("/chat")}>Fazer Consulta</button>
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
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => handleNotificationClick(notif.id, notif.link)}>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications"><p>Nenhuma notificação no momento</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HERO */}
            <div className="teleconsulta-hero">
                <div className="teleconsulta-hero-content">
                    <div className="teleconsulta-hero-text">
                        <h1>TELECONSULTA</h1>
                        <p>Digite o código fornecido pelo seu médico para iniciar a consulta.</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                <div className="teleconsulta-container">
                    {!emChamadaVideo ? (
                        <>
                            <div className="section-title">
                                <h2>ORIENTAÇÕES</h2>
                                <hr />
                                <p>Certifique-se de estar em um ambiente tranquilo e com boa iluminação para uma melhor experiência.</p>
                            </div>

                            <div className="teleconsulta-grid">
                                {/* CARD PARA INSERIR O CÓDIGO */}
                                <div className="link-card">
                                    <h2>ENTRAR NA TELECONSULTA</h2>
                                    <div className="input-group">
                                        <label>Código da consulta (6 dígitos)</label>
                                        <input 
                                            type="text"
                                            placeholder="Ex: ABC123"
                                            value={codigoBusca}
                                            onChange={(e) => setCodigoBusca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                            maxLength="6"
                                            disabled={carregando}
                                        />
                                    </div>
                                    <button 
                                        className="btn-entrar"
                                        onClick={() => entrarNaConsulta()}
                                        disabled={carregando || !codigoBusca}
                                    >
                                        {carregando ? "Verificando..." : "Entrar na consulta"}
                                    </button>
                                </div>

                                {/* PRÓXIMA CONSULTA */}
                                <div className="info-card">
                                    <div className="info-card-header">
                                        <h2>PRÓXIMA CONSULTA</h2>
                                    </div>
                                    <div className="info-card-body">
                                        {carregandoConsulta ? (
                                            <div className="loading-consulta">
                                                <p>Carregando...</p>
                                            </div>
                                        ) : proximaConsulta ? (
                                            <>
                                                <div className="info-content">
                                                    <div className="info-item">
                                                        <span className="info-label">Médico(a):</span>
                                                        <span className="info-value destaque">{proximaConsulta.medico}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Especialidade:</span>
                                                        <span className="info-value">{proximaConsulta.especialidade}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Data:</span>
                                                        <span className="info-value">{proximaConsulta.data}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Horário:</span>
                                                        <span className="info-value">{proximaConsulta.horario}</span>
                                                    </div>
                                                    {proximaConsulta.codigo && (
                                                        <div className="info-item">
                                                            <span className="info-label">Código:</span>
                                                            <span className="info-value codigo-destaque">{proximaConsulta.codigo}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    className="btn-entrar-proxima"
                                                    onClick={entrarComProximaConsulta}
                                                >
                                                    Entrar na consulta
                                                </button>
                                            </>
                                        ) : (
                                            <div className="sem-consulta">
                                                <p>Nenhuma consulta agendada no momento.</p>
                                                <Link to="/clinicas" className="btn-agendar">
                                                    Agendar consulta
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CARD COM O CÓDIGO DA PRÓXIMA CONSULTA (se tiver) */}
                            {proximaConsulta?.codigo && (
                                <div className="codigo-card">
                                    <h3>Seu código para a próxima consulta</h3>
                                    <div className="codigo-grande">{proximaConsulta.codigo}</div>
                                    <p>Compartilhe este código com seu médico ou digite acima para entrar</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <VideoCall 
                            roomUrl={roomUrl}
                            userName={usuario?.user_metadata?.name || usuario?.email?.split('@')[0] || "Paciente"}
                            isDoctor={false}
                            onCallEnd={() => {
                                setEmChamadaVideo(false);
                                setRoomUrl(null);
                                setCodigoBusca('');
                                setProcessandoCodigoUrl(false);
                                carregarProximaConsulta();
                            }}
                        />
                    )}
                </div>
            </div>

            {/* TOAST */}
            {toast && (
                <div className={`toast ${toast.isError ? 'error' : ''}`}>
                    {toast.message}
                </div>
            )}

            <style>{`
                .codigo-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 24px;
                    text-align: center;
                    color: white;
                }
                
                .codigo-card h3 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                    font-weight: normal;
                }
                
                .codigo-grande {
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    background: rgba(255,255,255,0.2);
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                    font-family: monospace;
                }
                
                .codigo-destaque {
                    background: #e3f2fd;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-weight: bold;
                    font-size: 16px;
                    letter-spacing: 2px;
                }
                
                .info-card-body .info-content {
                    margin-bottom: 16px;
                }
                
                .btn-entrar-proxima {
                    width: 100%;
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .btn-entrar-proxima:hover {
                    background: #218838;
                }
            `}</style>
        </div>
    );
}