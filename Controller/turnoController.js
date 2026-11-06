import { reservarTurno, obtenerDisponibilidad } from "../Services/turnoService.js";

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
