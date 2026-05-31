import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RedefinirSenha from './pages/RedefinirSenha';

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
import AdminFAQ from "./pages/AdminFAQ";
import AdmAgendamentos from './pages/AdmAgendamentos';
import AdmDisponibilidade from './pages/AdmDisponibilidade';
import AdmNotificacao from './pages/AdmNotificacao';
import AdmDicas from './pages/AdmDicas';

import HomeMe from "./pages/HomeMe";
import AgendaMe from "./pages/AgendaMe";
import DicasMe from "./pages/DicasMe";
import ConsultaMe from "./pages/ConsultaMe";
import Disponibilidade from './pages/Disponibilidade';
import PerfilMe from "./pages/PerfilMe";

import TeleconsultaPa from "./pages/TeleconsultaPa";

export default function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('tipo')
          .eq('id', user.id)
          .single();
        setUserType(usuario?.tipo);
      }
      setLoading(false);
    };
    
    getUser();
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase
          .from('usuarios')
          .select('tipo')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setUserType(data?.tipo));
      } else {
        setUserType(null);
      }
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Componente para proteger rotas de admin
  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    if (userType !== 'admin') return <Navigate to="/home-paciente" replace />;
    return children;
  };

  // Componente para proteger rotas de paciente
  const PacienteRoute = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    if (userType === 'medico') return <Navigate to="/home-medico" replace />;
    if (userType === 'admin') return <Navigate to="/admin" replace />;
    return children;
  };

  // Componente para proteger rotas de médico
  const MedicoRoute = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    if (userType === 'paciente') return <Navigate to="/home-paciente" replace />;
    if (userType === 'admin') return <Navigate to="/admin" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        {/* Rotas protegidas para PACIENTE */}
        <Route path="/home-paciente" element={
          <PacienteRoute>
            <HomePa />
          </PacienteRoute>
        } />
        <Route path="/clinicas" element={
          <PacienteRoute>
            <Clinicas />
          </PacienteRoute>
        } />
        <Route path="/contato" element={
          <PacienteRoute>
            <Contato />
          </PacienteRoute>
        } />
        <Route path="/chat" element={
          <PacienteRoute>
            <Chat />
          </PacienteRoute>
        } />
        <Route path="/perfil" element={
          <PacienteRoute>
            <ConfigPerfil />
          </PacienteRoute>
        } />
        <Route path="/agendamento" element={
          <PacienteRoute>
            <AgendaPerfil />
          </PacienteRoute>
        } />
        <Route path="/notificacoes" element={
          <PacienteRoute>
            <NotiPerfil />
          </PacienteRoute>
        } />
        <Route path="/teleconsulta" element={
          <PacienteRoute>
            <TeleconsultaPa />
          </PacienteRoute>
        } />

        {/* Rotas protegidas para MÉDICO */}
        <Route path="/home-medico" element={
          <MedicoRoute>
            <HomeMe />
          </MedicoRoute>
        } />
        <Route path="/agenda" element={
          <MedicoRoute>
            <AgendaMe />
          </MedicoRoute>
        } />
        <Route path="/consulta" element={
          <MedicoRoute>
            <ConsultaMe />
          </MedicoRoute>
        } />
        <Route path="/dicas" element={
          <MedicoRoute>
            <DicasMe />
          </MedicoRoute>
        } />
        <Route path="/disponibilidade" element={
          <MedicoRoute>
            <Disponibilidade />
          </MedicoRoute>
        } />
        <Route path="/perfil-medico" element={
          <MedicoRoute>
            <PerfilMe />
          </MedicoRoute>
        } />

        {/* Rotas protegidas para ADMIN */}
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        <Route path="/admusuarios" element={
          <AdminRoute>
            <AdmUsuario />
          </AdminRoute>
        } />
        <Route path="/admprofissionais" element={
          <AdminRoute>
            <AdmProfissional />
          </AdminRoute>
        } />
        <Route path="/admconsultas" element={
          <AdminRoute>
            <AdmConsulta />
          </AdminRoute>
        } />
        <Route path="/admfaq" element={
          <AdminRoute>
            <AdminFAQ />
          </AdminRoute>
        } />
        <Route path="/disponibilidadeadm" element={
          <AdminRoute>
            <AdmDisponibilidade />
          </AdminRoute>
        } />
        <Route path="/agendamentos" element={
          <AdminRoute>
            <AdmAgendamentos />
          </AdminRoute>
        } />
        <Route path="/admnotificacao" element={
          <AdminRoute>
            <AdmNotificacao />
          </AdminRoute>
        } />
        <Route path="/admdicas" element={
          <AdminRoute>
            <AdmDicas />
          </AdminRoute>
        } />
        <Route path="/admmensagens" element={
          <AdminRoute>
            <AdmMensagem />
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}