import ServiciosService from "../services/serviciosService.js";

export default class ServiciosController {
    constructor() {
        this.serviciosService = new ServiciosService();
    }

    buscarTodos = async (req, res) => {
        try {
            const { page = 1, limit = 10, activo = 1, sortBy = 'servicio_id', sortOrder = 'ASC', q = '' } = req.query;
            const result = await this.serviciosService.buscarTodos({ page, limit, activo, sortBy, sortOrder, q });
            res.json({
                estado: true,
                data: result.data,
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
            console.error('Error al obtener servicios:', err);
            res.status(500).json({ estado: false, mensaje: 'Error interno del servidor al consultar servicios' });
        }
    }

    buscarPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const servicio = await this.serviciosService.buscarPorId(id);
            if (!servicio) {
                return res.status(404).json({ estado: false, mensaje: 'El servicio solicitado no se encuentra disponible.' });
            }
            res.json({ estado: true, datos: servicio });
        } catch (err) {
            console.log('Error al traer servicio por ID -->', err);
            res.status(500).json({ estado: false, mensaje: 'Ocurrió un fallo al procesar su solicitud.' });
        }
    }

    crear = async (req, res) => {
        try {
            const { descripcion, importe } = req.body;
            const creado = await this.serviciosService.crear({ descripcion, importe });
            return res.status(201).json({ estado: true, datos: creado });
        } catch (err) {
            console.log('Error al crear servicio -->', err);
            res.status(500).json({ estado: false, mensaje: 'No fue posible registrar el servicio. Verifique los datos e intente nuevamente.' });
        }
    }

    actualizarServicio = async (req, res) => {
        try {
            const { id } = req.params;
            const datos = req.body;
            const actualizado = await this.serviciosService.actualizarServicio(id, datos);
            if (!actualizado) {
                return res.status(404).json({ estado: false, mensaje: 'El servicio especificado no existe.' });
            }
            res.json({ estado: true, datos: actualizado });
        } catch (err) {
            console.log('Error al actualizar servicio -->', err);
            if (err.message === 'No existe el servicio') {
                return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el servicio indicado no está registrado.' });
            }
            res.status(500).json({ estado: false, mensaje: 'La actualización no pudo completarse debido a un error interno.' });
        }
    }

    eliminarServicio = async (req, res) => {
        try {
            const { id } = req.params;
            const eliminado = await this.serviciosService.eliminarServicio(id);
            if (!eliminado) {
                return res.status(404).json({ estado: false, mensaje: 'El servicio especificado no existe.' });
            }
            res.json({ estado: true, datos: eliminado, mensaje: 'El servicio ha sido eliminado exitosamente.' });
        } catch (err) {
            console.log('Error al eliminar servicio -->', err);
            if (err.message === 'No existe el servicio') {
                return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el servicio indicado no está registrado.' });
            }
            res.status(500).json({ estado: false, mensaje: 'La eliminación no pudo completarse debido a un error interno.' });
        }
    }
}