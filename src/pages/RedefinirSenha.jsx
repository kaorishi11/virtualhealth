import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export default function RedefinirSenha() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] =
    useState('');

  const navigate = useNavigate();

  async function alterarSenha(e) {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    const { error } =
      await supabase.auth.updateUser({
        password: senha,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Senha alterada com sucesso!');
    navigate('/');
  }

  return (
    <div className="container">
      <div className="login-card">
        <h1>Nova senha</h1>

        <form onSubmit={alterarSenha}>
          <input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) =>
              setConfirmarSenha(
                e.target.value
              )
            }
            required
          />

          <button type="submit">
            Alterar senha
          </button>
        </form>
      </div>
    </div>
  );
}