
import "dotenv/config";

import { connectDB, closeDB } from "../Config/database.js";
import { crearIndiceEmailClientes } from "../Data/clienteData.js";

try {
    await connectDB();

    const nombreIndice = await crearIndiceEmailClientes();

    console.log(`Índice único preparado: ${nombreIndice}`);
} catch (error) {
    console.error("No se pudo preparar el índice de clientes:", error.message);
    process.exitCode = 1;
} finally {
    await closeDB();
}
