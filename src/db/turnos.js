import { pool } from "./conexion.js";

export default class Turnos {
    buscarTodos = async ({ page = 1, limit = 10, activo = 1, sortBy = 'turno_id', sortOrder = 'ASC' }) => {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        const allowedSortFields = ['turno_id', 'orden', 'hora_desde', 'hora_hasta', 'creado', 'modificado'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'turno_id';
        const sortDir = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';

        const sqlData = `
            SELECT
                turno_id,
                orden,
                DATE_FORMAT(hora_desde, '%H:%i') as hora_desde,
                DATE_FORMAT(hora_hasta, '%H:%i') as hora_hasta,
                activo,
                DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado
            FROM turnos
            WHERE activo = ?
            ORDER BY ${sortField} ${sortDir}
            LIMIT ? OFFSET ?`;

        const sqlTotal = `SELECT COUNT(*) AS total FROM turnos WHERE activo = ?`;

        try {
            const [data] = await pool.execute(sqlData, [activo, limitNum, offset]);
            const [totalRows] = await pool.execute(sqlTotal, [activo]);
            return {
                data,
                total: totalRows[0].total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalRows[0].total / limitNum)
            };
        } catch (error) {
            console.error('Error en buscarTodos turnos:', error);
            throw new Error('Error al consultar turnos en base de datos');
        }
    }

    buscarPorId = async (id) => {
        const [rows] = await pool.execute(
            'SELECT turno_id, orden, hora_desde, hora_hasta, activo, creado, modificado FROM turnos WHERE turno_id = ?',
            [id]
        );
        return rows[0];
    }

    crear = async ({ orden, hora_desde, hora_hasta }) => {
        const [result] = await pool.execute(
            'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?,?,?)',
            [orden, hora_desde, hora_hasta]
        );
        return this.buscarPorId(result.insertId);
    }

    actualizarTurno = async (turno_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo}=?`).join(',');
        const parametros = [...valoresActualizar, turno_id];
        const sql = `UPDATE turnos SET ${setValores} WHERE turno_id=?`;
        const [result] = await pool.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(turno_id);
    }

    eliminarTurno = async (turno_id) => {
        const [result] = await pool.execute(
            'UPDATE turnos SET activo = 0 WHERE turno_id = ?',
            [turno_id]
        );
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(turno_id);
    }
}


