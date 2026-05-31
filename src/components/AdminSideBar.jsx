import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Swal from 'sweetalert2';
import "../styles/AdminBase.css";
import logo from "../images/logo.png";

export default function AdminSideBar() {
  const navigate = useNavigate();
  const [adminNome, setAdminNome] = useState("Carregando...");
  const [adminFoto, setAdminFoto] = useState("https://ui-avatars.com/api/?background=ffd966&color=1a6b6f&name=Admin");

  useEffect(() => {
    buscarAdmin();
  }, []);

  const buscarAdmin = async () => {
    try {
      // Pega o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log("User do auth:", user); // Debug: ver o que vem do auth
      
      if (user) {
        // Busca os dados do usuário na tabela 'usuarios'
        const { data: usuario, error } = await supabase
          .from("usuarios")
          .select("nome, foto")
          .eq("id", user.id)
          .single();

        console.log("Usuário da tabela:", usuario); // Debug: ver o que vem da tabela
        console.log("Erro:", error); // Debug: ver se tem erro

        if (usuario && usuario.nome) {
          // Usa o nome que está na tabela usuarios
          const nomeDoBanco = usuario.nome;
          setAdminNome(nomeDoBanco);
          
          if (usuario.foto) {
            setAdminFoto(usuario.foto);
          } else {
            // Gera avatar com as iniciais do nome do banco
            const iniciais = nomeDoBanco.substring(0, 2).toUpperCase();
            setAdminFoto(`https://ui-avatars.com/api/?background=ffd966&color=1a6b6f&name=${iniciais}`);
          }
        } else {
          // Fallback: se não encontrar na tabela, usa o email
          console.log("Usuário não encontrado na tabela, usando email");
          const nomeEmail = user.email?.split('@')[0] || "Admin";
          setAdminNome(nomeEmail);
          const iniciais = nomeEmail.substring(0, 2).toUpperCase();
          setAdminFoto(`https://ui-avatars.com/api/?background=ffd966&color=1a6b6f&name=${iniciais}`);
        }
      } else {
        setAdminNome("Admin");
      }
    } catch (error) {
      console.error("Erro ao buscar admin:", error);
      setAdminNome("Admin");
    }
  };

  const handleLogout = async () => {
    // Mostrar alerta de confirmação
    const result = await Swal.fire({
      title: 'Deseja sair?',
      text: 'Você será desconectado da sua conta',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1a6b6f',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)'
    });

    // Se confirmar, faz o logout
    if (result.isConfirmed) {
      try {
        await supabase.auth.signOut();
        
        await Swal.fire({
          title: 'Desconectado!',
          text: 'Você saiu da sua conta com sucesso',
          icon: 'success',
          confirmButtonColor: '#1a6b6f',
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate("/");
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        Swal.fire({
          title: 'Erro!',
          text: 'Erro ao fazer logout. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" className="logo-medico" />
      </div>

      <div className="admin-section">
        <img
          src={adminFoto}
          alt="Admin"
          className="admin-img"
        />
        <div className="admin-info">
          <h4>{adminNome}</h4>
          <p>Administrador</p>
        </div>
      </div>

      <div className="menu-lateral">
        <div className="menu-section">
          <h3>GERAL</h3>
          <ul>
            <li>
              <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>
                Visão geral
              </NavLink>
            </li>
            <li>
              <NavLink to="/admfaq" className={({ isActive }) => isActive ? "active" : ""}>
                Perguntas
              </NavLink>
            </li>
            <li>
              <NavLink to="/admusuarios" className={({ isActive }) => isActive ? "active" : ""}>
                Usuários
              </NavLink>
            </li>
            <li>
              <NavLink to="/admprofissionais" className={({ isActive }) => isActive ? "active" : ""}>
                Profissionais
              </NavLink>
            </li>
            <li>
              <NavLink to="/admdicas" className={({ isActive }) => isActive ? "active" : ""}>
                Dicas
              </NavLink>
            </li>
            <li>
              <NavLink to="/disponibilidadeadm" className={({ isActive }) => isActive ? "active" : ""}>
                Disponibilidade
              </NavLink>
            </li>
            <li>
              <NavLink to="/agendamentos" className={({ isActive }) => isActive ? "active" : ""}>
                Agendamentos
              </NavLink>
            </li>
            <li>
              <NavLink to="/admconsultas" className={({ isActive }) => isActive ? "active" : ""}>
                Consultas
              </NavLink>
            </li>
            <li>
              <NavLink to="/admnotificacao" className={({ isActive }) => isActive ? "active" : ""}>
                Notificações
              </NavLink>
            </li>
            <li>
              <NavLink to="/admmensagens" className={({ isActive }) => isActive ? "active" : ""}>
                Mensagens
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="spacer"></div>

        <div className="logout">
          <button onClick={handleLogout} className="logout-btn-link">
            Desconectar
          </button>
        </div>
      </div>
    </aside>
  );
}