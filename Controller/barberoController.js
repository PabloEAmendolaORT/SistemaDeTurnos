import { listarBarberosService } from "../Services/barberoService.js";

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