import { actualizarHorariosBarberoService, agregarBloqueoBarberoService, listarBarberosService, obtenerBarberoPorIdService } from "../Services/barberoService.js";

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

export async function actualizarHorariosBarberoController(req, res, next) {
    try {
        const horarios = await actualizarHorariosBarberoService(req.params.id, req.user, req.body?.horarios);
        return res.status(200).json({
            message: "Horarios actualizados correctamente.",
            data: horarios
        });
    } catch (error) {
        next(error);
    }
}

export async function agregarBloqueoBarberoController(req, res, next) {
    try {
        const bloqueo = await agregarBloqueoBarberoService(
            req.params.id,
            req.user,
            req.body
        );

        return res.status(201).json({
            message: "Bloqueo agregado correctamente.",
            data: bloqueo
        });
    } catch (error) {
        next(error);
    }
}