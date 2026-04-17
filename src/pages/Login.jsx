import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import login from '../images/login.png';
import paciente from '../images/paciente.png';
import medico from '../images/medico.png';
import emailIcon from '../images/email.png';
import senhaIcon from  '../images/cadeado.png';
import olhoAberto from '../images/olho.png';
import olhoFechado from '../images/fechado.png';

import '../styles/Login.css';

export default function Login() {
  const [tipo, setTipo] = useState("paciente");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    const dados = {
      email,
      senha,
      tipo,
    };

    console.log(dados);

    //REDIRECIONAMENTO
    if (tipo === "paciente") {
      navigate("/home-paciente");
    } else {
      navigate("/home-medico");
    }
  }

  return (
    <div className="container">
      {/* LADO ESQUERDO */}
      <div className="left">
        <img src={login} alt="medica" />
      </div>

      {/* LADO DIREITO */}
      <div className="right">
        <div className="login-card">
          <h1>Bem-vindo de volta!</h1>
          <p>Entre com sua conta para acessar a plataforma.</p>

          <div className="toggle">
            <button
              className={tipo === "paciente" ? "active" : ""}
              onClick={() => setTipo("paciente")}
              type="button"
            >
              <img src={paciente} alt="paciente icon" />
              Sou paciente
            </button>

            <button
              className={tipo === "medico" ? "active" : ""}
              onClick={() => setTipo("medico")}
              type="button"
            >
              <img src={medico} alt="medico icon" />
              Sou médico
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <img src={emailIcon} className="icon" alt="email" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <img src={senhaIcon} className="icon" alt="senha" />

              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <img
                src={mostrarSenha ? olhoAberto : olhoFechado}
                className="icon-eye"
                alt="mostrar senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>

            <div className="lembrar">
              <input type="checkbox" />
              <span>Lembrar de mim</span>
            </div>

            <button type="submit">Entrar</button>
          </form>

          <p>
            Não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
          </p>

          <span>Esqueceu a senha?</span>
        </div>
      </div>
    </div>
  );
}