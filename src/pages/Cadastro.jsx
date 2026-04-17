import { useState } from "react";
import { Link } from "react-router-dom";
import login from '../images/login.png';
import medico from '../images/medico.png';
import paciente from '../images/paciente.png';
import olhoAberto from '../images/olho.png';
import olhoFechado from '../images/fechado.png';

import "../styles/Cadastro.css";

export default function Cadastro() {
  const [tipo, setTipo] = useState("paciente");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="container">
      {/* ESQUERDA */}
      <div className="left">
        <img src={login} alt="medico" />
      </div>

      {/* DIREITA */}
      <div className="right">
        <div className="cadas-card">
          <h1>
            {tipo === "paciente"
              ? "Cadastre-se"
              : "Bem-vindo Profissional"}
          </h1>

          <p>
            {tipo === "paciente"
              ? "Acesse nossa plataforma e descubra ferramentas incríveis."
              : "Acesse nossa plataforma e ajude muitas pessoas."}
          </p>

          {/* TOGGLE */}
          <div className="toggle">
            <button
              className={tipo === "paciente" ? "active" : ""}
              onClick={() => setTipo("paciente")}
              type="button"
            >
              <img src={paciente} />
              Sou paciente
            </button>

            <button
              className={tipo === "medico" ? "active" : ""}
              onClick={() => setTipo("medico")}
              type="button"
            >
              <img src={medico} />
              Sou médico
            </button>
          </div>

          <form>
            {/*CAMPOS COMUNS */}
            <input type="text" placeholder="Nome completo" />
            <input type="email" placeholder="E-mail" />

            {/*PACIENTE */}
            {tipo === "paciente" && (
              <>
                <div className="row">
                  <input type="text" placeholder="CEP" />
                  <input type="text" placeholder="CPF" />
                </div>
              </>
            )}

            {/*MÉDICO */}
            {tipo === "medico" && (
              <>
                <div className="row">
                  <input type="text" placeholder="Telefone" />
                  <input type="text" placeholder="CPF" />
                </div>

                <div className="row">
                  <input type="text" placeholder="CEP" />
                  <input type="date" placeholder="Data de nascimento" />
                </div>

                <div className="row">
                  <select>
                    <option>Gênero</option>
                  </select>

                  <select>
                    <option>Especialidade</option>
                  </select>
                </div>

                <div className="row">
                  <input type="text" placeholder="CRM" />
                  <input type="text" placeholder="Universidade" />
                </div>

                <div className="row">
                  <input type="text" placeholder="Ano de formação" />
                </div>
              </>
            )}

            {/* SENHA */}
            <div className="input-group">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
              />

              <img
                src={mostrarSenha ? olhoAberto : olhoFechado}
                className="icon-eye"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>

            <button type="submit">Cadastrar</button>
          </form>

          <p>
            Tem conta? <Link to="/">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}