// public/js/apiReservas.js
import { getToken } from "./apiAuth.js";

const API_URL = "/api/v1/reservas";

// 📦 Obtener reservas del usuario
export async function obtenerReservasUsuario(usuarioId) {
    const token = getToken();
    const res = await fetch(`${API_URL}/usuario/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener reservas");
    return await res.json();
}

// 📝 Crear nueva reserva
export async function crearReserva(datos) {
    const token = getToken();
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error("Error al crear reserva");
    return await res.json();
}
