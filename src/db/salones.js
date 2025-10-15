import { conexion } from "./conexion.js";

export default class Salones {
    buscarTodos = async ({ page = 1, limit = 10, q = '', activo = 1 }) => {
        const offset = (page - 1) * limit;

        let filtros = 'WHERE activo = ?';
        let params = [activo];

        if (q) {
            filtros += ' AND titulo LIKE ?';
            params.push(`%${q}%`);
        }

        const sqlData = `
            SELECT * FROM salones 
            ${filtros}
            ORDER BY salon_id ASC
            LIMIT ? OFFSET ?`;

        const sqlTotal = `
            SELECT COUNT(*) AS total 
            FROM salones 
            ${filtros}`;

        const [data] = await conexion.execute(sqlData, [...params, Number(limit), Number(offset)]);
        const [totalRows] = await conexion.execute(sqlTotal, params);

        return {
            data,
            total: totalRows[0].total
        };
    }

    buscarPorId = async (id) => {
        const [rows] = await conexion.execute(
            'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE salon_id = ?',
            [id]
        );
        return rows[0];
    }

    crear = async ({ titulo, direccion, capacidad = null, importe, latitud = null, longitud = null }) => {
        const [result] = await conexion.execute(
            'INSERT INTO salones (titulo, direccion, capacidad, importe, latitud, longitud) VALUES (?,?,?,?,?,?)',
            [titulo, direccion, capacidad, importe, latitud, longitud]
        );
        const [rows] = await conexion.execute(
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
        const [result] = await conexion.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(salon_id);
    }
}
