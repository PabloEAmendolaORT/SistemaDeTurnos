# 💈 Barbería API — Sistema de Gestión de Turnos

API REST desarrollada con **Node.js, Express.js y MongoDB** (driver oficial `mongodb`) para la gestión de turnos de una barbería.

El sistema permite que los clientes realicen reservas de manera autónoma, consulten la disponibilidad de los barberos y administren sus turnos. A su vez, los barberos pueden gestionar sus horarios laborales, bloquear períodos de su agenda y administrar el estado de los turnos asignados.

Este proyecto fue desarrollado como trabajo académico, aplicando conceptos de arquitectura backend, diseño de APIs REST, persistencia de datos y reglas de negocio.

## 🛠️ Tecnologías

- **Node.js:** entorno de ejecución de JavaScript (ES Modules).
- **Express.js 5:** framework para desarrollar la API REST.
- **MongoDB:** base de datos NoSQL orientada a documentos (MongoDB Atlas o local).
- **mongodb (driver oficial):** conexión y consultas a la base de datos.
- **JWT (jsonwebtoken):** autenticación mediante tokens Bearer.
- **bcrypt:** hash de contraseñas.
- **dotenv:** manejo de variables de entorno.
- **cors** y **morgan:** habilitación de CORS y logging de solicitudes.
- **nodemon:** recarga automática en desarrollo.
- **Postman:** pruebas y documentación de los endpoints.

## 🎯 Objetivos del proyecto

- Digitalizar la gestión de turnos de una barbería.
- Permitir que los clientes reserven turnos mediante la API.
- Administrar los horarios y la disponibilidad de los barberos.
- Evitar reservas superpuestas y conflictos de horarios.
- Gestionar clientes y conservar sus historiales.
- Aplicar reglas de negocio y validaciones.
- Implementar una arquitectura modular y mantenible.

## 👥 Roles del sistema

### Cliente

Los clientes pueden:

- Registrarse en el sistema.
- Consultar los barberos disponibles.
- Consultar los horarios disponibles de un barbero en una fecha.
- Reservar turnos.
- Consultar sus próximos turnos y su historial.
- Cancelar sus propias reservas.
- Consultar y actualizar sus datos personales.

### Barbero

Los barberos pueden:

- Consultar su agenda diaria, con los datos de cada cliente.
- Consultar los turnos asignados.
- Administrar sus horarios laborales.
- Registrar bloqueos o períodos de indisponibilidad.
- Confirmar turnos.
- Marcar turnos como completados.
- Registrar la ausencia de un cliente.

**Alcance:** el sistema está destinado a una única barbería y no cuenta con roles de dueño, administrador ni gestión de sucursales. Los barberos se cargan mediante un script de datos iniciales.

## 📦 Módulos del sistema

### 1. Gestión de turnos

Módulo encargado de administrar las reservas y controlar la disponibilidad.

**Funcionalidades:**

- Creación de turnos.
- Consulta de turnos.
- Consulta de disponibilidad.
- Cancelación de reservas.
- Actualización de estados.
- Historial de reservas.
- Validación de conflictos de horarios.

**Estados de un turno:**

| Estado | Descripción |
|---|---|
| `pendiente` | Reserva creada, pendiente de confirmación. |
| `confirmado` | Turno confirmado por el barbero. |
| `completado` | Servicio realizado. |
| `cancelado` | Reserva cancelada. |
| `ausente` | El cliente no asistió. |

**Transiciones válidas:**

| Desde | Puede pasar a |
|---|---|
| `pendiente` | `confirmado`, `cancelado` |
| `confirmado` | `completado`, `ausente`, `cancelado` |
| `completado` / `cancelado` / `ausente` | — (estados finales) |

El cliente cancela sus turnos mediante `PATCH /api/turnos/:id/cancelar`. El barbero asignado cambia los demás estados mediante `PATCH /api/turnos/:id/estado`.

### 2. Gestión de barberos

Módulo encargado de los barberos y su disponibilidad.

**Funcionalidades:**

- Consulta de barberos activos.
- Consulta de información de un barbero.
- Configuración de horarios laborales.
- Registro de bloqueos de agenda.
- Consulta de agenda personal.
- Cálculo de disponibilidad en turnos de 45 minutos.

### 3. Gestión de clientes

Módulo encargado de administrar la información de los clientes.

**Funcionalidades:**

- Registro de clientes.
- Consulta de datos personales.
- Actualización de información.
- Consulta de turnos futuros.
- Historial de reservas.

## 📋 Reglas de negocio

### Turnos

1. Cada turno pertenece a un cliente y a un barbero existentes.
2. Un barbero no puede tener dos turnos activos (`pendiente` o `confirmado`) superpuestos.
3. Solo pueden reservarse turnos en fechas y horarios futuros.
4. Los turnos deben estar completamente dentro del horario laboral del barbero.
5. No se permiten reservas durante bloqueos de agenda.
6. Los turnos tienen una duración fija de **45 minutos**.
7. Los turnos cancelados liberan la disponibilidad.
8. Los turnos en estado final (`completado`, `cancelado`, `ausente`) no pueden modificarse.
9. Un cliente no puede mantener dos reservas activas superpuestas, aunque sean con barberos distintos.
10. Las reservas simultáneas se controlan con una operación atómica (`findOneAndUpdate`): el turno solo se inserta si en ese mismo momento no existe un turno activo ni un bloqueo superpuesto.
11. Los cambios de estado también son atómicos: si el estado del turno cambió mientras se procesaba la solicitud, la API responde `409`.

### Barberos

1. Cada barbero tiene horarios laborales definidos por día de la semana (`dia` de 0 a 6, donde 0 es domingo), con formato `HH:mm`.
2. Un barbero puede tener varias franjas en un mismo día, pero no pueden superponerse.
3. La actualización de horarios **reemplaza** la lista completa de horarios.
4. Los barberos inactivos no aparecen en el listado ni pueden recibir nuevos turnos.
5. No pueden crearse bloqueos que se superpongan con turnos activos (la API responde `409`).
6. Cada barbero gestiona únicamente su propia agenda, horarios, bloqueos y turnos asignados.

### Clientes

1. Los clientes deben proporcionar nombre y apellido (entre 2 y 80 caracteres), un email válido y una contraseña (mínimo 8 caracteres y máximo 72 bytes). El teléfono es opcional (hasta 25 caracteres).
2. No se permiten correos electrónicos duplicados.
3. Cada cliente puede tener múltiples reservas.
4. Los clientes únicamente pueden consultar y gestionar sus propios datos y turnos.
5. Los clientes inactivos no pueden iniciar sesión ni reservar nuevos turnos.
6. El historial se conserva aunque un cliente sea desactivado.

### Fechas y zona horaria

Las fechas y horas enviadas por los clientes (`fecha` y `hora`) se interpretan en la zona horaria de Argentina (**UTC-03:00**) y se almacenan en UTC. Los bloqueos deben enviarse en formato ISO 8601 **con zona horaria** (por ejemplo, `2026-11-10T09:00:00-03:00`).

## 🏗️ Arquitectura del proyecto

Se utiliza una arquitectura por capas para separar las responsabilidades.

```text
SistemaDeTurnos/
├── Config/
│   └── database.js            # Conexión a MongoDB (connectDB / getDB / closeDB)
│
├── Controller/
│   ├── authController.js
│   ├── barberoController.js
│   ├── clienteController.js
│   └── turnoController.js
│
├── Services/
│   ├── authService.js
│   ├── barberoService.js
│   ├── clienteService.js
│   ├── turnoService.js
│   └── turnoUtils.js          # Validaciones de fecha/hora, superposición y cálculo de horarios libres
│
├── Data/
│   ├── authData.js
│   ├── barberoData.js
│   ├── clienteData.js
│   └── turnoData.js
│
├── Routes/
│   ├── authRoutes.js
│   ├── barberoRoutes.js
│   ├── clienteRoutes.js
│   └── turnoRoutes.js
│
├── Middlewares/
│   ├── auth.middleware.js
│   ├── roles.middleware.js
│   └── error.middleware.js
│
├── Scripts/
│   ├── initDB.js              # Crea colecciones, validadores e índices
│   ├── seedBarberos.js        # Carga un barbero de prueba
│   └── crearIndiceClientes.js # Crea el índice único de email de clientes
│
├── Postman/
│   ├── Barberia_API.postman_collection.json
│   └── README.md
│
├── App.js                     # Configuración de Express, middlewares y rutas
├── server.js                  # Punto de entrada: conecta la base y levanta el servidor
├── .env.example
└── package.json
```

Flujo de una solicitud: **Routes → Middlewares → Controller → Services → Data → MongoDB**.

**Routes:** definen los endpoints de la API y los middlewares que aplica cada uno.

**Middlewares:** gestionan la autenticación (JWT), la autorización por rol y el manejo centralizado de errores.

**Controller:** reciben la solicitud HTTP, invocan al servicio correspondiente y arman la respuesta.

**Services:** implementan las validaciones y las reglas de negocio.

**Data:** encapsulan el acceso a MongoDB (consultas, inserciones y actualizaciones).

**Config:** administra la conexión a la base de datos.

## 🗄️ Modelo de datos

La base utiliza **dos colecciones**:

| Colección | Descripción |
|---|---|
| `barberos` | Datos personales, credenciales, estado y, embebidos, sus horarios, bloqueos y turnos. |
| `clientes` | Datos personales, credenciales y estado. |

No existe una colección de usuarios separada: cada documento guarda su propio `email`, `password` (hasheada) y `rol`. El login busca el email en ambas colecciones.

Los **turnos** y los **bloqueos** se guardan como arrays embebidos dentro de cada barbero. Esto permite validar y reservar un turno en una única operación atómica sobre un solo documento. Cada turno referencia al cliente mediante un `ObjectId`.

**Ejemplo de documento `barbero`:**

```json
{
  "_id": "ObjectId",
  "nombre": "Barbero",
  "apellido": "Prueba",
  "email": "barbero.prueba@test.com",
  "password": "<hash bcrypt>",
  "rol": "barbero",
  "activo": true,
  "horarios": [
    { "dia": 1, "inicio": "09:00", "fin": "13:00" }
  ],
  "bloqueos": [
    { "_id": "ObjectId", "inicio": "2026-11-10T15:00:00Z", "fin": "2026-11-10T17:00:00Z" }
  ],
  "turnos": [
    {
      "_id": "ObjectId",
      "cliente": "ObjectId",
      "inicio": "2026-11-10T13:00:00Z",
      "fin": "2026-11-10T13:45:00Z",
      "duracionMinutos": 45,
      "estado": "pendiente",
      "createdAt": "2026-11-01T18:30:00Z"
    }
  ]
}
```

**Ejemplo de documento `cliente`:**

```json
{
  "_id": "ObjectId",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@mail.com",
  "telefono": "1122334455",
  "password": "<hash bcrypt>",
  "rol": "cliente",
  "activo": true,
  "createdAt": "2026-11-01T18:00:00Z",
  "updatedAt": "2026-11-01T18:00:00Z"
}
```

Ambas colecciones tienen validación mediante `$jsonSchema` e índices únicos sobre `email`. La colección `barberos` tiene además índices sobre `turnos._id` y `turnos.cliente`. Todo esto se crea con el script `Scripts/initDB.js`.

## 🌐 Endpoints

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | Público | Verifica que la API esté funcionando. |

### Autenticación

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar cliente. |
| POST | `/api/auth/login` | Público | Iniciar sesión (cliente o barbero). Devuelve el JWT. |

### Barberos

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/barberos` | Público | Listar barberos activos. |
| GET | `/api/barberos/:id` | Público | Obtener información de un barbero. |
| GET | `/api/barberos/:id/disponibilidad?fecha=YYYY-MM-DD` | Autenticado | Consultar horarios disponibles del día. |
| GET | `/api/barberos/:id/agenda?fecha=YYYY-MM-DD` | Barbero (propio) | Consultar agenda del día con datos de los clientes. |
| PUT | `/api/barberos/:id/horarios` | Barbero (propio) | Reemplazar horarios laborales. |
| POST | `/api/barberos/:id/bloqueos` | Barbero (propio) | Registrar un período de indisponibilidad. |

### Clientes

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/clientes/:id` | Cliente (propio) | Consultar datos del cliente. |
| PUT | `/api/clientes/:id` | Cliente (propio) | Actualizar nombre, apellido, email o teléfono. |
| GET | `/api/clientes/:id/turnos` | Cliente (propio) | Consultar próximos turnos e historial. |

### Turnos

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/turnos` | Cliente | Reservar turno. |
| GET | `/api/turnos/:id` | Cliente o barbero del turno | Consultar turno. |
| PATCH | `/api/turnos/:id/estado` | Barbero asignado | Actualizar estado. |
| PATCH | `/api/turnos/:id/cancelar` | Cliente dueño del turno | Cancelar reserva. |

Los endpoints protegidos requieren el header `Authorization: Bearer <token>`. El token se obtiene en el login y vence a las 2 horas.

El detalle de los parámetros y bodies de cada endpoint se encuentra en [Postman/README.md](Postman/README.md).

### Formato de las respuestas

Respuesta exitosa:

```json
{
  "message": "Descripción del resultado",
  "data": { }
}
```

Respuesta de error:

```json
{
  "message": "Descripción del error",
  "errors": []
}
```

Códigos utilizados: `200`, `201`, `400` (datos inválidos), `401` (no autenticado o token inválido), `403` (sin permisos), `404` (recurso no encontrado), `409` (conflicto: horario ocupado, email duplicado, etc.) y `500` (error interno).

## 🔄 Ejemplo de reserva

**Solicitud:**

```http
POST /api/turnos
Authorization: Bearer TOKEN
Content-Type: application/json
```

```json
{
  "barberoId": "507f1f77bcf86cd799439011",
  "fecha": "2026-11-10",
  "hora": "10:00"
}
```

El backend:

1. Identifica al cliente autenticado a partir del token.
2. Valida el formato de `barberoId`, `fecha` y `hora`.
3. Verifica que el cliente exista y esté activo.
4. Verifica que el barbero exista y esté activo.
5. Comprueba que la fecha y hora sean futuras.
6. Comprueba que el turno esté dentro del horario laboral del barbero.
7. Verifica que el cliente no tenga otra reserva activa superpuesta.
8. Registra la reserva de forma atómica, verificando en la misma operación que no haya turnos activos ni bloqueos superpuestos.
9. Devuelve el turno creado.

**Respuesta (`201 Created`):**

```json
{
  "message": "Turno reservado correctamente",
  "data": {
    "_id": "6740a1b2c3d4e5f6a7b8c9d0",
    "barberoId": "507f1f77bcf86cd799439011",
    "inicio": "2026-11-10T13:00:00.000Z",
    "fin": "2026-11-10T13:45:00.000Z",
    "duracionMinutos": 45,
    "estado": "pendiente"
  }
}
```

> `inicio` y `fin` se devuelven en UTC: las 10:00 de Argentina (UTC-03:00) equivalen a las 13:00 UTC.

## 🚀 Instalación y ejecución

### Requisitos

- Node.js
- npm
- MongoDB local o MongoDB Atlas
- Postman (para las pruebas)

### Pasos

1. Clonar el repositorio e instalar las dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` como `.env` y completar los valores:

   | Variable | Descripción |
   |---|---|
   | `PORT` | Puerto del servidor (por defecto `3000`). |
   | `NODE_ENV` | Entorno de ejecución (`development`). |
   | `MONGO_URI` | Cadena de conexión a MongoDB. |
   | `MONGO_DB_NAME` | Nombre de la base de datos (por ejemplo, `sistema_turnos`). |
   | `JWT_SECRET` | Clave secreta para firmar los tokens. |

3. Inicializar la base de datos (colecciones, validadores e índices):

   ```bash
   node Scripts/initDB.js
   ```

4. Cargar el barbero de prueba:

   ```bash
   npm run seed
   ```

   Crea el barbero `barbero.prueba@test.com` con la contraseña `BarberoDemo123`, que atiende los lunes de 09:00 a 13:00.

5. Levantar el servidor:

   ```bash
   npm run dev   # desarrollo, con nodemon
   npm start     # ejecución normal
   ```

   La API queda disponible en `http://localhost:3000`.

## 🧪 Pruebas

La API se prueba mediante Postman. La colección `Postman/Barberia_API.postman_collection.json` incluye casos exitosos y de error para todos los endpoints. Las instrucciones de uso están en [Postman/README.md](Postman/README.md).

Casos principales cubiertos:

- Registro correcto de un cliente y registro con email duplicado.
- Login correcto y con credenciales incorrectas.
- Reserva de un turno disponible.
- Intento de reservar un horario ocupado.
- Reserva fuera del horario laboral.
- Reserva en una fecha pasada.
- Cancelación de turno.
- Consulta de historial y próximos turnos.
- Intento de acceso a turnos o datos de otro cliente.
- Bloqueo de agenda y bloqueo superpuesto con un turno activo.
- Actualización de estados y transiciones inválidas.

## 📈 Posibles mejoras futuras

- Endpoints para activar o desactivar clientes y barberos.
- Alta y edición de barberos mediante la API.
- Eliminación de bloqueos y registro de un motivo para cada bloqueo.
- Estadísticas simples de turnos completados por barbero.
- Cantidad de cortes diarios y mensuales.
- Registro de servicios y precios.
- Diferentes duraciones según el servicio.
- Reprogramación de turnos.
- Notificaciones automáticas.
- Tests automatizados.
- Interfaz web para clientes y barberos.

## 📌 Estado del proyecto

**Finalizado — versión 1.0.**

Están implementados todos los endpoints, las reglas de negocio, la autenticación con JWT, la autorización por roles y la colección de pruebas de Postman.

## 👨‍💻 Integrantes

- Amendola Pablo Ezequiel
- Pagliuca Agustin
- Quinteros Serra Agustin Alejandro
- Otero Facundo Joel

---

**Proyecto académico — Taller de Programación 2 — Desarrollo Backend con Node.js, Express.js y MongoDB.**
