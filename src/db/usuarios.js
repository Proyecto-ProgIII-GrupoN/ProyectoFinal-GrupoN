import { pool } from "./conexion.js";

export default class Usuarios {
    buscarTodos = async ({ page = 1, limit = 10, activo = 1, sortBy = 'usuario_id', sortOrder = 'ASC', tipo_usuario = null }) => {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        const allowedSortFields = ['usuario_id', 'nombre', 'apellido', 'nombre_usuario', 'tipo_usuario', 'creado', 'modificado'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'usuario_id';
        const sortDir = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';

        let filtros = 'WHERE activo = ?';
        const params = [activo];

        // Filtrar por tipo_usuario si se especifica (útil para listar solo clientes)
        if (tipo_usuario !== null && tipo_usuario !== undefined) {
            filtros += ' AND tipo_usuario = ?';
            params.push(tipo_usuario);
        }

        const sqlData = `
            SELECT
                usuario_id,
                nombre,
                apellido,
                nombre_usuario,
                tipo_usuario,
                celular,
                foto,
                activo,
                DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado
            FROM usuarios
            ${filtros}
            ORDER BY ${sortField} ${sortDir}
            LIMIT ? OFFSET ?`;

        const sqlTotal = `SELECT COUNT(*) AS total FROM usuarios ${filtros}`;

        try {
            const [data] = await pool.execute(sqlData, [...params, limitNum, offset]);
            const [totalRows] = await pool.execute(sqlTotal, params);
            return {
                data,
                total: totalRows[0].total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalRows[0].total / limitNum)
            };
        } catch (error) {
            console.error('Error en buscarTodos usuarios:', error);
            throw new Error('Error al consultar usuarios en base de datos');
        }
    }

    buscarPorId = async (id) => {
        const [rows] = await pool.execute(
            `SELECT 
                usuario_id,
                nombre,
                apellido,
                nombre_usuario,
                tipo_usuario,
                celular,
                foto,
                activo,
                DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado
            FROM usuarios 
            WHERE usuario_id = ?`,
            [id]
        );
        return rows[0];
    }

    buscarPorNombreUsuario = async (nombre_usuario) => {
        const [rows] = await pool.execute(
            'SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo, creado, modificado FROM usuarios WHERE nombre_usuario = ? AND activo = 1',
            [nombre_usuario]
        );
        return rows[0];
    }

    crear = async ({ nombre, apellido, nombre_usuario, contrasenia_hash, tipo_usuario, celular = null, foto = null }) => {
        try {
            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
                [nombre, apellido, nombre_usuario, contrasenia_hash, tipo_usuario, celular, foto]
            );
            
            const usuarioCreado = await this.buscarPorId(result.insertId);
            if (!usuarioCreado) {
                throw new Error('No se pudo recuperar el usuario después de crearlo');
            }
            return usuarioCreado;
        } catch (error) {
            console.error('Error en crear usuario:', error);
            throw error;
        }
    }

    actualizarUsuario = async (usuario_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo}=?`).join(',');
        const parametros = [...valoresActualizar, usuario_id];
        const sql = `UPDATE usuarios SET ${setValores} WHERE usuario_id=?`;
        const [result] = await pool.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(usuario_id);
    }

    eliminarUsuario = async (usuario_id) => {
        const [result] = await pool.execute(
            'UPDATE usuarios SET activo = 0 WHERE usuario_id = ?',
            [usuario_id]
        );
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(usuario_id);
    }

    /**
     * Obtiene los correos de todos los administradores activos (tipo_usuario = 1)
     * Retorna un array de correos
     */
    obtenerCorreosAdministradores = async () => {
        const [rows] = await pool.execute(
            'SELECT nombre_usuario FROM usuarios WHERE tipo_usuario = 1 AND activo = 1',
            []
        );
        return rows.map(row => row.nombre_usuario);
    }
}


