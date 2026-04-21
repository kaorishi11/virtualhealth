import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Clinicas.css";

// Imagens
import logo from "../images/logo.png";
import email from '../images/login (2).png';
import lupa from "../images/lupa.png";
import marta from "../images/med.png";
import andrey from "../images/medi.png";
import sheila from "../images/douto.png";
import iconlocal from "../images/iconlocal.png";
import certinho from "../images/certinho.png";
import wats from "../images/wats.png";
import insta from "../images/insta.png";
import local from "../images/local.png";
import tell from "../images/tel.png";
import gmail from "../images/gmail.png";
import tempo from "../images/tempo.png";

export default function Clinicas() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [showAddress, setShowAddress] = useState({});
    const [showTeleconsulta, setShowTeleconsulta] = useState({});

    // Dados dos médicos com informações completas
    const doctors = [
        {
            id: 1,
            name: "Dra Marta",
            specialty: "Dentista",
            rating: 4.9,
            reviews: 38,
            enderecoCompleto: "Clínica Sul – Santa Casa São José dos Campos, Rua XV de Novembro, 123 - Centro, São José dos Campos - SP",
            price: 90.00,
            teleconsulta: true,
            avatar: marta,
            coordinates: { lat: -23.1896, lng: -45.8841 }, // São José dos Campos
            enderecoUrl: "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Santa+Casa+São+José+dos+Campos",
        },
        {
            id: 2,
            name: "Dr Andrey",
            specialty: "Oftalmologista",
            rating: 4.9,
            reviews: 38,
            enderecoCompleto: "Clínica Vision Care, Av. Dr. Nelson D'Ávila, 500 - Jardim São Dimas, São José dos Campos - SP",
            price: 60.00,
            teleconsulta: true,
            avatar: andrey,
            coordinates: { lat: -23.1847, lng: -45.8865 },
            enderecoUrl: "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Av.+Dr.+Nelson+D'Ávila+500+São+José+dos+Campos",
        },
        {
            id: 3,
            name: "Dra Sheila",
            specialty: "Ginecologista",
            rating: 4.9,
            reviews: 38,
            enderecoCompleto: "R Cal João Dias Guimarães, 45 - Centro, Caçapava - SP",
            price: 60.00,
            teleconsulta: true,
            avatar: sheila,
            coordinates: { lat: -23.1005, lng: -45.7072 }, // Caçapava
            enderecoUrl: "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Rua+Cal+João+Dias+Guimarães+Caçapava",
        },
    ];

    const horarios = ["09H30", "13H30", "11H00", "15H00"];
    const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    const generateCalendarDates = () => {
        const days = [];
        for (let i = 1; i <= 28; i++) {
            days.push({ day: i, fullDate: `2026-03-${i < 10 ? "0" + i : i}` });
        }
        return days;
    };
    const calendarDays = generateCalendarDates();

    const filteredDoctors = doctors.filter(
        (doc) =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectDoctor = (doc) => {
        setSelectedDoctor(doc);
        setSelectedDate(null);
        setSelectedHour(null);
    };

    const handleSelectDate = (dateObj) => {
        setSelectedDate(dateObj);
        setSelectedHour(null);
    };

    const handleSelectHour = (hour) => {
        setSelectedHour(hour);
        alert(`Consulta agendada com ${selectedDoctor?.name}\n Dia: ${selectedDate?.day}/03/2026\n⏰ Horário: ${hour}\n💰 Valor: R$ ${selectedDoctor?.price.toFixed(2)}`);
    };

    const toggleAddress = (doctorId) => {
        setShowAddress(prev => ({ ...prev, [doctorId]: !prev[doctorId] }));
        setShowTeleconsulta(prev => ({ ...prev, [doctorId]: false }));
    };

    const toggleTeleconsulta = (doctorId) => {
        setShowTeleconsulta(prev => ({ ...prev, [doctorId]: !prev[doctorId] }));
        setShowAddress(prev => ({ ...prev, [doctorId]: false }));
    };

    return (
        <div>
            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logo" />

                <div className="nav-links">
                    <Link to="/home-paciente">Início</Link>
                    <Link to="/clinicas">Clínicas</Link>
                    <Link to="/contato">Contato</Link>
                </div>

                <button className="consulta-btn" onClick={() => navigate("/chat")}>
                    Fazer Consulta
                </button>

                <Link to="/perfil">
                    <img src={email} className="email" />
                </Link>
            </div>

            {/* HERO */}
            <div className="hero-clinicas">
                <h1><span>CONHEÇA TODAS AS <br />
                    CLÍNICAS</span> PRESENCIAIS</h1>
                <p>Encontre especialistas próximos a você e agende sua consulta.</p>
            </div>

            {/* CONTEÚDO */}
            <div className="main-content">
                <div className="search-section">
                    <div className="section-header">
                        <h2>Clínicas e especialistas para você</h2>
                        <hr />
                    </div>

                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <img src={lupa} alt="buscar" />
                            <input
                                type="text"
                                placeholder="Procure clínicas ou especialistas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-tags">
                            <span className="filter-tag active">Especialista</span>
                            <span className="filter-tag">Caçapava, São Paulo - SP</span>
                        </div>
                    </div>
                </div>

                <hr className="hr"/>

                {/* GRID MÉDICOS */}
                <div className="doctors">
                    {filteredDoctors.map((doc) => (
                        <div className="doctor-card" key={doc.id}>

    {/* ESQUERDA */}
    <div className="doctor-left">
        <div className="doctor-header">
            <div className="doctor-avatar">
                <img src={doc.avatar} alt={doc.name} />
            </div>

            <div className="doctor-info">
                <h3>{doc.name}</h3>
                <div className="doctor-specialty">{doc.specialty}</div>
                <div className="doctor-rating">
                    ⭐ {doc.rating} ({doc.reviews} avaliações)
                </div>
            </div>
        </div>

        <div className="buttons-row">
            <button onClick={() => toggleAddress(doc.id)}>
                Endereço
            </button>

            <button onClick={() => toggleTeleconsulta(doc.id)}>
                Teleconsulta
            </button>
        </div>

        <p>{doc.enderecoCompleto}</p>

        <div className="price-value">
            Consulta: R${doc.price.toFixed(2)}
        </div>

        <button className="btn-schedule">
            Agendar Consulta
        </button>
    </div>

    {/* DIREITA */}
    <div className="doctor-right">

        {showAddress[doc.id] && (
            <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${doc.coordinates.lng - 0.01},${doc.coordinates.lat - 0.01},${doc.coordinates.lng + 0.01},${doc.coordinates.lat + 0.01}&layer=mapnik&marker=${doc.coordinates.lat},${doc.coordinates.lng}`}
                title="mapa"
            />
        )}

        {showTeleconsulta[doc.id] && (
            <div className="teleconsulta-box">
                <p>Teleconsulta disponível</p>
                <p>⏱30 a 50 minutos</p>
                <p>Dados protegidos</p>
                <p>Celular ou computador</p>
            </div>
        )}

    </div>
</div>
                    ))}
                </div>

                {/* CALENDÁRIO DE AGENDAMENTO */}
                {selectedDoctor && (
                    <div className="calendar-wrapper">
                        <h3 style={{ marginBottom: "20px" }}>Agendar Consulta - {selectedDoctor.name}</h3>
                        <div className="calendar-flex">
                            <div className="calendar-section">
                                <h4>ESCOLHA A DATA</h4>
                                <div className="week-row">
                                    {weekDays.map(d => <span key={d}>{d}</span>)}
                                </div>
                                <div className="dates-row">
                                    {calendarDays.map((dateObj, idx) => (
                                        <div
                                            key={idx}
                                            className={`date-item ${selectedDate?.day === dateObj.day ? "selected" : ""}`}
                                            onClick={() => handleSelectDate(dateObj)}
                                        >
                                            {dateObj.day}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="calendar-section">
                                <h4>SELECIONE O HORÁRIO</h4>
                                <div className="hours-list">
                                    {horarios.map((hour) => (
                                        <button
                                            key={hour}
                                            className={`hour-btn ${selectedHour === hour ? "selected" : ""}`}
                                            onClick={() => handleSelectHour(hour)}
                                            disabled={!selectedDate}
                                            style={{ opacity: !selectedDate ? 0.5 : 1 }}
                                        >
                                            {hour}
                                        </button>
                                    ))}
                                </div>
                                {!selectedDate && (
                                    <p style={{ fontSize: "12px", marginTop: "12px", color: "#dc2626" }}>
                                        * Selecione uma data primeiro
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul>
                        <li><img src={certinho} alt="check" /> Teleconsulta 24h</li>
                        <li><img src={certinho} alt="check" /> Agendamento online</li>
                        <li><img src={certinho} alt="check" /> Especialidades</li>
                        <li><img src={certinho} alt="check" /> Perguntas frequentes</li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Virtual Health</h4>
                    <p>Seu médico virtual 24h</p>
                    <div className="social-icons">
                        <img src={wats} alt="whatsapp" />
                        <img src={insta} alt="instagram" />
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Contato</h4>
                    <ul>
                        <li><img src={local} alt="local" /> Endereço: Sesi Caçapava SP</li>
                        <li><img src={tell} alt="telefone" /> Telefone: (12) 9966-9732</li>
                        <li><img src={gmail} alt="email" /> Email: VirtualHealthAssistencia@gmail.com</li>
                        <li><img src={tempo} alt="horario" /> Horário: Equipe 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}