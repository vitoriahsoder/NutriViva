
import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";

import {
    cadastrarPlanejamento,
    listarPlanejamento,
    editarPlanejamento,
    excluirPlanejamento
} from "../controllers/planejamentoController.js";

const router = express.Router();

router.post("/", verificarToken, cadastrarPlanejamento);
router.get("/", verificarToken, listarPlanejamento);
router.put("/:id", verificarToken, editarPlanejamento);
router.delete("/:id", verificarToken, excluirPlanejamento);

export default router;
