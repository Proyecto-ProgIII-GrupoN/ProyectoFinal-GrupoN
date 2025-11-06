// 📁 main.js
// Archivo principal: inicializa la app, maneja autenticación y navegación global

document.addEventListener("DOMContentLoaded", async () => {
    inicializarApp();
});

async function inicializarApp() {
    console.log("Inicializando aplicación...");

    verificarLogin();
    configurarNavegacion();
    manejarLogout();
}

// ----------------------------------------------------
// 🔹 Verificar si hay sesión activa (JWT en sessionStorage)
// ----------------------------------------------------
function verificarLogin() {
    const token = localStorage.getItem("token");
    const userProfileNav = document.getElementById("userProfileNav");
    const loginLink = document.getElementById("loginLink");
    const usuariosLink = document.getElementById("usuariosLink");

    // Si no hay token → solo opciones públicas
    if (!token) {
        if (userProfileNav) userProfileNav.style.display = "none";
        if (usuariosLink) usuariosLink.style.display = "none";
        if (loginLink) loginLink.style.display = "block";

        // Navbar público
        mostrarNavbarPorRol(null);
        return;
    }

    try {
        const payload = parseJwt(token);
        console.log("Usuario logueado:", payload);

        // Mostrar el navbar correspondiente al tipo de usuario
        mostrarNavbarPorRol(payload.rol);

        // Mostrar perfil, ocultar login
        if (userProfileNav) userProfileNav.style.display = "block";
        if (loginLink) loginLink.style.display = "none";

        // Mostrar nombre y foto si existen
        const navUsername = document.getElementById("navUsername");
        const navProfileImg = document.getElementById("navProfileImg");

        if (navUsername)
            navUsername.textContent = payload.nombre_usuario || "Usuario";

        if (navProfileImg && payload.imagen_perfil)
            navProfileImg.src = payload.imagen_perfil;

    } catch (error) {
        console.error("Token inválido:", error);
        sessionStorage.removeItem("token");
        window.location.reload();
    }
}


function mostrarNavbarPorRol(tipoUsuario) {
    console.log("Mostrando navbar para:", tipoUsuario);

    // Ocultar todos los grupos primero
    document.querySelectorAll(".nav-admin, .nav-cliente, .nav-usuario, .nav-publico").forEach(el => {
        el.style.display = "none";
    });

    // Mostrar según el tipo
    if (!tipoUsuario) {
        // Usuario no logueado → mostrar solo opciones públicas
        document.querySelectorAll(".nav-publico").forEach(el => el.style.display = "block");
        return;
    }

    // Común a todos los logueados
    document.querySelectorAll(".nav-usuario").forEach(el => el.style.display = "block");

    // Roles específicos
    if (tipoUsuario === 1) {
        document.querySelectorAll(".nav-admin").forEach(el => el.style.display = "block");
    } else if (tipoUsuario === 3) {
        document.querySelectorAll(".nav-cliente").forEach(el => el.style.display = "block");
    } else if (tipoUsuario === 2) {
        document.querySelectorAll(".nav-empleado").forEach(el => el.style.display = "block");
    }
}



// ----------------------------------------------------
// 🔹 Decodificar JWT (solo leer payload)
// ----------------------------------------------------
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error al decodificar token:", error);
        throw error;
    }
}

// ----------------------------------------------------
// 🔹 Configurar navegación de botones o enlaces globales
// ----------------------------------------------------
function configurarNavegacion() {
    const links = document.querySelectorAll("a[data-navegar]");
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const destino = e.target.getAttribute("data-navegar");
            if (destino) window.location.href = destino;
        });
    });
}

// ----------------------------------------------------
// 🔹 Logout: eliminar token y recargar
// ----------------------------------------------------
function manejarLogout() {
    const logoutBtn = document.querySelector('a[onclick="cerrarSesion()"]');
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sessionStorage.removeItem("accessToken");
            window.location.reload();
        });
    }
}

// ----------------------------------------------------
// 🔹 Mostrar modal de login si intenta reservar sin estar logueado
// ----------------------------------------------------
function manejarLogout() {
    const logoutBtn = document.querySelector('a[onclick="cerrarSesion()"]');
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }
}

// 🔹 Nueva función de cierre de sesión
function cerrarSesion() {
    // Borramos el token del mismo lugar donde lo guardás al hacer login
    localStorage.removeItem("token");

    // También borramos cualquier token residual por si acaso
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");

    // Redirigir al inicio (o login)
    window.location.href = "../index.html";
}


// ----------------------------------------------------
// 🔹 Fetch con token incluido automáticamente
// ----------------------------------------------------
async function fetchConToken(url, options = {}) {
    const token = sessionStorage.getItem("accessToken");
    const headers = options.headers || {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        console.warn("Token expirado o inválido");
        sessionStorage.removeItem("accessToken");
        mostrarModalLogin();
        throw new Error("No autorizado");
    }

    return response;
}
