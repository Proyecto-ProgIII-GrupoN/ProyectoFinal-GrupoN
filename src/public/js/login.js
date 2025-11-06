document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre_usuario = document.getElementById("username").value;
        const contrasenia = document.getElementById("password").value;

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre_usuario, contrasenia }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.mensaje || "Error de login");

            // 💾 Guardar token y usuario
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            alert("Inicio de sesión exitoso");
            window.location.href = "../index.html";
        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión");
        }
    });
});
