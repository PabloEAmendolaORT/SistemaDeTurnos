import { Router } from "express";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { rolesMiddleware } from "../Middlewares/roles.middleware.js";
import {
    reservar,
    obtenerTurnoPorIdController,
    actualizarEstadoTurnoController 
} from "../Controller/turnoController.js";

const router = Router();

router.post("/", authMiddleware, rolesMiddleware("cliente"), reservar);
router.get("/:id", authMiddleware, obtenerTurnoPorIdController);
router.patch("/:id/estado", authMiddleware, rolesMiddleware("barbero"), actualizarEstadoTurnoController);

export default router;
