import TurnosService from "../services/turnosService.js";

export default class TurnosController {
    constructor() {
        this.turnosService = new TurnosService();
    }

    buscarTodos = async (req, res) => {
        try {
            const { page = 1, limit = 10, activo = 1, sortBy = 'turno_id', sortOrder = 'ASC' } = req.query;
            const result = await this.turnosService.buscarTodos({ page, limit, activo, sortBy, sortOrder });
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
            console.error('Error al obtener turnos:', err);
            res.status(500).json({ estado: false, mensaje: 'Error interno del servidor al consultar turnos' });
        }
    }

    buscarPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const turno = await this.turnosService.buscarPorId(id);
            if (!turno) {
                return res.status(404).json({ estado: false, mensaje: 'El turno solicitado no se encuentra disponible.' });
            }
            res.json({ estado: true, datos: turno });
        } catch (err) {
            console.log('Error al traer turno por ID -->', err);
            res.status(500).json({ estado: false, mensaje: 'Ocurrió un fallo al procesar su solicitud.' });
        }
    }

    crear = async (req, res) => {
        try {
            const { orden, hora_desde, hora_hasta } = req.body;
            const creado = await this.turnosService.crear({ orden, hora_desde, hora_hasta });
            return res.status(201).json({ estado: true, datos: creado });
        } catch (err) {
            console.log('Error al crear turno -->', err);
            res.status(500).json({ estado: false, mensaje: 'No fue posible registrar el turno.' });
        }
    }

    actualizarTurno = async (req, res) => {
        try {
            const { id } = req.params;
            const datos = req.body;
            const actualizado = await this.turnosService.actualizarTurno(id, datos);
            if (!actualizado) {
                return res.status(404).json({ estado: false, mensaje: 'El turno especificado no existe.' });
            }
            res.json({ estado: true, datos: actualizado });
        } catch (err) {
            console.log('Error al actualizar turno -->', err);
            if (err.message === 'No existe el turno') {
                return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el turno indicado no está registrado.' });
            }
            res.status(500).json({ estado: false, mensaje: 'La actualización no pudo completarse.' });
        }
    }

    eliminarTurno = async (req, res) => {
        try {
            const { id } = req.params;
            const eliminado = await this.turnosService.eliminarTurno(id);
            if (!eliminado) {
                return res.status(404).json({ estado: false, mensaje: 'El turno especificado no existe.' });
            }
            res.json({ estado: true, datos: eliminado, mensaje: 'El turno ha sido eliminado exitosamente.' });
        } catch (err) {
            console.log('Error al eliminar turno -->', err);
            if (err.message === 'No existe el turno') {
                return res.status(404).json({ estado: false, mensaje: 'Recurso no encontrado: el turno indicado no está registrado.' });
            }
            res.status(500).json({ estado: false, mensaje: 'La eliminación no pudo completarse.' });
        }
    }
}


