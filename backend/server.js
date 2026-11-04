
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testarConexao } from "./database/conexao.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        mensagem: "API do NutriViva funcionando!"
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Servidor do NutriViva iniciado!");
    console.log(`Acesse: http://localhost:${PORT}/`);

    testarConexao();
});
