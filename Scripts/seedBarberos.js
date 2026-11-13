import "dotenv/config";
import bcrypt from "bcrypt";

import { connectDB, closeDB, getDB } from "../Config/database.js";
import { obtenerBarberoPorEmail } from "../Data/authData.js";

try{
    await connectDB();

    const email = "barbero.prueba@test.com"
    const barberoExistente = await obtenerBarberoPorEmail(email);

    if (barberoExistente) {
        console.log(`El barbero ${email} ya existe.`);
    } else {
        const password = await bcrypt.hash("BarberoDemo123", 10);

        const barbero = {
            nombre: "Barbero",
            apellido: "Prueba",
            email,
            password,
            rol: "barbero",
            activo: true,
            horarios: [
                { dia: 1, inicio: "09:00", fin: "13:00" }
            ],
            bloqueos: [],
            turnos: []
        };

        await getDB().collection("barberos").insertOne(barbero);
        console.log(`Se creó el barbero ${email}.`);
    }

} finally{
    await closeDB();
}