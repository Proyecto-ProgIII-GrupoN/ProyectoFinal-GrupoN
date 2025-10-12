import SalonesService from "../services/salonesService.js";

export default class SalonesController {

    constructor() {
        this.salonesService = new SalonesService();
    }

    buscarTodos = async (req, res) => {
        try {
            const salones = await this.salonesService.buscarTodos();

            res.json({
                estado: true,
                datos: salones
            });
        } catch (err) {
            console.log('Error al obtener todos los salones -->', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor'
            });
        }
    }
}