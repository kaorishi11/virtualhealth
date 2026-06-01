import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { supabase } from '../services/supabase';

import login from '../images/login.jpeg';
import medico from '../images/medico.png';
import paciente from '../images/paciente.png';
import olhoAberto from '../images/olho.png';
import olhoFechado from '../images/fechado.png';

import "../styles/Cadastro.css";

export default function Cadastro() {
  const [tipo, setTipo] = useState("paciente");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [genero, setGenero] = useState("");
  const [cep, setCep] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [crm, setCrm] = useState("");
  const [universidade, setUniversidade] = useState("");
  const [anoFormacao, setAnoFormacao] = useState("");
  const [clinicas, setClinicas] = useState([]);
  const [clinicaId, setClinicaId] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  useEffect(() => {
    buscarClinicas();
  }, []);

  async function buscarClinicas() {
    const { data, error } = await supabase
      .from("clinicas")
      .select("*")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    setClinicas(data);
  }

  // Função para validar idade mínima de 18 anos
  const validarIdade = (dataNasc) => {
    if (!dataNasc) return false;
    
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade >= 18;
  };

  async function buscarCep(cepDigitado) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        Swal.fire({
          icon: "error",
          title: "CEP inválido",
          text: "CEP não encontrado",
        });
        return;
      }

      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setEstado(data.uf || "");

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível buscar o CEP.",
      });
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();

    // Validar senhas
    if (senha !== confirmarSenha) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "As senhas não coincidem",
      });
      return;
    }

    if (senha.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Senha fraca",
        text: "A senha precisa ter no mínimo 6 caracteres.",
      });
      return;
    }

    // Validar idade mínima
    if (!validarIdade(dataNascimento)) {
      Swal.fire({
        icon: "error",
        title: "Idade inválida",
        text: "Você precisa ter no mínimo 18 anos para se cadastrar.",
      });
      return;
    }

    try {
      // criar usuário no auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome,
            tipo: tipo
          }
        }
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Erro no cadastro",
          text: error.message,
        });
        return;
      }

      // Preparar dados para salvar na tabela usuarios
      const dadosUsuario = {
        id: data.user.id,
        tipo: tipo,
        nome: nome,
        email: email,
        telefone: telefone || null,
        data_nascimento: dataNascimento || null,
        cpf: cpf || null,
        genero: genero || null,
      };

      // Adicionar campos de endereço APENAS para médico
      if (tipo === "medico") {
        dadosUsuario.cep = cep || null;
        dadosUsuario.logradouro = logradouro || null;
        dadosUsuario.bairro = bairro || null;
        dadosUsuario.cidade = cidade || null;
        dadosUsuario.estado = estado || null;
        dadosUsuario.crm = crm || null;
        dadosUsuario.especialidade = especialidade || null;
        dadosUsuario.universidade = universidade || null;
        dadosUsuario.ano_formacao = anoFormacao ? Number(anoFormacao) : null;
        dadosUsuario.clinica_id = clinicaId || null;
      }

      // salvar perfil na tabela usuarios
      const { error: perfilError } = await supabase
        .from("usuarios")
        .insert([dadosUsuario]);

      if (perfilError) {
        console.error("Erro ao salvar perfil:", perfilError);
        
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: perfilError.message,
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Cadastro realizado!",
        text: "Sua conta foi criada com sucesso.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/", {
        state: { cadastroSucesso: true }
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível concluir o cadastro.",
      });
    }
  }

  return (
    <div className="container">
      {/* ESQUERDA */}
      <div className="left">
        <img src={login} alt="medico" />
      </div>

      {/* DIREITA */}
      <div className="right">
        <div className="cadas-card">
          <h1>
            {tipo === "paciente"
              ? "Cadastre-se"
              : "Bem-vindo Profissional"}
          </h1>

          <p>
            {tipo === "paciente"
              ? "Acesse nossa plataforma e descubra ferramentas incríveis."
              : "Acesse nossa plataforma e ajude muitas pessoas."}
          </p>

          {/* TOGGLE */}
          <div className="toggle">
            <button
              className={tipo === "paciente" ? "active" : ""}
              onClick={() => setTipo("paciente")}
              type="button"
            >
              <img src={paciente} alt="paciente" />
              Sou paciente
            </button>

            <button
              className={tipo === "medico" ? "active" : ""}
              onClick={() => setTipo("medico")}
              type="button"
            >
              <img src={medico} alt="medico" />
              Sou médico
            </button>
          </div>

          <form onSubmit={handleCadastro}>
            {/* CAMPOS COMUNS */}
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value.replace(/[0-9]/g, ""))
              }
              required
            />
            
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* DATA DE NASCIMENTO - PARA AMBOS */}
            <input
              type="date"
              placeholder="Data de nascimento"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
            />

            {/* PACIENTE - SEM CEP E ENDEREÇO */}
            {tipo === "paciente" && (
              <>
                <div className="row">
                  <input
                    type="text"
                    placeholder="CPF"
                    value={cpf}
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                    onChange={(e) =>
                      setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={telefone}
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]{10,11}"
                    onChange={(e) =>
                      setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    required
                  />
                </div>

                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
                >
                  <option value="">Gênero</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="nao_binario">Não-binário</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_informar">Prefiro não informar</option>
                </select>
              </>
            )}

            {/* MÉDICO - COM CEP E ENDEREÇO */}
            {tipo === "medico" && (
              <>
                <div className="row">
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={telefone}
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]{10,11}"
                    onChange={(e) =>
                      setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    required
                  />
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    required
                  >
                    <option value="">Gênero</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="nao_binario">Não-binário</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_informar">Prefiro não informar</option>
                  </select>
                </div>

                <div className="row">
                  <input
                    type="text"
                    placeholder="CPF"
                    value={cpf}
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                    onChange={(e) =>
                      setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="CEP"
                    value={cep}
                    maxLength={8}
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setCep(valor);
                      if (valor.length === 8) {
                        buscarCep(valor);
                      }
                    }}
                  />
                </div>

                <div className="row">
                  <input
                    type="text"
                    placeholder="Rua"
                    value={logradouro}
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={bairro}
                    readOnly
                  />
                </div>

                <div className="row">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={cidade}
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    value={estado}
                    readOnly
                  />
                </div>

                <div className="row">
                  <input
                    type="text"
                    placeholder="Especialidade"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="CRM"
                    value={crm}
                    maxLength={15}
                    onChange={(e) => setCrm(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="row">
                  <input
                    type="text"
                    placeholder="Universidade"
                    value={universidade}
                    onChange={(e) => setUniversidade(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Ano de formação"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={anoFormacao}
                    onChange={(e) => setAnoFormacao(e.target.value)}
                    required
                  />
                </div>

                <select
                  value={clinicaId}
                  onChange={(e) => setClinicaId(e.target.value)}
                >
                  <option value="">Nenhuma clínica</option>
                  {clinicas.map((clinica) => (
                    <option key={clinica.id} value={clinica.id}>
                      {clinica.nome}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* SENHA */}
            <div className="input-senha">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <img
                src={mostrarSenha ? olhoAberto : olhoFechado}
                className="icon-eye"
                alt="mostrar senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>

            {/* CONFIRMAR SENHA */}
            <div className="input-senha">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              <img
                src={mostrarSenha ? olhoAberto : olhoFechado}
                className="icon-eye"
                alt="mostrar senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>

            <button type="submit">Cadastrar</button>
          </form>

          <p>
            Tem conta? <Link to="/">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}