import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';
import icon5 from '../images/person.png';
import icon6 from '../images/cad.png';
import olho from '../images/olho.png';
import fechado from '../images/fechado.png';
import atencao from '../images/atencao.png';

import "../styles/ConfigPerfil.css";

export default function ConfigPerfil() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
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
        foto: ''
    });
    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [editandoFoto, setEditandoFoto] = useState(false);
    const [novaFotoUrl, setNovaFotoUrl] = useState('');
    const [fotoErro, setFotoErro] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Usuário logado:', user);
        setUser(user);
        if (user) {
            carregarDadosUsuario(user.id, user.email);
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

            console.log('Dados do banco:', data);

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
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
                    foto: data.foto || ''
                });
            } else {
                await criarRegistroUsuario(userId, userEmail);
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

    const criarRegistroUsuario = async (userId, userEmail) => {
        try {
            const novoUsuario = {
                id: userId,
                tipo: 'paciente',
                nome: userEmail?.split('@')[0] || 'Usuário',
                created_at: new Date()
            };

            const { data, error } = await supabase
                .from('usuarios')
                .insert([novoUsuario])
                .select()
                .single();

            if (error) throw error;
            
            setUserData({
                ...userData,
                nome: novoUsuario.nome,
                email: userEmail
            });
            
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao criar perfil de usuário',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    // Função para formatar CPF
    const formatarCPF = (valor) => {
        const cpf = valor.replace(/\D/g, '');
        if (cpf.length <= 11) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
        }
        return valor;
    };

    // Função para formatar Telefone
    const formatarTelefone = (valor) => {
        const telefone = valor.replace(/\D/g, '');
        if (telefone.length <= 10) {
            return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
        } else {
            return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
        }
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

    // Função para salvar URL da foto
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

        // Validar se é uma URL válida
        try {
            new URL(novaFotoUrl);
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'URL Inválida!',
                text: 'Digite uma URL completa (ex: https://exemplo.com/imagem.jpg)',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        try {
            setLoading(true);
            
            // Testar se a imagem carrega
            const img = new Image();
            img.onload = async () => {
                try {
                    // Salvar URL no banco
                    const { error } = await supabase
                        .from('usuarios')
                        .update({ foto: novaFotoUrl })
                        .eq('id', user.id);

                    if (error) throw error;

                    // Atualizar estado local
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
                        text: 'Erro ao salvar foto: ' + error.message,
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
                    text: 'A URL não parece ser uma imagem válida. Verifique se o link funciona.',
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
        
        // Aplicar máscaras específicas
        if (name === 'cpf') {
            setUserData(prev => ({
                ...prev,
                [name]: formatarCPF(value)
            }));
        } else if (name === 'telefone') {
            setUserData(prev => ({
                ...prev,
                [name]: formatarTelefone(value)
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSavePersonal = async () => {
        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Usuário não está logado',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        try {
            setLoading(true);

            // Remover pontos e traços do CPF antes de salvar
            const cpfLimpo = userData.cpf.replace(/\D/g, '');
            const telefoneLimpo = userData.telefone.replace(/\D/g, '');

            const dadosParaAtualizar = {
                nome: userData.nome,
                telefone: telefoneLimpo,
                cpf: cpfLimpo,
                data_nascimento: userData.data_nascimento || null,
                logradouro: userData.logradouro,
                bairro: userData.bairro,
                cidade: userData.cidade,
                estado: userData.estado
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
                text: 'Erro ao salvar dados: ' + error.message,
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
                text: 'Erro ao alterar senha: ' + error.message,
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

        const { data, error } = await supabase.functions.invoke("delete-account");

        if (error) {
            throw new Error(error.message);
        }

        await supabase.auth.signOut();

        await Swal.fire({
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
            text: error.message || 'Erro ao excluir conta',
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

    return (
        <div className="perfil-container">
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} className="logoperfil" alt="logo" />
                </div>
            
                <h3>CONTA</h3>
                <ul>
                    <li className="active">
                        <Link to="/perfil">
                            <img src={icon1} alt="icon"/> 
                            Configurações
                        </Link>
                        <span className="active-indicator"></span>
                    </li>
                    <li>
                        <Link to="/agendamento">
                            <img src={icon2} alt="icon"/> 
                            Agendamentos
                        </Link>
                    </li>
                </ul>
            
                <h3>NAVEGAÇÕES</h3>
                <ul>
                    <li>
                        <Link to="/home-paciente">
                            <img src={icon4} alt="icon"/> 
                            Voltar para o início
                        </Link>
                    </li>
                </ul>
            
                <p className="logout">
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        Desconectar
                    </button>
                </p>
            </div>

            <div className="perfil-content">
                <h1>CONFIGURAÇÕES DE PERFIL</h1>

                <div className="perfil-card">
                    <div className="perfil-foto-container">
                        <div className="perfil-img-wrapper">
                            {userData.foto && !fotoErro ? (
                                <img 
                                    src={userData.foto} 
                                    className="perfil-img" 
                                    alt="foto"
                                    onError={() => setFotoErro(true)}
                                />
                            ) : (
                                <div 
                                    className="perfil-img-iniciais"
                                    style={{ backgroundColor: getCorFundo() }}
                                >
                                    {getIniciais()}
                                </div>
                            )}
                        </div>
                        
                        {!editandoFoto ? (
                            <button 
                                className="edit-foto-btn"
                                onClick={() => setEditandoFoto(true)}
                            >
                                {userData.foto ? 'Alterar foto' : 'Adicionar foto'}
                            </button>
                        ) : (
                            <div className="foto-url-editor">
                                <input
                                    type="text"
                                    placeholder="Digite a URL da imagem"
                                    value={novaFotoUrl}
                                    onChange={(e) => setNovaFotoUrl(e.target.value)}
                                    className="url-input"
                                />
                                <div className="url-buttons">
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
                    
                    <div className="perfil-info">
                        <h2>{userData.nome || "Nome não informado"}</h2>
                        <p>{userData.email || user?.email || "Email não informado"}</p>
                    </div>
                </div>

                <div className="grid">
                    <div className="card">
                        <h3><img src={icon5} alt="icon"/> DADOS PESSOAIS</h3>
                        <div className="inputs grid-2">
                            <input 
                                type="text" 
                                name="nome"
                                placeholder="Nome completo" 
                                value={userData.nome}
                                onChange={handleInputChange}
                            />
                            <input 
                                type="text" 
                                name="cpf"
                                placeholder="CPF" 
                                value={userData.cpf}
                                onChange={handleInputChange}
                                maxLength={14}
                            />
                            <input 
                                type="email" 
                                name="email"
                                placeholder="E-mail" 
                                value={userData.email || user?.email || ''}
                                disabled
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
                        <div className="actions">
                            <button className="btn" onClick={handleSavePersonal} disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                            <button className="btn cancel" onClick={handleCancel} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h3><img src={icon6} alt="icon"/> SEGURANÇA</h3>
                        <div className="inputs">
                            <input 
                                type="password" 
                                name="senhaAtual"
                                placeholder="Senha atual" 
                                value={passwordData.senhaAtual}
                                onChange={handlePasswordChange}
                            />
                            <div className="password-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="novaSenha"
                                    placeholder="Nova senha" 
                                    value={passwordData.novaSenha}
                                    onChange={handlePasswordChange}
                                />
                                <img 
                                    src={showPassword ? olho : fechado} 
                                    className="eye-icon" 
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
                        <button className="btn" onClick={handleSaveSecurity} disabled={loading}>
                            {loading ? 'Salvando...' : 'Alterar senha'}
                        </button>
                    </div>
                </div>

                <div className="alert">
                    <img src={atencao} alt="atenção"/>
                    <div className="alert-content">
                        <h4>ATENÇÃO!</h4>
                        <p>
                            A exclusão da conta é permanente e não pode ser desfeita.
                            Todos os seus dados, agendamentos e histórico médico serão removidos.
                        </p>
                        <button className="delete" onClick={handleDeleteAccount} disabled={loading}>
                            {loading ? 'Processando...' : 'Excluir conta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}