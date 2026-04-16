const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const autenticarToken = require("../middlewares/auth");
const permitirAdmin = require("../middlewares/admin");

router.get("/",autenticarToken, permitirAdmin, usuarioController.listarUsuarios);
router.get("/:id",autenticarToken, permitirAdmin, usuarioController.buscarUsuarioPorId);
router.put("/:id",autenticarToken, permitirAdmin, usuarioController.atualizarUsuario);
router.put("/:id/senha",autenticarToken, permitirAdmin, usuarioController.alterarSenhaUsuario);
router.put("/:id/desativar",autenticarToken, permitirAdmin, usuarioController.desativarUsuario);
router.put("/:id/reativar",autenticarToken, permitirAdmin, usuarioController.reativarUsuario);
router.put("/:id/perfil",autenticarToken, permitirAdmin, usuarioController.atualizarPerfil);

module.exports = router;