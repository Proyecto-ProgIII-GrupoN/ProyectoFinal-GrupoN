import { pool } from './conexion.js';

export default class UsuariosDB {
  async buscarPorNombreUsuario(nombre_usuario) {
    const [rows] = await pool.execute(
      `SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo
       FROM usuarios
       WHERE nombre_usuario = ? AND activo = 1
       LIMIT 1`,
      [nombre_usuario]
    );
    return rows[0] || null;
  }

  async crearUsuario({ nombre, apellido, nombre_usuario, hash, tipo_usuario }) {
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo)
       VALUES (?,?,?,?,?,1)`,
      [nombre, apellido, nombre_usuario, hash, tipo_usuario]
    );
    const [rows] = await pool.execute(
      `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, activo, creado, modificado
       FROM usuarios WHERE usuario_id = ?`,
      [result.insertId]
    );
    return rows[0];
  }
}
