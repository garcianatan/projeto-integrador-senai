const permitirFuncionario = (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }
  
    if (req.usuario.tipo !== "funcionario") {
      return res.status(403).json({ erro: "Acesso restrito a funcionários" });
    }
  
    next();
  };
  
  module.exports = permitirFuncionario;