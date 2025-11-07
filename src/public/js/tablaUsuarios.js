// public/js/tablaUsuarios.js

// Obtener token guardado (mismo criterio que venís usando)
function getToken() {
    return sessionStorage.getItem("accessToken") || localStorage.getItem("token");
  }
  
  // Decodificar JWT para ver rol (opcional pero útil)
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
    } catch (e) {
      console.error("Error al decodificar token:", e);
      return null;
    }
  }
  
  async function cargarUsuarios() {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;
  
    const token = getToken();
    if (!token) {
      // Sin login → afuera
      alert("Debes iniciar sesión como administrador para ver los usuarios.");
      window.location.href = "login.html";
      return;
    }
  
    const payload = parseJwt(token);
    const rol = payload?.rol; // asumiendo que tu JWT tiene 'rol'
  
    // Solo Admin (rol = 1) puede ver esta pantalla según tus rutas
    if (rol !== 1) {
      alert("No tienes permisos para ver esta sección.");
      window.location.href = "index.html";
      return;
    }
  
    try {
      // Rompemos caché de apicache/navegador agregando _=timestamp
      const res = await fetch(`/api/v1/usuarios?page=1&limit=100&_=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache"
        }
      });
  
      if (res.status === 401 || res.status === 403) {
        alert("Sesión expirada o sin permisos.");
        window.location.href = "login.html";
        return;
      }
  
      if (!res.ok) {
        console.error("Error HTTP al obtener usuarios:", res.status);
        alert("No se pudieron cargar los usuarios.");
        return;
      }
  
      const data = await res.json();
      const usuarios = data.datos || data.data || [];
  
      tbody.innerHTML = "";
  
      if (!usuarios.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="3" class="text-center text-muted">
              No hay usuarios para mostrar.
            </td>
          </tr>`;
        return;
      }
  
      usuarios.forEach((u) => {
        const tr = document.createElement("tr");
  
        // OJO: en tu modelo no hay campo email separado,
        // usás nombre_usuario como email/login.
        tr.innerHTML = `
          <td>${u.nombre || ""} ${u.apellido || ""}</td>
          <td class="text-center">${u.nombre_usuario || ""}</td>
          <td class="text-center">${u.nombre_usuario || ""}</td>
        `;
  
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("Ocurrió un error al cargar los usuarios.");
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
  });
  