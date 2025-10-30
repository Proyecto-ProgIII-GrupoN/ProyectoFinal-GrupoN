import { pool } from "./conexion.js";

export default class Servicios {
    buscarServicios = async ({ page = 1, limit = 10, q = '', activo = 1, sortBy = 'servicio_id', sortOrder = 'ASC' }) => {
        const pageNum = Number.isInteger(parseInt(page)) && parseInt(page) > 0 ? parseInt(page) : 1;
        const limitNum = Number.isInteger(parseInt(limit)) && parseInt(limit) > 0 ? parseInt(limit) : 10;
        const offset = Number((pageNum - 1) * limitNum);

        const allowedSortFields = ['servicio_id', 'descripcion', 'importe', 'creado', 'modificado'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'servicio_id';
        const sortDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        let filtros = 'WHERE activo = ?';
        const params = [activo];

        if (q && q.trim()) {
            filtros += ' AND (descripcion LIKE ?)';
            const term = `%${q.trim()}%`;
            params.push(term);
        };

        const sqlDatos = `
            SELECT servicio_id, descripcion, importe, activo, 
            DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado,
            DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado
            FROM servicios
            ${filtros}
            ORDER BY ${sortField} ${sortDir}
            LIMIT ${limitNum} OFFSET ${offset}

        `;

        const sqlTotal = `SELECT COUNT(*) as total FROM servicios ${filtros}`;

        //parametros de paginacion
        const paramsDatos = [...params, limitNum, offset];
        console.log("PARAMS SQL ->", paramsDatos);
        console.log("SQL DATOS:", sqlDatos);
        console.log("PARAMS:", params);


        const [dataResult] = await pool.query(sqlDatos, paramsDatos);
        const [totalResult] = await pool.execute(sqlTotal, params);

        return {
            data: dataResult,
            total: totalResult[0].total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalResult[0].total / limitNum) || 1
        };
    };

    buscarServicioPorId = async (id) => {
        const [rows] = await pool.execute('SELECT servicio_id, descripcion, importe, activo, DATE_FORMAT(creado, "%Y-%m-%d %H:%i:%s") as creado, DATE_FORMAT(modificado, "%Y-%m-%d %H:%i:%s") as modificado FROM servicios WHERE servicio_id = ? AND activo = 1', [id]);
        return rows.length ? rows[0] : null;
    };

    crearServicio = async ({ descripcion, importe }) => {
        const [result] = await pool.execute('INSERT INTO servicios (descripcion, importe, activo) VALUES (?,?,1)', [descripcion, importe]);
        return result.insertId;
    };

    actualizarServicio = async (servicio_id, datos) => {
        //uso coalesce para actualizar parcialemente
        const { descripcion, importe } = datos;
        const sql = 'UPDATE servicios SET descripcion = COALESCE(?, descripcion), importe = COALESCE(?, importe), modificado = CURRENT_TIMESTAMP() WHERE servicio_id = ?';
        const [result] = await pool.execute(sql, [descripcion || null, (typeof importe !== 'undefined' ? importe : null), servicio_id]);
        return result.affectedRows;
    };

    eliminarServicio = async (servicio_id) => {
        const [result] = await pool.execute('UPDATE servicios SET activo = 0, modificado = CURRENT_TIMESTAMP() WHERE servicio_id = ?', [servicio_id]);
        return result.affectedRows;
    };

}