import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ListaOS.css";
import { FaSignOutAlt, FaEllipsisH, FaTimesCircle, FaCheck, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ListaOS() {
  const [ordens, setOrdens] = useState([]);
  const [filtroProjeto, setFiltroProjeto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const navigate = useNavigate();

  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));

  useEffect(() => {
    carregarOrdens();
  }, []);

  async function carregarOrdens() {
    try {
      const resposta = await api.get("/ordens");
      setOrdens(resposta.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar ordens de serviço");
    }
  }

  function formatarDataParaInput(dataString) {
    const data = new Date(dataString);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  const ordensFiltradas = ordens.filter((os) => {
    const projetoOk = os.nome_projeto
      .toLowerCase()
      .includes(filtroProjeto.toLowerCase());

    const statusOk = filtroStatus ? os.status === filtroStatus : true;

    const dataOk = filtroData
      ? formatarDataParaInput(os.data_lancamento) === filtroData
      : true;

    return projetoOk && statusOk && dataOk;
  });

  return (
    <div className="container-lista">
      <div className="painel-lista">
        <div className="topo-lista">
          <div className="topo-info">
            <h2>Ordens de Serviço</h2>
            <p className="usuario-logado">
              Usuário: {usuarioLogado?.nome || "Não identificado"}
            </p>
          </div>

          <div className="topo-acoes">
            {usuarioLogado?.tipo !== "admin" && (
              <button type="button" onClick={() => navigate("/ordens/nova")}>
                Nova OS
              </button>
            )}

            {usuarioLogado?.tipo === "admin" && (
              <button type="button" onClick={() => navigate("/usuarios")}>
                Gerenciar Usuários
              </button>
            )}
          </div>
        </div>

        <div className="filtros">
          <div className="campo-filtro">
            <label>Buscar por projeto</label>
            <input
              type="text"
              value={filtroProjeto}
              onChange={(e) => setFiltroProjeto(e.target.value)}
              placeholder="Digite o nome do projeto"
            />
          </div>

          <div className="campo-filtro">
            <label>Filtrar por status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="recusada">Recusada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>

          <div className="campo-filtro">
            <label>Filtrar por data</label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>
        </div>

        <div className="tabela-wrapper">
          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Projeto</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.length > 0 ? (
                ordensFiltradas.map((os) => (
                  <tr key={os.id}>
                    <td>{os.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{os.nome_projeto}</td>
                    <td>
                      <span className={`status-os status-${os.status}`}>
                        {os.status}
                        {os.status === 'recusada' && (
                          <FaTimesCircle />
                        )}
                        {os.status === 'aprovada' && (
                          <FaCheck />
                        )}
                        {os.status === 'pendente' && (
                          <FaClock />
                        )}
                      </span>
                    </td>
                    <td>
                      {new Date(os.data_lancamento).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <button
                        className="piu"
                        type="button"
                        onClick={() => navigate(`/ordens/${os.id}`)}
                      >
                        <FaEllipsisH />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Nenhuma ordem encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}