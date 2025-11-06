let modoEliminarActivo = false;

// 🔹 Nueva función: obtiene los salones reales del backend
async function obtenerSalonesDesdeBackend() {
    try {
        const response = await fetch("/api/v1/salones");
        if (!response.ok) throw new Error("Error al obtener los salones");

        const data = await response.json();
        return data.datos || data; // tu backend devuelve { estado, datos, meta }
    } catch (error) {
        console.error("Error cargando salones:", error);
        return [];
    }
}

async function mostrarSalones(tipoFiltro = "todos", forzarTodos = false) {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const fechaSeleccionada = document.getElementById("fecha-filtro")?.value;
    const contenedor = document.getElementById("contenedor-salones");
    contenedor.innerHTML = `<p class="text-muted text-center">Cargando salones...</p>`;

    // 🔹 Ahora los salones vienen del backend, no del localStorage
    let lista = await obtenerSalonesDesdeBackend();

    // 🔸 Si querés seguir usando tipoFiltro
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
            (r) => r.salonId === salon.salon_id && r.fecha === fechaSeleccionada
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
      <img src="${salon.imagen || "../img/default.jpg"}" class="card-img-top w-100 object-fit-cover" style="height:13rem;" alt="${salon.titulo}"/>
      <div class="card-body d-flex flex-column">
        <h3 class="card-title text-primary text-center">${salon.titulo}</h3>
        <p class="card-text my-1"><strong>Dirección:</strong> ${salon.direccion}</p>
        <p class="card-text my-1"><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
        <p class="card-text my-1"><strong>Precio:</strong> $${salon.importe.toLocaleString()}</p>
        ${estaReservado
                ? `<div class="bg-danger text-white text-center fw-bold py-1 rounded my-2">
              No disponible para la fecha seleccionada
            </div>`
                : ""
            }

        <div class="botones mt-2 text-center d-flex justify-content-around">
          <a href="../HTML/detallesSalon.html?id=${salon.salon_id}" 
             class="btn ${estaReservado ? "d-none" : "btn-info"} text-white flex-grow-1 w-25 me-2">Ver detalle</a>
          <button class="btn ${estaReservado ? "d-none" : "btn-primary"} flex-grow-1 w-25" ${estaReservado ? "disabled" : ""
            }>
            ${estaReservado ? "Reservado" : "Reservar"}
          </button>
        </div>
      </div>
    `;

        const btnReservar = card.querySelector(".btn.btn-primary");
        if (btnReservar && !estaReservado) {
            btnReservar.addEventListener("click", (e) => {
                e.preventDefault();
                const token = sessionStorage.getItem("accessToken");
                if (!token) {
                    mostrarModalLogin();
                } else {
                    window.location.href = "reserva.html";
                }
            });
        }

        // 🔹 Modo eliminar
        if (modoEliminarActivo) {
            const btnX = document.createElement("button");
            btnX.innerHTML = "x";
            btnX.className = "btn btn-danger btn-sm";
            btnX.style.position = "absolute";
            btnX.style.top = "10px";
            btnX.style.right = "10px";
            btnX.addEventListener("click", async () => {
                const confirmacion = confirm(
                    `¿Estás seguro de que querés eliminar el salón "${salon.titulo}"?`
                );
                if (confirmacion) {
                    await eliminarSalonPorId(salon.salon_id);
                    mostrarSalones(tipoFiltro);
                }
            });
            card.appendChild(btnX);
        }

        contenedor.appendChild(col);
        col.appendChild(card);
    });
}

async function eliminarSalonPorId(id) {
    try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(`/api/v1/salones/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error("Error al eliminar salón");
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el salón.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const selectTipo = document.getElementById("tipo-salon");
    const btnEliminarModo = document.getElementById("btn-eliminar-modo");
    const inputFecha = document.getElementById("fecha-filtro");
    const btnFiltrarFecha = document.getElementById("btn-filtrar-fecha");

    // Mostrar todos los salones al cargar
    mostrarSalones("todos", true);

    if (selectTipo) {
        selectTipo.addEventListener("change", () => {
            mostrarSalones(selectTipo.value);
        });
    }

    if (btnFiltrarFecha && inputFecha) {
        btnFiltrarFecha.addEventListener("click", () => {
            const fecha = inputFecha.value;
            if (!fecha) {
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

    if (btnEliminarModo) {
        btnEliminarModo.addEventListener("click", () => {
            modoEliminarActivo = !modoEliminarActivo;
            btnEliminarModo.textContent = modoEliminarActivo
                ? "Desactivar Eliminar Salones"
                : "Eliminar Salones";
            if (selectTipo) {
                mostrarSalones(selectTipo.value);
            }
        });
    }
});
