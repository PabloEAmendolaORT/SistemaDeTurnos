
import { ObjectId } from "mongodb";
import { getDB } from "../Config/database.js";


export async function obtenerBarberoPorTurnoId(id) {
    if (
        typeof id !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(id)
    ) {
        return null;
    }

    const db = getDB();

    return await db.collection("barberos").findOne({
        "turnos._id": new ObjectId(id)
    });
}

