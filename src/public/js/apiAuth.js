// public/js/apiAuth.js

const API_URL = "/api/v1/auth";

// 🔐 Login
async function loginUsuario(nombre_usuario, password) {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario, password })
        });

        if (!res.ok) throw new Error("Error al iniciar sesión");

        const data = await res.json();
        // Guardar el token (si tu backend lo devuelve)
        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        console.error("Error en login:", error);
        throw error;
    }
}

// 🔓 Logout
function logoutUsuario() {
    localStorage.removeItem("token");
}

// 🧾 Obtener token guardado
function getToken() {
    return localStorage.getItem("token");
}

export { loginUsuario, logoutUsuario, getToken };
