
import "dotenv/config";

import app from "./App.js";
import { connectDB } from "./Config/database.js";

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Servidor funcionando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

iniciarServidor();
