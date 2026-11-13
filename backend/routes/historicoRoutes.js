
import express from "express";

import { verificarToken } from "../middlewares/authMiddleware.js";

import {
    cadastrarHistorico,
    listarHistorico,
    excluirHistorico
} from "../controllers/historicoController.js";

const router = express.Router();

router.post("/", verificarToken, cadastrarHistorico);
router.get("/", verificarToken, listarHistorico);
router.delete("/:id", verificarToken, excluirHistorico);

export default router;
