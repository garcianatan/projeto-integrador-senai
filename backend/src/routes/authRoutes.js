const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const autenticarToken = require("../middlewares/auth");
const permitirAdmin = require("../middlewares/admin");


router.post("/register", autenticarToken, permitirAdmin, authController.cadastrar);
router.post("/login", authController.login);

module.exports = router;

