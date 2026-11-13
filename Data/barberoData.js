import { getDB } from "../Config/database.js";

export async function listarBarberosActivos() {
    const db = getDB();

    return await db.collection("barberos")
        .find(
            { activo: true },
            { projection: { password: 0, turnos: 0 } }
        )
        .toArray();
}