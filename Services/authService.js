
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
    obtenerClientePorEmail,
    crearCliente
} from "../Data/clienteData.js";

import { obtenerBarberoPorEmail } from "../Data/authData.js";

function crearError(status, message, errors = []) {
    const error = new Error(message);
    error.status = status;
    error.errors = errors;

    return error;
}

export async function registrarClienteService(datos) {
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        throw crearError(400, "Los datos enviados no son válidos");
    }

    const nombre = typeof datos.nombre === "string"
        ? datos.nombre.trim()
        : "";

    const apellido = typeof datos.apellido === "string"
        ? datos.apellido.trim()
        : "";

    const email = typeof datos.email === "string"
        ? datos.email.trim().toLowerCase()
        : "";

    const telefono = typeof datos.telefono === "string"
        ? datos.telefono.trim()
        : "";

    const password = datos.password;
    const errores = [];

    if (nombre.length < 2 || nombre.length > 80) {
        errores.push("El nombre debe tener entre 2 y 80 caracteres");
    }

    if (apellido.length < 2 || apellido.length > 80) {
        errores.push("El apellido debe tener entre 2 y 80 caracteres");
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254
    ) {
        errores.push("El correo electrónico no es válido");
    }

    if (
        datos.telefono !== undefined &&
        datos.telefono !== null &&
        (
            typeof datos.telefono !== "string" ||
            telefono.length > 25
        )
    ) {
        errores.push("El teléfono no es válido");
    }

    if (
        typeof password !== "string" ||
        password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        errores.push(
            "La contraseña debe tener al menos 8 caracteres y no superar 72 bytes"
        );
    }

    if (errores.length > 0) {
        throw crearError(400, "Error de validación", errores);
    }

    const clienteExistente = await obtenerClientePorEmail(email);

    if (clienteExistente) {
        throw crearError(409, "El correo electrónico ya está registrado");
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
            nombre: nuevoCliente.nombre,
            apellido: nuevoCliente.apellido,
            email: nuevoCliente.email,
            telefono: nuevoCliente.telefono,
            activo: nuevoCliente.activo
        };

    } catch (error) {
        if (error.code === 11000) {
            throw crearError(409, "El correo electrónico ya está registrado");
        }

        throw error;
    }
}

export async function iniciarSesionService(datos) {
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        throw crearError(400, "Los datos enviados no son válidos");
    }

    const email = typeof datos.email === "string"
        ? datos.email.trim().toLowerCase()
        : "";

    const password = datos.password;

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== "string" ||
        password.length === 0
    ) {
        throw crearError(400, "Email y contraseña son obligatorios");
    }

    const [cliente, barbero] = await Promise.all([
        obtenerClientePorEmail(email),
        obtenerBarberoPorEmail(email)
    ]);

    if ((cliente && barbero) || (!cliente && !barbero)) {
        throw crearError(401, "Credenciales incorrectas");
    }

    const usuario = cliente || barbero;
    const rol = cliente ? "cliente" : "barbero";

    if (usuario.activo !== true) {
        throw crearError(401, "Credenciales incorrectas");
    }

    if (typeof usuario.password !== "string") {
        throw crearError(401, "Credenciales incorrectas");
    }

    const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.password
    );

    if (!passwordCorrecta) {
        throw crearError(401, "Credenciales incorrectas");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET no está configurada");
    }

    const token = jwt.sign(
        {
            id: usuario._id.toString(),
            rol: rol
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h",
            algorithm: "HS256"
        }
    );

    return {
        token,
        tokenType: "Bearer",
        expiresIn: 7200,
        usuario: {
            id: usuario._id.toString(),
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol
        }
    };
}
