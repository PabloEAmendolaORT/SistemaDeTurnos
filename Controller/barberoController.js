import { listarBarberosService, obtenerBarberoPorIdService } from "../Services/barberoService.js";

export async function listarBarberosController(req, res, next) {
    try {
        const barberos = await listarBarberosService();

        return res.status(200).json({
            message: "Barberos obtenidos correctamente.",
            data: barberos
        });

    } catch (error) {
        next(error);
    }
}

export async function obtenerBarberoPorIdController(req, res, next) {
    try {
        const barbero = await obtenerBarberoPorIdService(req.params.id);

        return res.status(200).json({
            message: "Barbero obtenido correctamente.",
            data: barbero
        });
    } catch (error) {
        next(error);
    }
}