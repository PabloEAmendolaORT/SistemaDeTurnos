import { obtenerTurnoPorIdService } from "../Services/turnoService.js";

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
