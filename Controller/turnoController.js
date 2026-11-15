import {
    reservarTurno,
    obtenerDisponibilidad,
    obtenerTurnoPorIdService,
    obtenerTurnosClienteService,
    actualizarEstadoTurnoService 
} from "../Services/turnoService.js";

export async function reservar(req, res, next) {
    try {
        const turno = await reservarTurno(req.user, req.body);

        res.status(201).json({
            message: "Turno reservado correctamente",
            data: turno
        });
    } catch (error) {
        next(error);
    }
}

export async function disponibilidad(req, res, next) {
    try {
        const data = await obtenerDisponibilidad(req.params.id, req.query.fecha);

        res.status(200).json({
            message: "Disponibilidad consultada correctamente",
            data
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerTurnoPorIdController(req, res, next) {
    try {
        const turno = await obtenerTurnoPorIdService(req.params.id, req.user);

        return res.status(200).json({
            message: "Datos de turno obtenidos correctamente",
            data: turno
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerTurnosClienteController(req, res, next) {
    try {
        const turnos = await obtenerTurnosClienteService(req.params.id, req.user);

        return res.status(200).json({
            message: "Turnos del cliente obtenidos correctamente",
            data: turnos
        });
    } catch (error) {
        next(error);
    }
}

export async function actualizarEstadoTurnoController(req, res, next) {
    try {
        const turno = await actualizarEstadoTurnoService(
            req.params.id,
            req.user,
            req.body?.estado
        );

        return res.status(200).json({
            message: "Estado del turno fue actualizado",
            data: turno
        });
    } catch (error) {
        next(error);
    }
}
