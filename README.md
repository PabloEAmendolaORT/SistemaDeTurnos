# 💈 Barbería API — Sistema de Gestión de Turnos

API REST desarrollada con **Node.js, Express.js, MongoDB y Mongoose** para la gestión de turnos de una barbería.

El sistema permitirá que los clientes realicen reservas de manera autónoma, consulten la disponibilidad de los barberos y administren sus turnos. A su vez, los empleados podrán gestionar sus horarios laborales y consultar sus agendas.

Este proyecto se desarrolla como trabajo académico, aplicando conceptos de arquitectura backend, diseño de APIs REST, persistencia de datos y reglas de negocio.

## 🛠️ Tecnologías

- **Node.js:** entorno de ejecución de JavaScript.
- **Express.js:** framework para desarrollar la API REST.
- **MongoDB:** base de datos NoSQL orientada a documentos.
- **Mongoose:** ODM para modelado de datos y consultas a MongoDB.
- **JWT:** autenticación mediante tokens (prevista).
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

Los clientes podrán:

- Registrarse en el sistema.
- Consultar los barberos disponibles.
- Consultar fechas y horarios disponibles.
- Reservar turnos.
- Consultar sus próximos turnos.
- Cancelar sus propias reservas.
- Consultar su historial de turnos.
- Actualizar sus datos personales.

### Barbero

Los empleados podrán:

- Consultar su agenda diaria.
- Consultar los turnos asignados.
- Administrar sus horarios laborales.
- Registrar ausencias o períodos de indisponibilidad.
- Confirmar turnos.
- Marcar turnos como completados.
- Registrar la ausencia de un cliente.

**Alcance:** el sistema estará destinado a una única barbería y no contará con roles de dueño, administrador ni gestión de sucursales.

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
| Pendiente | Reserva creada, pendiente de confirmación. |
| Confirmado | Turno confirmado por el barbero. |
| Completado | Servicio realizado. |
| Cancelado | Reserva cancelada. |
| Ausente | El cliente no asistió. |

### 2. Gestión de barberos

Módulo encargado de los empleados y su disponibilidad.

**Funcionalidades:**

- Consulta de barberos.
- Consulta de información de un empleado.
- Configuración de horarios laborales.
- Registro de ausencias y bloqueos de agenda.
- Consulta de agenda personal.
- Control de disponibilidad.
- Gestión del estado activo/inactivo.

Los barberos serán registrados inicialmente mediante un script de carga de datos.

### 3. Gestión de clientes

Módulo encargado de administrar la información de los clientes.

**Funcionalidades:**

- Registro de clientes.
- Consulta de datos personales.
- Actualización de información.
- Consulta de turnos futuros.
- Historial de reservas.
- Control de clientes activos/inactivos.

## 📋 Reglas de negocio

### Turnos

1. Cada turno debe pertenecer a un cliente y un barbero existentes.
2. Un barbero no puede tener dos turnos activos superpuestos.
3. Solo pueden reservarse turnos en fechas y horarios futuros.
4. Los turnos deben estar dentro del horario laboral del barbero.
5. No se permiten reservas durante bloqueos de agenda.
6. Los turnos tendrán una duración fija de **45 minutos**.
7. Los turnos cancelados liberan la disponibilidad.
8. Los turnos completados o cancelados no pueden modificarse mediante las operaciones habituales.
9. Un cliente no puede mantener dos reservas activas superpuestas.
10. Las reservas simultáneas deben controlarse para evitar duplicaciones.

### Barberos

1. Cada barbero tendrá horarios laborales definidos.
2. Los horarios podrán variar según el día de la semana.
3. Los horarios laborales de un mismo barbero no podrán superponerse.
4. Los barberos inactivos no podrán recibir nuevos turnos.
5. No podrán crearse bloqueos sobre reservas activas sin resolverlas previamente.
6. Cada barbero gestionará únicamente sus turnos asignados.

### Clientes

1. Los clientes deberán proporcionar nombre, apellido y al menos un medio de contacto válido.
2. No se permitirán correos electrónicos duplicados cuando se utilicen como identificador único.
3. Cada cliente podrá tener múltiples reservas.
4. Los clientes únicamente podrán gestionar sus propios turnos.
5. Los clientes inactivos no podrán reservar nuevos turnos.
6. El historial se conservará aunque un cliente sea desactivado.

## 🏗️ Arquitectura del proyecto

Se utilizará una arquitectura por capas para separar las responsabilidades.

```text
src/
├── config/
│   └── db.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── barberos.controller.js
│   ├── clientes.controller.js
│   └── turnos.controller.js
│
├── services/
│   ├── auth.service.js
│   ├── barberos.service.js
│   ├── clientes.service.js
│   └── turnos.service.js
│
├── models/
│   ├── Usuario.js
│   ├── Barbero.js
│   ├── Cliente.js
│   ├── Turno.js
│   └── BloqueoAgenda.js
│
├── routes/
│   ├── auth.routes.js
│   ├── barberos.routes.js
│   ├── clientes.routes.js
│   └── turnos.routes.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── roles.middleware.js
│   └── error.middleware.js
│
├── seed/
│   └── barberos.seed.js
│
└── app.js
```

**Routes:** definen los endpoints de la API.

**Controllers:** procesan las solicitudes HTTP y generan las respuestas.

**Services:** implementan las reglas de negocio.

**Models:** representan los documentos de MongoDB mediante Mongoose.

**Middlewares:** gestionan autenticación, autorización y errores.

## 🗄️ Modelo de datos

Se contemplan las siguientes colecciones:

| Colección | Descripción |
|---|---|
| Usuarios | Credenciales y roles para autenticación. |
| Barberos | Información laboral, horarios y estado de los empleados. |
| Clientes | Información personal y datos de contacto. |
| Turnos | Reservas, fechas, horarios, estados y referencias. |
| BloqueosAgenda | Períodos de indisponibilidad de los barberos. |

Las relaciones entre documentos se implementarán utilizando referencias `ObjectId`.

## 🌐 Endpoints previstos

Los siguientes endpoints corresponden al diseño inicial y podrán ajustarse durante la implementación.

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar cliente. |
| POST | `/api/auth/login` | Iniciar sesión. |

### Barberos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/barberos` | Listar barberos activos. |
| GET | `/api/barberos/:id` | Obtener información de un barbero. |
| GET | `/api/barberos/:id/agenda` | Consultar agenda. |
| GET | `/api/barberos/:id/disponibilidad` | Consultar horarios disponibles. |
| PUT | `/api/barberos/:id/horarios` | Actualizar horarios laborales. |
| POST | `/api/barberos/:id/bloqueos` | Registrar indisponibilidad. |

### Clientes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/clientes/:id` | Consultar cliente. |
| PUT | `/api/clientes/:id` | Actualizar cliente. |
| GET | `/api/clientes/:id/turnos` | Consultar historial de reservas. |

### Turnos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/turnos` | Reservar turno. |
| GET | `/api/turnos/:id` | Consultar turno. |
| PATCH | `/api/turnos/:id/estado` | Actualizar estado. |
| PATCH | `/api/turnos/:id/cancelar` | Cancelar reserva. |

Las operaciones estarán protegidas según los permisos del usuario autenticado.

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

El backend deberá:

1. Identificar al cliente autenticado.
2. Verificar que el barbero exista y esté activo.
3. Validar la fecha y el horario.
4. Comprobar que esté dentro del horario laboral.
5. Verificar que no existan bloqueos.
6. Comprobar que el horario esté disponible.
7. Registrar la reserva evitando conflictos concurrentes.
8. Devolver el turno creado.

**Respuesta esperada:**

```json
{
  "message": "Turno reservado correctamente",
  "turno": {
    "barberoId": "507f1f77bcf86cd799439011",
    "fecha": "2026-11-10",
    "hora": "10:00",
    "duracionMinutos": 45,
    "estado": "pendiente"
  }
}
```

La respuesta es ilustrativa; su estructura definitiva se establecerá durante el desarrollo.

## 🚀 Instalación y ejecución

*Esta sección se completará cuando se inicialice el proyecto y se definan sus scripts y dependencias.*

Requisitos previstos:

- Node.js
- MongoDB local o MongoDB Atlas
- npm
- Postman

Se utilizarán variables de entorno para configurar la conexión a MongoDB y el secreto de autenticación.

## 🧪 Pruebas

La API se probará mediante Postman, verificando tanto operaciones exitosas como errores de validación.

Casos principales:

- Registro correcto de un cliente.
- Reserva de un turno disponible.
- Intento de reservar un horario ocupado.
- Reserva fuera del horario laboral.
- Reserva en una fecha pasada.
- Cancelación de turno.
- Consulta de historial.
- Intento de acceso a turnos de otro cliente.
- Bloqueo de agenda.
- Actualización de estados.

## 📈 Posibles mejoras futuras

En caso de ampliar el alcance del proyecto, se podrán incorporar:

- Estadísticas simples de turnos completados por barbero.
- Cantidad de cortes diarios y mensuales.
- Registro de servicios y precios.
- Diferentes duraciones según el servicio.
- Reprogramación de turnos.
- Notificaciones automáticas.
- Interfaz web para clientes y empleados.

## 📌 Estado del proyecto

**En etapa de análisis y diseño.**

Actualmente se encuentran definidos el alcance funcional, los actores, los módulos principales y las reglas de negocio iniciales.

Las próximas etapas contemplan el diseño de los modelos Mongoose, la implementación de endpoints, la aplicación de validaciones y las pruebas de integración mediante Postman.

---

**Proyecto académico — Desarrollo Backend con Node.js, Express.js y MongoDB.**