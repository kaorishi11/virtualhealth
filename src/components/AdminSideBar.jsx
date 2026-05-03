import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/AdminBase.css";
import logo from "../images/logo.png";

export default function AdminSideBar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" className="logo-medico" />
      </div>

      <div className="admin-section">
        <img
          src="https://ui-avatars.com/api/?background=ffd966&color=1a6b6f&name=Gustavo"
          alt="Admin"
          className="admin-img"
        />
        <div className="admin-info">
          <h4>Gustavo</h4>
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
              <NavLink to="/admconsultas" className={({ isActive }) => isActive ? "active" : ""}>
                Consultas
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
          <NavLink to="/">Desconectar</NavLink>
        </div>
      </div>
    </aside>
  );
}