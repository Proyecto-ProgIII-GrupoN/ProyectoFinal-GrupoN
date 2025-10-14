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
}
