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

export default function Clinicas() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
    const [selectedLocal, setSelectedLocal] = useState("Caçapava, São Paulo - SP");
    const [activeTab, setActiveTab] = useState({});
    
    // States para Teleconsulta (agendamento direto no card)
    const [selectedDateTele, setSelectedDateTele] = useState({});
    const [selectedHourTele, setSelectedHourTele] = useState({});
    const [showConfirmationTele, setShowConfirmationTele] = useState(false);
    const [confirmationDetailsTele, setConfirmationDetailsTele] = useState({});
    const [selectedDoctorTele, setSelectedDoctorTele] = useState(null);
    
    // States para Presencial (modal)
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDatePresencial, setSelectedDatePresencial] = useState({});
    const [selectedHourPresencial, setSelectedHourPresencial] = useState({});
    const [showConfirmationPresencial, setShowConfirmationPresencial] = useState(false);
    const [confirmationDetailsPresencial, setConfirmationDetailsPresencial] = useState({});

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

    // Handlers para Teleconsulta (direto no card)
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

const handleAgendarTeleconsulta = (doc) => {
    if (selectedDateTele[doc.id] && selectedHourTele[doc.id]) {
        setConfirmationDetailsTele({
            doctorName: doc.name,
            specialty: doc.specialty,
            date: selectedDateTele[doc.id],
            hour: selectedHourTele[doc.id],
            price: doc.price,
            type: "Teleconsulta",
            platform: "Virtual Health",
            duration: "30 a 50 minutos"
        });
        setSelectedDoctorTele(doc);
        setShowConfirmationTele(true);
        // Removeu o setTimeout
    } else {
        alert("Por favor, selecione uma data e horário primeiro!");
    }
};

    // Handlers para Presencial (modal)
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
        // Removeu o setTimeout - o modal continua aberto mostrando a confirmação
    } else {
        alert("Por favor, selecione uma data e horário primeiro!");
    }
};

    const handleAgendar = (doc) => {
        if (activeTab[doc.id] === 'teleconsulta') {
            handleAgendarTeleconsulta(doc);
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

    // Fechar confirmação da teleconsulta
    const closeTeleConfirmation = () => {
        setShowConfirmationTele(false);
        setSelectedDateTele({});
        setSelectedHourTele({});
        setConfirmationDetailsTele({});
        setSelectedDoctorTele(null);
    };

    return (
        <div>
            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logoclinicas" alt="logo" />
                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                </div>
                <button className="consulta-btn" onClick={() => navigate("/chat")}>
                    Fazer Consulta
                </button>
            </div>

            {/* HERO */}
            <div className="hero-clinicas">
                <h1><span>CONHEÇA TODAS AS <br />CLÍNICAS</span> PRESENCIAIS</h1>
                <p>Encontre especialistas próximos a você e agende sua consulta.</p>
            </div>

            <div className="main-content">
                {/* SEÇÃO COM TÍTULO */}
                <div className="search-header">
                    <h2>Clínicas e especialistas para você</h2>
                    <hr />
                </div>

                {/* BARRA DE BUSCA COM FILTROS */}
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
                        <option value="">Especialista ▼</option>
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

                {/* CARDS */}
                <div className="doctors">
                    {filteredDoctors.map((doc) => (
                        <div className="doctor-card" key={doc.id}>
                            {/* LADO ESQUERDO - INFORMAÇÕES DO MÉDICO + BOTÕES */}
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

                                {/* BOTÕES PRESENCIAL E TELECONSULTA */}
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

                                <div className="address-section">
                                    <strong>Endereço</strong>
                                    <p>Teleconsulta</p>
                                    <p className="address-full">{doc.enderecoCompleto}</p>
                                </div>

                                {/* INFORMAÇÕES DA TELECONSULTA */}
                                {activeTab[doc.id] === 'teleconsulta' && (
                                    <div className="tele-info-left">
                                        <p>Duração média: 30 a 50 minutos</p>
                                        <p>Dados protegidos pela LGPD</p>
                                        <p>Acesse pelo celular ou computador</p>
                                    </div>
                                )}

                                <div className="price-value">
                                    Consulta: <strong>R${doc.price.toFixed(2)}</strong>
                                </div>

                                <button 
                                    className="btn-schedule"
                                    onClick={() => handleAgendar(doc)}
                                >
                                    Agendar Consulta
                                </button>
                            </div>

                            {/* LADO DIREITO - CONTEÚDO DINÂMICO */}
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
                                                {["08H30 DA MANHÃ", "13H30 DA TARDE", "19H00 DA NOITE", "15H00 DA TARDE"].map(hour => (
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

            {/* MODAL PARA PRESENCIAL */}
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
                                        {["08H30 DA MANHÃ", "13H30 DA TARDE", "19H00 DA NOITE", "15H00 DA TARDE"].map(hour => (
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
                                    <div className="loader"></div>
                                    <p className="auto-close">Fechando em 3 segundos...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MENSAGEM DE CONFIRMAÇÃO PARA TELECONSULTA (SEM MODAL) */}
            {showConfirmationTele && selectedDoctorTele && (
                <div className="confirmation-overlay" onClick={closeTeleConfirmation}>
                    <div className="confirmation-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="confirmation-close" onClick={closeTeleConfirmation}>✕</button>
                        <div className="success-animation">
                            <div className="checkmark">✓</div>
                        </div>
                        <h2>Teleconsulta Agendada!</h2>
                        <p className="confirmation-subtitle">Sua consulta online foi marcada com sucesso</p>
                        
                        <div className="confirmation-card">
                            <div className="confirmation-row">
                                <span className="confirmation-label">Médico:</span>
                                <span className="confirmation-value">{confirmationDetailsTele.doctorName}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="confirmation-label">Especialidade:</span>
                                <span className="confirmation-value">{confirmationDetailsTele.specialty}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="confirmation-label">Data:</span>
                                <span className="confirmation-value">{confirmationDetailsTele.date}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="confirmation-label">Horário:</span>
                                <span className="confirmation-value">{confirmationDetailsTele.hour}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="confirmation-label">Plataforma:</span>
                                <span className="confirmation-value">{confirmationDetailsTele.platform}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="confirmation-label">⏱Duração:</span>
                                <span className="confirmation-value">{confirmationDetailsTele.duration}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="confirmation-label">Valor:</span>
                                <span className="confirmation-value highlight">R$ {confirmationDetailsTele.price.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="confirmation-footer">
                            <p>Você receberá o link da consulta por e-mail</p>
                        </div>
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
                                    <img src={wats} className="img"/>
                                    <img src={insta} />
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