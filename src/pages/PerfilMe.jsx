import { useState } from 'react';
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

    // Estados para os valores
    const [valores, setValores] = useState({
        presencial: 150,
        online: 120
    });

    const [dadosPessoais, setDadosPessoais] = useState({
        nome: "Dra Marta Santos",
        cpf: "123.456.789-00",
        emailPessoal: "marta.santos@email.com",
        telefone: "(12) 98765-4321",
        emailProfissional: "dra.marta@clinica.com",
        aniversario: "15/03/1985",
        sexo: "Feminino",
        enderecoConsultorio: "Rua das Flores, 123 - Centro, Caçapava, SP",
        enderecoPessoal: "Av. Paulista, 1000 - Apto 45, São Paulo, SP"
    });

    const handleSaveSecurity = () => {
        alert("Senha alterada com sucesso!");
    };

    const handleSaveValores = () => {
        alert("Valores das consultas salvos com sucesso!");
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
        alert("Funcionalidade de editar foto será implementada em breve!");
    };

    return (
        <div className="perfil-container">
            {/* SIDEBAR */}
            <div className='sidebar'>
                <div className="sidebar-logo">
                    <img src={logo} alt='Logo' className='logo-medico' />
                </div>
                
                <Link to="/perfil-medico" className="perfil-link">
                    <div className='perfil-medico'>
                        <img src={doutora} alt='Doutora' className='avatar-medico' />
                        <h2>Dra. Marta</h2>
                        <p>Dentista</p>
                    </div>
                </Link>

                <div className='menu-lateral'>
                    <div className='menu-section'>
                        <h3>GERAL</h3>
                        <ul>
                            <li><Link to="/dashboard">Visão geral</Link></li>
                            <li><Link to="/minha-agenda"><img src={planilha} alt="icon"/>Minha agenda</Link></li>
                        </ul>
                    </div>

                    <div className='menu-section'>
                        <h3>ATENDIMENTO</h3>
                        <ul>
                            <li><Link to="/consulta"><img src={planisaude} alt="icon"/>Iniciar consulta</Link></li>
                            <li><Link to="/dicas-saude"><img src={planisaude} alt="icon"/>Dicas de saúde</Link></li>
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
                    <h1>PERFIL</h1>
                    <p>Gerencie seu perfil</p>
                </div>

                {/* CARD DE PERFIL */}
                <div className='perfil-card'>
                    <div className='perfil-foto-area'>
                        <img src={doutora} alt="Dra Marta" className='perfil-foto-grande' />
                        <button className="btn-editar-foto" onClick={handleEditPhoto}>Editar foto</button>
                    </div>
                    <div className='perfil-info-area'>
                        <h2>DRA MARTA SANTOS</h2>
                        <p className="profissao">Dentista · Odontologia Geral</p>
                        <div className="local-info">
                            <span>Caçapava, SP</span>
                            <span>Paciente desde 2026</span>
                        </div>
                    </div>
                </div>

                {/* GRID DE CONFIGURAÇÕES */}
                <div className='config-grid'>
                    {/* SEGURANÇA */}
                    <div className='config-card'>
                        <div className='card-header'>
                            <h3>SEGURANÇA</h3>
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
                        <button className="btn-primary" onClick={handleSaveSecurity}>Salvar alterações</button>
                    </div>

                    {/* VALORES DAS CONSULTAS */}
                    <div className='config-card'>
                        <div className='card-header'>
                            <h3>💰 VALORES DAS CONSULTAS</h3>
                        </div>
                        <div className='form-row'>
                            <div className='form-group'>
                                <label>Consulta presencial</label>
                                <div className="input-icon">
                                    <span className="moeda">R$</span>
                                    <input 
                                        type="number" 
                                        value={valores.presencial}
                                        onChange={(e) => setValores({...valores, presencial: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label>Consulta Online</label>
                                <div className="input-icon">
                                    <span className="moeda">R$</span>
                                    <input 
                                        type="number" 
                                        value={valores.online}
                                        onChange={(e) => setValores({...valores, online: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleSaveValores}>Salvar</button>
                    </div>
                </div>

                {/* DADOS PESSOAIS */}
                <div className='dados-pessoais-card'>
                    <div className='card-header'>
                        <h3>DADOS PESSOAIS</h3>
                    </div>
                    <div className='form-grid-2col'>
                        <div className='form-group'>
                            <label>Nome completo</label>
                            <input 
                                type="text" 
                                value={dadosPessoais.nome}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, nome: e.target.value})}
                            />
                        </div>
                        <div className='form-group'>
                            <label>CPF</label>
                            <input 
                                type="text" 
                                value={dadosPessoais.cpf}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, cpf: e.target.value})}
                            />
                        </div>
                        <div className='form-group'>
                            <label>E-mail pessoal</label>
                            <input 
                                type="email" 
                                value={dadosPessoais.emailPessoal}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, emailPessoal: e.target.value})}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Telefone</label>
                            <input 
                                type="tel" 
                                value={dadosPessoais.telefone}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, telefone: e.target.value})}
                            />
                        </div>
                        <div className='form-group'>
                            <label>E-mail profissional</label>
                            <input 
                                type="email" 
                                value={dadosPessoais.emailProfissional}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, emailProfissional: e.target.value})}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Aniversário</label>
                            <input 
                                type="text" 
                                value={dadosPessoais.aniversario}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, aniversario: e.target.value})}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Sexo</label>
                            <input 
                                type="text" 
                                value={dadosPessoais.sexo}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, sexo: e.target.value})}
                            />
                        </div>
                        <div className='form-group full-width'>
                            <label>Ender. do consultório</label>
                            <input 
                                type="text" 
                                value={dadosPessoais.enderecoConsultorio}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, enderecoConsultorio: e.target.value})}
                            />
                        </div>
                        <div className='form-group full-width'>
                            <label>Endereço pessoal</label>
                            <input 
                                type="text" 
                                value={dadosPessoais.enderecoPessoal}
                                onChange={(e) => setDadosPessoais({...dadosPessoais, enderecoPessoal: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className='form-actions'>
                        <button className="btn-primary" onClick={handleSavePersonal}>Salvar alterações</button>
                        <button className="btn-secondary">Cancelar</button>
                    </div>
                </div>

                {/* ALERTA DE EXCLUSÃO */}
                <div className='alert-card'>
                    <img src={atencao} alt="Atenção" />
                    <div className='alert-content'>
                        <h4>ATENÇÃO!</h4>
                        <p>A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados, agendamentos e histórico médico serão removidos.</p>
                        <button className="btn-danger" onClick={handleDeleteAccount}>Excluir</button>
                    </div>
                </div>
            </div>
        </div>
    );
}