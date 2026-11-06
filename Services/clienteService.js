
import {
    obtenerClientePorId,
    obtenerClientePorEmail,
    actualizarClientePorId
} from "../Data/clienteData.js";

import { obtenerBarberoPorEmail } from "../Data/authData.js";

function crearError(status, message, errors = []) {
    const error = new Error(message);
    error.status = status;
    error.errors = errors;
    return error;
}

function validarAcceso(id, usuario) {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        throw crearError(400, "El identificador del cliente no es válido");
    }

    if (
        !usuario ||
        usuario.rol !== "cliente" ||
        usuario.id.toLowerCase() !== id.toLowerCase()
    ) {
        throw crearError(403, "No tenés permisos para acceder a este cliente");
    }
}

function validarCliente(cliente) {
    if (!cliente) {
        throw crearError(404, "Cliente no encontrado");
    }

    if (cliente.activo !== true) {
        throw crearError(403, "El cliente se encuentra inactivo");
    }
}

function datosPublicos(cliente) {
    return {
        id: cliente._id.toString(),
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono ?? null,
        activo: cliente.activo
    };
}

export async function obtenerClienteService(id, usuario) {
    validarAcceso(id, usuario);

    const cliente = await obtenerClientePorId(id);

    validarCliente(cliente);

    return datosPublicos(cliente);
}

export async function actualizarClienteService(id, usuario, datos) {
    validarAcceso(id, usuario);

    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        throw crearError(400, "Los datos enviados no son válidos");
    }

    const cliente = await obtenerClientePorId(id);

    validarCliente(cliente);

    const camposPermitidos = [
        "nombre",
        "apellido",
        "email",
        "telefono"
    ];

    const camposRecibidos = Object.keys(datos);

    if (camposRecibidos.length === 0) {
        throw crearError(400, "No se enviaron datos para actualizar");
    }

    const camposInvalidos = camposRecibidos.filter(
        campo => !camposPermitidos.includes(campo)
    );

    if (camposInvalidos.length > 0) {
        throw crearError(
            400,
            "Se enviaron campos que no pueden modificarse",
            camposInvalidos
        );
    }

    const cambios = {};
    const errores = [];

    if (datos.nombre !== undefined) {
        if (
            typeof datos.nombre !== "string" ||
            datos.nombre.trim().length < 2 ||
            datos.nombre.trim().length > 80
        ) {
            errores.push("El nombre debe tener entre 2 y 80 caracteres");
        } else {
            cambios.nombre = datos.nombre.trim();
        }
    }

    if (datos.apellido !== undefined) {
        if (
            typeof datos.apellido !== "string" ||
            datos.apellido.trim().length < 2 ||
            datos.apellido.trim().length > 80
        ) {
            errores.push("El apellido debe tener entre 2 y 80 caracteres");
        } else {
            cambios.apellido = datos.apellido.trim();
        }
    }

    if (datos.email !== undefined) {
        if (typeof datos.email !== "string") {
            errores.push("El correo electrónico no es válido");
        } else {
            const email = datos.email.trim().toLowerCase();

            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
                email.length > 254
            ) {
                errores.push("El correo electrónico no es válido");
            } else {
                cambios.email = email;
            }
        }
    }

    if (datos.telefono !== undefined) {
        if (
            datos.telefono !== null &&
            typeof datos.telefono !== "string"
        ) {
            errores.push("El teléfono no es válido");
        } else {
            const telefono = datos.telefono?.trim() ?? "";

            if (telefono.length > 25) {
                errores.push("El teléfono no puede superar 25 caracteres");
            } else {
                cambios.telefono = telefono || null;
            }
        }
    }

    if (errores.length > 0) {
        throw crearError(400, "Error de validación", errores);
    }

    if (cambios.email && cambios.email !== cliente.email) {
        const [clienteExistente, barberoExistente] = await Promise.all([
            obtenerClientePorEmail(cambios.email),
            obtenerBarberoPorEmail(cambios.email)
        ]);

        if (
            (clienteExistente &&
                clienteExistente._id.toString() !== id.toLowerCase()) ||
            barberoExistente
        ) {
            throw crearError(409, "El correo electrónico ya está registrado");
        }
    }

    try {
        const resultado = await actualizarClientePorId(id, cambios);

        if (resultado.matchedCount === 0) {
            throw crearError(409, "El cliente ya no está disponible para actualizar");
        }

    } catch (error) {
        if (error.code === 11000) {
            throw crearError(409, "El correo electrónico ya está registrado");
        }

        throw error;
    }

    const clienteActualizado = await obtenerClientePorId(id);

    validarCliente(clienteActualizado);

    return datosPublicos(clienteActualizado);
}
