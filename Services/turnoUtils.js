import { DURACION_TURNO_MINUTOS, ESTADOS_ACTIVOS } from "../Data/turnoData.js";

const OFFSET_LOCAL = "-03:00";
const OFFSET_LOCAL_MINUTOS = -180;
const REGEX_ID = /^[0-9a-fA-F]{24}$/;
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function crearError(status, message, errors = []) {
    return { status, message, errors };
}

export function esIdValido(id) {
    return typeof id === "string" && REGEX_ID.test(id);
}

export function esHoraValida(hora) {
    return typeof hora === "string" && REGEX_HORA.test(hora);
}

export function esFechaValida(fecha) {
    return (
        typeof fecha === "string" &&
        REGEX_FECHA.test(fecha) &&
        !Number.isNaN(new Date(`${fecha}T12:00:00Z`).getTime()) &&
        new Date(`${fecha}T12:00:00Z`).toISOString().slice(0, 10) === fecha
    );
}

export function construirFecha(fecha, hora) {
    if (!esFechaValida(fecha) || !esHoraValida(hora)) {
        return null;
    }

    return new Date(`${fecha}T${hora}:00${OFFSET_LOCAL}`);
}

export function horaAMinutos(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
}

export function minutosAHora(minutos) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0");
    const m = String(minutos % 60).padStart(2, "0");
    return `${h}:${m}`;
}

export function diaDeSemana(fecha) {
    return new Date(`${fecha}T12:00:00Z`).getUTCDay();
}

export function partesLocales(date) {
    const local = new Date(date.getTime() + OFFSET_LOCAL_MINUTOS * 60000);

    return {
        dia: local.getUTCDay(),
        minutos: local.getUTCHours() * 60 + local.getUTCMinutes()
    };
}

export function seSuperponen(aInicio, aFin, bInicio, bFin) {
    return aInicio < bFin && aFin > bInicio;
}

export function estaEnHorarioLaboral(barbero, inicio, fin) {
    const desde = partesLocales(inicio);
    const hasta = partesLocales(fin);

    if (desde.dia !== hasta.dia) {
        return false;
    }

    return (barbero.horarios ?? []).some(
        (h) =>
            h.dia === desde.dia &&
            horaAMinutos(h.inicio) <= desde.minutos &&
            hasta.minutos <= horaAMinutos(h.fin)
    );
}

export function generarSlots({ fecha, horarios, turnos, bloqueos, ahora = new Date() }) {
    const dia = diaDeSemana(fecha);
    const activos = (turnos ?? []).filter((t) => ESTADOS_ACTIVOS.includes(t.estado));
    const jornadas = (horarios ?? [])
        .filter((h) => h.dia === dia)
        .sort((a, b) => horaAMinutos(a.inicio) - horaAMinutos(b.inicio));
    const slots = [];

    for (const jornada of jornadas) {
        const finJornada = horaAMinutos(jornada.fin);

        for (
            let m = horaAMinutos(jornada.inicio);
            m + DURACION_TURNO_MINUTOS <= finJornada;
            m += DURACION_TURNO_MINUTOS
        ) {
            const inicio = construirFecha(fecha, minutosAHora(m));
            const fin = new Date(inicio.getTime() + DURACION_TURNO_MINUTOS * 60000);

            if (inicio <= ahora) continue;
            if (activos.some((t) => seSuperponen(inicio, fin, t.inicio, t.fin))) continue;
            if (tieneBloqueo({ bloqueos }, inicio, fin)) continue;
            slots.push({ hora: minutosAHora(m), inicio, fin });
        }
    }

    return slots;
}


export function tieneBloqueo(barbero, inicio, fin) {
    return (barbero.bloqueos ?? []).some((bloqueo) =>
        seSuperponen(inicio, fin, bloqueo.inicio, bloqueo.fin)
    );
}
