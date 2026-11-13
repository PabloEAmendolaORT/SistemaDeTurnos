import "dotenv/config";

import { connectDB, closeDB } from "../Config/database.js";

const REGEX_HORA = "^([01]\\d|2[0-3]):[0-5]\\d$";
const REGEX_EMAIL = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

const validadorBarberos = {
    $jsonSchema: {
        bsonType: "object",
        required: ["nombre", "apellido", "email", "password", "rol", "activo", "horarios", "bloqueos", "turnos"],
        properties: {
            nombre: { bsonType: "string", minLength: 1 },
            apellido: { bsonType: "string", minLength: 1 },
            email: { bsonType: "string", pattern: REGEX_EMAIL },
            password: { bsonType: "string", minLength: 1 },
            rol: { enum: ["barbero"] },
            activo: { bsonType: "bool" },
            horarios: {
                bsonType: "array",
                items: {
                    bsonType: "object",
                    required: ["dia", "inicio", "fin"],
                    properties: {
                        dia: { bsonType: "number", minimum: 0, maximum: 6 },
                        inicio: { bsonType: "string", pattern: REGEX_HORA },
                        fin: { bsonType: "string", pattern: REGEX_HORA }
                    }
                }
            },
            bloqueos: {
                bsonType: "array",
                items: {
                    bsonType: "object",
                    required: ["_id", "inicio", "fin"],
                    properties: {
                        _id: { bsonType: "objectId" },
                        inicio: { bsonType: "date" },
                        fin: { bsonType: "date" },
                        motivo: { bsonType: "string" }
                    }
                }
            },
            turnos: {
                bsonType: "array",
                items: {
                    bsonType: "object",
                    required: ["_id", "cliente", "inicio", "fin", "duracionMinutos", "estado", "createdAt"],
                    properties: {
                        _id: { bsonType: "objectId" },
                        cliente: { bsonType: "objectId" },
                        inicio: { bsonType: "date" },
                        fin: { bsonType: "date" },
                        duracionMinutos: { bsonType: "number", minimum: 1 },
                        estado: { enum: ["pendiente", "confirmado", "completado", "cancelado", "ausente"] },
                        createdAt: { bsonType: "date" }
                    }
                }
            }
        }
    }
};

const validadorClientes = {
    $jsonSchema: {
        bsonType: "object",
        required: ["nombre", "apellido", "email", "password", "rol", "activo"],
        properties: {
            nombre: { bsonType: "string", minLength: 1 },
            apellido: { bsonType: "string", minLength: 1 },
            email: { bsonType: "string", pattern: REGEX_EMAIL },
            telefono: { bsonType: ["string", "null"] },
            password: { bsonType: "string", minLength: 1 },
            rol: { enum: ["cliente"] },
            activo: { bsonType: "bool" }
        }
    }
};

async function aplicarValidador(db, nombre, validator) {
    const existentes = await db.listCollections({ name: nombre }).toArray();

    if (existentes.length === 0) {
        await db.createCollection(nombre, {
            validator,
            validationLevel: "strict",
            validationAction: "error"
        });
        console.log(`Colección creada: ${nombre}`);
        return;
    }

    await db.command({
        collMod: nombre,
        validator,
        validationLevel: "strict",
        validationAction: "error"
    });
    console.log(`Validador actualizado: ${nombre}`);
}

async function inicializar() {
    const db = await connectDB();

    await aplicarValidador(db, "barberos", validadorBarberos);
    await aplicarValidador(db, "clientes", validadorClientes);

    await db.collection("barberos").createIndex({ email: 1 }, { unique: true });
    await db.collection("clientes").createIndex({ email: 1 }, { unique: true });
    await db.collection("barberos").createIndex({ "turnos._id": 1 });
    await db.collection("barberos").createIndex({ "turnos.cliente": 1 });

    console.log("Índices creados");
}

inicializar()
    .then(() => closeDB())
    .catch(async (error) => {
        console.error("Error al inicializar la base:", error.message);
        await closeDB();
        process.exit(1);
    });
