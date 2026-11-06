
import {
    registrarClienteService,
    iniciarSesionService
} from "../Services/authService.js";

export async function registrarClienteController(req, res, next) {
    try {
        const cliente = await registrarClienteService(req.body);

        return res.status(201).json({
            message: "Cliente registrado correctamente",
            data: cliente
        });
    } catch (error) {
        next(error);
    }
}

export async function iniciarSesionController(req, res, next) {
    try {
        const resultado = await iniciarSesionService(req.body);

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            data: resultado
        });
    } catch (error) {
        next(error);
    }
}
