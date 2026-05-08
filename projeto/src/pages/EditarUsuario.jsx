import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./CadastroUsuario.css";
import toast from "react-hot-toast";

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("funcionario");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarAvisoSenha, setMostrarAvisoSenha] = useState(false);

  useEffect(() => {
    carregarUsuario();
  }, [id]);

  async function carregarUsuario() {
    try {
      const resposta = await api.get(`/usuarios/${id}`);
      setNome(resposta.data.nome);
      setEmail(resposta.data.email);
      setTipo(resposta.data.tipo);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuário");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      Number(usuarioLogado?.id) === Number(id) &&
      tipo !== "admin"
    ) {
      toast.error("Você não pode alterar seu próprio tipo de admin");
      return;
    }

    try {
      await api.put(`/usuarios/${id}`, {
        nome: nome.trim(),
        email: email.trim(),
        tipo
      });

      if (novaSenha.trim()) {
        await api.put(`/usuarios/${id}/senha`, {
          novaSenha
        });
      }

      toast.success("Usuário atualizado com sucesso");
      navigate("/usuarios");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao atualizar usuário");
    }
  }

  return (
    <div className="container-cadastro-usuario">
      <form className="form-cadastro-usuario" onSubmit={handleSubmit}>
        <h2>Editar Usuário</h2>

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

        <label>Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          disabled={Number(usuarioLogado?.id) === Number(id)} //impedir que apareça o select de tipo para usuário admin editando o próprio usuário 
        >
          <option value="funcionario">Funcionário</option>
          <option value="admin">Admin</option>
        </select>

        <label>Nova senha (opcional)</label>
        <input
          type="password"
          value={novaSenha}
          onFocus={() => setMostrarAvisoSenha(true)}
          onBlur={() => setMostrarAvisoSenha(false)}
          onChange={(e) => setNovaSenha(e.target.value.replace(/\s/g, ""))}
          placeholder="Preencha apenas se quiser alterar"
          minLength={6}
        />

        {mostrarAvisoSenha && (
          <span className="aviso-senha">
            Mínimo de 6 caracteres e sem espaços
          </span>
        )}

        <div className="acoes-cadastro-usuario">
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => navigate("/usuarios")}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}