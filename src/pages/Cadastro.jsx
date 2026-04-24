import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  function handleCadastro(e){
    e.preventDefault();
    navigate("/");
  }

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

          <form onSubmit={handleCadastro}>
            {/*CAMPOS COMUNS */}
            <input type="text" placeholder="Nome completo" required/>
            <input type="email" placeholder="E-mail" required/>

            {/*PACIENTE */}
            {tipo === "paciente" && (
              <>
                <div className="row">
                  <input type="text" placeholder="CEP" required/>
                  <input type="text" placeholder="CPF" required/>
                </div>
              </>
            )}

            {/*MÉDICO */}
            {tipo === "medico" && (
              <>
                <div className="row">
                  <input type="text" placeholder="Telefone" required/>
                  <select required>
                    <option value="">Gênero</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="nao_binario">Não-binário</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_informar">Prefiro não informar</option>
                  </select>
                </div>

                <div className="row">
                  <input type="text" placeholder="CEP" required/>
                  <input type="text" placeholder="CPF" required/>
                </div>

                <div className="row">
                  <input type="text" placeholder="Especialidade" required/>
                  <input type="text" placeholder="CRM" required/>
                </div>

                <div className="row">
                  <input type="text" placeholder="Universidade" required/>
                  <input type="text" placeholder="Ano de formação" required/>
                </div>
              </>
            )}

            {/* SENHA */}
            <div className="input-senha">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                required
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