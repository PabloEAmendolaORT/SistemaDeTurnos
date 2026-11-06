import { obtenerClientePorId } from "../Data/clienteData.js";
import { obtenerBarberoActivo } from "../Data/barberoData.js";
import {
    DURACION_TURNO_MINUTOS,
    nuevoTurno,
    reservarTurnoAtomico,
    existeTurnoActivoDelCliente
} from "../Data/turnoData.js";
import { estaEnHorarioLaboral } from "./barberoService.js";
import {
    crearError,
    esIdValido,
    esFechaValida,
    esHoraValida,
    construirFecha,
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

    if (!(await estaEnHorarioLaboral(barbero, turno.inicio, turno.fin))) {
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
