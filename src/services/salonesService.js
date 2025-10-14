import Salones from '../db/salones.js';

export default class SalonesService {
  constructor() {
    this.salones = new Salones();
  }

  buscarTodos = () => this.salones.buscarTodos();

  buscarPorId = (id) => this.salones.buscarPorId(id);

  crear = (data) => this.salones.crear(data);
}
