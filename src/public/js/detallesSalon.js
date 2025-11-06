document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    const token = sessionStorage.getItem("accessToken");
    const res = await fetch(`/api/v1/salones/${id}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });

    const data = await res.json();
    const salon = data.datos || data;

    document.getElementById("detalleNombreSalon").value = salon.titulo;
    document.getElementById("detalleCapacidadSalon").value = salon.capacidad;
    document.getElementById("detalleDireccionSalon").value = salon.direccion;
    document.getElementById("detallePrecioSalon").value = salon.importe;
    document.getElementById("detalleImagenSalon").src = salon.imagen || "../img/default.jpg";
});
