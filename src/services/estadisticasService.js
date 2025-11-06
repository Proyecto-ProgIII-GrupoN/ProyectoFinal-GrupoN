import Estadisticas from "../db/estadisticas.js";

export default class EstadisticasService {
    constructor() {
        this.estadisticas = new Estadisticas();
    }

    /**
     * Obtiene estadísticas según el tipo solicitado
     * @param {string} tipo - Tipo de estadística: 'general', 'salon', 'periodo', 'servicios', 'clientes'
     * @returns {Promise<Object|Array>} Estadísticas solicitadas
     */
    obtenerEstadisticas = async (tipo) => {
        switch (tipo) {
            case 'general':
            case 'generales':
                return await this.estadisticas.obtenerGenerales();
            
            case 'salon':
            case 'salones':
                return await this.estadisticas.obtenerPorSalon();
            
            case 'periodo':
            case 'periodos':
                return await this.estadisticas.obtenerPorPeriodo();
            
            case 'servicio':
            case 'servicios':
                return await this.estadisticas.obtenerServicios();
            
            case 'cliente':
            case 'clientes':
                return await this.estadisticas.obtenerClientes();
            
            default:
                throw new Error(`Tipo de estadística no válido: ${tipo}`);
        }
    }

    /**
     * Obtiene todas las estadísticas disponibles
     * @returns {Promise<Object>} Objeto con todas las estadísticas
     */
    obtenerTodas = async () => {
        try {
            const [generales, porSalon, porPeriodo, servicios, clientes] = await Promise.all([
                this.estadisticas.obtenerGenerales(),
                this.estadisticas.obtenerPorSalon(),
                this.estadisticas.obtenerPorPeriodo(),
                this.estadisticas.obtenerServicios(),
                this.estadisticas.obtenerClientes()
            ]);

            return {
                generales,
                porSalon,
                porPeriodo,
                servicios,
                clientes
            };
        } catch (error) {
            console.error('Error en obtenerTodas:', error);
            throw new Error('Error al obtener todas las estadísticas');
        }
    }
}

