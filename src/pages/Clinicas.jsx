import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Clinicas.css";

// Imagens
import logo from "../images/logo.png";
import email from '../images/login (2).png';
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
    const [selectedDate, setSelectedDate] = useState({});
    const [selectedHour, setSelectedHour] = useState({});
    const [showAddress, setShowAddress] = useState({});
    const [showTeleconsulta, setShowTeleconsulta] = useState({});

    // 🔥 NOVOS STATES DO MODAL
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

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
            enderecoCompleto: "Centro, Caçapava",
            price: 60.00,
            avatar: sheila,
            coordinates: { lat: -23.1005, lng: -45.7072 }
        }
    ];

    const horarios = ["09H30", "13H30", "11H00", "15H00"];

    const calendarDays = Array.from({ length: 14 }, (_, i) => ({
        day: i + 1
    }));

    const filteredDoctors = doctors.filter(
        (doc) =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAddress = (id) => {
        setShowAddress(prev => ({ ...prev, [id]: !prev[id] }));
        setShowTeleconsulta(prev => ({ ...prev, [id]: false }));
    };

    const toggleTeleconsulta = (id) => {
        setShowTeleconsulta(prev => ({ ...prev, [id]: !prev[id] }));
        setShowAddress(prev => ({ ...prev, [id]: false }));
    };

    const handleSelectDate = (doctorId, dateObj) => {
        setSelectedDate(prev => ({
            ...prev,
            [doctorId]: dateObj
        }));

        setSelectedHour(prev => ({
            ...prev,
            [doctorId]: null
        }));
    };

    const handleSelectHour = (doctorId, hour) => {
        setSelectedHour(prev => ({
            ...prev,
            [doctorId]: hour
        }));

        const doctor = doctors.find(d => d.id === doctorId);

        alert(`Consulta agendada com ${doctor.name}
Dia: ${selectedDate[doctorId]?.day}/03/2026
⏰ Horário: ${hour}`);
    };

    return (
        <div>

            {/* HEADER */}
            <div className="header">
                <img src={logo} className="logoclinicas" />

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
                <h1><span>CONHEÇA TODAS AS</span> CLÍNICAS PRESENCIAIS</h1>
                <p>Encontre especialistas próximos a você</p>
            </div>

            {/* CONTEÚDO */}
            <div className="main-content">

                {/* BUSCA */}
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <img src={lupa} />
                        <input
                            placeholder="Procure clínicas ou especialistas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* CARDS */}
                <div className="doctors">
                    {filteredDoctors.map((doc) => (
                        <div className="doctor-card" key={doc.id}>

                            {/* ESQUERDA */}
                            <div className="doctor-left">

                                <div className="doctor-header">
                                    <img src={doc.avatar} className="doctor-avatar" />

                                    <div>
                                        <h3>{doc.name}</h3>
                                        <p className="doctor-specialty">{doc.specialty}</p>

                                        <div className="doctor-rating">
                                            {[1,2,3,4,5].map(star => (
                                                <span key={star} className={star <= Math.round(doc.rating) ? "filled" : ""}>★</span>
                                            ))}
                                            <span className="reviews">({doc.reviews})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="buttons-row">
                                    {/* 🔥 AGORA ABRE MODAL */}
                                    <button
                                        onClick={() => {
                                            setSelectedDoctor(doc);
                                            setModalOpen(true);
                                        }}
                                    >
                                        Presencial
                                    </button>

                                    <button
                                        className={showTeleconsulta[doc.id] ? "active" : ""}
                                        onClick={() => toggleTeleconsulta(doc.id)}
                                    >
                                        Teleconsulta
                                    </button>
                                </div>

                                <p>{doc.enderecoCompleto}</p>

                                <div className="price-value">
                                    R$ {doc.price.toFixed(2)}
                                </div>

                                <button className="btn-schedule">
                                    Agendar Consulta
                                </button>
                            </div>

                            {/* DIREITA */}
                            <div className="doctor-right">

                                {showTeleconsulta[doc.id] && (
                                    <div className="teleconsulta-box">
                                        <p>✔ Teleconsulta disponível</p>
                                        <p>⏱ 30 a 50 minutos</p>
                                        <p>🔒 Dados protegidos</p>
                                        <p>📱 Celular ou computador</p>
                                    </div>
                                )}

                                {/* CALENDÁRIO */}
                                <div className="mini-calendar">
                                    <h4>Escolha a data</h4>

                                    <div className="calendar-grid">
                                        {calendarDays.map((d) => (
                                            <div
                                                key={d.day}
                                                className={`mini-date ${selectedDate[doc.id]?.day === d.day ? "selected" : ""}`}
                                                onClick={() => handleSelectDate(doc.id, d)}
                                            >
                                                {d.day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mini-hours">
                                        {horarios.map((h) => (
                                            <button
                                                key={h}
                                                className={`mini-hour ${selectedHour[doc.id] === h ? "selected" : ""}`}
                                                onClick={() => handleSelectHour(doc.id, h)}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔥 MODAL */}
            {modalOpen && selectedDoctor && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>

                        <h2>Agendar Consulta Presencial</h2>

                        <div className="modal-doctor">
                            <img src={selectedDoctor.avatar} />
                            <div>
                                <h3>{selectedDoctor.name}</h3>
                                <p>{selectedDoctor.specialty}</p>
                            </div>
                        </div>

                        <p className="modal-address">{selectedDoctor.enderecoCompleto}</p>

                        <div className="mini-calendar">
                            <h4>Escolha a data</h4>

                            <div className="calendar-grid">
                                {calendarDays.map((d) => (
                                    <div
                                        key={d.day}
                                        className={`mini-date ${
                                            selectedDate[selectedDoctor.id]?.day === d.day ? "selected" : ""
                                        }`}
                                        onClick={() => handleSelectDate(selectedDoctor.id, d)}
                                    >
                                        {d.day}
                                    </div>
                                ))}
                            </div>

                            <div className="mini-hours">
                                {horarios.map((h) => (
                                    <button
                                        key={h}
                                        className={`mini-hour ${
                                            selectedHour[selectedDoctor.id] === h ? "selected" : ""
                                        }`}
                                        onClick={() => handleSelectHour(selectedDoctor.id, h)}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="close-modal" onClick={() => setModalOpen(false)}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul>
                        <li><img src={certinho}/> Teleconsulta 24h</li>
                        <li><img src={certinho}/> Agendamento online</li>
                        <li><img src={certinho}/> Especialidades</li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Virtual Health</h4>
                    <div className="social">
                        <img src={wats}/>
                        <img src={insta}/>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Contato</h4>
                    <ul>
                        <li><img src={local}/> Caçapava SP</li>
                        <li><img src={tell}/> (12) 99999-9999</li>
                        <li><img src={gmail}/> email@gmail.com</li>
                        <li><img src={tempo}/> 24h</li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}