import { pool } from "./conexion.js";

export default class Estadisticas {
    
    /**
     * Obtiene estadísticas generales del sistema
     * @returns {Promise<Object>} Estadísticas generales
     */
    obtenerGenerales = async () => {
        try {
            const [rows] = await pool.execute('CALL sp_estadisticas_generales()');
            let result = rows[0][0] || null;

            // Fallback: si el stored procedure devuelve 0 o null en total_reservas,
            // recalculamos con consultas directas (esto ayuda cuando el SP está desactualizado)
            if (!result || Number(result.total_reservas) === 0) {
                const [[{ total_reservas }]] = await pool.execute("SELECT COUNT(*) AS total_reservas FROM reservas WHERE activo = 1");
                const [[{ total_ingresos }]] = await pool.execute("SELECT COALESCE(SUM(importe_total),0) AS total_ingresos FROM reservas WHERE activo = 1");
                const [[{ min_fecha }]] = await pool.execute("SELECT MIN(fecha_reserva) AS min_fecha FROM reservas WHERE activo = 1");
                const [[{ total_clientes }]] = await pool.execute("SELECT COUNT(DISTINCT usuario_id) AS total_clientes FROM reservas WHERE activo = 1");
                const [[{ total_salones }]] = await pool.execute("SELECT COUNT(DISTINCT salon_id) AS total_salones FROM reservas WHERE activo = 1");

                // calcular promedio mensual (si min_fecha está definido)
                let promedio = null;
                if (min_fecha) {
                    const monthsDiffRow = await pool.execute(`SELECT GREATEST(TIMESTAMPDIFF(MONTH, ?, CURDATE()), 1) AS months`, [min_fecha]);
                    const months = (monthsDiffRow[0][0] && monthsDiffRow[0][0].months) ? monthsDiffRow[0][0].months : 1;
                    promedio = (Number(total_reservas) / months).toFixed(2);
                }

                result = {
                    total_reservas: Number(total_reservas) || 0,
                    total_ingresos: (Number(total_ingresos) || 0).toFixed(2),
                    promedio_reservas_mes: promedio,
                    total_clientes_activos: Number(total_clientes) || 0,
                    total_salones_activos: Number(total_salones) || 0
                };
            }

            return result;
        } catch (error) {
            console.error('Error en obtenerGenerales:', error);
            throw new Error('Error al obtener estadísticas generales');
        }
    }

    /**
     * Obtiene estadísticas agrupadas por salón
     * @returns {Promise<Array>} Array de estadísticas por salón
     */
    obtenerPorSalon = async () => {
        try {
            const [rows] = await pool.execute('CALL sp_estadisticas_por_salon()');
            return rows[0] || [];
        } catch (error) {
            console.error('Error en obtenerPorSalon:', error);
            throw new Error('Error al obtener estadísticas por salón');
        }
    }

    /**
     * Obtiene estadísticas agrupadas por período (mes/año)
     * @returns {Promise<Array>} Array de estadísticas por período
     */
    obtenerPorPeriodo = async () => {
        try {
            const [rows] = await pool.execute('CALL sp_estadisticas_por_periodo()');
            return rows[0] || [];
        } catch (error) {
            console.error('Error en obtenerPorPeriodo:', error);
            throw new Error('Error al obtener estadísticas por período');
        }
    }

    /**
     * Obtiene estadísticas de servicios más contratados
     * @returns {Promise<Array>} Array de estadísticas de servicios
     */
    obtenerServicios = async () => {
        try {
            const [rows] = await pool.execute('CALL sp_estadisticas_servicios()');
            return rows[0] || [];
        } catch (error) {
            console.error('Error en obtenerServicios:', error);
            throw new Error('Error al obtener estadísticas de servicios');
        }
    }

    /**
     * Obtiene estadísticas de clientes más frecuentes
     * @returns {Promise<Array>} Array de estadísticas de clientes
     */
    obtenerClientes = async () => {
        try {
            const [rows] = await pool.execute('CALL sp_estadisticas_clientes()');
            return rows[0] || [];
        } catch (error) {
            console.error('Error en obtenerClientes:', error);
            throw new Error('Error al obtener estadísticas de clientes');
        }
    }
}

