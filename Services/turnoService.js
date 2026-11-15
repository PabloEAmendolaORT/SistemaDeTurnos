import { obtenerClientePorId } from "../Data/clienteData.js";
import {
    DURACION_TURNO_MINUTOS,
    ESTADOS_ACTIVOS,
    nuevoTurno,
    obtenerBarberoActivo,
    obtenerBarberoPorTurnoId,
    reservarTurnoAtomico,
    existeTurnoActivoDelCliente,
    obtenerBarberosConTurnosDeCliente
} from "../Data/turnoData.js";

import {
    crearError,
    esIdValido,
    esFechaValida,
    esHoraValida,
    construirFecha,
    estaEnHorarioLaboral,
    generarSlots
} from "./turnoUtils.js";

export async function reservarTurno(usuario, { barberoId, fecha, hora } = {}) {
    const errores = [];

    if (!esIdValido(barberoId)) errores.push("barberoId inválido");
    if (!esFechaValida(fecha)) errores.push("fecha inválida, se espera el formato YYYY-MM-DD");
    if (!esHoraValida(hora)) errores.push("hora inválida, se espera el formato HH:mm");

    if (errores.length > 0) {
        throw crearError(400, "Datos de la reserva inválidos", errores);
    }

    const cliente = await obtenerClientePorId(usuario.id);

    if (!cliente) {
        throw crearError(404, "Cliente no encontrado");
    }

    if (!cliente.activo) {
        throw crearError(403, "El cliente está inactivo y no puede reservar turnos");
    }

    const barbero = await obtenerBarberoActivo(barberoId);

    if (!barbero) {
        throw crearError(404, "Barbero no encontrado o inactivo");
    }

    const inicio = construirFecha(fecha, hora);

    if (inicio <= new Date()) {
        throw crearError(400, "El turno debe ser en una fecha y horario futuros");
    }

    const turno = nuevoTurno(usuario.id, inicio);

    if (!estaEnHorarioLaboral(barbero, turno.inicio, turno.fin)) {
        throw crearError(400, "El turno está fuera del horario laboral del barbero");
    }

    if (await existeTurnoActivoDelCliente(usuario.id, turno.inicio, turno.fin)) {
        throw crearError(409, "Ya tenés una reserva activa que se superpone con ese horario");
    }

    const reservado = await reservarTurnoAtomico(barberoId, turno);

    if (!reservado) {
        throw crearError(409, "El horario seleccionado ya no está disponible");
    }

    return {
        _id: turno._id,
        barberoId: barbero._id,
        inicio: turno.inicio,
        fin: turno.fin,
        duracionMinutos: turno.duracionMinutos,
        estado: turno.estado
    };
}

export async function obtenerDisponibilidad(barberoId, fecha) {
    const errores = [];

    if (!esIdValido(barberoId)) errores.push("id de barbero inválido");
    if (!esFechaValida(fecha)) errores.push("fecha inválida, se espera el formato YYYY-MM-DD");

    if (errores.length > 0) {
        throw crearError(400, "Datos de la consulta inválidos", errores);
    }

    const barbero = await obtenerBarberoActivo(barberoId);

    if (!barbero) {
        throw crearError(404, "Barbero no encontrado o inactivo");
    }

    const disponibles = generarSlots({
        fecha,
        horarios: barbero.horarios,
        turnos: barbero.turnos,
        bloqueos: barbero.bloqueos
    });

    return {
        barberoId: barbero._id,
        fecha,
        duracionMinutos: DURACION_TURNO_MINUTOS,
        disponibles
    };
}

export async function obtenerTurnoPorIdService(id, usuario) {

    if (!esIdValido(id)) {
        throw crearError(400, "El identificador del turno no es válido");
    }

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

export async function obtenerTurnosClienteService(id, usuario) {
    if (!esIdValido(id)) {
        throw crearError(400, "El identificador del cliente no es válido");
    }

    if (usuario.rol !== "cliente" || usuario.id.toLowerCase() !== id.toLowerCase()) {
        throw crearError(403, "Solo podes consultar tus turnos");
    }

    const cliente = await obtenerClientePorId(id);

    if (!cliente) {
        throw crearError(404, "Cliente no encontrado");
    }

    const barberos = await obtenerBarberosConTurnosDeCliente(id);
    const ahora = new Date();

    const proximos = [];
    const historial = [];

    for (const barbero of barberos) {
        for (const turno of barbero.turnos) {
            if (turno.cliente.toString() === id.toLowerCase()) {
                const turnoConBarbero = {
                    ...turno,
                    barbero: {
                        _id: barbero._id,
                        nombre: barbero.nombre,
                        apellido: barbero.apellido
                    }
                };

                if (turno.inicio > ahora && ESTADOS_ACTIVOS.includes(turno.estado)) {
                    proximos.push(turnoConBarbero);
                } else {
                    historial.push(turnoConBarbero);
                }
            }
        }
    }

    proximos.sort((a, b) => a.inicio - b.inicio);
    historial.sort((a, b) => b.inicio - a.inicio);

    return { proximos, historial };
}
