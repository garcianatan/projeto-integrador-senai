import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CadastroOS.css";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
 
export default function CadastroOS() {
  const navigate = useNavigate();
 
  const [modalSairAberto, setModalSairAberto] = useState(false);
 
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
 
  function handleCheckboxChange(valor, lista, setLista) {
    if (lista.includes(valor)) {
      setLista(lista.filter((item) => item !== valor));
    } else {
      setLista([...lista, valor]);
    }
  }
 
  function limparFormulario() {
    setTipoSolicitante("");
    setSetorInterno("");
    setSolicitanteExterno("");
    setContato("");
    setNomeProjeto("");
    setDescricaoProjeto("");
    setMedidaFinal("");
    setQuantidade("");
    setManipulacaoArquivo("");
    setProcessos([]);
    setMateriais([]);
    setOutroProcesso(false);
    setTextoOutroProcesso("");
    setOutroMaterial(false);
    setTextoOutroMaterial("");
    setObservacoes("");
  }
 
  function campoFoiPreenchido(valor) {
    if (Array.isArray(valor)) {
      return valor.length > 0;
    }
 
    if (typeof valor === "boolean") {
      return valor === true;
    }
 
    if (valor === null || valor === undefined) {
      return false;
    }
 
    return String(valor).trim() !== "";
  }
 
  function temFormularioPreenchido() {
    return [
      tipoSolicitante,
      setorInterno,
      solicitanteExterno,
      contato,
      nomeProjeto,
      descricaoProjeto,
      medidaFinal,
      quantidade,
      manipulacaoArquivo,
      processos,
      materiais,
      outroProcesso,
      textoOutroProcesso,
      outroMaterial,
      textoOutroMaterial,
      observacoes
    ].some(campoFoiPreenchido);
  }
 
  function handleVoltar() {
    if (temFormularioPreenchido()) {
      setModalSairAberto(true);
      return;
    }
 
    navigate("/ordens");
  }
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));
 
    if (!usuarioLogado) {
      toast.error("Usuário não encontrado. Faça login novamente.");
      navigate("/login");
      return;
    }
 
    if (outroProcesso && !textoOutroProcesso.trim()) {
      toast.error("Informe o outro processo");
      return;
    }
 
    if (outroMaterial && !textoOutroMaterial.trim()) {
      toast.error("Informe o outro material");
      return;
    }
 
    const processosFinal =
      outroProcesso && textoOutroProcesso.trim()
        ? [...processos, `Outro: ${textoOutroProcesso.trim()}`]
        : processos;
 
    const materiaisFinal =
      outroMaterial && textoOutroMaterial.trim()
        ? [...materiais, `Outro: ${textoOutroMaterial.trim()}`]
        : materiais;
 
    if (processosFinal.length === 0) {
      toast.error("Selecione ao menos um processo");
      return;
    }
 
    if (materiaisFinal.length === 0) {
      toast.error("Selecione ao menos um material");
      return;
    }
 
    try {
      const novaOS = {
        tipo_solicitante: tipoSolicitante,
        setor_interno: tipoSolicitante === "interno" ? setorInterno : null,
        solicitante_externo:
          tipoSolicitante === "externo" ? solicitanteExterno.trim() : null,
        contato: contato.trim() ? contato.trim() : null,
        nome_projeto: nomeProjeto.trim(),
        descricao_projeto: descricaoProjeto.trim(),
        medida_final: medidaFinal.trim(),
        quantidade: Number(quantidade),
        manipulacao_arquivo: manipulacaoArquivo === "1",
        processos: processosFinal.join(", "),
        materiais: materiaisFinal.join(", "),
        observacoes: observacoes.trim() ? observacoes.trim() : null
      };
 
      const resposta = await api.post("/ordens", novaOS);
 
      toast.success(resposta.data.mensagem);
      limparFormulario();
      navigate("/ordens");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.erro || "Erro ao cadastrar ordem de serviço"
      );
    }
  };
 
  return (
    <div className="container-os">
      <form className="cadastro-os-form" onSubmit={handleSubmit}>
        <div className="topo-cadastro-os">
          <h2>Cadastro de Ordem de Serviço</h2>
 
          <button type="button" onClick={handleVoltar}>
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
          required
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
 
                if (!e.target.checked) {
                  setTextoOutroProcesso("");
                }
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
              placeholder="Digite o processo"
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
 
                if (!e.target.checked) {
                  setTextoOutroMaterial("");
                }
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
              placeholder="Digite o material"
            />
          </>
        )}
 
        <h3>Observações (opcional)</h3>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
 
        <div className="acoes-cadastro-os">
          <button type="submit">Salvar OS</button>
        </div>
      </form>
 
      <ConfirmModal
        aberto={modalSairAberto}
        titulo="Sair sem salvar?"
        mensagem="Existem dados preenchidos no formulário. Se você sair agora, as informações serão perdidas."
        textoCancelar="Continuar preenchendo"
        textoConfirmar="Sair sem salvar"
        onCancel={() => setModalSairAberto(false)}
        onConfirm={() => navigate("/ordens")}
      />
    </div>
  );
}