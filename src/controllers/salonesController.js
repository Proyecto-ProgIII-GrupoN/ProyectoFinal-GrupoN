import SalonesService from "../services/salonesService.js";

export default class SalonesController {
  constructor() {
    this.salonesService = new SalonesService();
  }

  buscarTodos = async (req, res) => {
    try {
      // sacar y chequear los params con defaults seguros
      const {
        page = 1,
        limit = 10,
        q = '',
        activo = 1,
        sortBy = 'salon_id',
        sortOrder = 'ASC'
      } = req.query;

      // mas validaciones en el controller
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
      const activoNum = parseInt(activo) === 1 ? 1 : 0;

      const result = await this.salonesService.buscarTodos({
        page: pageNum,
        limit: limitNum,
        q: q.toString().trim(),
        activo: activoNum,
        sortBy,
        sortOrder
      });

      res.json({
        estado: true,
        datos: result.data,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1
        }
      });
    } catch (err) {
      console.error('Error al obtener salones:', err);
      res.status(500).json({
        estado: false,
        mensaje: 'Error interno del servidor al consultar salones'
      });
    }
  }

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
      if (err.message === 'No existe el salon') {
        return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el salón indicado no está registrado en el sistema.' });
      }
      res.status(500).json({ estado: false, mensaje: 'La actualización no pudo completarse debido a un error interno. Intente más tarde.' });
    }
  }

  eliminarSalon = async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await this.salonesService.eliminarSalon(id);
      if (!eliminado) {
        return res.status(404).json({ estado: false, mensaje: 'El salón especificado no existe o no pudo ser localizado.' });
      }
      res.json({ estado: true, datos: eliminado, mensaje: 'El salón ha sido eliminado exitosamente.' });
    } catch (err) {
      console.log('Error al eliminar salón -->', err);
      if (err.message === 'No existe el salon') {
        return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el salón indicado no está registrado en el sistema.' });
      }
      res.status(500).json({ estado: false, mensaje: 'La eliminación no pudo completarse debido a un error interno. Intente más tarde.' });
    }
  }
}
