import Servicios from "../db/servicios.js";

export default class ServiciosService {
    constructor() {
        this.servicios = new Servicios();
    }

    buscarTodos = (params) => {
        return this.servicios.buscarTodos(params);
    }

    buscarPorId = (id) => {
        return this.servicios.buscarPorId(id);
    }

    crear = (data) => {
        // Aquí podrías agregar lógica extra, como evitar duplicados
        return this.servicios.crear(data);
    }

    actualizarServicio = async (servicio_id, datos) => {
        const existe = await this.servicios.buscarPorId(servicio_id);
        if (!existe) {
            throw new Error('No existe el servicio');
        }
        return this.servicios.actualizarServicio(servicio_id, datos);
    }

    eliminarServicio = async (servicio_id) => {
        const existe = await this.servicios.buscarPorId(servicio_id);
        if (!existe) {
            throw new Error('No existe el servicio');
        }
        return this.servicios.eliminarServicio(servicio_id);
    }
}