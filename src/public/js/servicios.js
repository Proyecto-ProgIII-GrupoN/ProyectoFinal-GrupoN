// ================== Helpers básicos ==================

function getToken() {
    return localStorage.getItem("token");
}

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar token:", e);
        return null;
    }
}

function esAdminOEmpleado() {
    const token = getToken();
    if (!token) return false;
    const payload = parseJwt(token);
    const rol = payload?.tipo_usuario || payload?.rol;
    return rol === 1 || rol === 2;
}

// ================== Init ==================

document.addEventListener("DOMContentLoaded", () => {
    // Proteger página de servicios
    if (!esAdminOEmpleado()) {
        alert("Acceso restringido. Solo administradores o empleados pueden administrar servicios.");
        window.location.href = "../index.html";
        return;
    }

    cargarServicios();
    initFormServicios();
});

// ================== Listar servicios ==================

async function cargarServicios() {
    const tbody = document.getElementById("tbodyServicios");
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-muted">Cargando servicios...</td>
        </tr>
    `;

    try {
        const res = await fetch("/api/v1/servicios?page=1&limit=100");
        const data = await res.json();

        if (!res.ok || data.estado === false) {
            throw new Error(data.mensaje || "Error al obtener servicios");
        }

        const servicios = data.data || data.datos || [];

        if (!servicios.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        No hay servicios registrados.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";

        servicios.forEach(servicio => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${servicio.servicio_id}</td>
                <td>${servicio.descripcion}</td>
                <td>$${Number(servicio.importe).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" data-editar="${servicio.servicio_id}">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" data-eliminar="${servicio.servicio_id}">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Eventos de edición
        tbody.querySelectorAll("[data-editar]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-editar");
                const fila = btn.closest("tr");
                cargarServicioEnFormulario(id, fila);
            });
        });

        // Eventos de eliminación
        tbody.querySelectorAll("[data-eliminar]").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-eliminar");
                const ok = confirm("¿Seguro que deseas eliminar este servicio?");
                if (!ok) return;
                await eliminarServicio(id);
            });
        });

    } catch (error) {
        console.error("Error cargando servicios:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Error al cargar servicios.
                </td>
            </tr>
        `;
    }
}

// ================== Form crear / editar ==================

function initFormServicios() {
    const form = document.getElementById("formServicio");
    const inputId = document.getElementById("idServicio");
    const inputDesc = document.getElementById("descripcionServicio");
    const inputValor = document.getElementById("valorServicio");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = getToken();
        if (!token) {
            alert("Debes iniciar sesión.");
            return;
        }

        const descripcion = inputDesc.value.trim();
        const importe = parseFloat(inputValor.value);

        if (!descripcion || isNaN(importe) || importe < 0) {
            alert("Completa la descripción y un importe válido.");
            return;
        }

        const esEdicion = !!inputId.value;
        const url = esEdicion
            ? `/api/v1/servicios/${inputId.value}`
            : `/api/v1/servicios`;
        const method = esEdicion ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ descripcion, importe })
            });

            const data = await res.json();

            if (!res.ok || data.estado === false) {
                const msg =
                    data.mensaje ||
                    (data.errores && data.errores[0]?.msg) ||
                    "Error al guardar el servicio";
                throw new Error(msg);
            }

            form.reset();
            inputId.value = "";
            form.querySelector("button[type='submit']").textContent = "Guardar";

            cargarServicios();
        } catch (error) {
            console.error("Error guardando servicio:", error);
            alert(error.message || "Error al guardar servicio.");
        }
    });

    // Botón reset vuelve a modo "crear"
    form.addEventListener("reset", () => {
        inputId.value = "";
        form.querySelector("button[type='submit']").textContent = "Guardar";
    });
}

function cargarServicioEnFormulario(id, fila) {
    const inputId = document.getElementById("idServicio");
    const inputDesc = document.getElementById("descripcionServicio");
    const inputValor = document.getElementById("valorServicio");
    const submitBtn = document.querySelector("#formServicio button[type='submit']");

    const descripcion = fila.children[1].textContent.trim();
    const valorTexto = fila.children[2].textContent.replace("$", "").replace(/\./g, "").replace(",", ".");
    const importe = parseFloat(valorTexto);

    inputId.value = id;
    inputDesc.value = descripcion;
    inputValor.value = !isNaN(importe) ? importe : "";

    submitBtn.textContent = "Actualizar";
}

// ================== Eliminar servicio ==================

async function eliminarServicio(id) {
    try {
        const token = getToken();
        if (!token) {
            alert("Debes iniciar sesión.");
            return;
        }

        const res = await fetch(`/api/v1/servicios/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok || data.estado === false) {
            throw new Error(data.mensaje || "No se pudo eliminar el servicio");
        }

        cargarServicios();
    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        alert(error.message || "Error al eliminar servicio.");
    }
}
