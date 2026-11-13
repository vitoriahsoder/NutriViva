
import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarAdministrador } from "../middlewares/autorizacaoMiddleware.js";

import {
    cadastrarUsuario,
    listarUsuarios,
    fazerLogin,
    consultarPerfil,
    atualizarPerfil
} from "../controllers/usuariosController.js";

const router = express.Router();

// Cadastro e login
router.post("/cadastro", cadastrarUsuario);
router.post("/login", fazerLogin);

// Rotas do perfil: qualquer usuário autenticado
router.get("/perfil", verificarToken, consultarPerfil);
router.put("/perfil", verificarToken, atualizarPerfil);

// Rota exclusiva para administradores
router.get("/", verificarToken, verificarAdministrador, listarUsuarios);

router.get("/administradores", verificarToken, verificarAdministrador, (req, res) => {
    res.status(200).json({
        mensagem: "Bem-vindo, administrador!"
    });
});

export default router;
