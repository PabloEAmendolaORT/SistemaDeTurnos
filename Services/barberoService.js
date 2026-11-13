import { listarBarberosActivos, obtenerBarberoPorId } from "../Data/barberoData.js";

export async function listarBarberosService() {
    const barberos = await listarBarberosActivos();
    return barberos;
}

export async function obtenerBarberoPorIdService(id) {
    if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
        throw { status: 400, message: "El identificador del barbero no es válido."};
    }

    const barbero = await obtenerBarberoPorId(id);

    if (!barbero) {
        throw { status: 404, message: "Barbero no encontrado."};
    }

    return barbero;
}