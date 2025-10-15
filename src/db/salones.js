import { pool } from "./conexion.js";

export default class Salones {
    buscarTodos = async ({ page = 1, limit = 10, q = '', activo = 1, sortBy = 'salon_id', sortOrder = 'ASC' }) => {
        // Validar y limitar parametros de paginacion
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Number(Math.min(100, Math.max(1, parseInt(limit) || 10))); // max 100 registros por pagina
        const offset = Number((pageNum - 1) * limitNum);

        // Validar campos de ordenamiento permitidos
        const allowedSortFields = ['salon_id', 'titulo', 'importe', 'creado', 'modificado'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'salon_id';
        const sortDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        // Construir filtros de busqueda
        let filtros = 'WHERE activo = ?';
        let params = [activo];

        if (q && q.trim()) {
            filtros += ' AND (titulo LIKE ? OR direccion LIKE ?)';
            const searchTerm = `%${q.trim()}%`;
            params.push(searchTerm, searchTerm);
        }

        // Consulta para obtener los datos paginados
        const sqlData = `
            SELECT
                salon_id,
                titulo,
                direccion,
                capacidad,
                importe,
                latitud,
                longitud,
                activo,
                DATE_FORMAT(creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(modificado, '%Y-%m-%d %H:%i:%s') as modificado
            FROM salones
            ${filtros}
            ORDER BY ${sortField} ${sortDir}
            LIMIT ${limitNum} OFFSET ${offset}`;

        // Consulta para contar el total de registros
        const sqlTotal = `SELECT COUNT(*) AS total FROM salones ${filtros}`;

        try {
            // Ejecutar ambas consultas en paralelo 
            const [dataResult, totalResult] = await Promise.all([
                pool.execute(sqlData, params),
                pool.execute(sqlTotal, params)
            ]);

            const [data] = dataResult;
            const [totalRows] = totalResult;

            return {
                data,
                total: totalRows[0].total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalRows[0].total / limitNum)
            };
        } catch (error) {
            console.error('Error en buscarTodos:', error);
            throw new Error('Error al consultar salones en base de datos');
        }
    }

    buscarPorId = async (id) => {
        const [rows] = await pool.execute(
            'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE salon_id = ?',
            [id]
        );
        return rows[0];
    }

    crear = async ({ titulo, direccion, capacidad = null, importe, latitud = null, longitud = null }) => {
        const [result] = await pool.execute(
            'INSERT INTO salones (titulo, direccion, capacidad, importe, latitud, longitud) VALUES (?,?,?,?,?,?)',
            [titulo, direccion, capacidad, importe, latitud, longitud]
        );
        const [rows] = await pool.execute(
            'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE salon_id = ?',
            [result.insertId]
        );
        return rows[0];
    }

    actualizarSalon = async (salon_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo}=?`).join(',');
        const parametros = [...valoresActualizar, salon_id];
        const sql = `UPDATE salones SET ${setValores} WHERE salon_id=?`;
        const [result] = await pool.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(salon_id);
    }

    eliminarSalon = async (salon_id) => {
        const [result] = await pool.execute(
            'UPDATE salones SET activo = 0 WHERE salon_id = ?',
            [salon_id]
        );
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(salon_id);
    }
}
