import EstadisticasService from "../services/estadisticasService.js";
import { pool } from "../db/conexion.js";

export default class EstadisticasController {
    constructor() {
        this.estadisticasService = new EstadisticasService();
    }

    /**
     * Obtiene estadísticas según el tipo solicitado
     * GET /estadisticas?tipo=general|salon|periodo|servicios|clientes
     * Si no se especifica tipo, retorna todas las estadísticas
     */
    obtener = async (req, res) => {
        try {
            const { tipo } = req.query;

            // Modo debug: calcular rápidamente algunas métricas con consultas directas
            // para comparar con los resultados del stored procedure.
            if (req.query.debug === 'true') {
                const [[{ total_reservas }]] = await pool.execute("SELECT COUNT(*) AS total_reservas FROM reservas WHERE activo = 1");
                const [[{ total_ingresos }]] = await pool.execute("SELECT COALESCE(SUM(importe_total),0) AS total_ingresos FROM reservas WHERE activo = 1");
                const [[{ total_clientes }]] = await pool.execute("SELECT COUNT(DISTINCT usuario_id) AS total_clientes FROM reservas WHERE activo = 1");
                const [[{ total_salones }]] = await pool.execute("SELECT COUNT(DISTINCT salon_id) AS total_salones FROM reservas WHERE activo = 1");

                return res.json({
                    estado: true,
                    mensaje: 'Estadísticas debug calculadas directamente desde consultas',
                    datos: {
                        total_reservas: Number(total_reservas) || 0,
                        total_ingresos: (Number(total_ingresos) || 0).toFixed(2),
                        promedio_reservas_mes: null,
                        total_clientes_activos: Number(total_clientes) || 0,
                        total_salones_activos: Number(total_salones) || 0
                    }
                });
            }

            // Si no se especifica tipo, retornar todas las estadísticas
            if (!tipo || tipo === 'todas' || tipo === 'all') {
                const todas = await this.estadisticasService.obtenerTodas();
                return res.json({
                    estado: true,
                    mensaje: 'Estadísticas obtenidas exitosamente',
                    datos: todas
                });
            }

            // Obtener estadística específica
            const datos = await this.estadisticasService.obtenerEstadisticas(tipo);

            if (!datos || (Array.isArray(datos) && datos.length === 0)) {
                return res.status(404).json({
                    estado: false,
                    mensaje: `No se encontraron datos para el tipo de estadística: ${tipo}`
                });
            }

            res.json({
                estado: true,
                mensaje: 'Estadísticas obtenidas exitosamente',
                tipo: tipo,
                datos: datos
            });

        } catch (error) {
            console.error('Error en obtener estadísticas:', error);
            
            if (error.message.includes('no válido')) {
                return res.status(400).json({
                    estado: false,
                    mensaje: error.message
                });
            }

            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor al obtener estadísticas'
            });
        }
    }
}

