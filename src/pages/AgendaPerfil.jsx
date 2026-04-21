import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';

export default function AgendaPerfil() {
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

                <h1>AGENDAMENTOS MÉDICOS</h1>   
            </div>
        </div>
    );
}