
import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization.trim())) {
        return next({
            status: 401,
            message: "Token de autenticación faltante o mal formado"
        });
    }

    const token = authorization.trim().split(/\s+/)[1];

    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET no está configurada"));
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (
            !payload ||
            typeof payload !== "object" ||
            typeof payload.id !== "string" ||
            !["cliente", "barbero"].includes(payload.rol)
        ) {
            return next({
                status: 401,
                message: "Token de autenticación inválido"
            });
        }

        req.user = {
            id: payload.id,
            rol: payload.rol
        };

        next();
    } catch (error) {
        next({
            status: 401,
            message: "Token de autenticación inválido o vencido"
        });
    }
}
