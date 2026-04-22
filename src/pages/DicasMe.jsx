import { useState } from 'react';
import { Link } from 'react-router-dom';

import logo from '../images/logo.png';
import doutora from '../images/med.png';
import planilha from '../images/icon2.png';
import planisaude from '../images/planisaude.png';
import atencao from '../images/atencao.png';

import '../styles/DicasMe.css';

export default function DicasMe() {
    const [novaDica, setNovaDica] = useState('');
    const [dicas, setDicas] = useState([
        {
            id: 1,
            texto: "O ideal é escovar os dentes pelo menos três vezes ao dia, principalmente antes de dormir, pois durante a noite a produção de saliva diminui e as bactérias se proliferam com mais facilidade.",
            autor: "Dra Marta",
            profissao: "Dentista",
            data: "15/02/2026"
        },
        {
            id: 2,
            texto: "É fundamental visitar o dentista regularmente, pelo menos a cada seis meses, para fazer avaliações e limpezas profissionais. Pequenos cuidados diários fazem uma grande diferença na saúde do seu sorriso.",
            autor: "Dra Marta",
            profissao: "Dentista",
            data: "10/02/2026"
        }
    ]);

    const handlePublicarDica = () => {
        if (novaDica.trim() === '') {
            alert('Por favor, escreva uma dica antes de publicar!');
            return;
        }

        const novaDicaObj = {
            id: Date.now(),
            texto: novaDica,
            autor: "Dra Marta",
            profissao: "Dentista",
            data: new Date().toLocaleDateString('pt-BR')
        };

        setDicas([novaDicaObj, ...dicas]);
        setNovaDica('');
        alert('Dica publicada com sucesso!');
    };

    return (
        <div className="dicas-container">
            {/* SIDEBAR */}
            <div className='sidebar'>
                <div className="sidebar-logo">
                    <img src={logo} alt='Logo' className='logo-medico' />
                </div>
                
                <Link to="/perfil-medico" className="perfil-link">
                    <div className='perfil-medico'>
                        <img src={doutora} alt='Doutora' className='avatar-medico' />
                        <h2>Dra. Marta</h2>
                        <p>Dentista</p>
                    </div>
                </Link>

                <div className='menu-lateral'>
                    <div className='menu-section'>
                        <h3>GERAL</h3>
                        <ul>
                            <li><Link to="/home-medico">Visão geral</Link></li>
                            <li><Link to="/agenda"><img src={planilha} alt="icon"/>Minha agenda</Link></li>
                        </ul>
                    </div>

                    <div className='menu-section'>
                        <h3>ATENDIMENTO</h3>
                        <ul>
                            <li><Link to="/consulta">Iniciar consulta</Link></li>
                            <li className="active"><Link to="/dicas"><img src={planisaude} alt="icon"/>Dicas de saúde</Link></li>
                        </ul>
                    </div>
                
                    <div className="logout">
                        <Link to="/">Desconectar</Link>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className='main-content'>
                <div className='dicas-header'>
                    <h1>DICAS DE SAÚDE</h1>
                </div>

                {/* ÁREA DE PUBLICAÇÃO DE DICAS */}
                <div className='publicar-dica'>
                    <h2>PUBLICAR DICAS</h2>
                    <div className='editor-area'>
                        <textarea 
                            placeholder="Escrever..."
                            value={novaDica}
                            onChange={(e) => setNovaDica(e.target.value)}
                            rows="4"
                        />
                        <button className="btn-publicar" onClick={handlePublicarDica}>
                            Publicar
                        </button>
                    </div>
                </div>

                {/* LISTA DE ÚLTIMAS DICAS */}
                <div className='ultimas-dicas'>
                    <h2>ÚLTIMAS DICAS PUBLICADAS</h2>
                    <div className='dicas-lista'>
                        {dicas.map((dica) => (
                            <div key={dica.id} className='dica-card'>
                                <p className="dica-texto">{dica.texto}</p>
                                <div className="dica-autor">
                                    <span className="autor-nome">{dica.autor}</span>
                                    <span className="autor-profissao">{dica.profissao}</span>
                                    <span className="dica-data">{dica.data}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}