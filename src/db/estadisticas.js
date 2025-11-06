import { pool } from "./conexion.js";

export default class Estadisticas {
    
    /**
     * Obtiene estadísticas generales del sistema
     * @returns {Promise<Object>} Estadísticas generales
     */
    obtenerGenerales = async () => {
        try {
            const [rows] = await pool.execute('CALL sp_estadisticas_generales()');
            return rows[0][0] || null;
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

