
import bcrypt from "bcrypt";

import {
    obtenerClientePorEmail,
    crearCliente
} from "../Data/clienteData.js";

function crearError(status, message, errors = []) {
    const error = new Error(message);
    error.status = status;
    error.errors = errors;
    return error;
}

export async function registrarClienteService(datos) {
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        throw crearError(400, "El cuerpo de la solicitud debe ser un objeto JSON");
    }

    const nombre = typeof datos.nombre === "string" ? datos.nombre.trim() : "";
    const apellido = typeof datos.apellido === "string" ? datos.apellido.trim() : "";
    const email = typeof datos.email === "string" ? datos.email.trim().toLowerCase() : "";
    const telefono = typeof datos.telefono === "string" ? datos.telefono.trim() : "";
    const password = datos.password;

    const errores = [];

    if (nombre.length < 2 || nombre.length > 80) {
        errores.push("El nombre debe tener entre 2 y 80 caracteres");
    }

    if (apellido.length < 2 || apellido.length > 80) {
        errores.push("El apellido debe tener entre 2 y 80 caracteres");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        errores.push("El email debe tener un formato válido");
    }

    if (datos.telefono !== undefined &&
        (typeof datos.telefono !== "string" || telefono.length > 25)) {
        errores.push("El teléfono debe ser texto de hasta 25 caracteres");
    }

    if (typeof password !== "string" ||
        password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72) {
        errores.push("La contraseña debe tener al menos 8 caracteres y no superar 72 bytes UTF-8");
    }

    if (errores.length > 0) {
        throw crearError(400, "Datos de registro inválidos", errores);
    }

    const clienteExistente = await obtenerClientePorEmail(email);

    if (clienteExistente) {
        throw crearError(409, "El email ya está registrado");
    }

    const passwordHasheada = await bcrypt.hash(password, 10);

    const nuevoCliente = {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        password: passwordHasheada,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        const resultado = await crearCliente(nuevoCliente);

        return {
            id: resultado.insertedId.toString(),
            nombre,
            apellido,
            email,
            telefono: nuevoCliente.telefono,
            activo: true
        };
    } catch (error) {
        if (error.code === 11000) {
            throw crearError(409, "El email ya está registrado");
        }

        throw error;
    }
}
