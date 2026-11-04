import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarAdministrador } from "../middlewares/autorizacaoMiddleware.js";

import {
    cadastrarUsuario,
    listarUsuarios,
    fazerLogin
} from "../controllers/usuariosController.js";

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.get("/", listarUsuarios);
router.post("/login", fazerLogin);

// Rota acessível para qualquer usuário autenticado
router.get("/perfil", verificarToken, (req, res) => {
    res.status(200).json({
        mensagem: "Acesso autorizado!",
        usuario: req.usuario
    });
});

// Rota acessível somente para administradores
router.get("/administradores", verificarToken, verificarAdministrador, (req, res) => {
    res.status(200).json({
        mensagem: "Bem-vindo, administrador!"
    });
});

export default router;
