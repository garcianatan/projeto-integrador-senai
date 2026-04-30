const bcrypt = require("bcryptjs");
const usuarioModel = require("../models/usuarioModel");

const listarUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pagina = Number(page) || 1;
    const limite = Number(limit) || 10;

    const total = await usuarioModel.contarPaginado();
    const totalPages = Math.max(1, Math.ceil(total / limite));
    const paginaFinal = Math.min(Math.max(pagina, 1), totalPages);

    const usuarios = await usuarioModel.listarPaginado({
      page: paginaFinal,
      limit: limite
    });

    res.json({
      itens: usuarios,
      paginacao: {
        page: paginaFinal,
        limit: limite,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
};

const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar usuário" });
  }
};

const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, tipo, usuarioLogadoId } = req.body;

        if (!nome || !email || !tipo) {
        return res.status(400).json({
            erro: "Nome, email e tipo são obrigatórios"
        });
        }

        // impedir que admin altere o próprio tipo para funcionario
        if (Number(id) === Number(usuarioLogadoId) && tipo !== "admin") {
        return res.status(400).json({
            erro: "Você não pode alterar seu próprio tipo de admin"
        });
        }

        // impedir alterar email para outro já cadastrado em outro usuário
        const emailExistente = await usuarioModel.buscarPorEmailExcetoId(email, id);

        if (emailExistente) {
          return res.status(400).json({
            erro: "Já existe outro usuário com esse email"
          });
        }

        const resultado = await usuarioModel.atualizar(id, { nome, email, tipo });

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        res.json({ mensagem: "Usuário atualizado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao atualizar usuário" });
    }
};

const desativarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioLogadoId } = req.body;

    if (Number(id) === Number(usuarioLogadoId)) {
      return res.status(400).json({
        erro: "Você não pode desativar seu próprio usuário"
      });
    }

    const resultado = await usuarioModel.desativar(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({ mensagem: "Usuário desativado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao desativar usuário" });
  }
};

const reativarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await usuarioModel.reativar(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({ mensagem: "Usuário reativado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao reativar usuário" });
  }
};

const alterarSenhaUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { novaSenha } = req.body;

        if (!novaSenha) {
        return res.status(400).json({ erro: "Nova senha é obrigatória" });
        }

        const usuario = await usuarioModel.buscarPorId(id);

        if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

        await usuarioModel.atualizarSenhaPorId(id, senhaCriptografada);

        res.json({ mensagem: "Senha alterada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao alterar senha do usuário" });
    }
};

const atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;

    if (Number(id) !== Number(req.usuario.id)) {
      return res.status(403).json({
        erro: "Você só pode editar o seu próprio perfil"
      });
    }

    if (!nome || !email) {
      return res.status(400).json({
        erro: "Nome e email são obrigatórios"
      });
    }

    const usuario = await usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const emailExistente = await usuarioModel.buscarPorEmailExcetoId(email, id);

    if (emailExistente) {
      return res.status(400).json({
        erro: "Já existe outro usuário com esse email"
      });
    }

    const resultado = await usuarioModel.atualizar(id, {
      nome,
      email,
      tipo: usuario.tipo
    });

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({ mensagem: "Perfil atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar perfil" });
  }
};

const buscarPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) !== Number(req.usuario.id)) {
      return res.status(403).json({
        erro: "Você só pode acessar o seu próprio perfil"
      });
    }

    const usuario = await usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar perfil" });
  }
};

const alterarMinhaSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (Number(id) !== Number(req.usuario.id)) {
      return res.status(403).json({
        erro: "Você só pode alterar a sua própria senha"
      });
    }

    if (!novaSenha || !novaSenha.trim()) {
      return res.status(400).json({
        erro: "Nova senha é obrigatória"
      });
    }

    const usuario = await usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await usuarioModel.atualizarSenhaPorId(id, senhaCriptografada);

    res.json({ mensagem: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao alterar senha" });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  desativarUsuario,
  reativarUsuario,
  alterarSenhaUsuario,
  atualizarPerfil,
  buscarPerfil,
  alterarMinhaSenha
};