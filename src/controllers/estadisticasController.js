import EstadisticasService from "../services/estadisticasService.js";

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

