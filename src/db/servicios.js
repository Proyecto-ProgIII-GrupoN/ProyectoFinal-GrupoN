import { pool } from "./conexion.js";

export default class Servicios {
    async buscarTodos({ page = 1, limit = 10, activo = 1, sortBy = 'servicio_id', sortOrder = 'ASC', q = '' }) {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        const allowedSortFields = ['servicio_id', 'descripcion', 'importe', 'creado', 'modificado'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'servicio_id';
        const sortDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        // filtros dinámicos
        let filtros = 'WHERE activo = ?';
        const paramsBase = [activo];
        if (q && String(q).trim()) {
            filtros += ' AND (descripcion LIKE ?)';
            const search = `%${String(q).trim()}%`;
            paramsBase.push(search);
        }

        const sqlData = `SELECT servicio_id, descripcion, importe, activo, DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado, DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado FROM servicios ${filtros} ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`;
        const sqlTotal = `SELECT COUNT(*) AS total FROM servicios ${filtros}`;
        try {
            const [data] = await pool.execute(sqlData, [...paramsBase, limitNum, offset]);
            const [totalRows] = await pool.execute(sqlTotal, paramsBase);
            return {
                data,
                total: totalRows[0].total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalRows[0].total / limitNum)
            };
        } catch (error) {
            console.error('Error en buscarTodos servicios:', error);
            throw new Error('Error al consultar servicios en base de datos');
        }
    }

    async buscarPorId(id) {
        const [rows] = await pool.execute(
            'SELECT servicio_id, descripcion, importe, activo, creado, modificado FROM servicios WHERE servicio_id = ?',
            [id]
        );
        return rows[0];
    }

    async crear({ descripcion, importe }) {
        const [result] = await pool.execute(
            'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
            [descripcion, importe]
        );
        return this.buscarPorId(result.insertId);
    }

    async actualizarServicio(servicio_id, datos) {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo}=?`).join(',');
        const parametros = [...valoresActualizar, servicio_id];
        const sql = `UPDATE servicios SET ${setValores} WHERE servicio_id=?`;
        const [result] = await pool.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(servicio_id);
    }

    async eliminarServicio(servicio_id) {
        const [result] = await pool.execute(
            'UPDATE servicios SET activo = 0 WHERE servicio_id = ?',
            [servicio_id]
        );
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(servicio_id);
    }
}