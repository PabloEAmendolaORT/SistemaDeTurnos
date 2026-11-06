
import express from "express";
import morgan from "morgan";
import cors from "cors";

import clienteRoutes from "./Routes/clienteRoutes.js";
import barberoRoutes from "./Routes/barberoRoutes.js";
import turnoRoutes from "./Routes/turnoRoutes.js";
import authRoutes from "./Routes/authRoutes.js";

import { errorMiddleware } from "./Middlewares/error.middleware.js";

// Inicialización de Express
const app = express();

// Middlewares globales
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
    res.send("API Sistema de Turnos - Barbería");
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/barberos", barberoRoutes);
app.use("/api/turnos", turnoRoutes);

// Manejo de rutas inexistentes
app.use((req, res) => {
    res.status(404).json({
        message: "Recurso no encontrado",
        errors: []
    });
});

// Manejo global de errores
app.use(errorMiddleware);

export default app;
