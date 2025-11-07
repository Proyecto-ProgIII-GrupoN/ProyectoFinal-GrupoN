document.addEventListener("DOMContentLoaded", () => {
    cargarMisReservas();
});

async function cargarMisReservas() {
    const lista = document.getElementById("reservasList");
    const noRes = document.getElementById("noReservations");

    const token = localStorage.getItem("token");
    if (!token) {
        // si no hay sesión: al login
        window.location.href = "login.html";
        return;
    }

    lista.innerHTML = `
        <p class="text-center mt-4">Cargando reservas...</p>
    `;
    if (noRes) noRes.style.display = "none";

    try {
        const res = await fetch("/api/v1/reservas?page=1&limit=50", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok || data.estado === false) {
            throw new Error(data.mensaje || "Error al obtener reservas");
        }

        const reservas = data.datos || [];

        if (!reservas.length) {
            lista.innerHTML = "";
            if (noRes) noRes.style.display = "block";
            return;
        }

        lista.innerHTML = "";

        reservas.forEach(r => {
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4 mb-3";

            const turnoTexto = (r.hora_desde && r.hora_hasta)
                ? `${r.hora_desde} - ${r.hora_hasta}`
                : r.turno_horario || "";

            col.innerHTML = `
                <div class="card shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-calendar-day me-2"></i>${r.fecha_reserva}
                        </h5>
                        <p class="card-text mb-1">
                            <strong>Salón:</strong> ${r.salon_titulo || r.salon_nombre || r.salon_id}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Turno:</strong> ${turnoTexto}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Temática:</strong> ${r.tematica || "-"}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Total:</strong> $${Number(r.importe_total || 0).toLocaleString()}
                        </p>
                        <button class="btn btn-outline-primary btn-sm mt-2">
                            Ver detalle
                        </button>
                    </div>
                </div>
            `;

            const btn = col.querySelector("button");
            btn.addEventListener("click", () => mostrarDetalleReserva(r));

            lista.appendChild(col);
        });

    } catch (error) {
        console.error("Error al cargar reservas:", error);
        lista.innerHTML = `
            <p class="text-center text-danger mt-4">
                No se pudieron cargar tus reservas.
            </p>
        `;
    }
}

function mostrarDetalleReserva(r) {
    const content = document.getElementById("detalleReservaContent");
    if (!content) return;

    const turnoTexto = (r.hora_desde && r.hora_hasta)
        ? `${r.hora_desde} - ${r.hora_hasta}`
        : r.turno_horario || "";

    const servicios = r.servicios || [];

    content.innerHTML = `
        <p><strong>Fecha:</strong> ${r.fecha_reserva}</p>
        <p><strong>Salón:</strong> ${r.salon_titulo || r.salon_nombre || r.salon_id}</p>
        <p><strong>Turno:</strong> ${turnoTexto}</p>
        <p><strong>Temática:</strong> ${r.tematica || "-"}</p>
        <p><strong>Servicios:</strong></p>
        <ul>
            ${
                servicios.length
                    ? servicios.map(s => `<li>${s.descripcion} - $${Number(s.importe || 0).toLocaleString()}</li>`).join("")
                    : "<li>Sin servicios adicionales</li>"
            }
        </ul>
        <p><strong>Total:</strong> $${Number(r.importe_total || 0).toLocaleString()}</p>
    `;

    const modalEl = document.getElementById("detalleReservaModal");
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}
