import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./DetalheOS.css";

export default function DetalheOS() {
  const [os, setOs] = useState(null);
  const [status, setStatus] = useState("");
  const [coordenadorNome, setCoordenadorNome] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  const handleGerarPDF = async () => {
    try {
      const response = await api.get(`/ordens/${os.id}/pdf`, {
        responseType: "blob",
      });
  
      const file = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(file);
  
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
    }
  };

  useEffect(() => {
    carregarOS();
  }, [id]);

  async function carregarOS() {
    try {
      const resposta = await api.get(`/ordens/${id}`);
      setOs(resposta.data);

      setStatus("");
      setCoordenadorNome(resposta.data.coordenador_nome || "");
      setMotivoRecusa(resposta.data.motivo_recusa || "");
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar detalhes da OS");
    }
  }

  async function atualizarStatus() {
    if (!status) {
      alert("Selecione um status");
      return;
    }

    if ((status === "aprovada" || status === "recusada") && !coordenadorNome.trim()) {
      alert("Informe o nome do coordenador");
      return;
    }

    if (status === "recusada" && !motivoRecusa.trim()) {
      alert("Informe o motivo da recusa");
      return;
    }

    try {
      await api.put(`/ordens/${id}/status`, {
        status,
        coordenador_nome: coordenadorNome,
        motivo_recusa: status === "recusada" ? motivoRecusa : null
      });

      alert("Status atualizado com sucesso");
      carregarOS();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.erro || "Erro ao atualizar status");
    }
  }

  if (!os) {
    return <p style={{ padding: "20px" }}>Carregando...</p>;
  }

  let opcoesStatus = [];

  if (os.status === "pendente") {
    opcoesStatus = ["aprovada", "recusada"];
  } else if (os.status === "aprovada") {
    opcoesStatus = ["finalizada"];
  }

  const podeAlterarStatus =
    os.status === "pendente" || os.status === "aprovada";

  return (
    <div className="container-detalhe">
      <div className="painel-detalhe">
      <div className="topo-detalhe">
        <h2>Detalhes da OS #{os.id}</h2>

        <div className="topo-acoes">
          {os.status === "pendente" && (
            <button
              type="button"
              onClick={() => navigate(`/ordens/${os.id}/editar`)}
            >
              Editar
            </button>
          )}

          <button type="button" onClick={handleGerarPDF}>
            Gerar PDF
          </button>

          <button type="button" onClick={() => navigate("/ordens")}>
            Voltar
          </button>
        </div>
      </div>

        <div className="bloco-info">
          <h3>Identificação</h3>
          <p><strong>ID da OS:</strong> {os.id}</p>
          <p>
            <strong>Status atual:</strong>{" "}
            <span className={`status-os status-${os.status}`}>
              {os.status}
            </span>
          </p>
          <p>
            <strong>Data de lançamento:</strong>{" "}
            {os.data_lancamento
              ? new Date(os.data_lancamento).toLocaleString("pt-BR")
              : "-"}
          </p>
          <p>
            <strong>Data de autorização:</strong>{" "}
            {os.data_autorizacao
              ? new Date(os.data_autorizacao).toLocaleString("pt-BR")
              : "-"}
          </p>
          <p>
            <strong>Data de conclusão:</strong>{" "}
            {os.data_conclusao
              ? new Date(os.data_conclusao).toLocaleString("pt-BR")
              : "-"}
          </p>
          <p><strong>Atendente:</strong> {os.nome_atendente || "-"}</p>
          <p><strong>Email do atendente:</strong> {os.email_atendente || "-"}</p>

          <h3>Solicitante</h3>
          <p><strong>Tipo de solicitante:</strong> {os.tipo_solicitante}</p>
          <p><strong>Setor interno:</strong> {os.setor_interno || "-"}</p>
          <p><strong>Solicitante externo:</strong> {os.solicitante_externo || "-"}</p>
          <p><strong>Contato:</strong> {os.contato || "-"}</p>

          <h3>Projeto</h3>
          <p><strong>Projeto:</strong> {os.nome_projeto}</p>
          <p><strong>Descrição:</strong> {os.descricao_projeto}</p>
          <p><strong>Medida final:</strong> {os.medida_final || "-"}</p>
          <p><strong>Quantidade:</strong> {os.quantidade}</p>

          <h3>Produção</h3>
          <p>
            <strong>Manipulação do arquivo:</strong>{" "}
            {os.manipulacao_arquivo ? "Sim" : "Não"}
          </p>
          <p><strong>Processos:</strong> {os.processos || "-"}</p>
          <p><strong>Materiais:</strong> {os.materiais || "-"}</p>
          <p><strong>Observações:</strong> {os.observacoes || "-"}</p>

          <h3>Controle</h3>
          <p><strong>Coordenador:</strong> {os.coordenador_nome || "-"}</p>
          <p><strong>Motivo da recusa:</strong> {os.motivo_recusa || "-"}</p>
        </div>

        {podeAlterarStatus && (
          <div className="bloco-status">
            <h3>Atualizar status</h3>

            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Selecione</option>
              {opcoesStatus.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao.charAt(0).toUpperCase() + opcao.slice(1)}
                </option>
              ))}
            </select>

            {(status === "aprovada" || status === "recusada") && (
              <>
                <label>Nome do coordenador</label>
                <input
                  type="text"
                  value={coordenadorNome}
                  onChange={(e) => setCoordenadorNome(e.target.value)}
                />
              </>
            )}

            {status === "recusada" && (
              <>
                <label>Motivo da recusa</label>
                <textarea
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                />
              </>
            )}

            <button type="button" onClick={atualizarStatus}>
              Salvar alteração
            </button>
          </div>
        )}
      </div>
    </div>
  );
}