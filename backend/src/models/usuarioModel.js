const db = require("../config/db");

const buscarPorEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email]
  );

  return rows[0];
};


// Para verificar e evitar adicionar email já cadastrado para outro usuário ao editar usuário 
const buscarPorEmailExcetoId = async (email, id) => {
  const [rows] = await db.execute(
    `
    SELECT * FROM usuarios
    WHERE email = ? AND id <> ?
    `,
    [email, id]
  );

  return rows[0];
};

const criar = async ({ nome, email, senha, tipo }) => {
  const [resultado] = await db.execute(
    `
    INSERT INTO usuarios (nome, email, senha, tipo)
    VALUES (?, ?, ?, ?)
    `,
    [nome, email, senha, tipo]
  );
  return resultado;
};

// funções abaixo para listar, update e delete de usuários
const listar = async () => {
  const [rows] = await db.execute(`
    SELECT id, nome, email, tipo, ativo, created_at
    FROM usuarios
    ORDER BY id DESC
  `);

  return rows;
};

const buscarPorId = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT id, nome, email, tipo, ativo, created_at
    FROM usuarios
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
};

const atualizar = async (id, { nome, email, tipo }) => {
  const [resultado] = await db.execute(
    `
    UPDATE usuarios
    SET nome = ?, email = ?, tipo = ?
    WHERE id = ?
    `,
    [nome, email, tipo, id]
  );

  return resultado;
};

// desativar e reativar usuário
const desativar = async (id) => {
  const [resultado] = await db.execute(
    `UPDATE usuarios SET ativo = 0 WHERE id = ?`,
    [id]
  );

  return resultado;
};

const reativar = async (id) => {
  const [resultado] = await db.execute(
    `UPDATE usuarios SET ativo = 1 WHERE id = ?`,
    [id]
  );

  return resultado;
};

const atualizarSenhaPorId = async (id, senha) => {
  const [resultado] = await db.execute(
    `UPDATE usuarios SET senha = ? WHERE id = ?`,
    [senha, id]
  );

  return resultado;
};

const listarPaginado = async ({ page = 1, limit = 10 }) => {
  const pagina = Number(page) || 1;
  const limite = Number(limit) || 10;
  const offset = (pagina - 1) * limite;

  const sql = `
    SELECT id, nome, email, tipo, ativo, created_at
    FROM usuarios
    ORDER BY id DESC
    LIMIT ${limite} OFFSET ${offset}
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

const contarPaginado = async () => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM usuarios
  `;

  const [rows] = await db.execute(sql);
  return rows[0].total;
};

module.exports = {
  buscarPorEmail,
  buscarPorEmailExcetoId,
  criar,
  listar,
  buscarPorId,
  atualizar,
  desativar,
  reativar,
  atualizarSenhaPorId,
  listarPaginado,
  contarPaginado
};