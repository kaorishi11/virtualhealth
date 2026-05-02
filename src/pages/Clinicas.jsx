import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Clinicas.css";

// Imagens
import logo from "../images/logo.png";
import lupa from "../images/lupa.png";
import marta from "../images/med.png";
import andrey from "../images/medi.png";
import sheila from "../images/douto.png";
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

export default function Clinicas() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
    const [selectedLocal, setSelectedLocal] = useState("Caçapava, São Paulo - SP");
    const [activeTab, setActiveTab] = useState({});
    
    // STATES DAS NOTIFICAÇÕES
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Nova consulta agendada",
            message: "Sua consulta com Dr. Lucas Ferraz foi agendada para amanhã às 14h.",
            time: "Há 2 horas",
            read: false,
            type: "consulta"
        },
        {
            id: 2,
            title: "Link para teleconsulta",
            message: "Copie e cole este link para acessar sua teleconsulta: https://virtualhealth.com/teleconsulta/12345",
            time: "2 min atrás",
            read: true,
            type: "teleconsulta"
        },
        {
            id: 3,
            title: "Confirme sua consulta",
            message: "Por favor, confirme sua presença na consulta de amanhã.",
            time: "Ontem",
            read: true,
            type: "lembrete"
        },
        {
            id: 4,
            title: "Novo especialista disponível",
            message: "Agora você pode agendar consultas com Drª Ana Souza - Neurologista.",
            time: "2 dias atrás",
            read: true,
            type: "sistema"
        }
    ]);
    
    // States para Teleconsulta (com pagamento)
    const [selectedDateTele, setSelectedDateTele] = useState({});
    const [selectedHourTele, setSelectedHourTele] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedDoctorPayment, setSelectedDoctorPayment] = useState(null);
    const [selectedDatePayment, setSelectedDatePayment] = useState(null);
    const [selectedHourPayment, setSelectedHourPayment] = useState(null);
    const [pixCopiado, setPixCopiado] = useState(false);
    const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
    const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);
    
    // States para Presencial (sem pagamento - agendamento direto)
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDatePresencial, setSelectedDatePresencial] = useState({});
    const [selectedHourPresencial, setSelectedHourPresencial] = useState({});
    const [showConfirmationPresencial, setShowConfirmationPresencial] = useState(false);
    const [confirmationDetailsPresencial, setConfirmationDetailsPresencial] = useState({});

    // FUNÇÕES DAS NOTIFICAÇÕES
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const closeNotifications = () => {
        setShowNotifications(false);
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'consulta': return '🩺';
            case 'lembrete': return '⏰';
            case 'teleconsulta': return '💻';
            case 'sistema': return '📢';
            default: return '📌';
        }
    };

    const getTypeClass = (type) => {
        switch(type) {
            case 'consulta': return 'consulta';
            case 'lembrete': return 'lembrete';
            case 'teleconsulta': return 'teleconsulta';
            case 'sistema': return 'sistema';
            default: return 'sistema';
        }
    };

    const doctors = [
        {
            id: 1,
            name: "Dra Marta",
            specialty: "Dentista",
            rating: 4.9,
            reviews: 38,
            enderecoCompleto: "Clínica Sul – Santa Casa São José dos Campos",
            price: 90.00,
            avatar: marta,
            coordinates: { lat: -23.1896, lng: -45.8841 }
        },
        {
            id: 2,
            name: "Dr Andrey",
            specialty: "Oftalmologista",
            rating: 4.9,
            reviews: 38,
            enderecoCompleto: "Clínica Vision Care",
            price: 60.00,
            avatar: andrey,
            coordinates: { lat: -23.1847, lng: -45.8865 }
        },
        {
            id: 3,
            name: "Dra Sheila",
            specialty: "Ginecologista",
            rating: 4.9,
            reviews: 38,
            enderecoCompleto: "R. Cel. João Dias Guimarães - Centro, Caçapava",
            price: 60.00,
            avatar: sheila,
            coordinates: { lat: -23.1005, lng: -45.7072 }
        }
    ];

    const filteredDoctors = doctors.filter(
        (doc) =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedEspecialidade === "" || doc.specialty === selectedEspecialidade)
    );

    // Handlers para Teleconsulta (com pagamento)
    const handleSelectDateTele = (doctorId, date) => {
        setSelectedDateTele(prev => ({
            ...prev,
            [doctorId]: date
        }));
    };

    const handleSelectHourTele = (doctorId, hour) => {
        setSelectedHourTele(prev => ({
            ...prev,
            [doctorId]: hour
        }));
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

    const handleCopiarPix = (codigo) => {
        navigator.clipboard.writeText(codigo);
        setPixCopiado(true);
        setTimeout(() => setPixCopiado(false), 2000);
    };

    const gerarCodigoPix = (doctorName) => {
        return `pix.virtualhealth.com/${doctorName.toLowerCase().replace(/\s/g, '')}${Date.now()}`;
    };

    const handleConfirmarPagamento = () => {
        setPagamentoConfirmado(true);
        setTimeout(() => {
            setAgendamentoConfirmado(true);
        }, 1500);
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

    // Handlers para Presencial (sem pagamento - agendamento direto)
    const handleSelectDatePresencial = (doctorId, date) => {
        setSelectedDatePresencial(prev => ({
            ...prev,
            [doctorId]: date
        }));
    };

    const handleSelectHourPresencial = (doctorId, hour) => {
        setSelectedHourPresencial(prev => ({
            ...prev,
            [doctorId]: hour
        }));
    };

    const handleConfirmPresencial = (doc) => {
        if (selectedDatePresencial[doc.id] && selectedHourPresencial[doc.id]) {
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

    const closeModal = () => {
        setModalOpen(false);
        setShowConfirmationPresencial(false);
        setSelectedDatePresencial({});
        setSelectedHourPresencial({});
        setConfirmationDetailsPresencial({});
        setSelectedDoctor(null);
    };

    return (
        <div>
            {/* HEADER COM NOTIFICAÇÕES */}
            <div className="header">
                <img src={logo} className="logopaciente" alt="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                    <Link to="/teleconsulta">Teleconsulta</Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="notification-wrapper" onClick={() => setShowNotifications(true)}>
                        <div className="notification-icon">
                            🔔
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </div>
                    </div>
                    
                    <button className="consulta-btn" onClick={() => navigate("/chat")}>
                        Fazer Consulta
                    </button>
                </div>
            </div>

            {/* MODAL DE NOTIFICAÇÕES */}
            {showNotifications && (
                <div className="notification-modal-overlay" onClick={closeNotifications}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notification-modal-header">
                            <h3>🔔 Notificações</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {unreadCount > 0 && (
                                    <button className="mark-all-btn" onClick={markAllAsRead}>
                                        Marcar todas
                                    </button>
                                )}
                                <button className="close-modal-btn" onClick={closeNotifications}>
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif.id)}
                                    >
                                        <div className={`notification-icon-circle ${getTypeClass(notif.type)}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-notifications">
                                    <div className="no-notifications-icon">📭</div>
                                    <p>Nenhuma notificação no momento</p>
                                </div>
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
                        <input
                            placeholder="Procure clínicas ou especialistas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="filter-select"
                        value={selectedEspecialidade}
                        onChange={(e) => setSelectedEspecialidade(e.target.value)}
                    >
                        <option value="">Especialista</option>
                        <option value="Dentista">Dentista</option>
                        <option value="Oftalmologista">Oftalmologista</option>
                        <option value="Ginecologista">Ginecologista</option>
                    </select>
                    
                    <input 
                        type="text" 
                        className="location-input"
                        placeholder="Caçapava, São Paulo - SP"
                        value={selectedLocal}
                        onChange={(e) => setSelectedLocal(e.target.value)}
                    />
                </div>

                <hr className="hr"/>

                {/* CARDS */}
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
                                    <button 
                                        className={`tab-btn-left ${activeTab[doc.id] !== 'teleconsulta' ? 'active' : ''}`}
                                        onClick={() => setActiveTab(prev => ({ ...prev, [doc.id]: 'presencial' }))}
                                    >
                                        Presencial
                                    </button>
                                    <button 
                                        className={`tab-btn-left ${activeTab[doc.id] === 'teleconsulta' ? 'active' : ''}`}
                                        onClick={() => setActiveTab(prev => ({ ...prev, [doc.id]: 'teleconsulta' }))}
                                    >
                                        Teleconsulta
                                    </button>
                                </div>

                                {activeTab[doc.id] === 'presencial' && (
                                    <div className="address-section">
                                        <p className="address-full"><img src={iconlocal} alt="Ícone de localização" />{doc.enderecoCompleto}</p>
                                    </div>
                                )}

                                {activeTab[doc.id] === 'teleconsulta' && (
                                    <div className="tele-info-left">
                                        <p><img src={icontempo} alt="Ícone de tempo" /> Duração média: 30 a 50 minutos</p>
                                        <p><img src={iconesc} alt="Ícone de segurança" /> Dados protegidos pela LGPD</p>
                                        <p><img src={iconcell} alt="Ícone de celular" /> Acesse pelo celular ou computador</p>
                                    </div>
                                )}

                                <div className="price-value">
                                    Consulta: <strong>R${doc.price.toFixed(2)}</strong>
                                </div>

                                <button 
                                    className="btn-schedule"
                                    onClick={() => handleAgendar(doc)}
                                >
                                    {activeTab[doc.id] === 'teleconsulta' ? 'Pagar Consulta' : 'Agendar Consulta'}
                                </button>
                            </div>

                            <div className="doctor-right">
                                {activeTab[doc.id] === 'teleconsulta' ? (
                                    <div className="teleconsulta-content">
                                        <div className="calendar-section">
                                            <h4>ESCOLHA A DATA</h4>
                                            <div className="calendar">
                                                <div className="calendar-weekdays">
                                                    {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map(day => (
                                                        <span key={day}>{day}</span>
                                                    ))}
                                                </div>
                                                <div className="calendar-dates">
                                                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((date) => (
                                                        <div
                                                            key={date}
                                                            className={`date ${selectedDateTele[doc.id] === date ? 'selected' : ''}`}
                                                            onClick={() => handleSelectDateTele(doc.id, date)}
                                                        >
                                                            {date}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hours-section">
                                            <h4>SELECIONE O HORÁRIO</h4>
                                            <div className="hours-grid">
                                                {["08H30", "13H30", "19H00", "15H00"].map(hour => (
                                                    <button
                                                        key={hour}
                                                        className={`hour-btn ${selectedHourTele[doc.id] === hour ? 'selected' : ''}`}
                                                        onClick={() => handleSelectHourTele(doc.id, hour)}
                                                    >
                                                        {hour}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="presencial-content">
                                        <div className="nearby-dates">
                                            <h4>Consultas Presenciais</h4>
                                            <div className="dates-row">
                                                <div className="date-badge">HOJE<br/>27/02</div>
                                                <div className="date-badge">AMANHÃ<br/>28/02</div>
                                                <div className="date-badge">DOMINGO<br/>01/03</div>
                                                <div className="date-badge">SEGUNDA<br/>02/03</div>
                                            </div>
                                        </div>

                                        <div className="location-section">
                                            <h4>Localização</h4>
                                            <div className="map-placeholder">
                                                <iframe
                                                    title={`map-${doc.id}`}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${doc.coordinates.lng - 0.015},${doc.coordinates.lat - 0.015},${doc.coordinates.lng + 0.015},${doc.coordinates.lat + 0.015}&marker=${doc.coordinates.lat},${doc.coordinates.lng}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL DE PAGAMENTO APENAS PARA TELECONSULTA */}
            {showPaymentModal && selectedDoctorPayment && (
                <div className="modal-overlay" onClick={closePaymentModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={closePaymentModal}>✕</button>
                        
                        {!agendamentoConfirmado ? (
                            <>
                                <div className="modal-doctor">
                                    <img src={selectedDoctorPayment.avatar} alt={selectedDoctorPayment.name} />
                                    <div>
                                        <h3>{selectedDoctorPayment.name}</h3>
                                        <p>{selectedDoctorPayment.specialty}</p>
                                        <p style={{ fontSize: '12px', color: '#2c7da0', marginTop: '4px' }}>Teleconsulta</p>
                                    </div>
                                </div>

                                <div className="confirmation-card" style={{ margin: '0 24px 20px 24px' }}>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Data:</span>
                                        <span className="confirmation-value">{selectedDatePayment}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Horário:</span>
                                        <span className="confirmation-value">{selectedHourPayment}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Valor:</span>
                                        <span className="confirmation-value highlight">R$ {selectedDoctorPayment.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                {!pagamentoConfirmado ? (
                                    <>
                                        <div className="qr-section">
                                            <div className="qr-placeholder">
                                                <div className="qr-fake">
                                                    <div className="qr-center">💊</div>
                                                </div>
                                                <div className="qr-value">R$ {selectedDoctorPayment.price.toFixed(2)}</div>
                                                <p className="qr-instruction">Escaneie o QR Code para pagar</p>
                                            </div>

                                            <div className="pix-code-section">
                                                <span className="pix-code-label">📱 Código PIX (Copiar e colar)</span>
                                                <div className="pix-code-container">
                                                    <input 
                                                        type="text" 
                                                        className="pix-code" 
                                                        value={gerarCodigoPix(selectedDoctorPayment.name)}
                                                        readOnly
                                                    />
                                                    <button 
                                                        className={`btn-copiar-pix ${pixCopiado ? 'copiado' : ''}`}
                                                        onClick={() => handleCopiarPix(gerarCodigoPix(selectedDoctorPayment.name))}
                                                    >
                                                        {pixCopiado ? '✓ COPIADO!' : '📋 Copiar'}
                                                    </button>
                                                </div>
                                                <div className="payment-info">
                                                    <p>⚠️ <strong>Pagamento via PIX</strong> - O código pode ser copiado</p>
                                                    <p>Após o pagamento, clique em confirmar</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            className="confirm-btn"
                                            onClick={handleConfirmarPagamento}
                                            style={{ margin: '0 24px 24px 24px', width: 'calc(100% - 48px)' }}
                                        >
                                            💳 Confirmar Pagamento
                                        </button>
                                    </>
                                ) : (
                                    <div className="confirmation-message" style={{ padding: '20px' }}>
                                        <div className="success-animation">
                                            <div className="checkmark">✓</div>
                                        </div>
                                        <h2>Processando Pagamento...</h2>
                                        <div className="loader"></div>
                                        <p className="auto-close">Aguarde, confirmando transação</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="confirmation-message" style={{ padding: '30px 24px' }}>
                                <div className="success-animation">
                                    <div className="checkmark">✓</div>
                                </div>
                                <h2>Teleconsulta Agendada!</h2>
                                <p className="confirmation-subtitle">Sua teleconsulta foi marcada com sucesso</p>
                                
                                <div className="confirmation-card">
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Médico:</span>
                                        <span className="confirmation-value">{selectedDoctorPayment.name}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Especialidade:</span>
                                        <span className="confirmation-value">{selectedDoctorPayment.specialty}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Data:</span>
                                        <span className="confirmation-value">{selectedDatePayment}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Horário:</span>
                                        <span className="confirmation-value">{selectedHourPayment}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Tipo:</span>
                                        <span className="confirmation-value">Teleconsulta</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="confirmation-label">Valor pago:</span>
                                        <span className="confirmation-value highlight">R$ {selectedDoctorPayment.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="confirmation-footer">
                                    <p>Você receberá o link da consulta por e-mail</p>
                                </div>
                                
                                <button className="confirm-btn" onClick={closePaymentModal} style={{ marginTop: '20px', width: '100%' }}>
                                    Fechar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL PARA PRESENCIAL (SEM PAGAMENTO) */}
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
                                    <h4>ESCOLHA A DATA</h4>
                                    <div className="calendar">
                                        <div className="calendar-weekdays">
                                            {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map(day => (
                                                <span key={day}>{day}</span>
                                            ))}
                                        </div>
                                        <div className="calendar-dates">
                                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((date) => (
                                                <div
                                                    key={date}
                                                    className={`date ${selectedDatePresencial[selectedDoctor.id] === date ? 'selected' : ''}`}
                                                    onClick={() => handleSelectDatePresencial(selectedDoctor.id, date)}
                                                >
                                                    {date}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-hours-section">
                                    <h4>SELECIONE O HORÁRIO</h4>
                                    <div className="hours-grid">
                                        {["08H30", "13H30", "19H00", "15H00"].map(hour => (
                                            <button
                                                key={hour}
                                                className={`hour-btn ${selectedHourPresencial[selectedDoctor.id] === hour ? 'selected' : ''}`}
                                                onClick={() => handleSelectHourPresencial(selectedDoctor.id, hour)}
                                            >
                                                {hour}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    className="confirm-btn"
                                    onClick={() => handleConfirmPresencial(selectedDoctor)}
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
                                        <span className="confirmation-value">{confirmationDetailsPresencial.date}</span>
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
                                
                                <button className="confirm-btn" onClick={closeModal} style={{ marginTop: '20px', width: '100%' }}>
                                    Fechar
                                </button>
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
                        <li><img src={certinho} className="certo"/> Teleconsulta 24h</li>
                        <li><img src={certinho} className="certo"/> Agendamento online</li>
                        <li><img src={certinho} className="certo"/> Especialidades</li>
                        <li><img src={certinho} className="certo"/> Perguntas frequentes</li>
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
                        <li><img src={local} className="certo"/> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} className="certo"/> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} className="certo"/> Email: Virtualhealth@gmail.com</li>
                        <li><img src={tempo} className="certo"/> Horário: 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}