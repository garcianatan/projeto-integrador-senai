import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      const resposta = await api.get(`/usuarios/${usuarioLogado.id}/perfil`);
      setNome(resposta.data.nome || "");
      setEmail(resposta.data.email || "");
      setTipo(resposta.data.tipo || "");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao carregar perfil");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.put(`/usuarios/${usuarioLogado.id}/perfil`, {
        nome,
        email
      });

      if (novaSenha.trim()) {
        await api.put(`/usuarios/${usuarioLogado.id}/perfil/senha`, {
          novaSenha
        });
      }

      const usuarioAtualizado = {
        ...usuarioLogado,
        nome,
        email,
        tipo
      };

      sessionStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

      toast.success("Perfil atualizado com sucesso");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao atualizar perfil");
    }
  }

  return (
    <div className="container-perfil">
      <form className="form-perfil" onSubmit={handleSubmit}>
        <div className="topo-perfil">
          <h2>Meu Perfil</h2>
          <button type="button" onClick={() => navigate("/")}>
            Voltar
          </button>
        </div>

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

        <label>Nova senha (opcional)</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Preencha apenas se quiser alterar"
        />

        <div className="acoes-perfil">
          <button type="submit">Salvar alterações</button>
        </div>
      </form>
    </div>
  );
}