import { listarBarberosActivos, obtenerBarberoPorId, actualizarHorariosBarbero, agregarBloqueoBarbero } from "../Data/barberoData.js";
import { ObjectId } from "mongodb";
import { esIdValido, esHoraValida, seSuperponen } from "./turnoUtils.js";

export async function listarBarberosService() {
    const barberos = await listarBarberosActivos();
    return barberos;
}

export async function obtenerBarberoPorIdService(id) {
    if (!esIdValido(id)) {
        throw { status: 400, message: "El identificador del barbero no es válido."};
    }

    const barbero = await obtenerBarberoPorId(id);

    if (!barbero) {
        throw { status: 404, message: "Barbero no encontrado."};
    }

    return barbero;
}

export async function actualizarHorariosBarberoService(id, usuario, horarios) {

    if (!esIdValido(id)) {
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

        const { inicio, fin } = franja;

        if(!esHoraValida(inicio) || !esHoraValida(fin)) {
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

            if (primera.dia === segunda.dia && seSuperponen(primera.inicio, primera.fin, segunda.inicio, segunda.fin)) {
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

export async function agregarBloqueoBarberoService(id, usuario, datos) {
    if (!esIdValido(id)) {
        throw { status: 400, message: "El identificador del barbero no es válido"};
    }

    if (usuario?.rol !== "barbero" || usuario.id.toLowerCase() !== id.toLowerCase()) {
        throw { status: 403, message: "Solo podes agregar bloqueos a tu propia agenda."}
    }

    const inicioTexto = datos?.inicio;
    const finTexto = datos?.fin;

    if (typeof inicioTexto !== "string" || typeof finTexto !== "string") {
        throw { status: 400, message: "El inicio y el fin del bloqueo deben enviarse como texto."}
    }

    const inicio = new Date(inicioTexto);
    const fin = new Date(finTexto);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
        throw { status: 400, message: "El inicio y el fin deben ser fechas válidas."}
    };

    const zonaAlFinal = /(?:Z|[+-]\d{2}:\d{2})$/;

    if (!zonaAlFinal.test(inicioTexto) || !zonaAlFinal.test(finTexto)) {
        throw { status:400, message: "El inicio y el fin deben incluir una zona horaria."};
    }

    if (inicio >= fin) {
        throw { status: 400, message: "El inicio del bloqueo debe ser anterior al fin."}
    }

    const bloqueo = {
        _id: new ObjectId(),
        inicio,
        fin
    };

    const resultado = await agregarBloqueoBarbero(id, bloqueo);

    if (resultado.matchedCount === 0) {
        const barbero = await obtenerBarberoPorId(id);

        if (!barbero) {
            throw { status: 404, message: "Barbero no encontrado." };
        }

        throw { status: 409, message: "El bloqueo se superpone con un turno activo."}
    }

    return bloqueo;

}