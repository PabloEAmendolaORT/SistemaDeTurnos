import { obtenerBarberoPorTurnoId } from "../Data/turnoData.js";

function crearError(status, message, errors = []) {
    const error = new Error(message);
    error.status = status;
    error.errors = errors;

    return error;
}

export async function obtenerTurnoPorIdService(id, usuario) {
    const barbero = await obtenerBarberoPorTurnoId(id);

    if (!barbero) {
        throw crearError(404, "Turno no encontrado");
    }

    const turno = barbero.turnos.find(
        (t) => t._id.toString() === id.toLowerCase()
    );

    const esSuCliente =
        usuario.rol === "cliente" &&
        turno.cliente.toString() === usuario.id;

    const esSuBarbero =
        usuario.rol === "barbero" &&
        barbero._id.toString() === usuario.id;

    if (!esSuCliente && !esSuBarbero) {
        throw crearError(403, "Sin permiso para ver este turno");
    }

    return {
        ...turno,
        barberoId: barbero._id
    };
}
