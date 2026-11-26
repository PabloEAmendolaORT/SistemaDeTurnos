# Postman — Barbería API

En este directorio se encuentra el archivo **`Barberia_API.postman_collection.json`**, con la colección de Postman para probar todos los endpoints de la API: los casos exitosos y los de error.

## Uso

1. Levantar el backend.
2. Abrir Postman.
3. Importar el archivo `.json`.

## Endpoints

| Método | Path | Rol | Parámetros | Descripción |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Público | Body: `nombre`, `apellido`, `email`, `password`, `telefono` (opcional) | Registra un cliente |
| POST | `/api/auth/login` | Público | Body: `email`, `password` | Inicia sesión y devuelve el JWT |
| GET | `/api/barberos` | Público | — | Lista los barberos activos |
| GET | `/api/barberos/:id` | Público | `id` | Datos de un barbero |
| PUT | `/api/barberos/:id/horarios` | Barbero (propio) | `id` · Body: `horarios[]` (`dia`, `inicio`, `fin`) | Reemplaza los horarios laborales |
| POST | `/api/barberos/:id/bloqueos` | Barbero (propio) | `id` · Body: `inicio`, `fin` (fecha ISO con zona horaria) | Bloquea un período de la agenda |
| GET | `/api/barberos/:id/disponibilidad` | Autenticado | `id` · Query: `fecha` (YYYY-MM-DD) | Horarios libres del día (turnos de 45 min) |
| GET | `/api/barberos/:id/agenda` | Barbero (propio) | `id` · Query: `fecha` (YYYY-MM-DD) | Turnos del día con los datos del cliente |
| GET | `/api/clientes/:id` | Cliente (propio) | `id` | Datos del cliente |
| PUT | `/api/clientes/:id` | Cliente (propio) | `id` · Body: `nombre`, `apellido`, `email`, `telefono` | Actualiza los datos personales |
| GET | `/api/clientes/:id/turnos` | Cliente (propio) | `id` | Próximos turnos e historial |
| POST | `/api/turnos` | Cliente | Body: `barberoId`, `fecha` (YYYY-MM-DD), `hora` (HH:mm) | Reserva un turno |
| GET | `/api/turnos/:id` | Cliente o barbero del turno | `id` | Detalle de un turno |
| PATCH | `/api/turnos/:id/estado` | Barbero asignado | `id` · Body: `estado` | Cambia el estado del turno |
| PATCH | `/api/turnos/:id/cancelar` | Cliente dueño | `id` | Cancela el turno y libera el horario |

Los endpoints autenticados requieren el header `Authorization: Bearer <token>`.

Estados del turno: `pendiente` → `confirmado` / `cancelado`; `confirmado` → `completado` / `ausente` / `cancelado`. `completado`, `cancelado` y `ausente` son estados finales.
