const express = require("express");
const cors = require("cors");
const osRoutes = require("./routes/osRoutes");
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const noCache = require("./middlewares/noCache");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(noCache);
app.use("/ordens", osRoutes);
app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);

// Caminho para o build do React
const frontendPath = path.join(__dirname, "../../projeto/dist");
 
// Servir arquivos do React
app.use(express.static(frontendPath));
 
// Quando acessar qualquer rota do React, devolver o index.html
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


module.exports = app;