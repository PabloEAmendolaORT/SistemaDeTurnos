
import { Router } from "express";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { rolesMiddleware } from "../Middlewares/roles.middleware.js";

import {
    obtenerClienteController,
    actualizarClienteController
} from "../Controller/clienteController.js";

import { obtenerTurnosClienteController } from "../Controller/turnoController.js";

const router = Router();

router.get(
    "/:id",
    authMiddleware,
    rolesMiddleware("cliente"),
    obtenerClienteController
);

router.put(
    "/:id",
    authMiddleware,
    rolesMiddleware("cliente"),
    actualizarClienteController
);

router.get(
    "/:id/turnos",
    authMiddleware,
    rolesMiddleware("cliente"),
    obtenerTurnosClienteController
);

export default router;
