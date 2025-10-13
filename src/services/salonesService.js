import Salones from "../db/salones.js";

export default class SalonesService {

    constructor() {
        this.salones = new Salones();
    }

    buscarTodos = () => {
        return this.salones.buscarTodos();
    }

    buscarPorId = (id) => {
        return this.salones.buscarPorId(id);
    }
}