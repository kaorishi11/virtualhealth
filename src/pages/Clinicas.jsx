import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { createConsultationRoom } from '../services/roomService'


import "../styles/Clinicas.css";

// Imagens
import logo from "../images/logo.png";
import lupa from "../images/lupa.png";
import certinho from "../images/certinho.png";
import wats from "../images/wats.png";
import insta from "../images/insta.png";
import local from "../images/local.png";
import tell from "../images/tel.png";
import gmail from "../images/gmail.png";
import tempo from "../images/tempo.png";
import iconlocal from "../images/iconlocal.png";
import icontempo from "../images/icontempo.png";
import iconesc from "../images/iconesc.png";
import iconcell from "../images/iconcell.png";
import qrcode from "../images/qrcode.png";

export default function Clinicas() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
    const [selectedLocal, setSelectedLocal] = useState("Caçapava, São Paulo - SP");
    const [activeTab, setActiveTab] = useState({});
    
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [horariosDisponiveis, setHorariosDisponiveis] = useState({});
    
    // States para Teleconsulta
    const [selectedDateTele, setSelectedDateTele] = useState({});
    const [selectedHourTele, setSelectedHourTele] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedDoctorPayment, setSelectedDoctorPayment] = useState(null);
    const [selectedDatePayment, setSelectedDatePayment] = useState(null);
    const [selectedHourPayment, setSelectedHourPayment] = useState(null);
    const [pixCopiado, setPixCopiado] = useState(false);
    const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
    const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);
    
    // States para Presencial
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDatePresencial, setSelectedDatePresencial] = useState({});
    const [selectedHourPresencial, setSelectedHourPresencial] = useState({});
    const [showConfirmationPresencial, setShowConfirmationPresencial] = useState(false);
    const [confirmationDetailsPresencial, setConfirmationDetailsPresencial] = useState({});
    
    const [pacienteId, setPacienteId] = useState(null);

    // Estados para navegação do calendário
    const [mesAtual, setMesAtual] = useState(new Date().getMonth());
    const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

    // ==================== FUNÇÕES DE DISPONIBILIDADE ====================

    // Função para buscar dias disponíveis do médico no mês selecionado
    async function buscarDiasDisponiveis(medicoId, mes, ano) {
        console.log(`Buscando disponibilidade para médico ${medicoId} no mês ${mes + 1}/${ano}`);
        
        const { data: disponibilidade, error } = await supabase
            .from("medico_disponibilidade")
            .select("dia_semana, horario_inicio, horario_fim")
            .eq("medico_id", medicoId)
            .eq("ativo", true);

        if (error) {
            console.error("Erro ao buscar disponibilidade:", error);
            return [];
        }

        if (!disponibilidade || disponibilidade.length === 0) {
            console.log("Nenhuma disponibilidade cadastrada para este médico");
            return [];
        }

        console.log("Disponibilidade encontrada:", disponibilidade);

        const diasAtendimento = disponibilidade.map(d => d.dia_semana);
        console.log("Dias da semana que atende:", diasAtendimento);
        
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        const diasDisponiveisLista = [];

        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const data = new Date(ano, mes, dia);
            const diaSemana = data.getDay();
            
            if (diasAtendimento.includes(diaSemana)) {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                
                if (data >= hoje) {
                    diasDisponiveisLista.push(dia);
                }
            }
        }

        console.log("Dias disponíveis encontrados:", diasDisponiveisLista);
        return diasDisponiveisLista;
    }

    // Função para buscar horários disponíveis
    async function buscarHorariosDisponiveis(medicoId, ano, mes, dia) {
        console.log("=== BUSCANDO HORÁRIOS ===");
        console.log("Médico ID:", medicoId);
        console.log("Ano:", ano, "Mês:", mes, "Dia:", dia);
        
        // Criar a data corretamente
        const dataObj = new Date(ano, mes, dia);
        const diaSemana = dataObj.getDay();
        console.log("Dia da semana (0=Domingo,6=Sábado):", diaSemana);
        
        // Formatar data para YYYY-MM-DD
        const dataFormatada = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        console.log("Data formatada para busca:", dataFormatada);
        
        // Buscar disponibilidade do médico
        const { data: disponibilidade, error: dispError } = await supabase
            .from("medico_disponibilidade")
            .select("horario_inicio, horario_fim")
            .eq("medico_id", medicoId)
            .eq("dia_semana", diaSemana)
            .eq("ativo", true);

        if (dispError) {
            console.error("Erro ao buscar disponibilidade:", dispError);
            return [];
        }

        if (!disponibilidade || disponibilidade.length === 0) {
            console.log(`❌ Nenhuma disponibilidade para o dia ${diaSemana}`);
            return [];
        }

        console.log("Disponibilidade encontrada:", disponibilidade);

        // Buscar horários já agendados
        const { data: agendamentos } = await supabase
            .from("agendamentos")
            .select("horario")
            .eq("medico_id", medicoId)
            .eq("data_consulta", dataFormatada)
            .eq("status", "agendada");

        const horariosOcupados = agendamentos?.map(a => a.horario) || [];
        console.log("Horários ocupados:", horariosOcupados);

        // Verificar se é hoje
        const hoje = new Date();
        const isHoje = hoje.getDate() === dia && hoje.getMonth() === mes && hoje.getFullYear() === ano;
        const horaAtual = hoje.getHours();
        const minutoAtual = hoje.getMinutes();
        
        console.log("É hoje?", isHoje);
        if (isHoje) {
            console.log("Hora atual:", horaAtual + ":" + minutoAtual);
        }

        // Gerar horários disponíveis
        const horarios = [];
        
        for (const disp of disponibilidade) {
            let inicio = disp.horario_inicio;
            const fim = disp.horario_fim;
            
            console.log(`Gerando horários entre ${inicio} e ${fim}`);
            
            while (inicio < fim) {
                const horarioStr = inicio.substring(0, 5);
                
                let horarioValido = true;
                if (isHoje) {
                    const [horaHorario, minutoHorario] = horarioStr.split(':');
                    const horarioEmMinutos = parseInt(horaHorario) * 60 + parseInt(minutoHorario);
                    const agoraEmMinutos = horaAtual * 60 + minutoAtual;
                    
                    if (horarioEmMinutos <= agoraEmMinutos) {
                        horarioValido = false;
                        console.log(`Horário ${horarioStr} já passou, ignorando`);
                    }
                }
                
                if (horarioValido && !horariosOcupados.includes(horarioStr)) {
                    horarios.push(horarioStr);
                }
                
                // Avançar 30 minutos
                const [h, m] = inicio.split(':');
                let novaHora = parseInt(h);
                let novoMinuto = parseInt(m) + 30;
                
                if (novoMinuto >= 60) {
                    novaHora++;
                    novoMinuto = novoMinuto - 60;
                }
                
                inicio = `${novaHora.toString().padStart(2, '0')}:${novoMinuto.toString().padStart(2, '0')}:00`;
            }
        }

        console.log("✅ Horários disponíveis finais:", horarios);
        return horarios;
    }

    // ==================== FUNÇÕES DE USUÁRIO ====================

    async function buscarPacienteLogado() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                navigate("/login");
                return;
            }

            const { data: usuario } = await supabase
                .from("usuarios")
                .select("id, tipo")
                .eq("id", user.id)
                .single();

            if (usuario && usuario.tipo === 'paciente') {
                setPacienteId(usuario.id);
            } else if (usuario && usuario.tipo === 'medico') {
                navigate("/home-medico");
            }
        } catch (error) {
            console.error("Erro ao buscar paciente:", error);
            navigate("/login");
        }
    }

    async function buscarMedicos() {
        setLoading(true);
        
        const { data: medicos, error } = await supabase
            .from("usuarios")
            .select(`
                id,
                nome,
                especialidade,
                foto,
                crm,
                ano_formacao,
                universidade,
                preco_consulta,
                clinica_id,
                clinicas (
                    id,
                    nome,
                    descricao,
                    logradouro,
                    bairro,
                    cidade,
                    estado,
                    cep,
                    telefone,
                    email,
                    imagem,
                    horario_funcionamento
                )
            `)
            .eq("tipo", "medico");

        if (error) {
            console.error("Erro ao buscar médicos:", error);
            setLoading(false);
            return;
        }

        const medicosFormatados = await Promise.all(
            medicos.map(async (medico) => {
                let lat = -23.1005;
                let lng = -45.7072;

                const diasDisponiveisMedico = await buscarDiasDisponiveis(
                    medico.id, 
                    mesAtual, 
                    anoAtual
                );

                if (medico.clinicas) {
                    const endereco = `${medico.clinicas.logradouro}, ${medico.clinicas.bairro}, ${medico.clinicas.cidade}, ${medico.clinicas.estado}`;
                    
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
                        );
                        const geoData = await response.json();
                        if (geoData.length > 0) {
                            lat = Number(geoData[0].lat);
                            lng = Number(geoData[0].lon);
                        }
                    } catch (err) {
                        console.error("Erro ao buscar localização:", err);
                    }
                }

                return {
                    id: medico.id,
                    name: medico.nome,
                    specialty: medico.especialidade || "Especialista",
                    crm: medico.crm,
                    anoFormacao: medico.ano_formacao,
                    universidade: medico.universidade,
                    rating: 4.9,
                    reviews: 38,
                    enderecoCompleto: medico.clinicas
                        ? `${medico.clinicas.nome} - ${medico.clinicas.logradouro}, ${medico.clinicas.bairro}, ${medico.clinicas.cidade} - ${medico.clinicas.estado}`
                        : "Clínica não informada",
                    clinicaInfo: medico.clinicas,
                    price: medico.preco_consulta || 90.00,
                    avatar: medico.foto || "https://placehold.co/300x300",
                    coordinates: { lat, lng },
                    diasDisponiveis: diasDisponiveisMedico
                };
            })
        );

        setDoctors(medicosFormatados);
        setLoading(false);
    }

    async function carregarNotificacoes() {
        if (!pacienteId) return;

        const { data: notificacoes } = await supabase
            .from("notificacoes")
            .select("*")
            .eq("usuario_id", pacienteId)
            .order("created_at", { ascending: false })
            .limit(20);

        if (notificacoes) {
            setNotifications(notificacoes.map(n => ({
                id: n.id,
                title: n.titulo,
                message: n.mensagem,
                type: n.tipo,
                read: n.lida,
                time: new Date(n.created_at).toLocaleDateString('pt-BR')
            })));
        }
    }

    // ==================== FUNÇÕES DE AGENDAMENTO ====================

    async function verificarDisponibilidadeHorario(medicoId, data, horario) {
        const { data: agendamentoExistente } = await supabase
            .from("agendamentos")
            .select("id")
            .eq("medico_id", medicoId)
            .eq("data_consulta", data)
            .eq("horario", horario)
            .eq("status", "agendada");

        return agendamentoExistente?.length === 0;
    }

    async function salvarAgendamentoPresencial(medico, pacienteId, data, horario) {
        const disponivel = await verificarDisponibilidadeHorario(medico.id, data, horario);
        
        if (!disponivel) {
            alert("Este horário já está ocupado!");
            return false;
        }

        const { error } = await supabase
            .from("agendamentos")
            .insert({
                paciente_id: pacienteId,
                medico_id: medico.id,
                tipo: "presencial",
                data_consulta: data,
                horario: horario,
                status: "agendada"
            });

        if (error) {
            console.error("Erro ao agendar:", error);
            alert("Erro ao agendar consulta.");
            return false;
        }

        await supabase.from("notificacoes").insert([
            {
                usuario_id: medico.id,
                titulo: "Nova consulta agendada",
                mensagem: `Um paciente agendou uma consulta presencial para ${data} às ${horario}`,
                tipo: "consulta"
            },
            {
                usuario_id: pacienteId,
                titulo: "Consulta agendada com sucesso!",
                mensagem: `Sua consulta com Dr(a). ${medico.name} foi agendada para ${data} às ${horario}`,
                tipo: "consulta"
            }
        ]);

        return true;
    }

    async function salvarAgendamentoTeleconsulta(medico, pacienteId, data, horario) {
    const disponivel = await verificarDisponibilidadeHorario(medico.id, data, horario);
    
    if (!disponivel) {
        alert("Este horário já está ocupado!");
        return false;
    }

    // Gerar código único para sala (6 caracteres)
    const codigoSala = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Criar URL da sala no Jitsi Meet
    const salaUrl = `https://meet.jit.si/VirtualHealth_${codigoSala}`;
    
    console.log("=== CRIANDO AGENDAMENTO TELECONSULTA ===");
    console.log("Código da sala:", codigoSala);
    console.log("URL da sala:", salaUrl);
    console.log("Médico:", medico.name, "ID:", medico.id);
    console.log("Paciente ID:", pacienteId);
    console.log("Data:", data, "Horário:", horario);

    // 1. Criar sala na tabela consulta_salas
    const { data: salaData, error: salaError } = await supabase
        .from("consulta_salas")
        .insert({
            codigo: codigoSala,
            medico_id: medico.id,
            paciente_id: pacienteId,
            sala_url: salaUrl,
            status: "aguardando"
        })
        .select();

    if (salaError) {
        console.error("Erro ao criar sala:", salaError);
        alert("Erro ao criar sala de consulta.");
        return false;
    }

    console.log("Sala criada com sucesso, ID:", salaData[0]?.id);

    // 2. Criar agendamento (SEM link_teleconsulta, pois a sala já tem)
    const { data: agendamentoData, error: agendamentoError } = await supabase
        .from("agendamentos")
        .insert({
            paciente_id: pacienteId,
            medico_id: medico.id,
            tipo: "teleconsulta",
            data_consulta: data,
            horario: horario,
            status: "agendada"
            // NÃO incluir link_teleconsulta aqui - ele está na tabela consulta_salas
        })
        .select();

    if (agendamentoError) {
        console.error("Erro ao agendar:", agendamentoError);
        alert("Erro ao agendar consulta.");
        return false;
    }

    console.log("Agendamento criado com sucesso, ID:", agendamentoData[0]?.id);

    // 3. Atualizar o agendamento com o id da sala (opcional, para referência)
    if (salaData && salaData[0] && agendamentoData && agendamentoData[0]) {
        await supabase
            .from("consulta_salas")
            .update({ agendamento_id: agendamentoData[0].id })
            .eq("id", salaData[0].id);
    }

    // 4. Criar NOTIFICAÇÃO para o MÉDICO
    const { error: notifMedicoError } = await supabase
        .from("notificacoes")
        .insert({
            usuario_id: medico.id,
            titulo: "Nova teleconsulta agendada",
            mensagem: `Um paciente agendou uma teleconsulta para ${data} às ${horario}. Código: ${codigoSala}`,
            tipo: "teleconsulta"
        });

    if (notifMedicoError) {
        console.error("Erro ao criar notificação para médico:", notifMedicoError);
    } else {
        console.log("✅ Notificação para médico enviada!");
    }

    // 5. Criar NOTIFICAÇÃO para o PACIENTE
    const { error: notifPacienteError } = await supabase
        .from("notificacoes")
        .insert({
            usuario_id: pacienteId,
            titulo: "🩺 Teleconsulta agendada!",
            mensagem: `Sua consulta com Dr(a). ${medico.name} foi agendada para ${data} às ${horario}. CÓDIGO: ${codigoSala}`,
            tipo: "teleconsulta"
        });

    if (notifPacienteError) {
        console.error("Erro ao criar notificação para paciente:", notifPacienteError);
    } else {
        console.log("✅ Notificação para paciente enviada!");
    }

    // 6. Salvar o código na sessão ou localStorage para o paciente usar depois
    localStorage.setItem(`consulta_${pacienteId}`, codigoSala);

    return true;
}

    // ==================== FUNÇÕES DE NAVEGAÇÃO DO CALENDÁRIO ====================

    const mesAnterior = () => {
        if (mesAtual === 0) {
            setMesAtual(11);
            setAnoAtual(anoAtual - 1);
        } else {
            setMesAtual(mesAtual - 1);
        }
    };

    const proximoMes = () => {
        if (mesAtual === 11) {
            setMesAtual(0);
            setAnoAtual(anoAtual + 1);
        } else {
            setMesAtual(mesAtual + 1);
        }
    };

    const getNomeMes = () => {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return `${meses[mesAtual]} ${anoAtual}`;
    };

    // ==================== HANDLERS ====================

    const handleSelectDateTele = async (doctorId, dia) => {
        console.log("=== DATA SELECIONADA TELECONSULTA ===");
        console.log("Doctor ID:", doctorId);
        console.log("Dia:", dia);
        
        setSelectedDateTele(prev => ({ ...prev, [doctorId]: dia }));
        
        const horarios = await buscarHorariosDisponiveis(doctorId, anoAtual, mesAtual, dia);
        
        console.log("Horários encontrados:", horarios);
        
        setHorariosDisponiveis(prev => ({ ...prev, [doctorId]: horarios }));
        setSelectedHourTele(prev => ({ ...prev, [doctorId]: null }));
    };

    const handleSelectHourTele = (doctorId, hour) => {
        setSelectedHourTele(prev => ({ ...prev, [doctorId]: hour }));
    };

    const handleSelectDatePresencial = async (doctorId, dia) => {
        console.log("=== DATA SELECIONADA PRESENCIAL ===");
        console.log("Doctor ID:", doctorId);
        console.log("Dia:", dia);
        
        setSelectedDatePresencial(prev => ({ ...prev, [doctorId]: dia }));
        
        const horarios = await buscarHorariosDisponiveis(doctorId, anoAtual, mesAtual, dia);
        
        console.log("Horários encontrados:", horarios);
        
        setHorariosDisponiveis(prev => ({ ...prev, [doctorId]: horarios }));
        setSelectedHourPresencial(prev => ({ ...prev, [doctorId]: null }));
    };

    const handleSelectHourPresencial = (doctorId, hour) => {
        setSelectedHourPresencial(prev => ({ ...prev, [doctorId]: hour }));
    };

    const handlePagarConsulta = (doc) => {
        if (selectedDateTele[doc.id] && selectedHourTele[doc.id]) {
            setSelectedDoctorPayment(doc);
            setSelectedDatePayment(selectedDateTele[doc.id]);
            setSelectedHourPayment(selectedHourTele[doc.id]);
            setShowPaymentModal(true);
            setPixCopiado(false);
            setPagamentoConfirmado(false);
            setAgendamentoConfirmado(false);
        } else {
            alert("Por favor, selecione uma data e horário primeiro!");
        }
    };

    const handleConfirmarPagamento = async () => {
        setPagamentoConfirmado(true);
        
        setTimeout(async () => {
            const dataFormatada = `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}-${selectedDatePayment.toString().padStart(2, '0')}`;
            
            const sucesso = await salvarAgendamentoTeleconsulta(
                selectedDoctorPayment,
                pacienteId,
                dataFormatada,
                selectedHourPayment
            );
            
            if (sucesso) {
                setAgendamentoConfirmado(true);
                await carregarNotificacoes();
            } else {
                setPagamentoConfirmado(false);
                alert("Erro ao agendar. Tente novamente.");
            }
        }, 1500);
    };

    const handleConfirmPresencial = async (doc) => {
        if (selectedDatePresencial[doc.id] && selectedHourPresencial[doc.id]) {
            const dataFormatada = `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}-${selectedDatePresencial[doc.id].toString().padStart(2, '0')}`;
            
            const sucesso = await salvarAgendamentoPresencial(
                doc,
                pacienteId,
                dataFormatada,
                selectedHourPresencial[doc.id]
            );
            
            if (sucesso) {
                setConfirmationDetailsPresencial({
                    doctorName: doc.name,
                    specialty: doc.specialty,
                    date: selectedDatePresencial[doc.id],
                    hour: selectedHourPresencial[doc.id],
                    address: doc.enderecoCompleto,
                    price: doc.price,
                    type: "Presencial"
                });
                setShowConfirmationPresencial(true);
                await carregarNotificacoes();
            }
        } else {
            alert("Por favor, selecione uma data e horário primeiro!");
        }
    };

    const handleAgendar = (doc) => {
        if (activeTab[doc.id] === 'teleconsulta') {
            handlePagarConsulta(doc);
        } else {
            setSelectedDoctor(doc);
            setModalOpen(true);
        }
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedDoctorPayment(null);
        setSelectedDatePayment(null);
        setSelectedHourPayment(null);
        setPixCopiado(false);
        setPagamentoConfirmado(false);
        setAgendamentoConfirmado(false);
    };

    const closeModal = () => {
        setModalOpen(false);
        setShowConfirmationPresencial(false);
        setSelectedDatePresencial({});
        setSelectedHourPresencial({});
        setConfirmationDetailsPresencial({});
        setSelectedDoctor(null);
    };

    const handleCopiarPix = (codigo) => {
        navigator.clipboard.writeText(codigo);
        setPixCopiado(true);
        setTimeout(() => setPixCopiado(false), 2000);
    };

    const gerarCodigoPix = (doctorName) => {
        return `pix.virtualhealth.com/${doctorName.toLowerCase().replace(/\s/g, '')}${Date.now()}`;
    };

    // ==================== NOTIFICAÇÕES ====================

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        
        await supabase
            .from("notificacoes")
            .update({ lida: true })
            .eq("id", id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        
        const idsNotificacoes = notifications.map(n => n.id);
        if (idsNotificacoes.length > 0) {
            await supabase
                .from("notificacoes")
                .update({ lida: true })
                .in("id", idsNotificacoes);
        }
    };

    const closeNotifications = () => setShowNotifications(false);

    const getTypeIcon = (type) => {
        switch(type) {
            case 'consulta':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9H9l-3-9H2"/><path d="M5 3h14"/><path d="M12 3v9"/></svg>;
            case 'teleconsulta':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m9 8 5 4-5 4V8z"/></svg>;
            default:
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'teleconsulta': return 'teleconsulta';
            default: return 'sistema';
        }
    };

    const filteredDoctors = doctors.filter(
        (doc) =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedEspecialidade === "" || doc.specialty === selectedEspecialidade)
    );

    // ==================== EFFECTS ====================

    useEffect(() => {
        buscarMedicos();
        buscarPacienteLogado();
    }, [mesAtual, anoAtual]);

    useEffect(() => {
        if (pacienteId) {
            carregarNotificacoes();
        }
    }, [pacienteId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loader"></div>
                <p>Carregando clínicas e especialistas...</p>
            </div>
        );
    }

    return (
        <div>
            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logopaciente" alt="logo" />
                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                        <div className="notification-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </div>
                    </div>
                    <button className="consulta-btn" onClick={() => navigate("/chat")}>Fazer Consulta</button>
                </div>
            </div>

            {/* MODAL NOTIFICAÇÕES */}
            {showNotifications && (
                <div className="notification-modal-overlay" onClick={closeNotifications}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notification-modal-header">
                            <h3>Notificações</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {unreadCount > 0 && <button className="mark-all-btn" onClick={markAllAsRead}>Marcar todas</button>}
                                <button className="close-modal-btn" onClick={closeNotifications}>×</button>
                            </div>
                        </div>
                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => handleNotificationClick(notif.id)}>
                                        <div className={`notification-icon-circle ${getTypeClass(notif.type)}`}>{getTypeIcon(notif.type)}</div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications"><p>Nenhuma notificação no momento</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HERO */}
            <div className="hero-clinicas">
                <h1><span>CONHEÇA TODAS AS <br />CLÍNICAS</span> PRESENCIAIS</h1>
                <p>Encontre especialistas próximos a você e agende sua consulta.</p>
            </div>

            <div className="main-content">
                <div className="search-header">
                    <h2>Clínicas e especialistas para você</h2>
                    <hr />
                </div>

                <div className="search-container">
                    <div className="search-input-wrapper">
                        <img src={lupa} alt="busca" />
                        <input placeholder="Procure clínicas ou especialistas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="filter-select" value={selectedEspecialidade} onChange={(e) => setSelectedEspecialidade(e.target.value)}>
                        <option value="">Todas Especialidades</option>
                        <option value="Dentista">Dentista</option>
                        <option value="Oftalmologista">Oftalmologista</option>
                        <option value="Ginecologista">Ginecologista</option>
                        <option value="Cardiologista">Cardiologista</option>
                        <option value="Pediatra">Pediatra</option>
                        <option value="Dermatologista">Dermatologista</option>
                    </select>
                    <input type="text" className="location-input" placeholder="Caçapava, São Paulo - SP" value={selectedLocal} onChange={(e) => setSelectedLocal(e.target.value)} />
                </div>

                <hr className="hr"/>

                <div className="doctors">
                    {filteredDoctors.map((doc) => (
                        <div className="doctor-card" key={doc.id}>
                            <div className="doctor-left">
                                <div className="doctor-header">
                                    <img src={doc.avatar} className="doctor-avatar" alt={doc.name} />
                                    <div className="doctor-info">
                                        <h3>{doc.name}</h3>
                                        <p className="doctor-specialty">{doc.specialty}</p>
                                        <div className="doctor-rating">
                                            <span className="stars">★★★★★</span>
                                            <span className="rating-value">({doc.rating} · {doc.reviews} avaliações)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="tabs-left">
                                    <button className={`tab-btn-left ${activeTab[doc.id] !== 'teleconsulta' ? 'active' : ''}`} onClick={() => setActiveTab(prev => ({ ...prev, [doc.id]: 'presencial' }))}>Presencial</button>
                                    <button className={`tab-btn-left ${activeTab[doc.id] === 'teleconsulta' ? 'active' : ''}`} onClick={() => setActiveTab(prev => ({ ...prev, [doc.id]: 'teleconsulta' }))}>Teleconsulta</button>
                                </div>
                                {activeTab[doc.id] === 'presencial' && (
                                    <div className="address-section">
                                        <p className="address-full"><img src={iconlocal} alt="local" />{doc.enderecoCompleto}</p>
                                    </div>
                                )}
                                {activeTab[doc.id] === 'teleconsulta' && (
                                    <div className="tele-info-left">
                                        <p><img src={icontempo} alt="tempo" /> Duração média: 30 a 50 minutos</p>
                                        <p><img src={iconesc} alt="segurança" /> Dados protegidos pela LGPD</p>
                                        <p><img src={iconcell} alt="celular" /> Acesse pelo celular ou computador</p>
                                    </div>
                                )}
                                <div className="price-value">Consulta: <strong>R$ {doc.price.toFixed(2)}</strong></div>
                                <button className="btn-schedule" onClick={() => handleAgendar(doc)}>{activeTab[doc.id] === 'teleconsulta' ? 'Pagar Consulta' : 'Agendar Consulta'}</button>
                            </div>
                            <div className="doctor-right">
                                {activeTab[doc.id] === 'teleconsulta' ? (
                                    <div className="teleconsulta-content">
                                        <div className="calendar-section">
                                            <div className="calendar-header">
                                                <h4>ESCOLHA A DATA</h4>
                                                <div className="month-navigation">
                                                    <button onClick={mesAnterior} className="month-nav-btn">◀</button>
                                                    <span className="month-name">{getNomeMes()}</span>
                                                    <button onClick={proximoMes} className="month-nav-btn">▶</button>
                                                </div>
                                            </div>
                                            <div className="calendar">
                                                <div className="calendar-weekdays">
                                                    {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map(day => (
                                                        <span key={day}>{day}</span>
                                                    ))}
                                                </div>
                                                <div className="calendar-dates">
                                                    {Array.from({ length: new Date(anoAtual, mesAtual + 1, 0).getDate() }, (_, i) => i + 1).map((date) => {
                                                                                                                const isDisponivel = doc.diasDisponiveis?.includes(date);
                                                        const isSelected = selectedDateTele[doc.id] === date;
                                                        
                                                        return (
                                                            <div
                                                                key={date}
                                                                className={`date ${isSelected ? 'selected' : ''}`}
                                                                onClick={() => isDisponivel && handleSelectDateTele(doc.id, date)}
                                                                style={{
                                                                    cursor: isDisponivel ? 'pointer' : 'not-allowed',
                                                                    opacity: isDisponivel ? 1 : 0.4,
                                                                    backgroundColor: isSelected ? '#2c7da0' : 'transparent',
                                                                    color: isSelected ? 'white' : '#333',
                                                                    textDecoration: isDisponivel ? 'none' : 'line-through'
                                                                }}
                                                            >
                                                                {date}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedDateTele[doc.id] && (
                                            <div className="hours-section">
                                                <h4>SELECIONE O HORÁRIO</h4>
                                                <div className="hours-grid">
                                                    {horariosDisponiveis[doc.id]?.length > 0 ? (
                                                        horariosDisponiveis[doc.id].map((hour) => (
                                                            <button
                                                                key={hour}
                                                                className={`hour-btn ${selectedHourTele[doc.id] === hour ? 'selected' : ''}`}
                                                                onClick={() => handleSelectHourTele(doc.id, hour)}
                                                            >
                                                                {hour}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>
                                                            Nenhum horário disponível para esta data
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="presencial-content">
                                        <div className="location-section">
                                            <h4>Localização da Clínica</h4>
                                            <div className="map-placeholder">
                                                <iframe
                                                    title={`map-${doc.id}`}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${doc.coordinates.lng - 0.015},${doc.coordinates.lat - 0.015},${doc.coordinates.lng + 0.015},${doc.coordinates.lat + 0.015}&marker=${doc.coordinates.lat},${doc.coordinates.lng}`}
                                                    style={{ width: '100%', height: '250px', border: 0, borderRadius: '8px' }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                            </div>
                                            <p className="address-full" style={{ marginTop: '10px', fontSize: '12px' }}>
                                                <img src={iconlocal} alt="local" style={{ width: '14px', marginRight: '5px' }} />
                                                {doc.enderecoCompleto}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL PAGAMENTO */}
            {showPaymentModal && selectedDoctorPayment && (
                <div className="modal-overlay" onClick={closePaymentModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={closePaymentModal}>✕</button>
                        {!agendamentoConfirmado ? (
                            <>
                                <div className="modal-doctor">
                                    <img src={selectedDoctorPayment.avatar} alt={selectedDoctorPayment.name} />
                                    <div><h3>{selectedDoctorPayment.name}</h3><p>{selectedDoctorPayment.specialty}</p></div>
                                </div>
                                <div className="confirmation-card" style={{ margin: '0 24px 20px 24px' }}>
                                    <div className="confirmation-row"><span className="confirmation-label">Data:</span><span className="confirmation-value">{selectedDatePayment}/{mesAtual + 1}/{anoAtual}</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Horário:</span><span className="confirmation-value">{selectedHourPayment}</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Valor:</span><span className="confirmation-value highlight">R$ {selectedDoctorPayment.price.toFixed(2)}</span></div>
                                </div>
                                {!pagamentoConfirmado ? (
                                    <>
                                        <div className="qr-section">
                                            <div className="qr-placeholder">
                                                <img src={qrcode} alt="QR Code PIX" className="qr-image" />
                                                <div className="qr-value">R$ {selectedDoctorPayment.price.toFixed(2)}</div>
                                                <p className="qr-instruction">Escaneie o QR Code para pagar</p>
                                            </div>
                                            <div className="pix-code-section">
                                                <span className="pix-code-label">Código PIX (Copiar e colar)</span>
                                                <div className="pix-code-container">
                                                    <input type="text" className="pix-code" value={gerarCodigoPix(selectedDoctorPayment.name)} readOnly />
                                                    <button className={`btn-copiar-pix ${pixCopiado ? 'copiado' : ''}`} onClick={() => handleCopiarPix(gerarCodigoPix(selectedDoctorPayment.name))}>{pixCopiado ? '✓ COPIADO!' : 'Copiar'}</button>
                                                </div>
                                                <div className="payment-info">
                                                    <p><span className="alert-icon">!</span> <strong>Pagamento via PIX</strong> - O código pode ser copiado</p>
                                                    <p>Após o pagamento, clique em confirmar</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="confirm-btn" onClick={handleConfirmarPagamento} style={{ margin: '0 24px 24px 24px', width: 'calc(100% - 48px)' }}>Confirmar Pagamento</button>
                                    </>
                                ) : (
                                    <div className="confirmation-message" style={{ padding: '20px' }}>
                                        <div className="success-animation"><div className="checkmark">✓</div></div>
                                        <h2>Processando Pagamento...</h2>
                                        <div className="loader"></div>
                                        <p className="auto-close">Aguarde, confirmando transação</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="confirmation-message" style={{ padding: '30px 24px' }}>
                                <div className="success-animation"><div className="checkmark">✓</div></div>
                                <h2>Teleconsulta Agendada!</h2>
                                <p className="confirmation-subtitle">Sua teleconsulta foi marcada com sucesso</p>
                                
                                <div className="confirmation-card">
                                    <div className="confirmation-row"><span className="confirmation-label">Médico:</span><span className="confirmation-value">{selectedDoctorPayment.name}</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Especialidade:</span><span className="confirmation-value">{selectedDoctorPayment.specialty}</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Data:</span><span className="confirmation-value">{selectedDatePayment}/{mesAtual + 1}/{anoAtual}</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Horário:</span><span className="confirmation-value">{selectedHourPayment}</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Tipo:</span><span className="confirmation-value">Teleconsulta</span></div>
                                    <div className="confirmation-row"><span className="confirmation-label">Valor pago:</span><span className="confirmation-value highlight">R$ {selectedDoctorPayment.price.toFixed(2)}</span></div>
                                </div>

                                <div className="confirmation-footer">
                                    <p>Você receberá o link da consulta por e-mail</p>
                                </div>
                                
                                <button className="confirm-btn" onClick={closePaymentModal} style={{ marginTop: '20px', width: '100%' }}>Fechar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL PRESENCIAL */}
            {modalOpen && selectedDoctor && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>✕</button>
                        {!showConfirmationPresencial ? (
                            <>
                                <div className="modal-doctor">
                                    <img src={selectedDoctor.avatar} alt={selectedDoctor.name} />
                                    <div>
                                        <h3>{selectedDoctor.name}</h3>
                                        <p>{selectedDoctor.specialty}</p>
                                        <div className="doctor-rating">
                                            <span className="stars">★★★★★</span>
                                            <span className="rating-value">({selectedDoctor.rating} · {selectedDoctor.reviews} avaliações)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-address">
                                    <strong>Endereço da Clínica</strong>
                                    <p>{selectedDoctor.enderecoCompleto}</p>
                                </div>

                                <div className="modal-calendar-section">
                                    <div className="calendar-header">
                                        <h4>ESCOLHA A DATA</h4>
                                        <div className="month-navigation">
                                            <button onClick={mesAnterior} className="month-nav-btn">◀</button>
                                            <span className="month-name">{getNomeMes()}</span>
                                            <button onClick={proximoMes} className="month-nav-btn">▶</button>
                                        </div>
                                    </div>
                                    <div className="calendar">
                                        <div className="calendar-weekdays">
                                            {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map(day => (
                                                <span key={day}>{day}</span>
                                            ))}
                                        </div>
                                        <div className="calendar-dates">
                                            {Array.from({ length: new Date(anoAtual, mesAtual + 1, 0).getDate() }, (_, i) => i + 1).map((date) => {
                                                const isDisponivel = selectedDoctor?.diasDisponiveis?.includes(date);
                                                const isSelected = selectedDatePresencial[selectedDoctor?.id] === date;
                                                
                                                return (
                                                    <div
                                                        key={date}
                                                        className={`date ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => isDisponivel && handleSelectDatePresencial(selectedDoctor.id, date)}
                                                        style={{
                                                            cursor: isDisponivel ? 'pointer' : 'not-allowed',
                                                            opacity: isDisponivel ? 1 : 0.4,
                                                            backgroundColor: isSelected ? '#2c7da0' : 'transparent',
                                                            color: isSelected ? 'white' : '#333',
                                                            textDecoration: isDisponivel ? 'none' : 'line-through'
                                                        }}
                                                    >
                                                        {date}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {selectedDatePresencial[selectedDoctor?.id] && (
                                    <div className="modal-hours-section">
                                        <h4>SELECIONE O HORÁRIO</h4>
                                        <div className="hours-grid">
                                            {horariosDisponiveis[selectedDoctor?.id]?.length > 0 ? (
                                                horariosDisponiveis[selectedDoctor?.id].map((hour) => (
                                                    <button
                                                        key={hour}
                                                        className={`hour-btn ${selectedHourPresencial[selectedDoctor?.id] === hour ? 'selected' : ''}`}
                                                        onClick={() => handleSelectHourPresencial(selectedDoctor.id, hour)}
                                                    >
                                                        {hour}
                                                    </button>
                                                ))
                                            ) : (
                                                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>
                                                    Nenhum horário disponível para esta data
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    className="confirm-btn"
                                    onClick={() => handleConfirmPresencial(selectedDoctor)}
                                    disabled={!selectedDatePresencial[selectedDoctor?.id] || !selectedHourPresencial[selectedDoctor?.id]}
                                    style={{
                                        marginTop: '20px',
                                        width: '100%',
                                        opacity: (!selectedDatePresencial[selectedDoctor?.id] || !selectedHourPresencial[selectedDoctor?.id]) ? 0.5 : 1,
                                        cursor: (!selectedDatePresencial[selectedDoctor?.id] || !selectedHourPresencial[selectedDoctor?.id]) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Confirmar Agendamento
                                </button>
                            </>
                        ) : (
                            <div className="confirmation-message">
                                <div className="success-animation">
                                    <div className="checkmark">✓</div>
                                </div>
                                <h2>Consulta Agendada!</h2>
                                <p className="confirmation-subtitle">Sua consulta presencial foi marcada com sucesso</p>
                                
                                <div className="confirmation-card">
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Médico:</span>
                                        <span className="confirmation-value">{confirmationDetailsPresencial.doctorName}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Especialidade:</span>
                                        <span className="confirmation-value">{confirmationDetailsPresencial.specialty}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Data:</span>
                                        <span className="confirmation-value">{confirmationDetailsPresencial.date}/{mesAtual + 1}/{anoAtual}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Horário:</span>
                                        <span className="confirmation-value">{confirmationDetailsPresencial.hour}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Local:</span>
                                        <span className="confirmation-value">{confirmationDetailsPresencial.address}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Valor:</span>
                                        <span className="confirmation-value highlight">R$ {confirmationDetailsPresencial.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="confirmation-footer">
                                    <p>Você receberá um lembrete por e-mail</p>
                                </div>
                                
                                <button className="confirm-btn" onClick={closeModal} style={{ marginTop: '20px', width: '100%' }}>Fechar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul>
                        <li><img src={certinho} className="certo" alt="check"/> Teleconsulta 24h</li>
                        <li><img src={certinho} className="certo" alt="check"/> Agendamento online</li>
                        <li><img src={certinho} className="certo" alt="check"/> Especialidades</li>
                        <li><img src={certinho} className="certo" alt="check"/> Perguntas frequentes</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Virtual Health</h4>
                    <p>Seu médico virtual 24h</p>
                    <div className="social">
                        <img src={wats} className="img" alt="whatsapp"/>
                        <img src={insta} alt="instagram"/>
                    </div>
                </div>
                <div className="footer-column">
                    <h4>Contato</h4>
                    <ul>
                        <li><img src={local} className="certo" alt="local"/> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} className="certo" alt="telefone"/> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} className="certo" alt="email"/> Email: Virtualhealth@gmail.com</li>
                        <li><img src={tempo} className="certo" alt="horario"/> Horário: 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}