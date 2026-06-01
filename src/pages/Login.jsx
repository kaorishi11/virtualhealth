import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { supabase } from '../services/supabase';

import login from '../images/login.jpeg';
import paciente from '../images/paciente.png';
import medico from '../images/medico.png';
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
      const savedEmail =
        localStorage.getItem("savedEmail");

      const lembrarSalvo =
        localStorage.getItem("lembrar");

      if (lembrarSalvo === "true") {
        if (savedEmail) {
          setEmail(savedEmail);
        }

        setLembrar(true);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar dados:",
        error
      );
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      // lembrar de mim
      if (lembrar) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedTipo", tipo);
        localStorage.setItem("lembrar", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedTipo");
        localStorage.setItem("lembrar", "false");
      }

      // LOGIN SUPABASE AUTH
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'Login inválido',
          text: 'Email ou senha inválidos',
          confirmButtonText: 'Tentar novamente',
        });
        return;
      }

      const user = data.user;

      // BUSCAR PERFIL
      const {
        data: usuario,
        error: usuarioError,
      } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (usuarioError || !usuario) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Perfil do usuário não encontrado',
          confirmButtonText: 'Tentar novamente',
        });
        return;
      }

      // REDIRECIONAMENTO AUTOMÁTICO
      switch (usuario.tipo) {
        case "admin":
          navigate("/admin");
          break;

        case "medico":
          navigate("/home-medico");
          break;

        case "paciente":
          navigate("/home-paciente");
          break;

        default:
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Tipo de usuário inválido',
            confirmButtonText: 'Tentar novamente',
          });
      }

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao fazer login',
        confirmButtonText: 'Tentar novamente',
      });
    }
  }

  function esqueciSenha() {
    setMostrarModal(true);
  }
  async function enviarRecuperacao() {
    if (!emailRecuperacao) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'Digite um e-mail',
      });
      return;
    }
    const { error } =
      await supabase.auth.resetPasswordForEmail(emailRecuperacao,
        {
          redirectTo:`${window.location.origin}/redefinir-senha`
        }
      );
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar e-mail',
        text: error.message,
        confirmButtonText: 'Tentar novamente',
      });
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'E-mail enviado',
      text:
        'Enviamos um link de recuperação para seu e-mail.',
    });
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
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              
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