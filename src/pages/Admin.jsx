import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/AdminBase.css';

import logo from '../images/logo.png';
import AdminSidebar from "../components/AdminSideBar";

export default function AdminDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalProfissionais: 0,
        consultasHoje: 0,
        consultasConcluidas: 0,
        consultasPendentes: 0
    });
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dadosGrafico, setDadosGrafico] = useState({
        meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        concluidas: [0, 0, 0, 0, 0, 0],
        pendentes: [0, 0, 0, 0, 0, 0],
        canceladas: [0, 0, 0, 0, 0, 0]
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            await carregarEstatisticas();
            await carregarConsultasRecentes();
            await carregarDadosGrafico();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const carregarEstatisticas = async () => {
        // Total de usuários (pacientes)
        const { count: totalUsuarios } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('tipo', 'paciente');

        // Total de profissionais (médicos)
        const { count: totalProfissionais } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('tipo', 'medico');

        // Consultas de hoje
        const hoje = new Date().toISOString().split('T')[0];
        const { count: consultasHoje } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('data_consulta', hoje);

        // Consultas concluídas
        const { count: consultasConcluidas } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'concluida');

        // Consultas pendentes
        const { count: consultasPendentes } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'agendada');

        setStats({
            totalUsuarios: totalUsuarios || 0,
            totalProfissionais: totalProfissionais || 0,
            consultasHoje: consultasHoje || 0,
            consultasConcluidas: consultasConcluidas || 0,
            consultasPendentes: consultasPendentes || 0
        });
    };

    const carregarConsultasRecentes = async () => {
        const { data, error } = await supabase
            .from('agendamentos')
            .select(`
                id,
                data_consulta,
                horario,
                tipo,
                status,
                paciente:paciente_id(nome),
                medico:medico_id(nome, especialidade)
            `)
            .order('data_consulta', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Erro ao carregar consultas:', error);
            return;
        }

        const consultasFormatadas = data.map(consulta => ({
            id: consulta.id,
            name: consulta.paciente?.nome || 'Paciente',
            date: new Date(consulta.data_consulta).toLocaleDateString('pt-BR'),
            status: getStatusText(consulta.status),
            type: consulta.medico?.especialidade || 'Especialista',
            horario: consulta.horario,
            tipo_consulta: consulta.tipo === 'teleconsulta' ? 'Online' : 'Presencial'
        }));

        setConsultations(consultasFormatadas);
    };

    const carregarDadosGrafico = async () => {
        try {
            const anoAtual = new Date().getFullYear();
            const meses = [0, 1, 2, 3, 4, 5]; // Janeiro a Junho
            const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
            
            const concluidas = [];
            const pendentes = [];
            const canceladas = [];

            for (let i = 0; i < meses.length; i++) {
                const mes = meses[i];
                const dataInicio = `${anoAtual}-${String(mes + 1).padStart(2, '0')}-01`;
                const ultimoDia = new Date(anoAtual, mes + 1, 0).getDate();
                const dataFim = `${anoAtual}-${String(mes + 1).padStart(2, '0')}-${ultimoDia}`;

                // Consultas concluídas no mês
                const { count: totalConcluidas } = await supabase
                    .from('agendamentos')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'concluida')
                    .gte('data_consulta', dataInicio)
                    .lte('data_consulta', dataFim);

                // Consultas pendentes no mês
                const { count: totalPendentes } = await supabase
                    .from('agendamentos')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'agendada')
                    .gte('data_consulta', dataInicio)
                    .lte('data_consulta', dataFim);

                // Consultas canceladas no mês
                const { count: totalCanceladas } = await supabase
                    .from('agendamentos')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'cancelada')
                    .gte('data_consulta', dataInicio)
                    .lte('data_consulta', dataFim);

                concluidas.push(totalConcluidas || 0);
                pendentes.push(totalPendentes || 0);
                canceladas.push(totalCanceladas || 0);
            }

            setDadosGrafico({
                meses: nomesMeses,
                concluidas,
                pendentes,
                canceladas
            });

        } catch (error) {
            console.error('Erro ao carregar dados do gráfico:', error);
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'agendada': return 'Pendente';
            case 'concluida': return 'Realizada';
            case 'cancelada': return 'Cancelada';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'Pendente': return 'status-pendente';
            case 'Realizada': return 'status-realizada';
            case 'Cancelada': return 'status-cancelada';
            default: return '';
        }
    };

    const handleView = (id) => {
        const consult = consultations.find(c => c.id === id);
        alert(`Consulta de ${consult.name} - ${consult.date} às ${consult.horario}`);
    };

    const filteredConsultations = consultations.filter(consult =>
        consult.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calcular altura máxima das barras para escala
    const maxValor = Math.max(
        ...dadosGrafico.concluidas,
        ...dadosGrafico.pendentes,
        ...dadosGrafico.canceladas,
        1
    );
    const alturaMaxima = 180;

    return (
        <div className="admin-container">
            <AdminSidebar />
            
            {/* MAIN CONTENT */}
            <main className="main-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando dados...</p>
                    </div>
                ) : (
                    <>
                        <div className="welcome-section">
                            <h1>Bem-vindo de volta, <span>Administrador!</span></h1>
                            <p>Gerencie sua plataforma de telemedicina</p>
                        </div>

                        {/* Cards com estatísticas */}
                        <div className="stats-cards grid-4">
                            {/* Card 1: Usuários */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Usuários</h3>
                                    <div className="stat-number">{stats.totalUsuarios}</div>
                                    <span className="stat-label">Pacientes ativos</span>
                                </div>
                            </div>

                            {/* Card 2: Profissionais */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                        <line x1="12" y1="11" x2="12" y2="17"/>
                                        <line x1="9" y1="14" x2="15" y2="14"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Profissionais</h3>
                                    <div className="stat-number">{stats.totalProfissionais}</div>
                                    <span className="stat-label">Médicos ativos</span>
                                </div>
                            </div>

                            {/* Card 3: Consultas do dia */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Consultas Hoje</h3>
                                    <div className="stat-number">{stats.consultasHoje}</div>
                                    <span className="stat-label pending-badge">{stats.consultasPendentes} pendentes</span>
                                </div>
                            </div>

                            {/* Card 4: Consultas Concluídas */}
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Concluídas</h3>
                                    <div className="stat-number">{stats.consultasConcluidas}</div>
                                    <span className="stat-label completed-badge">Total</span>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico Mensal */}
                        <div className="chart-section">
                            <h2>MENSAL</h2>
                            
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <div className="legend-color concluidas"></div>
                                    <span>Consultas concluídas</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color pendentes"></div>
                                    <span>Consultas pendentes</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color canceladas"></div>
                                    <span>Consultas canceladas</span>
                                </div>
                            </div>

                            <div className="chart-bars">
                                {dadosGrafico.meses.map((mes, idx) => {
                                    const alturaConcluidas = (dadosGrafico.concluidas[idx] / maxValor) * alturaMaxima;
                                    const alturaPendentes = (dadosGrafico.pendentes[idx] / maxValor) * alturaMaxima;
                                    const alturaCanceladas = (dadosGrafico.canceladas[idx] / maxValor) * alturaMaxima;
                                    
                                    return (
                                        <div key={idx} className="bar-item">
                                            <div className="bar-group">
                                                <div 
                                                    className="bar concluidas" 
                                                    style={{ height: `${alturaConcluidas || 4}px` }}
                                                    title={`Concluídas: ${dadosGrafico.concluidas[idx]}`}
                                                ></div>
                                                <div 
                                                    className="bar pendentes" 
                                                    style={{ height: `${alturaPendentes || 4}px` }}
                                                    title={`Pendentes: ${dadosGrafico.pendentes[idx]}`}
                                                ></div>
                                                <div 
                                                    className="bar canceladas" 
                                                    style={{ height: `${alturaCanceladas || 4}px` }}
                                                    title={`Canceladas: ${dadosGrafico.canceladas[idx]}`}
                                                ></div>
                                            </div>
                                            <span className="bar-label">{mes}</span>
                                            <div className="bar-valores">
                                                <small>{dadosGrafico.concluidas[idx] + dadosGrafico.pendentes[idx] + dadosGrafico.canceladas[idx]}</small>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tabela de Consultas Recentes */}
                        <div className="table-section">
                            <div className="table-header">
                                <h2>CONSULTAS RECENTES</h2>
                                <div className="search-wrapper">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar consulta..." 
                                        className="search-input"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="consultas-table">
                                    <thead>
                                        <tr>
                                            <th>PACIENTE</th>
                                            <th>DATA</th>
                                            <th>HORÁRIO</th>
                                            <th>STATUS</th>
                                            <th>ESPECIALIDADE</th>
                                            <th>TIPO</th>
                                            <th>AÇÃO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredConsultations.length > 0 ? (
                                            filteredConsultations.map((consult) => (
                                                <tr key={consult.id}>
                                                    <td>{consult.name}</td>
                                                    <td>{consult.date}</td>
                                                    <td>{consult.horario}</td>
                                                    <td><span className={getStatusClass(consult.status)}>{consult.status}</span></td>
                                                    <td>{consult.type}</td>
                                                    <td>
                                                        <span className={`tipo-badge ${consult.tipo_consulta === 'Online' ? 'teleconsulta' : 'presencial'}`}>
                                                            {consult.tipo_consulta}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="view-btn" onClick={() => handleView(consult.id)}>
                                                            Ver
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Nenhuma consulta encontrada
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}