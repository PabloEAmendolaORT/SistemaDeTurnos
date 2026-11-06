
import { Router } from "express";

import {
    authMiddleware 
} from "../Middlewares/auth.middleware.js";

import {
    obtenerTurnoPorIdController 
} from "../Controller/turnoController.js";

const router = Router();

router.get("/:id", authMiddleware, obtenerTurnoPorIdController);

export default router;
