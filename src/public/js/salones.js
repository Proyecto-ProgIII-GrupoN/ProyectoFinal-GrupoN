// salones.js

let modoEliminarActivo = false; 

// Helpers JWT
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
        return null;
    }
}

function getUserRole() {
    const token =
        sessionStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.rol || null;
}

//  Obtiene salones reales del backend
async function obtenerSalonesDesdeBackend() {
    try {
        const response = await fetch("/api/v1/salones?page=1&limit=100");
        if (!response.ok) throw new Error("Error al obtener los salones");

        const data = await response.json();
        return data.datos || data.data || []; 
    } catch (error) {
        console.error("Error cargando salones:", error);
        return [];
    }
}

async function mostrarSalones(tipoFiltro = "todos", forzarTodos = false) {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const fechaSeleccionada =
        document.getElementById("fecha-filtro")?.value || null;
    const contenedor = document.getElementById("contenedor-salones");
    const rol = getUserRole(); // 1 = admin, 2 = empleado, 3 = cliente

    contenedor.innerHTML =
        `<p class="text-muted text-center">Cargando salones...</p>`;

    let lista = await obtenerSalonesDesdeBackend();

    if (!forzarTodos && tipoFiltro !== "todos") {
        lista = lista.filter((salon) =>
            salon.tipo?.toLowerCase() === tipoFiltro.toLowerCase()
        );
    }

    contenedor.innerHTML = "";

    if (!lista.length) {
        contenedor.innerHTML = "<p>No hay salones disponibles.</p>";
        return;
    }

    lista.forEach((salon) => {
        const estaReservado = reservas.some(
            (r) =>
                r.salonId === salon.salon_id &&
                r.fecha === fechaSeleccionada
        );

        const col = document.createElement("div");
        col.className =
            "col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center";

        const card = document.createElement("div");
        card.classList.add(
            "card-galeria",
            "card",
            "h-auto",
            "position-relative",
            "shadow",
            "border-none",
            "p-0",
            "my-3",
            "flex-grow-2"
        );
        card.style.width = "20rem";
        if (estaReservado) card.style.opacity = "0.5";

        card.innerHTML = `
            <img src="${salon.imagen || "../img/default.jpg"}"
                 class="card-img-top w-100 object-fit-cover"
                 style="height:13rem;"
                 alt="${salon.titulo}"/>

            <div class="card-body d-flex flex-column">
                <h3 class="card-title text-primary text-center">${salon.titulo}</h3>
                <p class="card-text my-1"><strong>Dirección:</strong> ${salon.direccion}</p>
                <p class="card-text my-1"><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
                <p class="card-text my-1"><strong>Precio:</strong> $${Number(salon.importe).toLocaleString()}</p>

                ${
                    estaReservado
                        ? `<div class="bg-danger text-white text-center fw-bold py-1 rounded my-2">
                               No disponible para la fecha seleccionada
                           </div>`
                        : ""
                }

                <div class="botones mt-2 text-center d-flex justify-content-around">
                    <a href="../HTML/detallesSalon.html?id=${salon.salon_id}" 
                       class="btn ${estaReservado ? "d-none" : "btn-info"} text-white flex-grow-1 w-25 me-2">
                       Ver detalle
                    </a>
                    <button class="btn ${estaReservado ? "d-none" : "btn-primary"} flex-grow-1 w-25"
                            ${estaReservado ? "disabled" : ""}>
                        ${estaReservado ? "Reservado" : "Reservar"}
                    </button>
                </div>
            </div>
        `;

        // botón reservar
        const btnReservar = card.querySelector(".btn.btn-primary");
        if (btnReservar && !estaReservado) {
            btnReservar.addEventListener("click", (e) => {
                e.preventDefault();
                const token =
                    sessionStorage.getItem("accessToken") ||
                    localStorage.getItem("token");
                if (!token) {
                    window.location.href = "login.html";
                } else {
                    window.location.href = "reserva.html";
                }
            });
        }

        // Acciones admin/empleado (editar / eliminar)
        if (rol === 1 || rol === 2) {
            const actions = document.createElement("div");
            actions.className =
                "position-absolute top-0 end-0 p-2 d-flex gap-2 acciones-salon";
            actions.style.opacity = "0";
            actions.style.transition = "opacity 0.2s ease";

            actions.innerHTML = `
                <button class="btn btn-sm btn-light border btn-edit" title="Editar salón">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-delete" title="Eliminar salón">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            card.appendChild(actions);

            card.addEventListener("mouseenter", () => {
                actions.style.opacity = "1";
            });
            card.addEventListener("mouseleave", () => {
                actions.style.opacity = "0";
            });

            // EDITAR
            actions
                .querySelector(".btn-edit")
                .addEventListener("click", (e) => {
                    e.stopPropagation();
                    localStorage.setItem(
                        "salonEdit",
                        JSON.stringify(salon)
                    );
                    window.location.href =
                        `nuevoSalon.html?salon_id=${salon.salon_id}`;
                });

            // ELIMINAR
            actions
                .querySelector(".btn-delete")
                .addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const confirmacion = confirm(
                        `¿Seguro que deseas eliminar el salón "${salon.titulo}"?`
                    );
                    if (!confirmacion) return;
                    await eliminarSalonPorId(salon.salon_id);
                    mostrarSalones(tipoFiltro, forzarTodos);
                });
        }

        col.appendChild(card);
        contenedor.appendChild(col);
    });
}

async function eliminarSalonPorId(id) {
    try {
        const token =
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("token");
        if (!token) {
            alert("Debes iniciar sesión para eliminar un salón.");
            return;
        }

        const res = await fetch(`/api/v1/salones/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.estado === false) {
            throw data;
        }
    } catch (err) {
        console.error("Error al eliminar salón:", err);
        alert(
            err.mensaje || "No se pudo eliminar el salón. Intenta nuevamente."
        );
    }
}

// init galería
document.addEventListener("DOMContentLoaded", () => {
    const selectTipo = document.getElementById("tipo-salon");
    const inputFecha = document.getElementById("fecha-filtro");
    const btnFiltrarFecha = document.getElementById("btn-filtrar-fecha");

    if (document.getElementById("contenedor-salones")) {
        mostrarSalones("todos", true);
    }

    if (selectTipo) {
        selectTipo.addEventListener("change", () => {
            mostrarSalones(selectTipo.value);
        });
    }

    if (btnFiltrarFecha && inputFecha) {
        btnFiltrarFecha.addEventListener("click", () => {
            if (!inputFecha.value) {
                alert("Por favor seleccioná una fecha.");
                return;
            }
            mostrarSalones("todos", true);
        });
    }

    if (inputFecha) {
        inputFecha.addEventListener("change", () => {
            mostrarSalones("todos");
        });
    }

    if (window.location.pathname.endsWith("nuevoSalon.html")) {
        initFormularioSalon();
    }
});

function initFormularioSalon() {
    const form = document.getElementById("formSalon");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const salonId = params.get("salon_id");
    let salonData = null;
    let modoEdicion = false;

    if (salonId) {
        const stored = localStorage.getItem("salonEdit");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.salon_id == salonId) {
                salonData = parsed;
                modoEdicion = true;
            }
        }
    }

    const inputNombre = document.getElementById("nombreSalon");
    const inputCapacidad = document.getElementById("capacidadSalon");
    const inputDireccion = document.getElementById("direccionSalon");
    const inputPrecio = document.getElementById("precioSalon");
    const btnSubmit = form.querySelector('button[type="submit"]');

    // Precargar datos si estamos editando
    if (modoEdicion && salonData) {
        inputNombre.value = salonData.titulo || "";
        inputCapacidad.value = salonData.capacidad || "";
        inputDireccion.value = salonData.direccion || "";
        inputPrecio.value = salonData.importe || "";
        btnSubmit.textContent = "Actualizar salón";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token =
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("token");
        if (!token) {
            alert("Debes iniciar sesión como admin o empleado.");
            return;
        }

        const body = {
            titulo: inputNombre.value.trim(),
            direccion: inputDireccion.value.trim(),
            capacidad: inputCapacidad.value
                ? parseInt(inputCapacidad.value)
                : null,
            importe: inputPrecio.value
                ? parseFloat(inputPrecio.value)
                : 0,
        };

        if (!body.titulo || !body.direccion || !body.importe) {
            alert("Nombre, dirección y precio son obligatorios.");
            return;
        }

        const baseUrl = "/api/v1/salones";
        const url = modoEdicion
            ? `${baseUrl}/${salonData.salon_id}`
            : baseUrl;
        const method = modoEdicion ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.estado === false) {
                throw data;
            }

            localStorage.removeItem("salonEdit");
            window.location.href = "galeria.html";
        } catch (err) {
            console.error("Error al guardar salón:", err);
            alert(
                err.mensaje || "No se pudo guardar el salón. Intenta nuevamente."
            );
        }
    });
}
