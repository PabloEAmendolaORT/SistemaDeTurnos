import { Router } from "express";
import { listarBarberosController } from "../Controller/barberoController.js";

const router = Router();
router.get("/", listarBarberosController);

export default router;
