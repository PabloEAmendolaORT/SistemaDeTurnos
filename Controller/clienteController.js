
import {
    obtenerClienteService,
    actualizarClienteService
} from "../Services/clienteService.js";

export async function obtenerClienteController(req, res, next) {
    try {
        const cliente = await obtenerClienteService(
            req.params.id,
            req.user
        );

        return res.status(200).json({
            message: "Cliente obtenido correctamente",
            data: cliente
        });

    } catch (error) {
        next(error);
    }
}

export async function actualizarClienteController(req, res, next) {
    try {
        const cliente = await actualizarClienteService(
            req.params.id,
            req.user,
            req.body
        );

        return res.status(200).json({
            message: "Cliente actualizado correctamente",
            data: cliente
        });

    } catch (error) {
        next(error);
    }
}
