import express from "express";
import morgan from "morgan";
import cors from "cors";

import clienteRoutes from "./Routes/clienteRoutes.js";
import barberoRoutes from "./Routes/barberoRoutes.js";
import turnoRoutes from "./Routes/turnoRoutes.js";

// Inicialización de Express
const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
    res.send("API Sistema de Turnos - Barbería");
});

// Rutas
app.use("/api/clientes", clienteRoutes);
app.use("/api/barberos", barberoRoutes);
app.use("/api/turnos", turnoRoutes);

// Manejo global de rutas inexistentes
app.use((req, res) => {
    res.status(404).json({
        error: "Recurso no encontrado"
    });
});

// Manejo global de errores inesperados
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: "Error interno del servidor"
    });
});

export default app;