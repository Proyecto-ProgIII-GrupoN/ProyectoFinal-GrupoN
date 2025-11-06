// public/js/apiUsuarios.js
import { getToken } from "./apiAuth.js";

const API_URL = "/api/v1/usuarios";

// 📄 Obtener perfil de usuario
export async function obtenerUsuario(id) {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener usuario");
    return await res.json();
}

// ✏️ Actualizar perfil de usuario
export async function actualizarUsuario(id, datos) {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error("Error al actualizar usuario");
    return await res.json();
}
