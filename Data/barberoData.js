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

export async function agregarBloqueoBarbero(id, bloqueo) {
    const db = getDB();

    return await db.collection("barberos").updateOne(
        { _id: new ObjectId(id), 
            turnos: { 
                $not: {
                    $elemMatch: {
                        estado: { $in: ["pendiente", "confirmado"] },
                        inicio: { $lt: bloqueo.fin },
                        fin: { $gt: bloqueo.inicio}
                    }
                }
            } 
        },
        { $push: { bloqueos: bloqueo } }
    );
}

export async function obtenerBarberoActivo(id) {
    const db = getDB();

    return await db.collection("barberos").findOne(
        { _id: new ObjectId(id), activo: true },
        { projection: { password: 0 } }
    );
}