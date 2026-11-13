import { listarBarberosActivos, obtenerBarberoPorId, actualizarHorariosBarbero } from "../Data/barberoData.js";

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

export async function actualizarHorariosBarberoService(id, usuario, horarios) {

    if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
        throw { status: 400, message: "El identificador del barbero no es válido."};
    }

    if (usuario?.rol !== "barbero" || usuario.id.toLowerCase() !== id.toLowerCase()) {
        throw { status: 403, message: "Solo podes modificar los horarios de tu propia agenda."}
    }

    if (!Array.isArray(horarios)) {
        throw { status: 400, message: "Los horarios deben enviarse como un array."};
    }

    for (const franja of horarios) {
        const dia = franja?.dia;

        if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
            throw { status: 400, message: "Cada franja debe tener un dia entero entre 0 y 6."};
        }

        const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

        const { inicio, fin } = franja;

        if(typeof inicio !== "string" || typeof fin !== "string" || !formatoHora.test(inicio) || !formatoHora.test(fin)) {
            throw { status: 400, message: "El inicio y el fin deben tener formato HH:mm."}
        };

        if (inicio >= fin) {
            throw { status: 400, message: "El inicio debe ser anterior al fin."};
        }
    }

    for (let i = 0; i < horarios.length; i++) {
        const primera = horarios[i];

        for (let j = i + 1; j < horarios.length; j++){
            const segunda = horarios[j];

            if (primera.dia === segunda.dia && primera.inicio < segunda.fin && segunda.inicio < primera.fin) {
                throw { status: 400, message: "Las franjas de un mismo día no pueden superponerse."}
            }
        }
    }

    const resultado = await actualizarHorariosBarbero(id, horarios);

    if (resultado.matchedCount === 0) {
        throw { status: 404, message: "Barbero no encontrado." };
    }

    return horarios;
}