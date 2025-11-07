document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesion(); // asegúrate de que solo clientes puedan acceder
    await cargarSalones();
    await cargarServicios();
    await cargarTurnos(); // si también tenés servicios desde la API
    inicializarReserva();
});


async function verificarSesion() {
    const token = localStorage.getItem("token");
    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "Iniciar sesión requerido",
            text: "Debes iniciar sesión para hacer una reserva.",
            confirmButtonText: "Ir al login"
        }).then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    const payload = parseJwt(token);

    if (payload.rol !== 3) { // 3 = cliente
        Swal.fire({
            icon: "error",
            title: "Acceso restringido",
            text: "Solo los clientes pueden realizar reservas.",
            confirmButtonText: "Volver al inicio"
        }).then(() => {
            window.location.href = "../index.html";
        });
        return;
    }
}

let salonesGlobal = [];

async function cargarSalones() {
    try {
        const response = await fetch("http://localhost:3000/api/v1/salones");
        if (!response.ok) throw new Error("Error al obtener salones");

        const data = await response.json();
        const salones = data.datos || data.data || [];
        salonesGlobal = salones;

        const selectSalones = document.getElementById("salon");
        selectSalones.innerHTML = `<option value="">Seleccionar salón</option>`;

        salonesGlobal.forEach(salon => {
            const option = document.createElement("option");
            option.value = salon.salon_id;
            option.textContent = `${salon.titulo} - Capacidad ${salon.capacidad} personas - $${salon.importe}`;
            selectSalones.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando salones:", error);
        Swal.fire("Error", "No se pudieron cargar los salones", "error");
    }
}


async function cargarServicios() {
    try {
        const response = await fetch("http://localhost:3000/api/v1/servicios");
        if (!response.ok) throw new Error("Error al obtener servicios");

        const data = await response.json();
        const servicios = data.datos || data.data || [];

        const contenedorServicios = document.getElementById("servicios");
        contenedorServicios.innerHTML = "";

        servicios.forEach(servicio => {
            const div = document.createElement("div");
            div.classList.add("form-check");
            div.innerHTML = `
                <input class="form-check-input"
                       type="checkbox"
                       value="${servicio.servicio_id}"
                       data-precio="${servicio.importe}"
                       id="serv-${servicio.servicio_id}">
                <label class="form-check-label" for="serv-${servicio.servicio_id}">
                    ${servicio.descripcion} ($${servicio.importe})
                </label>
            `;
            contenedorServicios.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando servicios:", error);
    }
}


async function cargarTurnos() {
    try {
        const turnos = [
            { turno_id: 1, hora_desde: "12:00:00", hora_hasta: "14:00:00", activo: 1 },
            { turno_id: 2, hora_desde: "15:00:00", hora_hasta: "17:00:00", activo: 1 },
            { turno_id: 3, hora_desde: "18:00:00", hora_hasta: "20:00:00", activo: 1 },
        ];

        const turnoSelect = document.getElementById("turno");
        turnos.forEach(turno => {
            if (turno.activo) {
                const option = document.createElement("option");
                option.value = turno.turno_id;
                option.textContent = `${turno.hora_desde} - ${turno.hora_hasta}`;
                turnoSelect.appendChild(option);
            }
        });

    } catch (error) {
        console.error("Error cargando turnos:", error);
        Swal.fire("Error", "No se pudieron cargar los turnos", "error");
    }
}



function inicializarReserva() {
    const form = document.getElementById("formularioReserva");
    if (!form) return;

    form.addEventListener("change", calcularTotal);
    form.addEventListener("submit", enviarReserva);

    function calcularTotal() {
        let total = 0;

        // Servicios
        document.querySelectorAll("#servicios input:checked").forEach(chk => {
            total += parseFloat(chk.dataset.precio || 0);
        });

        // Salón
        const salonSeleccionado = salonesGlobal.find(
            s => s.salon_id == document.getElementById("salon").value
        );
        const importeSalon = salonSeleccionado ? parseFloat(salonSeleccionado.importe) : 0;
        total += importeSalon;

        document.getElementById("total").textContent = total;
        return { importeSalon, total };
    }

    async function enviarReserva(e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Error", "No hay sesión activa", "error");
            return;
        }

        const { importeSalon, total } = calcularTotal();

        const fecha_reserva = document.getElementById("fecha").value;
        const tematica = document.getElementById("tematica").value;
        const salon_id = parseInt(document.getElementById("salon").value);
        const turno_id = parseInt(document.getElementById("turno").value);

        if (!fecha_reserva || !salon_id || !turno_id) {
            Swal.fire("Error", "Completa todos los campos requeridos", "error");
            return;
        }

        const serviciosSeleccionados = Array
            .from(document.querySelectorAll("#servicios input:checked"))
            .map(chk => ({
                servicio_id: parseInt(chk.value),
                importe: parseFloat(chk.dataset.precio || 0)
            }));

        const reservaData = {
            fecha_reserva,
            salon_id,
            turno_id,
            tematica,
            ...(serviciosSeleccionados.length > 0 && { servicios: serviciosSeleccionados })
        };

        console.log("Reserva enviada:", reservaData);

        try {
            const response = await fetch("http://localhost:3000/api/v1/reservas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(reservaData)
            });

            const data = await response.json();
            console.log("Respuesta crear reserva:", data);

            if (!response.ok || data.estado === false) {
                // Esto te muestra el motivo real del 400
                throw new Error(data.mensaje || (data.errores && data.errores[0]?.msg) || "Error al crear la reserva");
            }

            await Swal.fire({
                icon: "success",
                title: "Reserva confirmada",
                text: "Tu reserva ha sido registrada exitosamente.",
                confirmButtonText: "Aceptar"
            });

            window.location.href = "reservasUsuario.html";

        } catch (error) {
            console.error("Error al enviar reserva:", error);
            Swal.fire("Error", error.message || "No se pudo enviar la reserva", "error");
        }
    }
}

// ----------------------------------------------------
// 🔹 Decodificar JWT (igual que en main.js)
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
