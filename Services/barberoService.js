import { listarBarberosActivos } from "../Data/barberoData.js";

export async function listarBarberosService() {
    const barberos = await listarBarberosActivos();
    return barberos;
}