
export function rolesMiddleware(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return next({
                status: 401,
                message: "Debés iniciar sesión"
            });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return next({
                status: 403,
                message: "No tenés permisos para realizar esta operación"
            });
        }

        next();
    };
}
