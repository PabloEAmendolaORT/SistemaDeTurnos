import { getDB } from "../Config/database.js";
import { ObjectId } from "mongodb";

export async function listarBarberosActivos() {
    const db = getDB();

    return await db.collection("barberos")
        .find(
            { activo: true },
            { projection: { password: 0, turnos: 0 } }
        )
        .toArray();
}

export async function obtenerBarberoPorId(id) {
    const db = getDB();

    return await db.collection("barberos").findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0, turnos: 0 } }
    );
}

export async function actualizarHorariosBarbero(id, horarios) {
    const db = getDB();

    return await db.collection("barberos").updateOne(
        { _id: new ObjectId(id) },
        { $set: { horarios } }
    );
}