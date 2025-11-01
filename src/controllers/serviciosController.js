import ServiciosService from "../services/serviciosService.js";
import { validationResult } from "express-validator";

export default class ServiciosController {
    constructor() {
        this.serviciosService = new ServiciosService();
    };

    mostrarServicios = async (req, res) => {
        try {
            const { page, limit, q, sortBy, sortOrder } = req.query;
            const activo = req.query.activo !== undefined ? Number(req.query.activo) : 1;
            const result = await this.serviciosService.buscarServicios({ page, limit, q, activo, sortBy, sortOrder });
            res.json({ estado: true, datos: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
        } catch (error) {
            console.log('Error al mostrar los servicios: ', error);;
            res.status(500).json({ estado: false, mensaje: 'Error al obtener los servicios' });

        }
    };

    obtenerServicioPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const servicio = await this.serviciosService.buscarServiciosPorId(id);
            if (!servicio) return res.status(404).json({ estado: false, mensaje: 'Servicio no encontrado' });
            res.json({ estado: true, datos: servicio });
        } catch (error) {
            console.error('Error al obtener el servicio por id: ', error);
            res.status(500).json({ estado: false, mensaje: 'Error al obtener el servicio buscado' });

        }
    }

    crearServicio = async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ estado: false, errores: errores.array() });

        try {
            const { descripcion, importe } = req.body;
            const insertId = await this.serviciosService.crearServicio({ descripcion, importe });
            res.status(201).json({ estado: true, mensaje: 'Servicio creado correctamente', servicio_id: insertId });
        } catch (error) {
            console.error('Error al crear el servicio: ', error);
            res.status(500).json({ estado: false, mensaje: 'Error al crear el servicio' });

        }
    }

    actualizarServicio = async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) return res.status(400).json({ estado: false, errores: errores.array() });

        try {
            const { id } = req.params;
            const { descripcion, importe } = req.body;
            await this.serviciosService.actualizarServicio(id, { descripcion, importe });
            res.json({ estado: true, mensaje: 'Servicio actualizado correctamente' });
        } catch (error) {
            if (error.mensaje === 'No existe el servicio buscado') return res.status(404).json({ estado: false, mensaje: error.mensaje });
            console.error('Error al actualizar el servicio: ', error);
            res.status(500).json({ estado: false, mensaje: 'Error al actualizar el servicio' });

        }
    };

    eliminarServicio = async (req, res) => {
        try {
            const { id } = req.params;
            await this.serviciosService.eliminarServicio(id);
            res.json({ estado: true, mensaje: 'Servicio eliminado correctamente' });
        } catch (error) {
            if (error.mensaje === 'No existe el servicio buscado') return res.status(404).json({ estado: false, mensaje: error.mensaje });
            console.error('Error al eliminar el servicio: ', error);
            res.status(500).json({ estado: false, mensaje: 'Error al eliminar el servicio' });

        }
    }
}