import Turnos from "../db/turnos.js";

export default class TurnosService {
    constructor() {
        this.turnos = new Turnos();
    }

    buscarTodos = (params) => this.turnos.buscarTodos(params);

    buscarPorId = (id) => this.turnos.buscarPorId(id);

    crear = (data) => this.turnos.crear(data);

    actualizarTurno = async (turno_id, datos) => {
        const existe = await this.turnos.buscarPorId(turno_id);
        if (!existe) {
            throw new Error('No existe el turno');
        }
        return this.turnos.actualizarTurno(turno_id, datos);
    }

    eliminarTurno = async (turno_id) => {
        const existe = await this.turnos.buscarPorId(turno_id);
        if (!existe) {
            throw new Error('No existe el turno');
        }
        return this.turnos.eliminarTurno(turno_id);
    }
}


