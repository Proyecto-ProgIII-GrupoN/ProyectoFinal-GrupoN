import SalonesService from "../services/salonesService.js";

export default class SalonesController {
    constructor() {
        this.salonesService = new SalonesService();
    }

    buscarTodos = async (req, res) => {
        try {
            const { page = 1, limit = 10, q = '', activo = 1 } = req.query;

            const result = await this.salonesService.buscarTodos({
                page: Number(page),
                limit: Number(limit),
                q,
                activo: Number(activo)
            });

            res.json({
                estado: true,
                datos: result.data,
                meta: {
                    page: Number(page),
                    limit: Number(limit),
                    total: result.total
                }
            });
        } catch (err) {
            console.error('Error al obtener salones:', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor'
            });
        }
    }
}
