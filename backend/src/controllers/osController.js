const osModel = require("../models/osModel");
const PDFDocument = require("pdfkit");

const criarOS = async (req, res) => {
  //Lucas: Requerimento obrigatório dos dados do formulário

  try {
    const {
      tipo_solicitante,
      setor_interno,
      solicitante_externo,
      contato,
      nome_projeto,
      descricao_projeto,
      medida_final,
      quantidade,
      manipulacao_arquivo,
      processos,
      materiais,
      observacoes,
      usuario_id
    } = req.body;

    if (!tipo_solicitante) {
      return res.status(400).json({ erro: "Tipo de solicitante é obrigatório" });
    }

    if (tipo_solicitante === "interno" && !setor_interno) {
      return res.status(400).json({ erro: "Setor interno é obrigatório" });
    }

    if (
      tipo_solicitante === "externo" &&
      (!solicitante_externo || !solicitante_externo.trim())
    ) {
      return res.status(400).json({ erro: "Solicitante externo é obrigatório" });
    }

    if (!nome_projeto || !nome_projeto.trim()) {
      return res.status(400).json({ erro: "Nome do projeto é obrigatório" });
    }

    if (!descricao_projeto || !descricao_projeto.trim()) {
      return res.status(400).json({ erro: "Descrição do projeto é obrigatória" });
    }

    if (!medida_final || !String(medida_final).trim()) {
      return res.status(400).json({ erro: "Medida final é obrigatória" });
    }

    if (!quantidade || Number(quantidade) < 1) {
      return res.status(400).json({ erro: "Quantidade deve ser maior que 0" });
    }

    if (manipulacao_arquivo === undefined || manipulacao_arquivo === null) {
      return res.status(400).json({ erro: "Informe se há manipulação de arquivo" });
    }

    if (!processos || !String(processos).trim()) {
      return res.status(400).json({ erro: "Selecione ao menos um processo" });
    }

    if (!materiais || !String(materiais).trim()) {
      return res.status(400).json({ erro: "Selecione ao menos um material" });
    }

    if (!usuario_id) {
      return res.status(400).json({ erro: "Usuário é obrigatório" });
    }

    const resultado = await osModel.criar({
      tipo_solicitante,
      setor_interno: tipo_solicitante === "interno" ? setor_interno : null,
      solicitante_externo:
        tipo_solicitante === "externo" ? solicitante_externo.trim() : null,
      contato: contato && String(contato).trim() ? String(contato).trim() : null,
      nome_projeto: nome_projeto.trim(),
      descricao_projeto: descricao_projeto.trim(),
      medida_final: String(medida_final).trim(),
      quantidade: Number(quantidade),
      manipulacao_arquivo,
      processos: String(processos).trim(),
      materiais: String(materiais).trim(),
      observacoes: observacoes ? String(observacoes).trim() : null,
      usuario_id
    });

    res.status(201).json({
      mensagem: "Ordem de serviço cadastrada com sucesso",
      id: resultado.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar ordem de serviço" });
  }
};

const listarOS = async (req, res) => {
  try {
    const {
      projeto = "",
      status = "",
      dataInicio = "",
      dataFim = "",
      page = 1,
      limit = 10
    } = req.query;

    const filtros = {
      projeto,
      status,
      dataInicio,
      dataFim
    };

    const limite = Number(limit) || 10;

    const total = await osModel.contarPaginado(filtros);

    const totalPages = Math.max(1, Math.ceil(total / limite));
    const paginaSolicitada = Number(page) || 1;
    const pagina = Math.min(Math.max(paginaSolicitada, 1), totalPages);

    const itens = await osModel.listarPaginado({
      ...filtros,
      page: pagina,
      limit: limite
    });

    const resumo = await osModel.buscarResumoLista(filtros);

    res.json({
      itens,
      resumo,
      paginacao: {
        page: pagina,
        limit: limite,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao listar ordens de serviço"
    });
  }
};

const buscarOSPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ordem = await osModel.buscarPorId(id);

    if (!ordem) {
      return res.status(404).json({ erro: "Ordem de serviço não encontrada" });
    }

    res.json(ordem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar ordem de serviço" });
  }
};

// permitir editar apenas OSs pendentes
const atualizarOS = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await osModel.atualizar(id, req.body);

    if (resultado.affectedRows === 0) {
      return res.status(400).json({
        erro: "A OS não foi encontrada ou não está pendente para edição"
      });
    }

    res.json({ mensagem: "Ordem de serviço atualizada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar ordem de serviço" });
  }
};

const atualizarStatusOS = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ordemAtual = await osModel.buscarStatusPorId(id);

    if (!ordemAtual) {
      return res.status(404).json({ erro: "Ordem de serviço não encontrada" });
    }

    const statusAtual = ordemAtual.status;

    // Regra 1: pendente só pode virar aprovada ou recusada
    if (statusAtual === "pendente") {
      if (status !== "aprovada" && status !== "recusada") {
        return res.status(400).json({
          erro: "Uma OS pendente só pode ser aprovada ou recusada"
        });
      }
    }

    // Regra 2: aprovada só pode virar finalizada
    else if (statusAtual === "aprovada") {
      if (status !== "finalizada") {
        return res.status(400).json({
          erro: "Uma OS aprovada só pode ser finalizada"
        });
      }
    }

    // Regra 3: recusada não pode mudar mais
    else if (statusAtual === "recusada") {
      return res.status(400).json({
        erro: "Uma OS recusada não pode ter o status alterado"
      });
    }

    // Regra 4: finalizada não pode mudar mais
    else if (statusAtual === "finalizada") {
      return res.status(400).json({
        erro: "Uma OS finalizada não pode ter o status alterado"
      });
    }

    const resultado = await osModel.atualizarStatus(id, req.body);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Ordem de serviço não encontrada" });
    }

    res.json({ mensagem: "Status atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar status" });
  }
};

const gerarPDFOrdem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const ordem = await osModel.buscarPorId(id);

    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    const descricao = String(ordem.descricao_projeto || '').slice(0, 500);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=ordem_${id}.pdf`
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    function escreverCampo(label, valor) {
      if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === "" ||
        valor === "-"
      ) {
        return;
      }
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${label}: `, { continued: true })
        .font("Helvetica")
        .text(valor || "-");

      doc.moveDown(0.8);
    }

    function escreverData(label, valor) {
      if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === "" ||
        valor === "-"
      ) {
        return;
      }
      const dataFormatada = new Date(valor).toLocaleString("pt-BR");
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${label}: `, { continued: true })
        .font("Helvetica")
        .text(dataFormatada);

      doc.moveDown(0.8);
    }

    function tituloSecao(titulo) {
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(titulo);

      const y = doc.y + 5;
      doc
        .moveTo(50, y)
        .lineTo(545, y)
        .strokeColor("#bdbdbd")
        .stroke();

      doc.moveDown(1.2);
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(`Ordem de Serviço #${ordem.id}`, { align: "center" });

    doc.moveDown(1.5);

    tituloSecao("Identificação");

    escreverCampo("ID da OS", String(ordem.id));
    escreverCampo("Status atual", ordem.status);
    escreverData("Data de lançamento", ordem.data_lancamento);
    escreverData("Data de autorização", ordem.data_autorizacao);
    escreverData("Data de conclusão", ordem.data_conclusao);
    escreverCampo("Atendente", ordem.nome_atendente);
    escreverCampo("Email do atendente", ordem.email_atendente);

    doc.moveDown(1.5);

    tituloSecao("Dados do Solicitante");
    escreverCampo("Tipo de solicitante", ordem.tipo_solicitante);
    escreverCampo("Solicitante", ordem.setor_interno || ordem.solicitante_externo);
    escreverCampo("Contato", ordem.contato);

    doc.moveDown(1.5);

    tituloSecao("Dados do Projeto");
    escreverCampo("Projeto", ordem.nome_projeto);
    escreverCampo("Descrição", ordem.descricao_projeto);
    escreverCampo("Medida final", ordem.medida_final);
    escreverCampo("Quantidade", ordem.quantidade);

    doc.moveDown(1.5);

    tituloSecao("Dados de Produção");
    escreverCampo("Manipulação do arquivo", ordem.manipulacao_arquivo ? "Sim" : "Não");
    escreverCampo("Processos", ordem.processos);
    escreverCampo("Materiais", ordem.materiais);
    escreverCampo("Observações", ordem.observacoes);

    doc.moveDown(1.5);

    if (ordem.coordenador_nome || ordem.motivo_recusa) {
      tituloSecao("Dados da Coordenação")
    }
    escreverCampo("Coordenador", ordem.coordenador_nome || '-');
    escreverCampo("Motivo da recusa", ordem.motivo_recusa || '-');

    doc.end();
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ erro: err.message });
  }
}

const exportarListaPdf = async (req, res) => {
  try {
    const {
      projeto = "",
      status = "",
      dataInicio = "",
      dataFim = ""
    } = req.query;

    const filtros = {
      projeto,
      status,
      dataInicio,
      dataFim
    };

    const resumo = await osModel.buscarResumoListaPdf(filtros);
    const itens = await osModel.buscarItensListaPdf(filtros);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="lista-os.pdf"'
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    doc.pipe(res);

    doc.fontSize(18).text("Relatorio de Ordens de Servico", {
      align: "center"
    });

    doc.moveDown();
    doc.fontSize(11).text(`Projeto: ${projeto || "Todos"}`);
    doc.text(`Status: ${status || "Todos"}`);
    doc.text(`Data inicial: ${dataInicio || "Todas"}`);
    doc.text(`Data final: ${dataFim || "Todas"}`);
    doc.moveDown();

    doc.fontSize(13).text("Resumo");
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Total: ${resumo.total || 0}`);
    doc.text(`Pendentes: ${resumo.pendentes || 0}`);
    doc.text(`Aprovadas: ${resumo.aprovadas || 0}`);
    doc.text(`Recusadas: ${resumo.recusadas || 0}`);
    doc.text(`Finalizadas: ${resumo.finalizadas || 0}`);
    doc.moveDown();

    doc.fontSize(13).text("Ordens encontradas");
    doc.moveDown(0.5);

    if (!itens.length) {
      doc.fontSize(11).text("Nenhuma ordem encontrada.");
      doc.end();
      return;
    }

    const colunas = {
      id: 40,
      projeto: 90,
      status: 340,
      data: 430
    };

    function desenharCabecalhoTabela() {
      const y = doc.y;
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("ID", colunas.id, y);
      doc.text("Projeto", colunas.projeto, y, { width: 220 });
      doc.text("Status", colunas.status, y, { width: 80 });
      doc.text("Data", colunas.data, y, { width: 90 });
      doc.moveDown();
      doc.font("Helvetica");
    }

    desenharCabecalhoTabela();

    itens.forEach((os) => {
      if (doc.y > 740) {
        doc.addPage();
        desenharCabecalhoTabela();
      }

      const y = doc.y;
      const dataFormatada = new Date(os.data_lancamento).toLocaleDateString("pt-BR");

      doc.fontSize(8);
      doc.text(String(os.id), colunas.id, y, { width: 35 });
      doc.text(os.nome_projeto || "-", colunas.projeto, y, { width: 220 });
      doc.text(os.status || "-", colunas.status, y, { width: 80 });
      doc.text(dataFormatada, colunas.data, y, { width: 90 });

      doc.moveDown(1.8);
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao exportar PDF da lista de ordens"
    });
  }
};

module.exports = {
  criarOS,
  listarOS,
  buscarOSPorId,
  atualizarOS,
  atualizarStatusOS,
  gerarPDFOrdem,
  exportarListaPdf
};