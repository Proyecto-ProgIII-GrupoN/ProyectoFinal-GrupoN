import bcrypt from 'bcryptjs';
import UsuariosDB from '../db/usuarios.js';

export default class UsuariosService {
  constructor() {
    this.usuarios = new UsuariosDB();
  }

  async login({ nombre_usuario, password }) {
    const user = await this.usuarios.buscarPorNombreUsuario(nombre_usuario);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.contrasenia);
    if (!ok) return null;

    return {
      id: user.usuario_id,
      usuario: user.nombre_usuario,
      rol: user.tipo_usuario, 
      nombre: user.nombre,
      apellido: user.apellido,
    };
  }

  async registrar({ nombre, apellido, nombre_usuario, password, tipo_usuario }) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return this.usuarios.crearUsuario({ nombre, apellido, nombre_usuario, hash, tipo_usuario });
  }
}
