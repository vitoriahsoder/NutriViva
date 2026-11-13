import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { listarSugestoes } from "../controllers/sugestoesController.js";

const router = express.Router();

router.get("/", verificarToken, listarSugestoes);

export default router;
