
import { ObjectId } from "mongodb";
import { getDB } from "../Config/database.js";

export async function obtenerClientePorEmail(email) {
    const db = getDB();

    return await db.collection("clientes").findOne({
        email: email
    });
}

export async function obtenerClientePorId(id) {
    if (
        typeof id !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(id)
    ) {
        return null;
    }

    const db = getDB();

    return await db.collection("clientes").findOne({
        _id: new ObjectId(id)
    });
}

export async function crearCliente(cliente) {
    const db = getDB();

    return await db.collection("clientes").insertOne(cliente);
}

export async function crearIndiceEmailClientes() {
    const db = getDB();

    return await db.collection("clientes").createIndex(
        { email: 1 },
        { unique: true }
    );
}
