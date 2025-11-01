import { param } from "express-validator";
import Servicios from "../db/servicios.js";

export default class ServiciosService {
    constructor() {
        this.servicios = new Servicios();
    };

    buscarServicios = (params) => this.servicios.buscarServicios(params);

    buscarServiciosPorId = (id) => this.servicios.buscarServicioPorId(id);

    crearServicio = async (data) => {
        //agregar validaciones aca
        return this.servicios.crearServicio(data);
    };

    actualizarServicio = async (servicio_id, datos) => {
        const existe = await this.servicios.buscarServicioPorId(servicio_id);
        if (!existe) throw new Error('No existe el servicio buscado');
        return this.servicios.actualizarServicio(servicio_id, datos);
    }

    eliminarServicio = async (servicio_id) => {
        const existe = await this.servicios.buscarServicioPorId(servicio_id);
        if (!existe) throw new Error('No existe el servicio buscado');
        return this.servicios.eliminarServicio(servicio_id);
    }
}