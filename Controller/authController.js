
import { registrarClienteService } from "../Services/authService.js";

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
