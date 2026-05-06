import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CadastroUsuario.css";
import toast from "react-hot-toast";

export default function CadastroUsuario() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("funcionario");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const resposta = await api.post("/auth/register", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        tipo
      });

      toast.success(resposta.data.mensagem);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao cadastrar usuário");
    }
  }

  return (
    <div className="container-cadastro-usuario">
      <form className="form-cadastro-usuario" onSubmit={handleSubmit}>
        <h2>Cadastro de Usuário</h2>

        <label>Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <label>Tipo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="funcionario">Funcionário</option>
          <option value="admin">Admin</option>
        </select>

        <div className="acoes-cadastro-usuario">
          <button type="submit">Cadastrar</button>
          <button type="button" onClick={() => navigate("/")}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}