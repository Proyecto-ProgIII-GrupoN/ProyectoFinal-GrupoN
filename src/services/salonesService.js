import Salones from "../db/salones.js";

export default class SalonesService {
    constructor() {
        this.salones = new Salones();
    }

    buscarTodos = (params) => {
        return this.salones.buscarTodos(params);
    }
}