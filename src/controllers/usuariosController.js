import UsuariosService from "../services/usuariosService.js";

export default class UsuariosController {
    constructor() {
        this.usuariosService = new UsuariosService();
    }

    buscarTodos = async (req, res) => {
        try {
            const { page = 1, limit = 10, activo = 1, sortBy = 'usuario_id', sortOrder = 'ASC', tipo_usuario } = req.query;
            
            const params = { page, limit, activo, sortBy, sortOrder };
            
            // Si se especifica tipo_usuario en query, agregarlo (útil para listar solo clientes)
            if (tipo_usuario !== undefined) {
                params.tipo_usuario = parseInt(tipo_usuario);
            }
            
            const result = await this.usuariosService.buscarTodos(params);
            
            res.json({
                estado: true,
                datos: result.data,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                    hasNextPage: result.page < result.totalPages,
                    hasPrevPage: result.page > 1
                }
            });
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            res.status(500).json({ estado: false, mensaje: 'Error interno del servidor al consultar usuarios' });
        }
    }

    buscarPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await this.usuariosService.buscarPorId(id);
            
            if (!usuario) {
                return res.status(404).json({ estado: false, mensaje: 'El usuario solicitado no se encuentra disponible.' });
            }
            
            res.json({ estado: true, datos: usuario });
        } catch (err) {
            console.log('Error al traer usuario por ID -->', err);
            res.status(500).json({ estado: false, mensaje: 'Ocurrió un fallo al procesar su solicitud.' });
        }
    }

    crear = async (req, res) => {
        try {
            const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;
            
            const creado = await this.usuariosService.crear({
                nombre,
                apellido,
                nombre_usuario,
                contrasenia,
                tipo_usuario,
                celular,
                foto
            });

            return res.status(201).json({ estado: true, datos: creado, mensaje: 'Usuario creado exitosamente' });
        } catch (err) {
            console.log('Error al crear usuario -->', err);
            if (err.message === 'El nombre de usuario ya existe') {
                return res.status(400).json({ estado: false, mensaje: err.message });
            }
            res.status(500).json({ estado: false, mensaje: 'No fue posible crear el usuario.' });
        }
    }

    actualizarUsuario = async (req, res) => {
        try {
            const { id } = req.params;
            const datos = req.body;
            
            const actualizado = await this.usuariosService.actualizarUsuario(id, datos);
            
            if (!actualizado) {
                return res.status(404).json({ estado: false, mensaje: 'El usuario especificado no existe.' });
            }
            
            res.json({ estado: true, datos: actualizado, mensaje: 'Usuario actualizado exitosamente' });
        } catch (err) {
            console.log('Error al actualizar usuario -->', err);
            if (err.message === 'No existe el usuario') {
                return res.status(404).json({ estado: false, mensaje: err.message });
            }
            if (err.message === 'El nombre de usuario ya existe') {
                return res.status(400).json({ estado: false, mensaje: err.message });
            }
            res.status(500).json({ estado: false, mensaje: 'La actualización no pudo completarse.' });
        }
    }

    eliminarUsuario = async (req, res) => {
        try {
            const { id } = req.params;
            const eliminado = await this.usuariosService.eliminarUsuario(id);
            
            if (!eliminado) {
                return res.status(404).json({ estado: false, mensaje: 'El usuario especificado no existe.' });
            }
            
            res.json({ estado: true, datos: eliminado, mensaje: 'El usuario ha sido eliminado exitosamente.' });
        } catch (err) {
            console.log('Error al eliminar usuario -->', err);
            if (err.message === 'No existe el usuario') {
                return res.status(404).json({ estado: false, mensaje: err.message });
            }
            res.status(500).json({ estado: false, mensaje: 'La eliminación no pudo completarse.' });
        }
    }
}

