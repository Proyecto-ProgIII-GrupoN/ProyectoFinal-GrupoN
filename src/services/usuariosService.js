import Usuarios from "../db/usuarios.js";
import bcrypt from 'bcrypt';

export default class UsuariosService {
    constructor() {
        this.usuarios = new Usuarios();
    }

    buscarTodos = (params) => {
        return this.usuarios.buscarTodos(params);
    }

    buscarPorId = (id) => {
        return this.usuarios.buscarPorId(id);
    }

    crear = async (data) => {
        const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = data;

        // Verificar que el nombre_usuario no exista
        const existe = await this.usuarios.buscarPorNombreUsuario(nombre_usuario);
        if (existe) {
            throw new Error('El nombre de usuario ya existe');
        }

        // Hashear contraseña con bcrypt
        const salt = await bcrypt.genSalt(10);
        const contrasenia_hash = await bcrypt.hash(contrasenia, salt);

        return this.usuarios.crear({
            nombre,
            apellido,
            nombre_usuario,
            contrasenia_hash,
            tipo_usuario,
            celular,
            foto
        });
    }

    actualizarUsuario = async (usuario_id, datos) => {
        const existe = await this.usuarios.buscarPorId(usuario_id);
        if (!existe) {
            throw new Error('No existe el usuario');
        }

        // Si se actualiza la contraseña, hashearla
        if (datos.contrasenia) {
            const salt = await bcrypt.genSalt(10);
            datos.contrasenia = await bcrypt.hash(datos.contrasenia, salt);
        }

        // Si se actualiza nombre_usuario, verificar que no exista otro con ese nombre
        if (datos.nombre_usuario && datos.nombre_usuario !== existe.nombre_usuario) {
            const existeUsuario = await this.usuarios.buscarPorNombreUsuario(datos.nombre_usuario);
            if (existeUsuario) {
                throw new Error('El nombre de usuario ya existe');
            }
        }

        return this.usuarios.actualizarUsuario(usuario_id, datos);
    }

    eliminarUsuario = async (usuario_id) => {
        const existe = await this.usuarios.buscarPorId(usuario_id);
        if (!existe) {
            throw new Error('No existe el usuario');
        }
        return this.usuarios.eliminarUsuario(usuario_id);
    }
}

