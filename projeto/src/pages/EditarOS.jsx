import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./CadastroOS.css";
import toast from "react-hot-toast";

export default function EditarOS() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tipoSolicitante, setTipoSolicitante] = useState("");
  const [setorInterno, setSetorInterno] = useState("");
  const [solicitanteExterno, setSolicitanteExterno] = useState("");
  const [contato, setContato] = useState("");

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricaoProjeto, setDescricaoProjeto] = useState("");
  const [medidaFinal, setMedidaFinal] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const [manipulacaoArquivo, setManipulacaoArquivo] = useState("");

  const [processos, setProcessos] = useState([]);
  const [materiais, setMateriais] = useState([]);

  const [outroProcesso, setOutroProcesso] = useState(false);
  const [textoOutroProcesso, setTextoOutroProcesso] = useState("");

  const [outroMaterial, setOutroMaterial] = useState(false);
  const [textoOutroMaterial, setTextoOutroMaterial] = useState("");

  const [observacoes, setObservacoes] = useState("");
  const [statusAtual, setStatusAtual] = useState("");

  const listaProcessos = [
    "Fechamento de arquivo",
    "Impressão UV",
    "Impressão HP Latex",
    "Impressão HP pequena",
    "Impressão 3D Filamento",
    "Impressão 3D Resina",
    "Corte laser",
    "Router CNC",
    "Corte de placas",
    "Programação em arduino"
  ];

  const listaMateriais = [
    "Acrílico 3 mm",
    "Acrílico 5 mm",
    "Acrílico 10 mm",
    "MDF 3 mm",
    "MDF 5 mm",
    "MDF 10 mm",
    "Lona PVC",
    "Vinil Brilho",
    "Vinil Matte",
    "Papel Genérico",
    "PLA",
    "ABS",
    "PETG",
    "Resina"
  ];

  useEffect(() => {
    carregarOS();
  }, [id]);

  async function carregarOS() {
    try {
      const resposta = await api.get(`/ordens/${id}`);
      const os = resposta.data;

      setStatusAtual(os.status);
      setTipoSolicitante(os.tipo_solicitante || "");
      setSetorInterno(os.setor_interno || "");
      setSolicitanteExterno(os.solicitante_externo || "");
      setContato(os.contato || "");
      setNomeProjeto(os.nome_projeto || "");
      setDescricaoProjeto(os.descricao_projeto || "");
      setMedidaFinal(os.medida_final || "");
      setQuantidade(os.quantidade || "");
      setManipulacaoArquivo(os.manipulacao_arquivo ? "1" : "0");
      setObservacoes(os.observacoes || "");

      const processosArray = os.processos
        ? os.processos.split(", ").filter((item) => !item.startsWith("Outro:"))
        : [];

      const materiaisArray = os.materiais
        ? os.materiais.split(", ").filter((item) => !item.startsWith("Outro:"))
        : [];

      setProcessos(processosArray);
      setMateriais(materiaisArray);

      const outroProc = os.processos
        ? os.processos.split(", ").find((item) => item.startsWith("Outro:"))
        : null;

      const outroMat = os.materiais
        ? os.materiais.split(", ").find((item) => item.startsWith("Outro:"))
        : null;

      if (outroProc) {
        setOutroProcesso(true);
        setTextoOutroProcesso(outroProc.replace("Outro: ", ""));
      } else {
        setOutroProcesso(false);
        setTextoOutroProcesso("");
      }

      if (outroMat) {
        setOutroMaterial(true);
        setTextoOutroMaterial(outroMat.replace("Outro: ", ""));
      } else {
        setOutroMaterial(false);
        setTextoOutroMaterial("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao carregar OS");
    }
  }

  function handleCheckboxChange(valor, lista, setLista) {
    if (lista.includes(valor)) {
      setLista(lista.filter((item) => item !== valor));
    } else {
      setLista([...lista, valor]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const dadosAtualizados = {
        tipo_solicitante: tipoSolicitante,
        setor_interno: tipoSolicitante === "interno" ? setorInterno : null,
        solicitante_externo:
          tipoSolicitante === "externo" ? solicitanteExterno : null,
        contato: contato || null,
        nome_projeto: nomeProjeto,
        descricao_projeto: descricaoProjeto,
        medida_final: medidaFinal,
        quantidade: Number(quantidade),
        manipulacao_arquivo: manipulacaoArquivo === "1",
        processos:
          outroProcesso && textoOutroProcesso.trim()
            ? [...processos, `Outro: ${textoOutroProcesso}`].join(", ")
            : processos.join(", "),
        materiais:
          outroMaterial && textoOutroMaterial.trim()
            ? [...materiais, `Outro: ${textoOutroMaterial}`].join(", ")
            : materiais.join(", "),
        observacoes
      };

      await api.put(`/ordens/${id}`, dadosAtualizados);
      toast.success("OS atualizada com sucesso");
      navigate(`/ordens/${id}`);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.erro || "Erro ao atualizar OS");
    }
  }

  if (statusAtual && statusAtual !== "pendente") {
    return (
      <div className="container-os">
        <form className="cadastro-os-form">
          <div className="topo-cadastro-os">
            <h2>Editar Ordem de Serviço</h2>
            <button type="button" onClick={() => navigate(`/ordens/${id}`)}>
              Voltar
            </button>
          </div>

          <p>Somente ordens pendentes podem ser editadas.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="container-os">
      <form className="cadastro-os-form" onSubmit={handleSubmit}>
        <div className="topo-cadastro-os">
          <h2>Editar Ordem de Serviço</h2>
          <button type="button" onClick={() => navigate(`/ordens/${id}`)}>
            Voltar
          </button>
        </div>

        <h3>Dados do Solicitante</h3>

        <label>
          Tipo de solicitante <span className="campo-obrigatorio">*</span>
        </label>
        <select
          value={tipoSolicitante}
          onChange={(e) => setTipoSolicitante(e.target.value)}
          required
        >
          <option value="">Selecione</option>
          <option value="interno">Interno</option>
          <option value="externo">Externo</option>
        </select>

        {tipoSolicitante === "interno" && (
          <>
            <label>
              Setor interno <span className="campo-obrigatorio">*</span>
            </label>
            <select
              value={setorInterno}
              onChange={(e) => setSetorInterno(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="SESI">SESI</option>
              <option value="SENAI">SENAI</option>
              <option value="GRÁFICA">GRÁFICA</option>
              <option value="ADMINISTRAÇÃO">ADMINISTRAÇÃO</option>
            </select>
          </>
        )}

        {tipoSolicitante === "externo" && (
          <>
            <label>
              Solicitante externo <span className="campo-obrigatorio">*</span>
            </label>
            <input
              type="text"
              value={solicitanteExterno}
              onChange={(e) => setSolicitanteExterno(e.target.value)}
              required
            />
          </>
        )}

        <label>Contato (opcional)</label>
        <input
          type="text"
          value={contato}
          onChange={(e) => setContato(e.target.value)}
        />

        <h3>Dados do Projeto</h3>

        <label>
          Nome do projeto <span className="campo-obrigatorio">*</span>
        </label>
        <input
          type="text"
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
          required
        />

        <label>
          Descrição do projeto <span className="campo-obrigatorio">*</span>
        </label>
        <textarea
          value={descricaoProjeto}
          onChange={(e) => setDescricaoProjeto(e.target.value)}
          required
        />

        <label>
          Medida final <span className="campo-obrigatorio">*</span>
        </label>
        <input
          type="text"
          value={medidaFinal}
          onChange={(e) => setMedidaFinal(e.target.value)}
        />

        <label>
          Quantidade <span className="campo-obrigatorio">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) => {
            const valor = e.target.value;
            if (valor === "" || Number(valor) >= 1) {
              setQuantidade(valor);
            }
          }}
          required
        />

        <h3>Arquivo</h3>

        <label>
          Necessita manipulação do arquivo?{" "}
          <span className="campo-obrigatorio">*</span>
        </label>
        <select
          value={manipulacaoArquivo}
          onChange={(e) => setManipulacaoArquivo(e.target.value)}
          required
        >
          <option value="">Selecione</option>
          <option value="1">Sim</option>
          <option value="0">Não</option>
        </select>

        <h3>
          Processos Envolvidos <span className="campo-obrigatorio">*</span>
        </h3>

        {listaProcessos.map((processo) => (
          <div className="checkbox-item" key={processo}>
            <label>
              <input
                type="checkbox"
                checked={processos.includes(processo)}
                onChange={() =>
                  handleCheckboxChange(processo, processos, setProcessos)
                }
              />
              {processo}
            </label>
          </div>
        ))}

        <div className="checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={outroProcesso}
              onChange={(e) => {
                setOutroProcesso(e.target.checked);
                if (!e.target.checked) setTextoOutroProcesso("");
              }}
            />
            Outro
          </label>
        </div>

        {outroProcesso && (
          <>
            <label>
              Informe outro processo{" "}
              <span className="campo-obrigatorio">*</span>
            </label>
            <input
              type="text"
              value={textoOutroProcesso}
              onChange={(e) => setTextoOutroProcesso(e.target.value)}
            />
          </>
        )}

        <h3>
          Materiais Utilizados <span className="campo-obrigatorio">*</span>
        </h3>

        {listaMateriais.map((material) => (
          <div className="checkbox-item" key={material}>
            <label>
              <input
                type="checkbox"
                checked={materiais.includes(material)}
                onChange={() =>
                  handleCheckboxChange(material, materiais, setMateriais)
                }
              />
              {material}
            </label>
          </div>
        ))}

        <div className="checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={outroMaterial}
              onChange={(e) => {
                setOutroMaterial(e.target.checked);
                if (!e.target.checked) setTextoOutroMaterial("");
              }}
            />
            Outro
          </label>
        </div>

        {outroMaterial && (
          <>
            <label>
              Informe outro material{" "}
              <span className="campo-obrigatorio">*</span>
            </label>
            <input
              type="text"
              value={textoOutroMaterial}
              onChange={(e) => setTextoOutroMaterial(e.target.value)}
            />
          </>
        )}

        <h3>Observações (opcional)</h3>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />

        <div className="acoes-cadastro-os">
          <button type="submit">Salvar alterações</button>
        </div>
      </form>
    </div>
  );
}