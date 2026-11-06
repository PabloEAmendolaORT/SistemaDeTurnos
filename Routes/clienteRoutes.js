
import { Router } from "express";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { rolesMiddleware } from "../Middlewares/roles.middleware.js";

import {
    obtenerClienteController,
    actualizarClienteController
} from "../Controller/clienteController.js";

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

export default router;
