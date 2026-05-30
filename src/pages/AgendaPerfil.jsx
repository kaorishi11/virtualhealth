import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';

import logo from '../images/logo.png';
import icon1 from '../images/icon1.png';
import icon2 from '../images/icon2.png';
import icon3 from '../images/icon3.png';
import icon4 from '../images/icon4.png';

import "../styles/AgendamentosMedicos.css";

export default function AgendamentosMedicos() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    
    const months = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            carregarAgendamentos();
        }
    }, [user, currentMonth, currentYear]);

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Usuário logado:', user);
        setUser(user);
    };

    const carregarAgendamentos = async () => {
        try {
            setLoading(true);
            
            // Buscar agendamentos do usuário
            const { data, error } = await supabase
                .from('agendamentos')
                .select(`
                    *,
                    medico:medico_id (
                        nome,
                        especialidade,
                        crm
                    )
                `)
                .eq('paciente_id', user.id)
                .gte('data_consulta', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
                .lt('data_consulta', `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-01`)
                .order('data_consulta', { ascending: true })
                .order('horario', { ascending: true });

            if (error) throw error;

            console.log('Agendamentos carregados:', data);
            
            // Formatar os dados para exibição
            const formattedAppointments = data.map(app => ({
                id: app.id,
                dia: new Date(app.data_consulta).getDate(),
                medico: app.medico?.nome || 'Médico não encontrado',
                especialidade: app.medico?.especialidade || 'Especialidade não informada',
                tipo: app.tipo === 'presencial' ? 'Presencial' : 'Teleconsulta',
                horario: app.horario.substring(0, 5), // Formato HH:MM
                duracao: app.tipo === 'teleconsulta' ? '30 min' : '',
                local: app.tipo === 'presencial' ? 'Consultório' : '',
                status: app.status,
                statusText: getStatusText(app.status),
                link_teleconsulta: app.link_teleconsulta,
                botao: getBotaoTexto(app.status, app.tipo),
                botaoAcao: getBotaoAcao(app.status, app.tipo)
            }));
            
            setAppointments(formattedAppointments);
            setFilteredAppointments(formattedAppointments);
            
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar agendamentos',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'agendada':
                return 'Agendada';
            case 'confirmada':
                return 'Confirmada';
            case 'cancelada':
                return 'Cancelada';
            case 'realizada':
                return 'Realizada';
            case 'aguardando':
                return 'Aguardando';
            default:
                return status;
        }
    };

    const getBotaoTexto = (status, tipo) => {
        if (status === 'agendada') {
            return 'Cancelar';
        }
        if (status === 'confirmada' && tipo === 'teleconsulta') {
            return 'Acessar link';
        }
        if (status === 'realizada') {
            return 'Ver relatório';
        }
        return '';
    };

    const getBotaoAcao = (status, tipo) => {
        if (status === 'agendada') {
            return 'cancelar';
        }
        if (status === 'confirmada' && tipo === 'teleconsulta') {
            return 'link';
        }
        if (status === 'realizada') {
            return 'relatorio';
        }
        return '';
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleButtonClick = async (acao, appointment) => {
        if (acao === 'cancelar') {
            const result = await Swal.fire({
                title: 'Cancelar consulta',
                text: `Tem certeza que deseja cancelar a consulta com ${appointment.medico}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6366f1',
                confirmButtonText: 'Sim, cancelar',
                cancelButtonText: 'Não'
            });

            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    
                    const { error } = await supabase
                        .from('agendamentos')
                        .update({ status: 'cancelada' })
                        .eq('id', appointment.id);

                    if (error) throw error;

                    Swal.fire({
                        icon: 'success',
                        title: 'Cancelado!',
                        text: 'Consulta cancelada com sucesso.',
                        confirmButtonColor: '#6366f1'
                    });
                    
                    // Recarregar agendamentos
                    await carregarAgendamentos();
                    
                } catch (error) {
                    console.error('Erro ao cancelar:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Erro ao cancelar consulta',
                        confirmButtonColor: '#6366f1'
                    });
                } finally {
                    setLoading(false);
                }
            }
        } 
        else if (acao === 'link') {
            if (appointment.link_teleconsulta) {
                window.open(appointment.link_teleconsulta, '_blank');
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Link não disponível',
                    text: 'O link da teleconsulta ainda não foi disponibilizado.',
                    confirmButtonColor: '#6366f1'
                });
            }
        }
        else if (acao === 'relatorio') {
            Swal.fire({
                icon: 'info',
                title: 'Relatório',
                text: 'Função de relatório em desenvolvimento.',
                confirmButtonColor: '#6366f1'
            });
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Desconectar',
            text: 'Tem certeza que deseja sair?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    if (loading && appointments.length === 0) {
        return <div className="loading">Carregando agendamentos...</div>;
    }

    return (
        <div className="agenda-container">

            {/* SIDEBAR */}
            <div className="navbar">
                <div className="nav-header">
                    <img src={logo} className="logoperfil" alt="logo" />
                </div>

                <h3>CONTA</h3>
                <ul>
                    <li>
                        <Link to="/perfil">
                            <img src={icon1} alt="icon"/> 
                            Configurações
                        </Link>
                    </li>
                    <li className="active">
                        <Link to="/agendamento">
                            <img src={icon2} alt="icon"/> 
                            Agendamentos
                        </Link>
                        <span className="active-indicator"></span>
                    </li>
                </ul>


                <h3>NAVEGAÇÕES</h3>
                <ul>
                    <li>
                        <Link to="/home-paciente">
                            <img src={icon4} alt="icon"/> 
                            Voltar para o início
                        </Link>
                    </li>
                </ul>

                <p className="logout">
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        Desconectar
                    </button>
                </p>
            </div>

            {/* CONTEÚDO */}
            <div className="agenda-content">
                <h1>AGENDAMENTOS MÉDICOS</h1>

                {/* MÊS COM SETAS */}
                <div className="mes-container">
                    <div className="mes-header">
                        <button className="month-nav-btn" onClick={goToPreviousMonth}>
                            ◀
                        </button>
                        <h2>{months[currentMonth]} {currentYear}</h2>
                        <button className="month-nav-btn" onClick={goToNextMonth}>
                            ▶
                        </button>
                    </div>
                    
                    {/* LISTA DE AGENDAMENTOS */}
                    <div className="appointments-list">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((app) => (
                                <div key={app.id} className="appointment-card">
                                    <div className="appointment-day">
                                        <span className="day-number">{app.dia}</span>
                                    </div>
                                    <div className="appointment-details">
                                        <div className="appointment-header">
                                            <strong>{app.medico}</strong> – {app.especialidade}
                                        </div>
                                        <div className="appointment-info">
                                            {app.tipo} - {app.horario}
                                            {app.duracao && ` - ${app.duracao}`}
                                            {app.local && <span className="appointment-local"> - {app.local}</span>}
                                        </div>
                                    </div>
                                    <div className="appointment-status">
                                        <span className={`status-badge status-${app.status}`}>
                                            {app.statusText}
                                        </span>
                                    </div>
                                    {app.botao && (
                                        <div className="appointment-action">
                                            <button 
                                                className={`action-btn btn-${app.botaoAcao}`}
                                                onClick={() => handleButtonClick(app.botaoAcao, app)}
                                                disabled={loading}
                                            >
                                                {app.botao}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-appointments">
                                <p>Nenhum agendamento para {months[currentMonth]} de {currentYear}</p>
                                <Link to="/clinicas" className="btn-agendar">
                                    Agendar nova consulta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}