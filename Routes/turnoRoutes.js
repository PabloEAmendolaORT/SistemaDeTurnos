import { Router } from "express";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { rolesMiddleware } from "../Middlewares/roles.middleware.js";
import {
    reservar,
    obtenerTurnoPorIdController
} from "../Controller/turnoController.js";

const router = Router();

router.post("/", authMiddleware, rolesMiddleware("cliente"), reservar);
router.get("/:id", authMiddleware, obtenerTurnoPorIdController);

export default router;
