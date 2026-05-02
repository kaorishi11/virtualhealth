import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';

import icon5 from '../images/person.png';
import icon6 from '../images/cad.png';

import foto from '../images/exfoto.png';
import cad from '../images/cad.png';
import olho from '../images/olho.png';
import fechado from '../images/fechado.png';
import person from '../images/person.png';
import atencao from '../images/atencao.png';

import "../styles/ConfigPerfil.css";

export default function ConfigPerfil() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSavePersonal = () => {
        alert("Dados salvos com sucesso!");
    };

    const handleSaveSecurity = () => {
        alert("Senha alterada com sucesso!");
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Tem certeza? A exclusão é permanente!")) {
            alert("Conta excluída");
        }
    };

    return (
        <div className="perfil-container">

            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} className="logoperfil" alt="logo" />
                    <p className="nav-title">Configuração</p>
                </div>
            
                <h3>CONTA</h3>
                <ul>
                    <li className="active">
                        <Link to="/perfil">
                            <img src={icon1} alt="icon"/> 
                            Configuração de perfil
                        </Link>
                        <span className="active-indicator"></span>
                    </li>
                    <li>
                        <Link to="/agendamento">
                            <img src={icon2} alt="icon"/> 
                            Agendamentos médicos
                        </Link>
                    </li>
                </ul>
            
                <h3>PREFERÊNCIAS</h3>
                <ul>
                    <li>
                        <Link to="/notificacoes">
                            <img src={icon3} alt="icon"/> 
                            Notificações
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
                    <Link to="/">Desconectar</Link>
                </p>
            </div>

            {/* CONTEÚDO */}
            <div className="perfil-content">

                <h1>CONFIGURAÇÕES DE PERFIL</h1>

                {/* CARD PERFIL - FOTO CENTRALIZADA COM BOTÃO EMBAIXO */}
                <div className="perfil-card">
                    <div className="perfil-foto-container">
                        <div className="perfil-img-wrapper">
                            <img src={foto} className="perfil-img" alt="foto"/>
                        </div>
                        <button className="edit-foto-btn">Editar foto</button>
                    </div>
                    <div className="perfil-info">
                        <h2>LUÍZA HELENA</h2>
                        <p>luizahelena@gmail.com</p>
                        <div className="tags">
                            <span>Caçapava, SP</span>
                            <span>Paciente desde 2026</span>
                        </div>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid">

                    {/* DADOS PESSOAIS - PRIMEIRO */}
                    <div className="card">
                        <h3><img src={icon5} alt="icon"/> DADOS PESSOAIS</h3>
                        <div className="inputs grid-2">
                            <input type="text" placeholder="Nome completo" defaultValue="Luíza Helena"/>
                            <input type="text" placeholder="CPF" defaultValue="123.456.789-00"/>
                            <input type="email" placeholder="E-mail" defaultValue="luizahelena@gmail.com"/>
                            <input type="tel" placeholder="Telefone" defaultValue="(12) 98765-4321"/>
                            <input type="text" placeholder="Aniversário" defaultValue="15/03/1990"/>
                            <input type="text" placeholder="Sexo" defaultValue="Feminino"/>
                            <input type="text" placeholder="Endereço" className="full" defaultValue="Rua das Flores, 123 - Centro, Caçapava, SP"/>
                        </div>
                        <div className="actions">
                            <button className="btn" onClick={handleSavePersonal}>Salvar alterações</button>
                            <button className="btn cancel">Cancelar</button>
                        </div>
                    </div>

                    {/* SEGURANÇA - SEGUNDO */}
                    <div className="card">
                        <h3><img src={icon6} alt="icon"/> SEGURANÇA</h3>
                        <div className="inputs">
                            <input type="password" placeholder="Senha atual" />
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} placeholder="Nova senha" />
                                <img src={showPassword ? olho : fechado} className="eye-icon" alt="mostrar senha" onClick={() => setShowPassword(!showPassword)}/>
                            </div>
                            <input type="password" placeholder="Confirmar nova senha" />
                        </div>
                        <button className="btn" onClick={handleSaveSecurity}>Salvar alterações</button>
                    </div>
                </div>

                {/* ALERTA */}
                <div className="alert">
                    <img src={atencao} alt="atenção"/>
                    <div className="alert-content">
                        <h4>ATENÇÃO!</h4>
                        <p>
                            A exclusão da conta é permanente e não pode ser desfeita.
                            Todos os seus dados, agendamentos e histórico médico serão removidos.
                        </p>
                        <button className="delete" onClick={handleDeleteAccount}>Excluir</button>
                    </div>
                </div>

            </div>
        </div>
    );
}