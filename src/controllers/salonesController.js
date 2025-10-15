import SalonesService from "../services/salonesService.js";

export default class SalonesController {
<<<<<<< HEAD
    constructor() {
        this.salonesService = new SalonesService();
=======
  constructor() {
    this.salonesService = new SalonesService();
  }

  buscarTodos = async (_req, res) => {
    try {
      const datos = await this.salonesService.buscarTodos();
      res.json({ estado: true, datos });
    } catch (err) {
      console.log('Error al listar salones -->', err);
      res.status(500).json({ estado: false, mensaje: 'El sistema experimentó una interrupción inesperada. Intente nuevamente.' });
>>>>>>> origin/developer
    }

<<<<<<< HEAD
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
=======
  buscarPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const salon = await this.salonesService.buscarPorId(id);
      if (!salon) {
        return res.status(404).json({ estado: false, mensaje: 'El salón solicitado no se encuentra disponible en este momento.' });
      }
      res.json({ estado: true, datos: salon });
    } catch (err) {
      console.log('Error al traer salón por ID -->', err);
      res.status(500).json({ estado: false, mensaje: 'Ocurrió un fallo al procesar su solicitud. Por favor, reintente la operación.' });
    }
  }

  crear = async (req, res) => {
    try {
      const { titulo, direccion, capacidad, importe, latitud, longitud } = req.body;
      const creado = await this.salonesService.crear({ titulo, direccion, capacidad, importe, latitud, longitud });
      return res.status(201).json({ estado: true, datos: creado });
    } catch (err) {
      console.log('Error al crear salón -->', err);
      res.status(500).json({ estado: false, mensaje: 'No fue posible registrar el salón. Verifique los datos e intente nuevamente.' });
    }
  }

  actualizarSalon = async (req, res) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const actualizado = await this.salonesService.actualizarSalon(id, datos);
      if (!actualizado) {
        return res.status(404).json({ estado: false, mensaje: 'El salón especificado no existe o no pudo ser localizado.' });
      }
      res.json({ estado: true, datos: actualizado });
    } catch (err) {
      console.log('Error al actualizar salón -->', err);
      // Manejar error específico del service
      if (err.message === 'No existe el salon') {
        return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el salón indicado no está registrado en el sistema.' });
      }
      res.status(500).json({ estado: false, mensaje: 'La actualización no pudo completarse debido a un error interno. Intente más tarde.' });
    }
  }


>>>>>>> origin/developer
}
