// apiSalones.js
const API_URL = "http://localhost:3000/api/v1/salones";

// ✅ Obtener todos los salones (requiere token JWT)
export const obtenerSalones = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Error al obtener los salones");
        return await response.json();
    } catch (error) {
        console.error("Error en obtenerSalones:", error);
        return [];
    }
};

// ✅ Obtener un salón por ID
export const obtenerSalonPorId = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Error al obtener el salón");
        return await response.json();
    } catch (error) {
        console.error("Error en obtenerSalonPorId:", error);
        return null;
    }
};
