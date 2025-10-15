import Salones from "../db/salones.js";

export default class SalonesService {
    constructor() {
        this.salones = new Salones();
    }

<<<<<<< HEAD
    buscarTodos = (params) => {
        return this.salones.buscarTodos(params);
    }
}
=======
  buscarTodos = () => this.salones.buscarTodos();

  buscarPorId = (id) => this.salones.buscarPorId(id);

  crear = (data) => this.salones.crear(data);

  actualizarSalon = async (salon_id, datos) => {
    const existe = await this.salones.buscarPorId(salon_id);
    if (!existe) {
      throw new Error('No existe el salon');
    }
    return this.salones.actualizarSalon(salon_id, datos);  
  }
}
>>>>>>> origin/developer
