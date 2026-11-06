
import { ObjectId } from "mongodb";
import { getDB } from "../Config/database.js";

function coleccionClientes() {
    return getDB().collection("clientes");
}

export async function obtenerClientePorEmail(email) {
    return coleccionClientes().findOne({ email });
}

export async function obtenerClientePorId(id) {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
        return null;
    }

    return coleccionClientes().findOne({
        _id: new ObjectId(id)
    });
}

export async function crearCliente(cliente) {
    return coleccionClientes().insertOne(cliente);
}

export async function crearIndiceEmailClientes() {
    return coleccionClientes().createIndex(
        { email: 1 },
        { unique: true, name: "email_unico" }
    );
}
