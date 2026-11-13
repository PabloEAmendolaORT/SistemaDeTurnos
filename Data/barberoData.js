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

export async function obtenerAgendaBarbero(id, desde, hasta) {
    const db = getDB();

    const [agenda] = await db.collection("barberos").aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $project: {
            turnos: {
                $filter: {
                    input: { $ifNull: ["$turnos", []]},
                    as: "turno",
                    cond: {
                        $and: [
                            { $gte: ["$$turno.inicio", desde] },
                            { $lt: ["$$turno.inicio", hasta] }
                        ]
                    }
                }
            }
        }}
    ]).toArray();

    return agenda ?? null;
}

export async function obtenerBarberoActivo(id) {
    const db = getDB();

    return await db.collection("barberos").findOne(
        { _id: new ObjectId(id), activo: true },
        { projection: { password: 0 } }
    );
}