import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";

import {
    listarFavoritos,
    adicionarFavorito,
    removerFavorito
} from "../controllers/favoritosController.js";

const router = express.Router();

// Listar favoritos
router.get("/", verificarToken, listarFavoritos);

// Adicionar favorito
router.post("/", verificarToken, adicionarFavorito);

// Remover favorito
router.delete("/:id_refeicao", verificarToken, removerFavorito);

export default router;