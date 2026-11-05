
export function errorMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const candidate = err?.status ?? err?.statusCode;

    const status =
        Number.isInteger(candidate) &&
        candidate >= 400 &&
        candidate <= 599
            ? candidate
            : 500;

    if (status >= 500) {
        console.error(err);
    }

    res.status(status).json({
        message:
            status === 500
                ? "Error interno del servidor"
                : (err?.message || "Error en la solicitud"),

        errors: Array.isArray(err?.errors) ? err.errors : []
    });
}
