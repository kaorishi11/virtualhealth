import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';

import foto from '../images/exfoto.png';
import cad from '../images/cad.png';
import olho from '../images/olho.png';
import fechado from '../images/fechado.png';
import person from '../images/person.png';
import atencao from '../images/atencao.png';

import "../styles/ConfigPerfil.css";

export default function ConfigPerfil() {
    return (
        <div className="perfil-container">

            {/* SIDEBAR */}
            <div className="navbar">
                <img src={logo} className="logoperfil" />
                <p className="nav-title">Configuração</p>

                <h3>CONTA</h3>
                <ul>
                    <li><Link to="/perfil"><img src={icon1}/> Configuração de perfil</Link></li>
                    <li><Link to="/agendamento"><img src={icon2}/> Agendamentos médicos</Link></li>
                </ul>

                <h3>PREFERÊNCIAS</h3>
                <ul>
                    <li><Link to="/notificacoes"><img src={icon3}/> Notificações</Link></li>
                </ul>

                <h3>NAVEGAÇÕES</h3>
                <ul>
                    <li><Link to="/home-paciente"><img src={icon4}/> Voltar para o início</Link></li>
                </ul>

                <p className="logout"><Link to="/">Desconectar</Link></p>
            </div>

            {/* CONTEÚDO */}
            <div className="perfil-content">

                <h1>CONFIGURAÇÕES DE PERFIL</h1>

                {/* CARD PERFIL */}
                <div className="perfil-card">
                    <img src={foto} className="perfil-img"/>

                    <div>
                        <h2>LUIZA HELENA</h2>
                        <p>luizahelena@gmail.com</p>

                        <div className="tags">
                            <span>Caçapava, SP</span>
                            <span>Paciente desde 2026</span>
                        </div>

                        <button>Editar foto</button>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid">

                    {/* SEGURANÇA */}
                    <div className="card">
                        <h3>SEGURANÇA</h3>

                        <div className="inputs">
                            <input placeholder="Senha atual" />
                            <input placeholder="Nova senha" />
                            <input placeholder="Confirmar nova senha" />
                        </div>

                        <button className="btn">Salvar alterações</button>
                    </div>

                    {/* DADOS */}
                    <div className="card">
                        <h3>DADOS PESSOAIS</h3>

                        <div className="inputs grid-2">
                            <input placeholder="Nome completo" />
                            <input placeholder="CPF" />
                            <input placeholder="E-mail" />
                            <input placeholder="Telefone" />
                            <input placeholder="Aniversário" />
                            <input placeholder="Sexo" />
                            <input placeholder="Endereço" className="full"/>
                        </div>

                        <div className="actions">
                            <button className="btn">Salvar alterações</button>
                            <button className="btn cancel">Cancelar</button>
                        </div>
                    </div>
                </div>

                {/* ALERTA */}
                <div className="alert">
                    <img src={atencao}/>
                    <div>
                        <h4>ATENÇÃO!</h4>
                        <p>
                            A exclusão da conta é permanente e não pode ser desfeita.
                            Todos os seus dados, agendamentos e histórico médico serão removidos.
                        </p>
                        <button className="delete">Excluir</button>
                    </div>
                </div>

            </div>
        </div>
    );
}