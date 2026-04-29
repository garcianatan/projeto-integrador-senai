import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ListaOS.css";
import { FaSignOutAlt, FaEllipsisH, FaTimesCircle, FaCheck, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ListaOS() {
  const [ordens, setOrdens] = useState([]);
  const [filtroProjeto, setFiltroProjeto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

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

  async function exportarPdf() {
    try {
      const resposta = await api.get("/ordens/pdf-lista", {
        params: {
          projeto: filtroProjeto,
          status: filtroStatus,
          dataInicio: filtroDataInicio,
          dataFim: filtroDataFim
        },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([resposta.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lista-os.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF exportado com sucesso");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao exportar PDF");
    }
  }

  function formatarDataParaInput(dataString) {
    const data = new Date(dataString);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  const ordensFiltradas = useMemo(() => {
    return ordens.filter((os) => {
      const projetoOk = os.nome_projeto
        .toLowerCase()
        .includes(filtroProjeto.toLowerCase());

      const statusOk = filtroStatus ? os.status === filtroStatus : true;

      const dataOS = formatarDataParaInput(os.data_lancamento);

      const dataInicioOk = filtroDataInicio
        ? dataOS >= filtroDataInicio
        : true;

      const dataFimOk = filtroDataFim
        ? dataOS <= filtroDataFim
        : true;

      return projetoOk && statusOk && dataInicioOk && dataFimOk;
    });
  }, [ordens, filtroProjeto, filtroStatus, filtroDataInicio, filtroDataFim]);

  const resumo = useMemo(() => {
    return ordensFiltradas.reduce(
      (acc, os) => {
        acc.total += 1;

        if (os.status === "pendente") acc.pendentes += 1;
        if (os.status === "aprovada") acc.aprovadas += 1;
        if (os.status === "recusada") acc.recusadas += 1;
        if (os.status === "finalizada") acc.finalizadas += 1;

        return acc;
      },
      {
        total: 0,
        pendentes: 0,
        aprovadas: 0,
        recusadas: 0,
        finalizadas: 0
      }
    );
  }, [ordensFiltradas]);

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
            <button type="button" onClick={() => navigate("/ordens/nova")}>
              Nova OS
            </button>

            <button type="button" onClick={exportarPdf}>
              Exportar PDF
            </button>
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
            <label>Data inicial</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>

          <div className="campo-filtro">
            <label>Data final</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-resumo">
          <div className="card-resumo">
            <span className="card-titulo">Total</span>
            <strong className="card-valor">{resumo.total}</strong>
          </div>

          <div className="card-resumo card-pendente">
            <span className="card-titulo">Pendentes</span>
            <strong className="card-valor">{resumo.pendentes}</strong>
          </div>

          <div className="card-resumo card-aprovada">
            <span className="card-titulo">Aprovadas</span>
            <strong className="card-valor">{resumo.aprovadas}</strong>
          </div>

          <div className="card-resumo card-recusada">
            <span className="card-titulo">Recusadas</span>
            <strong className="card-valor">{resumo.recusadas}</strong>
          </div>

          <div className="card-resumo card-finalizada">
            <span className="card-titulo">Finalizadas</span>
            <strong className="card-valor">{resumo.finalizadas}</strong>
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
                    <td className="coluna-projeto">{os.nome_projeto}</td>
                    <td>
                      <span className={`status-os status-${os.status}`}>
                        {os.status}
                        {os.status === "recusada" && <FaTimesCircle />}
                        {os.status === "aprovada" && <FaCheck />}
                        {os.status === "pendente" && <FaClock />}
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