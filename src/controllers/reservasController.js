import ReservasService from "../services/reservasService.js";

export default class ReservasController {
    constructor() {
        this.reservasService = new ReservasService();
    }

    buscarTodos = async (req, res) => {
        try {
            const { page = 1, limit = 10, activo = 1, sortBy = 'reserva_id', sortOrder = 'ASC' } = req.query;
            
            // Si es cliente, solo ver sus reservas
            const usuario_id = req.user && req.user.rol === 3 ? req.user.sub : null;
            
            const params = { page, limit, activo, sortBy, sortOrder, usuario_id };
            const result = await this.reservasService.buscarTodos(params);
            
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
            console.error('Error al obtener reservas:', err);
            res.status(500).json({ estado: false, mensaje: 'Error interno del servidor al consultar reservas' });
        }
    }

    buscarPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const reserva = await this.reservasService.buscarPorId(id);
            
            if (!reserva) {
                return res.status(404).json({ estado: false, mensaje: 'La reserva solicitada no se encuentra disponible.' });
            }

            // Si es cliente, verificar que sea su reserva
            if (req.user && req.user.rol === 3 && reserva.usuario_id !== req.user.sub) {
                return res.status(403).json({ estado: false, mensaje: 'No tienes permiso para ver esta reserva' });
            }

            res.json({ estado: true, datos: reserva });
        } catch (err) {
            console.log('Error al traer reserva por ID -->', err);
            res.status(500).json({ estado: false, mensaje: 'Ocurrió un fallo al procesar su solicitud.' });
        }
    }

    crear = async (req, res) => {
        try {
            const { fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, servicios } = req.body;
            
            // El usuario_id viene del token, no del body
            const usuario_id = req.user.sub;

            const creado = await this.reservasService.crear({
                fecha_reserva,
                salon_id,
                usuario_id,
                turno_id,
                foto_cumpleaniero,
                tematica,
                servicios
            });

            return res.status(201).json({ estado: true, datos: creado, mensaje: 'Reserva creada exitosamente' });
        } catch (err) {
            console.log('Error al crear reserva -->', err);
            if (err.message === 'El salón ya está reservado para esa fecha y turno') {
                return res.status(400).json({ estado: false, mensaje: err.message });
            }
            if (err.message === 'El salón especificado no existe') {
                return res.status(404).json({ estado: false, mensaje: err.message });
            }
            res.status(500).json({ estado: false, mensaje: 'No fue posible crear la reserva.' });
        }
    }

    actualizarReserva = async (req, res) => {
        try {
            const { id } = req.params;
            const datos = req.body;
            
            // Verificar que es admin (rol === 1)
            const esAdmin = req.user && req.user.rol === 1;
            
            const actualizado = await this.reservasService.actualizarReserva(id, datos, esAdmin);
            
            if (!actualizado) {
                return res.status(404).json({ estado: false, mensaje: 'La reserva especificada no existe.' });
            }
            
            res.json({ estado: true, datos: actualizado, mensaje: 'Reserva actualizada exitosamente' });
        } catch (err) {
            console.log('Error al actualizar reserva -->', err);
            if (err.message === 'Solo los administradores pueden modificar reservas') {
                return res.status(403).json({ estado: false, mensaje: err.message });
            }
            if (err.message === 'No existe la reserva') {
                return res.status(404).json({ estado: false, mensaje: err.message });
            }
            if (err.message === 'El salón ya está reservado para esa fecha y turno') {
                return res.status(400).json({ estado: false, mensaje: err.message });
            }
            res.status(500).json({ estado: false, mensaje: 'La actualización no pudo completarse.' });
        }
    }

    eliminarReserva = async (req, res) => {
        try {
            const { id } = req.params;
            const eliminado = await this.reservasService.eliminarReserva(id);
            
            if (!eliminado) {
                return res.status(404).json({ estado: false, mensaje: 'La reserva especificada no existe.' });
            }
            
            res.json({ estado: true, datos: eliminado, mensaje: 'La reserva ha sido eliminada exitosamente.' });
        } catch (err) {
            console.log('Error al eliminar reserva -->', err);
            if (err.message === 'No existe la reserva') {
                return res.status(404).json({ estado: false, mensaje: err.message });
            }
            res.status(500).json({ estado: false, mensaje: 'La eliminación no pudo completarse.' });
        }
    }
}

