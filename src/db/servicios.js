import { pool } from "./conexion.js";

export default class Servicios {
    async buscarTodos({ page = 1, limit = 10, q = '', activo = 1, sortBy = 'servicio_id', sortOrder = 'ASC' }) {
        try {
            const pageNum = Number.isInteger(parseInt(page)) && parseInt(page) > 0 ? parseInt(page) : 1;
            const limitNum = Number.isInteger(parseInt(limit)) && parseInt(limit) > 0 ? parseInt(limit) : 10;
            const offset = (pageNum - 1) * limitNum;
            const activoNum = parseInt(activo) || 1;

            const allowedSortFields = ['servicio_id', 'descripcion', 'importe', 'creado', 'modificado'];
            const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'servicio_id';
            const sortDir = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';

            // Filtro dinámico
            let filtros = 'WHERE activo = ?';
            const paramsBase = [activoNum];

            if (q && String(q).trim()) {
                filtros += ' AND (descripcion LIKE ?)';
                paramsBase.push(`%${String(q).trim()}%`);
            }

            // No usamos placeholders para LIMIT/OFFSET (compatibilidad mysql2)
            const sqlData = `
        SELECT servicio_id, descripcion, importe, activo,
               DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado,
               DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado
        FROM servicios
        ${filtros}
        ORDER BY ${sortField} ${sortDir}
        LIMIT ${limitNum} OFFSET ${offset}
      `;

            const sqlTotal = `SELECT COUNT(*) AS total FROM servicios ${filtros}`;

            console.log('SQL PARAMS (buscarTodos):', paramsBase, 'limit', limitNum, 'offset', offset);

            const [dataRows] = await pool.execute(sqlData, paramsBase);
            const [totalRows] = await pool.execute(sqlTotal, paramsBase);

            const total = (totalRows && totalRows[0] && totalRows[0].total) ? Number(totalRows[0].total) : 0;
            const totalPages = Math.max(1, Math.ceil(total / limitNum));

            return {
                data: dataRows,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            };
        } catch (err) {
            console.error('Error en buscarTodos servicios:', err);
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