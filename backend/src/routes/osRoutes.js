const express = require("express");
const router = express.Router();
const osController = require("../controllers/osController");
const autenticarToken = require("../middlewares/auth");

router.post("/", autenticarToken, osController.criarOS);
router.get("/", autenticarToken, osController.listarOS);
router.get("/:id", autenticarToken, osController.buscarOSPorId);
router.put("/:id", autenticarToken, osController.atualizarOS); // rota para permitir editar somente OSs pendentes
router.put("/:id/status", autenticarToken, osController.atualizarStatusOS);
router.get('/:id/pdf', autenticarToken, osController.gerarPDFOrdem);

module.exports = router;