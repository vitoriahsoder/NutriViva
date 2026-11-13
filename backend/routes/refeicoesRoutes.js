import express from "express";

import {
    cadastrarRefeicao,
    listarRefeicoes,
    buscarRefeicaoPorId,
    editarRefeicao,
    excluirRefeicao
} from "../controllers/refeicoesController.js";

import { verificarToken } from "../middlewares/authMiddleware.js";
import { verificarAdministrador } from "../middlewares/autorizacaoMiddleware.js";

const router = express.Router();

// Consultar refeições: usuários autenticados
router.get("/", verificarToken, listarRefeicoes);
router.get("/:id", verificarToken, buscarRefeicaoPorId);

// Administradores podem cadastrar, editar e excluir
router.post("/", verificarToken, verificarAdministrador, cadastrarRefeicao);
router.put("/:id", verificarToken, verificarAdministrador, editarRefeicao);
router.delete("/:id", verificarToken, verificarAdministrador, excluirRefeicao);

export default router;
