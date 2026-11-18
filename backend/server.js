import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { testarConexao } from "./database/conexao.js";

import usuariosRoutes from "./routes/usuariosRoutes.js";
import refeicoesRoutes from "./routes/refeicoesRoutes.js";
import favoritosRoutes from "./routes/favoritosRoutes.js";
import planejamentoRoutes from "./routes/planejamentoRoutes.js";
import historicoRoutes from "./routes/historicoRoutes.js";
import sugestoesRoutes from "./routes/sugestoesRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.warn("AVISO: JWT_SECRET não definido no .env.");
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRoutes);
app.use("/refeicoes", refeicoesRoutes);
app.use("/favoritos", favoritosRoutes);
app.use("/planejamento", planejamentoRoutes);
app.use("/historico", historicoRoutes);
app.use("/sugestoes", sugestoesRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        mensagem: "API do NutriViva funcionando!"
    });
});

// A API sempre responde em JSON, inclusive para caminhos inexistentes.
app.use((req, res) => {
    res.status(404).json({
        mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}`
    });
});

app.use((erro, req, res, next) => {
    const status = Number.isInteger(erro.status) ? erro.status : 500;
    if (status >= 500) console.error("Erro não tratado na API:", erro);
    const mensagem = status === 400
        ? "Corpo da requisição inválido. Envie um objeto JSON válido."
        : "Erro interno no servidor.";
    res.status(status).json({ mensagem });
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log("Servidor do NutriViva iniciado!");
    console.log(`Acesse: http://localhost:${PORT}/`);

    testarConexao();
});
