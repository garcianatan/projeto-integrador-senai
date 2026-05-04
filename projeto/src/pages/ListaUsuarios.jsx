import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ListaUsuarios.css";
import { FaTrash, FaEdit, FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [paginaDigitada, setPaginaDigitada] = useState("1");
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));

  useEffect(() => {
    carregarUsuarios({ page: 1 });
  }, []);



  async function carregarUsuarios({ page = paginaAtual } = {}) {
    try {
      setCarregando(true);

      const resposta = await api.get("/usuarios", {
        params: {
          page,
          limit: 10//limite de exibição de usuários por página
        }
      });

      setUsuarios(resposta.data.itens || []);
      setPaginaAtual(resposta.data.paginacao?.page || 1);
      setPaginaDigitada(String(resposta.data.paginacao?.page || 1));
      setTotalPaginas(resposta.data.paginacao?.totalPages || 1);
      setTotalItens(resposta.data.paginacao?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setCarregando(false);
    }
  }

  function desativarUsuario(id) {
    if (usuarioLogado?.id === id) {
      toast.error("Você não pode desativar seu próprio usuário");
      return;
    }

    setUsuarioSelecionado(id);
    setModalAberto(true);
  }

  async function confirmarDesativacao() {
    if (!usuarioSelecionado) return;

    try {
      await api.put(`/usuarios/${usuarioSelecionado}/desativar`, {
        usuarioLogadoId: usuarioLogado.id
      });

      toast.success("Usuário desativado com sucesso");
      setModalAberto(false);
      setUsuarioSelecionado(null);
      carregarUsuarios({ page: paginaAtual });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao desativar usuário");
    }
  }

  function fecharModal() {
    setModalAberto(false);
    setUsuarioSelecionado(null);
  }

  async function reativarUsuario(id) {
    try {
      await api.put(`/usuarios/${id}/reativar`);
      toast.success("Usuário reativado com sucesso");
      carregarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao reativar usuário");
    }
  }

  function irParaPaginaAnterior() {
    if (paginaAtual > 1) {
      carregarUsuarios({ page: paginaAtual - 1 });
    }
  }

  function irParaProximaPagina() {
    if (paginaAtual < totalPaginas) {
      carregarUsuarios({ page: paginaAtual + 1 });
    }
  }

  function irParaPaginaDigitada() {
    let pagina = Number(paginaDigitada);

    if (!pagina || isNaN(pagina)) pagina = 1;
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas) pagina = totalPaginas;

    carregarUsuarios({ page: pagina });
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
          </div>
        </div>

        <div className="info-paginacao">
          <span>Total de registros: {totalItens}</span>
          {carregando && <span>Carregando...</span>}
        </div>

        <div className="tabela-wrapper">
          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
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
                        <button type="button" onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>
                          <FaEdit />
                        </button>

                        {usuario.ativo ? (
                          usuarioLogado?.id !== usuario.id && (
                            <button type="button" onClick={() => desativarUsuario(usuario.id)} className="button-diversi">
                              <FaTrash />
                            </button>
                          )
                        ) : (
                          <button type="button" onClick={() => reativarUsuario(usuario.id)}>
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

        <div className="paginacao">
          <button
            type="button"
            onClick={irParaPaginaAnterior}
            disabled={paginaAtual === 1}
          >
            ←
          </button>

          <div className="paginacao-centro">
            <span className="texto-pagina">Página</span>

            <div className="caixa-paginacao">
              <input
                type="number"
                min="1"
                max={totalPaginas}
                value={paginaDigitada}
                onChange={(e) => setPaginaDigitada(e.target.value)}
                onBlur={irParaPaginaDigitada}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }

                  if (e.key === "Enter") {
                    irParaPaginaDigitada();
                  }
                }}
              />
              <span>/ {totalPaginas}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={irParaProximaPagina}
            disabled={paginaAtual === totalPaginas}
          >
            →
          </button>
        </div>

      </div>

      <ConfirmModal
        aberto={modalAberto}
        titulo="⚠️ Desativar usuário"
        mensagem="Deseja realmente desativar este usuário?"
        textoConfirmar="Desativar"
        textoCancelar="Cancelar"
        onConfirm={confirmarDesativacao}
        onCancel={fecharModal}
      />
    </div>
  );
}