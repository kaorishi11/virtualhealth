import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import login from '../images/login.png';
import paciente from '../images/paciente.png';
import medico from '../images/medico.png';
import emailIcon from '../images/email.png';
import senhaIcon from '../images/cadeado.png';
import olhoAberto from '../images/olho.png';
import olhoFechado from '../images/fechado.png';

import '../styles/Login.css';

export default function Login() {
  const [tipo, setTipo] = useState("paciente");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");

  const navigate = useNavigate();

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("savedEmail");
      const savedSenha = localStorage.getItem("savedSenha");
      const savedTipo = localStorage.getItem("savedTipo");
      const lembrarSalvo = localStorage.getItem("lembrar");

      if (lembrarSalvo === "true") {
        if (savedEmail) setEmail(savedEmail);
        if (savedSenha) setSenha(savedSenha);
        if (savedTipo) setTipo(savedTipo);
        setLembrar(true);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  function handleLogin(e) {
    e.preventDefault();

    try {
      // Salvar dados se "lembrar de mim" estiver marcado
      if (lembrar) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedSenha", senha);
        localStorage.setItem("savedTipo", tipo);
        localStorage.setItem("lembrar", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedSenha");
        localStorage.removeItem("savedTipo");
        localStorage.setItem("lembrar", "false");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }

    if (email === "admin@gmail.com" && senha === "123456") {
      navigate("/admin");
      return;
    }

    if (tipo === "paciente") {
      navigate("/home-paciente");
    } else {
      navigate("/home-medico");
    }
  }

  function esqueciSenha() {
    setMostrarModal(true);
  }
  function enviarRecuperacao(){
    if(!emailRecuperacao){
      alert("Digite um e-mail");
      return;
    }

    alert(`Instruções enviadas para ${emailRecuperacao}`);
    setMostrarModal(false);
    setEmailRecuperacao("");
  }

  return (
    <div className="container">
      <div className="left">
        <img src={login} alt="medica" />
      </div>

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
              <img src={paciente} alt="paciente" />
              Sou paciente
            </button>

            <button
              className={tipo === "medico" ? "active" : ""}
              onClick={() => setTipo("medico")}
              type="button"
            >
              <img src={medico} alt="medico" />
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
                required
              />
            </div>

            <div className="input-group">
              <img src={senhaIcon} className="icon" alt="senha" />
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <img
                src={mostrarSenha ? olhoAberto : olhoFechado}
                className="icon-eye"
                alt="mostrar senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>

            <div className="lembrar">
              <input 
                type="checkbox" 
                id="lembrar" 
                checked={lembrar}
                onChange={(e) => {
                  setLembrar(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem("savedEmail");
                    localStorage.removeItem("savedSenha");
                    localStorage.removeItem("savedTipo");
                    localStorage.setItem("lembrar", "false");
                  }
                }}
              />
              <label htmlFor="lembrar">Lembrar de mim</label>
            </div>

            <button type="submit">Entrar</button>
          </form>

          <div className="links">
            <p>
              Não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
            </p>
            <span onClick={esqueciSenha}>Esqueceu a senha?</span>
          </div>
        </div>
      </div>
      {mostrarModal && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Recuperar senha</h2>
          <p>Digite seu e-mail para receber as instruções</p>

          <input
            type="email"
            placeholder="Seu e-mail"
            value={emailRecuperacao}
            onChange={(e) => setEmailRecuperacao(e.target.value)}
          />

          <div className="modal-buttons">
            <button onClick={enviarRecuperacao}>Enviar</button>
            <button onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}