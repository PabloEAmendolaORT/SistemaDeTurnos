import { Router } from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js"
import { rolesMiddleware } from "../Middlewares/roles.middleware.js"
import { actualizarHorariosBarberoController, listarBarberosController, obtenerBarberoPorIdController, agregarBloqueoBarberoController } from "../Controller/barberoController.js";
import { disponibilidad } from "../Controller/turnoController.js";

const router = Router();
router.get("/", listarBarberosController);
router.get("/:id", obtenerBarberoPorIdController)
router.put("/:id/horarios", authMiddleware, rolesMiddleware("barbero"), actualizarHorariosBarberoController);
router.get("/:id/disponibilidad", authMiddleware, disponibilidad);
router.post("/:id/bloqueos", authMiddleware, rolesMiddleware("barbero"), agregarBloqueoBarberoController)

export default router;
