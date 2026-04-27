import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';
import atencao from '../images/atencao.png';
import olho from '../images/olho.png';
import fechado from '../images/fechado.png';

import '../styles/PerfilMe.css';

export default function PerfilMe() {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef(null);

    // Estados para os valores
    const [valores, setValores] = useState({
        presencial: 150,
        online: 120
    });

    const [dadosPessoais, setDadosPessoais] = useState({
        nome: "Luíza Helena",
        cpf: "123.456.789-00",
        email: "luizahelena@gmail.com",
        telefone: "(12) 98765-4321",
        aniversario: "15/03/1990",
        sexo: "Feminino",
        endereco: "Rua das Flores, 123 - Centro, Caçapava, SP"
    });

    const [profileImage, setProfileImage] = useState(doutora);
    const [patientSince] = useState("2026");

    const handleSaveSecurity = () => {
        alert("Senha alterada com sucesso!");
    };

    const handleSavePersonal = () => {
        alert("Dados pessoais salvos com sucesso!");
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Tem certeza? A exclusão é permanente!")) {
            alert("Conta excluída");
        }
    };

    const handleEditPhoto = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                alert("Foto atualizada com sucesso!");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="perfil-container">
            {/* SIDEBAR */}
            <div className='sidebar'>
                <div className="sidebar-logo">
                    <img src={logo} alt='Logo' className='logo-medico' />
                </div>
                
                <div className='perfil-info-sidebar'>
                    <div className='perfil-foto-sidebar'>
                        <img src={profileImage} alt='Perfil' className='avatar-medico' />
                    </div>
                    <h2>Luíza Helena</h2>
                    <p>luizahelena@gmail.com</p>
                    <p className='localidade'>Caçapava, SP</p>
                </div>

                <div className='menu-lateral'>
                    <div className='menu-section'>
                        <h3>CONTA</h3>
                        <ul>
                            <li className="active"><Link to="/perfil">Configuração de perfil</Link></li>
                            <li><Link to="/agendamentos">Agendamentos médicos</Link></li>
                        </ul>
                    </div>

                    <div className='menu-section'>
                        <h3>PREFERÊNCIAS</h3>
                        <ul>
                            <li><Link to="/notificacoes">Notificações</Link></li>
                        </ul>
                    </div>

                    <div className='menu-section'>
                        <h3>NAVEGAÇÕES</h3>
                        <ul>
                            <li><Link to="/inicio">Voltar para o início</Link></li>
                        </ul>
                    </div>
                
                    <div className="logout">
                        <Link to="/">Desconectar</Link>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className='main-content'>
                <div className='perfil-header'>
                    <h1>CONFIGURAÇÕES DE PERFIL</h1>
                </div>

                {/* CARD DE PERFIL COM LARGURA AUMENTADA E CONTORNO PRETO */}
                <div className='perfil-card-destaque'>
                    <div className='perfil-foto-modern'>
                        <img src={profileImage} alt="Luíza Helena" className='perfil-foto-grande' />
                        <button className="btn-editar-foto-modern" onClick={handleEditPhoto}>Editar foto</button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className='perfil-info-modern'>
                        <h2>LUÍZA HELENA</h2>
                        <p className="email">luizahelena@gmail.com</p>
                        <div className="local-info-modern">
                            <span className="local">📍 Caçapava, SP</span>
                            <span className="patient-since">📅 Paciente desde {patientSince}</span>
                        </div>
                    </div>
                </div>

                {/* DADOS PESSOAIS CARD */}
                <div className='dados-pessoais-card-modern'>
                    <div className='card-header-modern'>
                        <h3>📋 DADOS PESSOAIS</h3>
                    </div>
                    <div className='dados-grid'>
                        <div className='dados-row'>
                            <div className='dados-field'>
                                <label>Nome completo</label>
                                <input 
                                    type="text" 
                                    value={dadosPessoais.nome}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, nome: e.target.value})}
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div className='dados-field'>
                                <label>CPF</label>
                                <input 
                                    type="text" 
                                    value={dadosPessoais.cpf}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, cpf: e.target.value})}
                                    placeholder="CPF"
                                />
                            </div>
                        </div>
                        <div className='dados-row'>
                            <div className='dados-field'>
                                <label>E-mail</label>
                                <input 
                                    type="email" 
                                    value={dadosPessoais.email}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, email: e.target.value})}
                                    placeholder="E-mail"
                                />
                            </div>
                            <div className='dados-field'>
                                <label>Telefone</label>
                                <input 
                                    type="tel" 
                                    value={dadosPessoais.telefone}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, telefone: e.target.value})}
                                    placeholder="Telefone"
                                />
                            </div>
                        </div>
                        <div className='dados-row'>
                            <div className='dados-field'>
                                <label>Data de nascimento</label>
                                <input 
                                    type="text" 
                                    value={dadosPessoais.aniversario}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, aniversario: e.target.value})}
                                    placeholder="Aniversário"
                                />
                            </div>
                            <div className='dados-field'>
                                <label>Gênero</label>
                                <input 
                                    type="text" 
                                    value={dadosPessoais.sexo}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, sexo: e.target.value})}
                                    placeholder="Sexo"
                                />
                            </div>
                        </div>
                        <div className='dados-row-full'>
                            <div className='dados-field'>
                                <label>Endereço completo</label>
                                <input 
                                    type="text" 
                                    value={dadosPessoais.endereco}
                                    onChange={(e) => setDadosPessoais({...dadosPessoais, endereco: e.target.value})}
                                    placeholder="Endereço"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='form-actions-modern'>
                        <button className="btn-primary-modern" onClick={handleSavePersonal}>💾 Salvar alterações</button>
                        <button className="btn-secondary-modern" onClick={() => alert("Alterações canceladas")}>✖️ Cancelar</button>
                    </div>
                </div>

                {/* SEGURANÇA CARD */}
                <div className='seguranca-card'>
                    <div className='card-header-modern'>
                        <h3>🔒 SEGURANÇA</h3>
                    </div>
                    <div className='form-group'>
                        <label>Senha atual</label>
                        <div className="password-wrapper">
                            <input type="password" placeholder="Digite sua senha atual" />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label>Nova senha</label>
                        <div className="password-wrapper">
                            <input 
                                type={showNewPassword ? "text" : "password"} 
                                placeholder="Digite a nova senha" 
                            />
                            <img 
                                src={showNewPassword ? olho : fechado} 
                                className="eye-icon" 
                                alt="mostrar senha" 
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label>Confirmar nova senha</label>
                        <div className="password-wrapper">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirme a nova senha" 
                            />
                            <img 
                                src={showConfirmPassword ? olho : fechado} 
                                className="eye-icon" 
                                alt="mostrar senha" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        </div>
                    </div>
                    <button className="btn-primary-modern" onClick={handleSaveSecurity}>Salvar alterações</button>
                </div>
            </div>
        </div>
    );
}