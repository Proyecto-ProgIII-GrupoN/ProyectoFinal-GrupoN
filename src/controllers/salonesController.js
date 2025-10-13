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

    buscarPorId = async (req, res) => {
        try {
            const { id } = req.params;

            const salon = await this.salonesService.buscarPorId(id);

            if (!salon) {
                return res.status(404).json({ 
                    estado: false,
                    mensaje: 'Salón no encontrado o está inactivo.'
                });
            }

            res.json({
                estado: true,
                datos: salon
            });
            
        } catch (err) {
            console.log('Error al obtener el salón por ID -->', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor'
            });
        }
    }
}