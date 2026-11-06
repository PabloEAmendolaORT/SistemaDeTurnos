
import { getDB } from "../Config/database.js";

export async function obtenerBarberoPorEmail(email) {
    const db = getDB();

    return await db.collection("barberos").findOne({
        email: email
    });
}
