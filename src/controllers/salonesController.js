import SalonesService from '../services/salonesService.js';

export default class SalonesController {
  constructor() {
    this.salonesService = new SalonesService();
  }

  buscarTodos = async (_req, res) => {
    try {
      const datos = await this.salonesService.buscarTodos();
      res.json({ estado: true, datos });
    } catch (err) {
      console.log('Error al listar salones -->', err);
      res.status(500).json({ estado: false, mensaje: 'Uy, algo se rompió del lado del servidor.' });
    }
  }

  buscarPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const salon = await this.salonesService.buscarPorId(id);
      if (!salon) {
        return res.status(404).json({ estado: false, mensaje: 'No encontré ese salón o está inactivo.' });
      }
      res.json({ estado: true, datos: salon });
    } catch (err) {
      console.log('Error al traer salón por ID -->', err);
      res.status(500).json({ estado: false, mensaje: 'Se nos cayó la estantería en el server.' });
    }
  }

  crear = async (req, res) => {
    try {
      const { titulo, direccion, capacidad, importe, latitud, longitud } = req.body;
      const creado = await this.salonesService.crear({ titulo, direccion, capacidad, importe, latitud, longitud });
      return res.status(201).json({ estado: true, datos: creado });
    } catch (err) {
      console.log('Error al crear salón -->', err);
      res.status(500).json({ estado: false, mensaje: 'No pudimos guardar el salón, probemos de nuevo.' });
    }
  }
}
