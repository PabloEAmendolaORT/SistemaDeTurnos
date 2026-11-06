
import { Router } from "express";

import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { disponibilidad } from "../Controller/turnoController.js";

const router = Router();

router.get("/:id/disponibilidad", authMiddleware, disponibilidad);

export default router;
