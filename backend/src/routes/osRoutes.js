const express = require("express");
const router = express.Router();
const osController = require("../controllers/osController");
const autenticarToken = require("../middlewares/auth");
const permitirFuncionario = require("../middlewares/funcionario");

router.post("/", autenticarToken, permitirFuncionario, osController.criarOS);
router.get("/", autenticarToken, permitirFuncionario, osController.listarOS);
router.get("/:id", autenticarToken, permitirFuncionario, osController.buscarOSPorId);
router.put("/:id", autenticarToken, permitirFuncionario, osController.atualizarOS); // rota para permitir editar somente OSs pendentes
router.put("/:id/status", autenticarToken, permitirFuncionario, osController.atualizarStatusOS);
router.get('/:id/pdf', autenticarToken, permitirFuncionario, osController.gerarPDFOrdem);

module.exports = router;