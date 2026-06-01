import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';
import olho from '../images/olho.png';
import fechado from '../images/fechado.png';
import atencao from '../images/atencao.png';

import "../styles/PerfilMe.css";

export default function ConfigPerfilMedico() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [fotoErro, setFotoErro] = useState(false);
    const [clinicas, setClinicas] = useState([]);
    
    // Estados das notificações
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const [userData, setUserData] = useState({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        data_nascimento: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        genero: '',
        foto: '',
        crm: '',
        especialidade: '',
        universidade: '',
        ano_formacao: '',
        clinica_id: '',
        preco_consulta: ''
    });
    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [editandoFoto, setEditandoFoto] = useState(false);
    const [novaFotoUrl, setNovaFotoUrl] = useState('');
    const navigate = useNavigate();

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

    useEffect(() => {
        getUser();
        buscarClinicas();
    }, []);

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            carregarDadosUsuario(user.id, user.email);
            await carregarNotificacoes(user.id);
        }
    };

    // Função para carregar notificações
    const carregarNotificacoes = async (medicoId) => {
        try {
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
                .eq("usuario_id", medicoId)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                const notificacoesProcessadas = data.map(notif => {
                    let mensagemCorrigida = notif.mensagem || '';
                    mensagemCorrigida = corrigirDatasNaMensagem(mensagemCorrigida);
                    
                    return {
                        id: notif.id,
                        title: notif.titulo,
                        message: mensagemCorrigida,
                        type: notif.tipo,
                        read: notif.lida,
                        time: formatarDataCorreta(notif.created_at),
                        pacienteNome: notif.paciente?.nome || null
                    };
                });
                
                setNotifications(notificacoesProcessadas);
            }
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        }
    };

    // Função para marcar notificação como lida
    const marcarNotificacaoLida = async (id) => {
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);
    };

    const buscarClinicas = async () => {
        const { data, error } = await supabase
            .from("clinicas")
            .select("*")
            .order("nome");

        if (error) {
            console.error(error);
            return;
        }
        setClinicas(data || []);
    };

    const criarRegistroUsuario = async (userId, userEmail) => {
        try {
            const { error } = await supabase
                .from('usuarios')
                .insert([{
                    id: userId,
                    tipo: 'medico',
                    nome: userEmail.split('@')[0] || 'Médico',
                    email: userEmail
                }]);

            if (error) throw error;
            
            await carregarDadosUsuario(userId, userEmail);
            
        } catch (error) {
            console.error('Erro ao criar registro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao criar registro do usuário',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const carregarDadosUsuario = async (userId, userEmail) => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Erro na consulta:', error);
                if (error.code === 'PGRST116') {
                    console.log('Usuário não encontrado, criando registro...');
                    await criarRegistroUsuario(userId, userEmail);
                    return;
                }
                throw error;
            }

            if (data) {
                console.log('Dados carregados:', data);
                setUserData({
                    nome: data.nome || '',
                    email: userEmail || '',
                    cpf: data.cpf || '',
                    telefone: data.telefone || '',
                    data_nascimento: data.data_nascimento || '',
                    logradouro: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.cidade || '',
                    estado: data.estado || '',
                    cep: data.cep || '',
                    genero: data.genero || '',
                    foto: data.foto || '',
                    crm: data.crm || '',
                    especialidade: data.especialidade || '',
                    universidade: data.universidade || '',
                    ano_formacao: data.ano_formacao || '',
                    clinica_id: data.clinica_id || '',
                    preco_consulta: data.preco_consulta ? formatarPrecoParaExibicao(data.preco_consulta) : ''
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar dados do usuário',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatarCPF = (valor) => {
        const cpf = valor.replace(/\D/g, '');
        if (cpf.length <= 11) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
        }
        return valor;
    };

    const formatarTelefone = (valor) => {
        const telefone = valor.replace(/\D/g, '');
        if (telefone.length <= 10) {
            return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
        } else {
            return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
        }
    };

    const formatarCEP = (valor) => {
        const cep = valor.replace(/\D/g, '');
        if (cep.length <= 8) {
            return cep.replace(/(\d{5})(\d{3})/, '$1-$2').slice(0, 9);
        }
        return valor;
    };

    const formatarPrecoParaExibicao = (valor) => {
        if (!valor) return '';
        const numero = parseFloat(valor);
        if (isNaN(numero)) return '';
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatarPrecoDigitacao = (valor) => {
        let numero = valor.replace(/\D/g, '');
        if (numero === '') return '';
        let valorEmReais = parseFloat(numero) / 100;
        return valorEmReais.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getIniciais = () => {
        if (!userData.nome) return '?';
        const nomes = userData.nome.trim().split(' ');
        if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
        return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
    };

    const getCorFundo = () => {
        if (!userData.nome) return '#6366f1';
        
        const cores = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6'
        ];
        
        let hash = 0;
        for (let i = 0; i < userData.nome.length; i++) {
            hash = userData.nome.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % cores.length;
        return cores[index];
    };

    const getPrimeiroNome = () => {
        if (!userData.nome) return '';
        const partes = userData.nome.trim().split(' ');
        return partes[0];
    };

    const getSobrenome = () => {
        if (!userData.nome) return '';
        const partes = userData.nome.trim().split(' ');
        if (partes.length === 1) return '';
        return partes.slice(1).join(' ');
    };

    const handleSalvarFotoUrl = async () => {
        if (!novaFotoUrl.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Digite uma URL válida',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        try {
            new URL(novaFotoUrl);
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'URL Inválida!',
                text: 'Digite uma URL completa',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        try {
            setLoading(true);
            
            const img = new Image();
            img.onload = async () => {
                try {
                    const { error } = await supabase
                        .from('usuarios')
                        .update({ foto: novaFotoUrl })
                        .eq('id', user.id);

                    if (error) throw error;

                    setUserData(prev => ({ ...prev, foto: novaFotoUrl }));
                    setEditandoFoto(false);
                    setNovaFotoUrl('');
                    setFotoErro(false);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Foto atualizada com sucesso!',
                        confirmButtonColor: '#6366f1',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error('Erro ao salvar:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Erro ao salvar foto',
                        confirmButtonColor: '#6366f1'
                    });
                } finally {
                    setLoading(false);
                }
            };
            
            img.onerror = () => {
                Swal.fire({
                    icon: 'error',
                    title: 'URL Inválida!',
                    text: 'A URL não é uma imagem válida.',
                    confirmButtonColor: '#6366f1'
                });
                setLoading(false);
            };
            
            img.src = novaFotoUrl;
            
        } catch (error) {
            console.error('Erro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao processar URL',
                confirmButtonColor: '#6366f1'
            });
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cpf') {
            setUserData(prev => ({ ...prev, [name]: formatarCPF(value) }));
        } else if (name === 'telefone') {
            setUserData(prev => ({ ...prev, [name]: formatarTelefone(value) }));
        } else if (name === 'cep') {
            setUserData(prev => ({ ...prev, [name]: formatarCEP(value) }));
        } else if (name === 'preco_consulta') {
            const precoFormatado = formatarPrecoDigitacao(value);
            setUserData(prev => ({ ...prev, [name]: precoFormatado }));
        } else {
            setUserData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSavePersonal = async () => {
        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Usuário não autenticado',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        try {
            setLoading(true);

            const cpfLimpo = userData.cpf.replace(/\D/g, '');
            const telefoneLimpo = userData.telefone.replace(/\D/g, '');
            const cepLimpo = userData.cep.replace(/\D/g, '');
            
            let precoNumero = null;
            if (userData.preco_consulta && userData.preco_consulta.trim() !== '') {
                const precoLimpo = userData.preco_consulta
                    .replace(/[R$\s]/g, '')
                    .replace(/\./g, '')
                    .replace(',', '.');
                precoNumero = parseFloat(precoLimpo);
                if (isNaN(precoNumero)) precoNumero = null;
            }

            const dadosParaAtualizar = {
                nome: userData.nome,
                telefone: telefoneLimpo || null,
                cpf: cpfLimpo || null,
                cep: cepLimpo || null,
                data_nascimento: userData.data_nascimento || null,
                logradouro: userData.logradouro || null,
                bairro: userData.bairro || null,
                cidade: userData.cidade || null,
                estado: userData.estado || null,
                genero: userData.genero || null,
                crm: userData.crm || null,
                especialidade: userData.especialidade || null,
                universidade: userData.universidade || null,
                ano_formacao: userData.ano_formacao ? parseInt(userData.ano_formacao) : null,
                clinica_id: userData.clinica_id || null,
                preco_consulta: precoNumero
            };

            const { error } = await supabase
                .from('usuarios')
                .update(dadosParaAtualizar)
                .eq('id', user.id);

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Dados salvos com sucesso!',
                confirmButtonColor: '#6366f1',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: `Erro ao salvar dados: ${error.message}`,
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSecurity = async () => {
        if (passwordData.novaSenha !== passwordData.confirmarSenha) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'As senhas não coincidem!',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        if (passwordData.novaSenha.length < 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'A nova senha deve ter pelo menos 6 caracteres!',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        try {
            setLoading(true);
            
            const { error } = await supabase.auth.updateUser({
                password: passwordData.novaSenha
            });

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Senha alterada com sucesso!',
                confirmButtonColor: '#6366f1',
                timer: 2000,
                showConfirmButton: false
            });
            
            setPasswordData({
                senhaAtual: '',
                novaSenha: '',
                confirmarSenha: ''
            });
            
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao alterar senha',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: 'A exclusão é permanente! Todos os seus dados serão removidos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Sim, excluir minha conta',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const { data, error } = await supabase.functions.invoke('delete-account', {
                method: 'POST'
            });

            if (error) {
                throw new Error(error.message);
            }

            await supabase.auth.signOut();

            Swal.fire({
                icon: 'success',
                title: 'Conta excluída!',
                text: 'Sua conta foi removida com sucesso.',
                confirmButtonColor: '#6366f1'
            });

            navigate('/');

        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao excluir conta. Tente novamente mais tarde.',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            carregarDadosUsuario(user.id, user.email);
        }
        setEditandoFoto(false);
        setNovaFotoUrl('');
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Desconectar',
            text: 'Tem certeza que deseja sair?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    // Funções de notificação
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        await marcarNotificacaoLida(id);
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        
        for (const id of unreadIds) {
            await marcarNotificacaoLida(id);
        }
    };

    const closeNotifications = () => {
        setShowNotifications(false);
    };

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
            case 'pagamento':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="6" width="20" height="12" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                        <circle cx="16" cy="14" r="1"/>
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
            case 'pagamento': return 'pagamento';
            default: return 'sistema';
        }
    };

    return (
        <div className="perfil-container-medico">
            {/* NAVBAR */}
            <div className="navbar-medico">
                <div className="nav-header-medico">
                    <img src={logo} alt="Logo" className="logoperfil-medico" />
                </div>

                <div className="medico-section-medico">
                    <div className="medico-img-wrapper-medico">
                        {userData.foto && !fotoErro ? (
                            <img 
                                src={userData.foto} 
                                className="medico-img-medico" 
                                alt={userData.nome}
                                onError={() => setFotoErro(true)}
                            />
                        ) : (
                            <div 
                                className="medico-img-iniciais-medico"
                                style={{ backgroundColor: getCorFundo() }}
                            >
                                {getIniciais()}
                            </div>
                        )}
                    </div>
                    <div className="medico-info-medico">
                        <h4>
                            <span className="primeiro-nome-medico">{getPrimeiroNome()}</span>
                            {getSobrenome() && (
                                <span className="sobrenome-medico">{getSobrenome()}</span>
                            )}
                        </h4>
                        <p>{userData.especialidade || 'Médico'}</p>
                    </div>
                </div>

                <div className="nav-section-medico">
                    <h3>GERAL</h3>
                    <ul>
                        <li><Link to="/home-medico">Visão geral</Link></li>
                        <li><Link to="/agenda">Minha agenda</Link></li>
                        <li><Link to="/disponibilidade">Disponibilidade</Link></li>
                        <li className="active"><Link to="/perfil-medico">Perfil</Link></li>
                    </ul>
                </div>

                <div className="nav-section-medico">
                    <h3>ATENDIMENTO</h3>
                    <ul>
                        <li><Link to="/consulta">Iniciar consulta</Link></li>
                        <li><Link to="/dicas">Dicas de saúde</Link></li>
                    </ul>
                </div>

                <div className="spacer-medico"></div>

                <div className="logout-medico">
                    <button onClick={handleLogout}>Desconectar</button>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="main-content-medico">
                <div className="perfil-header-medico">
                    <div className="perfil-title-center-medico">
                        <h1>MEU PERFIL</h1>
                    </div>
                    <div className="header-actions-medico">
                        <div className="notification-wrapper-medico" onClick={() => setShowNotifications(true)}>
                            <div className="notification-icon-medico">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="notification-badge-medico">{unreadCount}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL DE NOTIFICAÇÕES */}
                {showNotifications && (
                    <div className="notification-modal-overlay-medico" onClick={closeNotifications}>
                        <div className="notification-modal-medico" onClick={(e) => e.stopPropagation()}>
                            <div className="notification-modal-header-medico">
                                <h3>Notificações</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {unreadCount > 0 && (
                                        <button className="mark-all-btn-medico" onClick={markAllAsRead}>
                                            Marcar todas
                                        </button>
                                    )}
                                    <button className="close-modal-btn-medico" onClick={closeNotifications}>
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="notification-list-medico">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className={`notification-item-medico ${!notif.read ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notif.id)}
                                        >
                                            <div className={`notification-icon-circle-medico ${getTypeClass(notif.type)}`}>
                                                {getTypeIcon(notif.type)}
                                            </div>
                                            <div className="notification-content-medico">
                                                <div className="notification-title-medico">
                                                    {notif.title}
                                                </div>
                                                <div className="notification-message-medico">{notif.message}</div>
                                                <div className="notification-time-medico">{notif.time}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-notifications-medico">
                                        <p>Nenhuma notificação no momento</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FOTO E INFORMAÇÕES BÁSICAS */}
                <div className="perfil-card-medico">
                    <div className="perfil-foto-container-medico">
                        <div className="perfil-img-wrapper-medico">
                            {userData.foto && !fotoErro ? (
                                <img 
                                    src={userData.foto} 
                                    className="perfil-img-medico" 
                                    alt="foto"
                                    onError={() => setFotoErro(true)}
                                />
                            ) : (
                                <div 
                                    className="perfil-img-iniciais-medico"
                                    style={{ backgroundColor: getCorFundo() }}
                                >
                                    {getIniciais()}
                                </div>
                            )}
                        </div>
                        
                        {!editandoFoto ? (
                            <button 
                                className="edit-foto-btn-medico"
                                onClick={() => setEditandoFoto(true)}
                            >
                                {userData.foto ? 'Alterar foto' : 'Adicionar foto'}
                            </button>
                        ) : (
                            <div className="foto-url-editor-medico">
                                <input
                                    type="text"
                                    placeholder="Digite a URL da imagem"
                                    value={novaFotoUrl}
                                    onChange={(e) => setNovaFotoUrl(e.target.value)}
                                    className="url-input-medico"
                                />
                                <div className="url-buttons-medico">
                                    <button onClick={handleSalvarFotoUrl} disabled={loading}>
                                        Salvar
                                    </button>
                                    <button onClick={() => setEditandoFoto(false)}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="perfil-info-medico">
                        <h2>{userData.nome || "Nome não informado"}</h2>
                        <p>{userData.email || user?.email || "Email não informado"}</p>
                        <div className="tags-medico">
                            {userData.especialidade && (
                                <span className="especialidade-tag-medico">{userData.especialidade}</span>
                            )}
                            {userData.crm && (
                                <span className="crm-tag-medico">CRM: {userData.crm}</span>
                            )}
                            {userData.preco_consulta && (
                                <span className="preco-tag-medico">
                                    Consulta: R$ {userData.preco_consulta}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* FORMULÁRIO EM GRID */}
                <div className="grid-medico">
                    {/* DADOS PESSOAIS */}
                    <div className="card-medico">
                        <h3>DADOS PESSOAIS</h3>
                        <div className="inputs-medico">
                            <input 
                                type="text" 
                                name="nome"
                                placeholder="Nome completo" 
                                value={userData.nome}
                                onChange={handleInputChange}
                            />
                            <div className="row-medico">
                                <input 
                                    type="text" 
                                    name="cpf"
                                    placeholder="CPF" 
                                    value={userData.cpf}
                                    onChange={handleInputChange}
                                    maxLength={14}
                                />
                                <input 
                                    type="tel" 
                                    name="telefone"
                                    placeholder="Telefone" 
                                    value={userData.telefone}
                                    onChange={handleInputChange}
                                    maxLength={15}
                                />
                            </div>
                            <div className="row-medico">
                                <input 
                                    type="date" 
                                    name="data_nascimento"
                                    placeholder="Data de nascimento" 
                                    value={userData.data_nascimento}
                                    onChange={handleInputChange}
                                />
                                <select
                                    name="genero"
                                    value={userData.genero}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Gênero</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="nao_binario">Não-binário</option>
                                    <option value="outro">Outro</option>
                                    <option value="prefiro_nao_informar">Prefiro não informar</option>
                                </select>
                            </div>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="E-mail" 
                                value={userData.email || user?.email || ''}
                                disabled
                            />
                        </div>
                    </div>

                    {/* ENDEREÇO */}
                    <div className="card-medico">
                        <h3>ENDEREÇO</h3>
                        <div className="inputs-medico">
                            <input 
                                type="text" 
                                name="cep"
                                placeholder="CEP" 
                                value={userData.cep}
                                onChange={handleInputChange}
                                maxLength={9}
                            />
                            <input 
                                type="text" 
                                name="logradouro"
                                placeholder="Logradouro" 
                                value={userData.logradouro}
                                onChange={handleInputChange}
                            />
                            <input 
                                type="text" 
                                name="bairro"
                                placeholder="Bairro" 
                                value={userData.bairro}
                                onChange={handleInputChange}
                            />
                            <div className="row-medico">
                                <input 
                                    type="text" 
                                    name="cidade"
                                    placeholder="Cidade" 
                                    value={userData.cidade}
                                    onChange={handleInputChange}
                                />
                                <input 
                                    type="text" 
                                    name="estado"
                                    placeholder="Estado" 
                                    value={userData.estado}
                                    onChange={handleInputChange}
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DADOS PROFISSIONAIS */}
                    <div className="card-medico">
                        <h3>DADOS PROFISSIONAIS</h3>
                        <div className="inputs-medico">
                            <div className="row-medico">
                                <input 
                                    type="text" 
                                    name="crm"
                                    placeholder="CRM" 
                                    value={userData.crm}
                                    onChange={handleInputChange}
                                />
                                <input 
                                    type="text" 
                                    name="especialidade"
                                    placeholder="Especialidade" 
                                    value={userData.especialidade}
                                    onChange={handleInputChange}
                                                                />
                            </div>
                            <input 
                                type="text" 
                                name="universidade"
                                placeholder="Universidade" 
                                value={userData.universidade}
                                onChange={handleInputChange}
                            />
                            <div className="row-medico">
                                <input 
                                    type="number" 
                                    name="ano_formacao"
                                    placeholder="Ano de formação" 
                                    value={userData.ano_formacao}
                                    onChange={handleInputChange}
                                />
                                <select
                                    name="clinica_id"
                                    value={userData.clinica_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Nenhuma clínica</option>
                                    {clinicas.map((clinica) => (
                                        <option key={clinica.id} value={clinica.id}>
                                            {clinica.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Campo de Preço da Consulta */}
                            <input 
                                type="text" 
                                name="preco_consulta"
                                placeholder="Preço da consulta (R$)" 
                                value={userData.preco_consulta}
                                onChange={handleInputChange}
                                className="preco-input-medico"
                            />
                            <small className="preco-hint-medico">Digite o valor da consulta (ex: 150,00)</small>
                        </div>
                    </div>

                    {/* SEGURANÇA */}
                    <div className="card-medico">
                        <h3>SEGURANÇA</h3>
                        <div className="inputs-medico">
                            <input 
                                type="password" 
                                name="senhaAtual"
                                placeholder="Senha atual" 
                                value={passwordData.senhaAtual}
                                onChange={handlePasswordChange}
                            />
                            <div className="password-wrapper-medico">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="novaSenha"
                                    placeholder="Nova senha" 
                                    value={passwordData.novaSenha}
                                    onChange={handlePasswordChange}
                                />
                                <img 
                                    src={showPassword ? olho : fechado} 
                                    className="eye-icon-medico" 
                                    alt="mostrar senha" 
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </div>
                            <input 
                                type="password" 
                                name="confirmarSenha"
                                placeholder="Confirmar nova senha" 
                                value={passwordData.confirmarSenha}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <button className="btn-medico" onClick={handleSaveSecurity} disabled={loading}>
                            {loading ? 'Salvando...' : 'Alterar senha'}
                        </button>
                    </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="actions-medico">
                    <button className="btn-save-medico" onClick={handleSavePersonal} disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                    <button className="btn-cancel-medico" onClick={handleCancel} disabled={loading}>
                        Cancelar
                    </button>
                </div>

                {/* ALERTA DE EXCLUSÃO */}
                <div className="alert-medico">
                    <img src={atencao} alt="atenção"/>
                    <div className="alert-content-medico">
                        <h4>ATENÇÃO!</h4>
                        <p>
                            A exclusão da conta é permanente e não pode ser desfeita.
                            Todos os seus dados, agendamentos e histórico serão removidos.
                        </p>
                        <button className="delete-medico" onClick={handleDeleteAccount} disabled={loading}>
                            {loading ? 'Processando...' : 'Excluir conta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}