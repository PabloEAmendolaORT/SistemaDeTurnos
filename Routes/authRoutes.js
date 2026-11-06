
import { Router } from "express";

import {
    registrarClienteController,
    iniciarSesionController
} from "../Controller/authController.js";

const router = Router();

router.post("/register", registrarClienteController);
router.post("/login", iniciarSesionController);

export default router;
