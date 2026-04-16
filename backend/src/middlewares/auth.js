const jwt = require("jsonwebtoken");
 
// Função para autenticar token
const autenticarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
 
    if (!authHeader) {
      return res.status(401).json({ erro: "Token não informado" });
    }
 
    const partes = authHeader.split(" ");
 
    if (partes.length !== 2) {
      return res.status(401).json({ erro: "Token mal formatado" });
    }
 
    const [scheme, token] = partes;
 
    if (scheme !== "Bearer") {
      return res.status(401).json({ erro: "Formato do token inválido" });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    req.usuario = decoded;
 
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
};
 
module.exports = autenticarToken;
 