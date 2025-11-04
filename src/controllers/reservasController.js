import ReservasService from '../services/reservasService.js';
import { validationResult } from 'express-validator';

const manejarError = (res, error, mensajeDefault = 'Error interno del servidor.') => {
    console.error(error);
    const erroresConocidos = [
        'Reserva no encontrada.',
        'Servicio no encontrado.',
        'Servicio no encontrado o inactivo.',
        'El servicio ya está agregado a esta reserva.',
        'Servicio no encontrado en esta reserva.',
        'No se pudo eliminar la reserva.'
    ];
    
    if (erroresConocidos.includes(error.message)) {
        return res.status(404).json({ estado: false, mensaje: error.message });
    }
    
    res.status(500).json({ estado: false, mensaje: mensajeDefault });
};

export default class ReservasController {
    constructor() {
        this.service = new ReservasService();
    }

    actualizar = async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ estado: false, errores: errores.array() });
        }
        
        try {
            const { id } = req.params;
            const datos = req.body;
            const reserva = await this.service.actualizarReserva(Number(id), datos);
            res.json({ estado: true, datos: reserva });
        } catch (e) {
            manejarError(res, e, 'Error al actualizar la reserva.');
        }
    }

    eliminar = async (req, res) => {
        try {
            const { id } = req.params;
            await this.service.eliminarReserva(Number(id));
            res.status(204).send(); 
        } catch (e) {
            manejarError(res, e, 'Error al eliminar la reserva.');
        }
    }

    agregarServicio = async (req, res) => {
        try {
            const { id: reserva_id } = req.params;
            const { servicio_id } = req.body;
            const reserva = await this.service.agregarServicio(Number(reserva_id), Number(servicio_id));
            res.status(201).json({ estado: true, datos: reserva });
        } catch (e) {
            manejarError(res, e, 'Error al agregar el servicio.');
        }
    }

    quitarServicio = async (req, res) => {
        try {
            const { id: reserva_id } = req.params;
            const { servicio_id } = req.body;
            const reserva = await this.service.quitarServicio(Number(reserva_id), Number(servicio_id));
            res.json({ estado: true, datos: reserva });
        } catch (e) {
            manejarError(res, e, 'Error al quitar el servicio.');
        }
    }

    crear = async (req, res) => { 
        res.status(501).json({ estado: false, mensaje: 'Endpoint (Crear Reserva) no implementado.' });
    }
    
    listar = async (req, res) => { 
        res.status(501).json({ estado: false, mensaje: 'Endpoint (Listar Reservas) no implementado.' });
    }

    buscarPorId = async (req, res) => { 
        res.status(501).json({ estado: false, mensaje: 'Endpoint (Buscar Reserva por ID) no implementado.' });
    }
}