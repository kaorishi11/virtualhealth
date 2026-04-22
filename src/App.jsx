import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import HomePa from './pages/HomePa';
import Clinicas from './pages/Clinicas';
import Contato from "./pages/Contato";
import Chat from './pages/Chat';
import ConfigPerfil from "./pages/ConfigPerfil";
import AgendaPerfil from "./pages/AgendaPerfil";
import NotiPerfil from "./pages/NotiPerfil";
import Admin from "./pages/Admin";
import AdmUsuario from "./pages/AdmUsuario";
import AdmProfissional from "./pages/AdmProfissional";
import AdmConsulta from "./pages/AdmConsulta";
import AdmMensagem from "./pages/AdmMensagem";
import HomeMe from "./pages/HomeMe";
import AgendaMe from "./pages/AgendaMe";
import DicasMe from "./pages/DicasMe";
import ConsultaMe from "./pages/ConsultaMe";
import PerfilMe from "./pages/PerfilMe";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home-paciente" element={< HomePa/>} />
        <Route path="/clinicas" element={< Clinicas/>} />
        <Route path="/contato" element={< Contato/>} />
        <Route path="/chat" element={< Chat/>} />
        <Route path="/perfil" element={< ConfigPerfil/>} />
        <Route path="/agendamento" element={< AgendaPerfil/>} />
        <Route path="/notificacoes" element={< NotiPerfil/>} />

        <Route path="/home-medico" element={< HomeMe/>} />
        <Route path="/agenda" element={< AgendaMe/>} />
        <Route path="/consulta" element={< ConsultaMe/>} />
        <Route path="/dicas" element={< DicasMe/>} />
        <Route path="/perfil-medico" element={< PerfilMe/>} />

        <Route path="/admin" element={< Admin/>} />
        <Route path="/admusuarios" element={< AdmUsuario/>} />
        <Route path="/admprofissionais" element={< AdmProfissional/>} />
        <Route path="/admconsultas" element={< AdmConsulta/>} />
        <Route path="/admmensagens" element={< AdmMensagem/>} />
      </Routes>
    </BrowserRouter>
  );
}