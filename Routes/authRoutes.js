
import { Router } from "express";
import { registrarClienteController } from "../Controller/authController.js";

const router = Router();

router.post("/register", registrarClienteController);

export default router;
