import { Router } from "express";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { rolesMiddleware } from "../Middlewares/roles.middleware.js";
import { reservar } from "../Controller/turnoController.js";

const router = Router();

router.post("/", authMiddleware, rolesMiddleware("cliente"), reservar);

export default router;
