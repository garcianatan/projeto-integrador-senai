import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ListaUsuarios.css";
import { FaTrash, FaEdit, FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/login");
  }

  async function carregarUsuarios() {
    try {
      const resposta = await api.get("/usuarios");
      setUsuarios(resposta.data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  }

  async function desativarUsuario(id) {
    if (usuarioLogado?.id === id) {
      toast.error("Você não pode desativar seu próprio usuário");
      return;
    }

    const confirmar = window.confirm("Deseja realmente desativar este usuário?");
    if (!confirmar) return;

    try {
      await api.put(`/usuarios/${id}/desativar`, {
        usuarioLogadoId: usuarioLogado.id
      });
      carregarUsuarios();
    } catch (error) {
      toast.error(error?.response?.data?.erro || "Erro ao desativar usuário");
    }
  }

  async function reativarUsuario(id) {
    try {
      await api.put(`/usuarios/${id}/reativar`);
      carregarUsuarios();
    } catch (error) {
      toast.error(error?.response?.data?.erro || "Erro ao reativar usuário");
    }
  }

  return (
    <div className="container-usuarios">
      <div className="painel-usuarios">
        <div className="topo-usuarios">
          <div className="topo-info">
            <h2>Gerenciamento de Usuários</h2>
            <p className="usuario-logado">
              Usuário: {usuarioLogado?.nome || "Não identificado"}
            </p>
          </div>

          <div className="topo-usuarios-acoes">
            <button onClick={() => navigate("/usuarios/novo")}>
              Novo Usuário
            </button>

            <button onClick={handleLogout} className="button-diversi">
              <FaSignOutAlt />
              Sair
            </button>
          </div>
        </div>

        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.tipo}</td>
                    <td>
                      <span className={usuario.ativo ? "status-ativo" : "status-inativo"}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      {usuario.created_at
                        ? new Date(usuario.created_at).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td>
                      <div className="acoes-tabela">
                        <button onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>
                          <FaEdit />
                        </button>

                        {usuario.ativo ? (
                          usuarioLogado?.id !== usuario.id && (
                            <button onClick={() => desativarUsuario(usuario.id)} className="button-diversi">
                              <FaTrash />
                            </button>
                          )
                        ) : (
                          <button onClick={() => reativarUsuario(usuario.id)}>
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}