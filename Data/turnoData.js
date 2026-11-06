import { ObjectId } from "mongodb";
import { getDB } from "../Config/database.js";

export const DURACION_TURNO_MINUTOS = 45;
export const ESTADOS_ACTIVOS = ["pendiente", "confirmado"];

const barberos = () => getDB().collection("barberos");

export function nuevoTurno(clienteId, inicio) {
    return {
        _id: new ObjectId(),
        cliente: new ObjectId(clienteId),
        inicio,
        fin: new Date(inicio.getTime() + DURACION_TURNO_MINUTOS * 60000),
        duracionMinutos: DURACION_TURNO_MINUTOS,
        estado: "pendiente",
        createdAt: new Date()
    };
}

export async function reservarTurnoAtomico(barberoId, turno) {
    return barberos().findOneAndUpdate(
        {
            _id: new ObjectId(barberoId),
            activo: true,
            turnos: {
                $not: {
                    $elemMatch: {
                        estado: { $in: ESTADOS_ACTIVOS },
                        inicio: { $lt: turno.fin },
                        fin: { $gt: turno.inicio }
                    }
                }
            },
            bloqueos: {
                $not: {
                    $elemMatch: {
                        inicio: { $lt: turno.fin },
                        fin: { $gt: turno.inicio }
                    }
                }
            }
        },
        { $push: { turnos: turno } },
        { returnDocument: "after", projection: { _id: 1 } }
    );
}

export async function existeTurnoActivoDelCliente(clienteId, inicio, fin) {
    const barbero = await barberos().findOne(
        {
            turnos: {
                $elemMatch: {
                    cliente: new ObjectId(clienteId),
                    estado: { $in: ESTADOS_ACTIVOS },
                    inicio: { $lt: fin },
                    fin: { $gt: inicio }
                }
            }
        },
        { projection: { _id: 1 } }
    );

    return barbero !== null;
}
