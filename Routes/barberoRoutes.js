import { Router } from "express";
import { listarBarberosController, obtenerBarberoPorIdController } from "../Controller/barberoController.js";

const router = Router();
router.get("/", listarBarberosController);
router.get("/:id", obtenerBarberoPorIdController)

export default router;
