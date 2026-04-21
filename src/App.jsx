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
        {/* <Route path="/home-medico" element={< HomeMe/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}