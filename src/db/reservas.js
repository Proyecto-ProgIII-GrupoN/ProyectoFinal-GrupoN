import { pool } from "./conexion.js";

export default class Reservas {
    buscarTodos = async ({ page = 1, limit = 10, activo = 1, sortBy = 'reserva_id', sortOrder = 'ASC', usuario_id = null }) => {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        const allowedSortFields = ['reserva_id', 'fecha_reserva', 'importe_total', 'creado', 'modificado'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'reserva_id';
        const sortDir = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';

        let filtros = 'WHERE r.activo = ?';
        const params = [activo];

        // Si se filtra por usuario (cliente solo ve las suyas)
        if (usuario_id) {
            filtros += ' AND r.usuario_id = ?';
            params.push(usuario_id);
        }

        const sqlData = `
            SELECT
                r.reserva_id,
                r.fecha_reserva,
                r.salon_id,
                r.usuario_id,
                r.turno_id,
                r.foto_cumpleaniero,
                r.tematica,
                r.importe_salon,
                r.importe_total,
                r.activo,
                DATE_FORMAT(r.creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(r.modificado, '%Y-%m-%d %H:%i:%s') as modificado,
                s.titulo as salon_titulo,
                t.hora_desde,
                t.hora_hasta,
                CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
            FROM reservas r
            LEFT JOIN salones s ON r.salon_id = s.salon_id
            LEFT JOIN turnos t ON r.turno_id = t.turno_id
            LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
            ${filtros}
            ORDER BY r.${sortField} ${sortDir}
            LIMIT ? OFFSET ?`;

        const sqlTotal = `SELECT COUNT(*) AS total FROM reservas r ${filtros}`;

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
            console.error('Error en buscarTodos reservas:', error);
            throw new Error('Error al consultar reservas en base de datos');
        }
    }

    buscarPorId = async (id) => {
        const [rows] = await pool.execute(
            `SELECT
                r.reserva_id,
                r.fecha_reserva,
                r.salon_id,
                r.usuario_id,
                r.turno_id,
                r.foto_cumpleaniero,
                r.tematica,
                r.importe_salon,
                r.importe_total,
                r.activo,
                DATE_FORMAT(r.creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(r.modificado, '%Y-%m-%d %H:%i:%s') as modificado,
                s.titulo as salon_titulo,
                t.hora_desde,
                t.hora_hasta,
                CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
            FROM reservas r
            LEFT JOIN salones s ON r.salon_id = s.salon_id
            LEFT JOIN turnos t ON r.turno_id = t.turno_id
            LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
            WHERE r.reserva_id = ?`,
            [id]
        );
        return rows[0];
    }

    verificarDisponibilidad = async (salon_id, turno_id, fecha_reserva, reserva_id_excluir = null) => {
        let sql = `
            SELECT COUNT(*) as total 
            FROM reservas 
            WHERE salon_id = ? 
                AND turno_id = ? 
                AND fecha_reserva = ? 
                AND activo = 1`;
        const params = [salon_id, turno_id, fecha_reserva];

        // Si estamos actualizando, excluir la reserva actual
        if (reserva_id_excluir) {
            sql += ' AND reserva_id != ?';
            params.push(reserva_id_excluir);
        }

        const [rows] = await pool.execute(sql, params);
        return rows[0].total === 0; // true si está disponible, false si hay conflicto
    }

    crear = async ({ fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero = null, tematica = null, importe_salon, importe_total }) => {
        const [result] = await pool.execute(
            `INSERT INTO reservas 
                (fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total]
        );
        return this.buscarPorId(result.insertId);
    }

    actualizarReserva = async (reserva_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo}=?`).join(',');
        const parametros = [...valoresActualizar, reserva_id];
        const sql = `UPDATE reservas SET ${setValores} WHERE reserva_id=?`;
        const [result] = await pool.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(reserva_id);
    }

    eliminarReserva = async (reserva_id) => {
        const [result] = await pool.execute(
            'UPDATE reservas SET activo = 0 WHERE reserva_id = ?',
            [reserva_id]
        );
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(reserva_id);
    }

    /**
     * Obtiene todos los datos necesarios para enviar notificación al cliente y admin
     * Incluye: datos de reserva, cliente, salón, turno y servicios
     */
    datosParaNotificacion = async (reserva_id) => {
        const [rows] = await pool.execute(
            `SELECT
                r.reserva_id,
                DATE_FORMAT(r.fecha_reserva, '%d/%m/%Y') as fecha_reserva,
                r.tematica,
                r.importe_salon,
                r.importe_total,
                s.titulo as salon_titulo,
                s.direccion as salon_direccion,
                DATE_FORMAT(t.hora_desde, '%H:%i') as hora_desde,
                DATE_FORMAT(t.hora_hasta, '%H:%i') as hora_hasta,
                u.nombre as cliente_nombre,
                u.apellido as cliente_apellido,
                u.nombre_usuario as cliente_email,
                u.celular as cliente_celular
            FROM reservas r
            LEFT JOIN salones s ON r.salon_id = s.salon_id
            LEFT JOIN turnos t ON r.turno_id = t.turno_id
            LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
            WHERE r.reserva_id = ? AND r.activo = 1`,
            [reserva_id]
        );
        
        if (rows.length === 0) {
            return null;
        }

        const datosReserva = rows[0];
        
        // Obtener servicios asociados con sus importes
        const [serviciosRows] = await pool.execute(
            `SELECT s.descripcion, rs.importe
            FROM reservas_servicios rs
            LEFT JOIN servicios s ON rs.servicio_id = s.servicio_id
            WHERE rs.reserva_id = ?`,
            [reserva_id]
        );

        // Calcular subtotal de servicios
        const subtotalServicios = serviciosRows.reduce((sum, s) => sum + parseFloat(s.importe || 0), 0);

        // Formatear datos
        return {
            ...datosReserva,
            cliente_nombre: `${datosReserva.cliente_nombre} ${datosReserva.cliente_apellido}`,
            servicios: serviciosRows.map(s => ({ 
                descripcion: s.descripcion,
                importe: parseFloat(s.importe || 0)
            })),
            subtotal_servicios: subtotalServicios
        };
    }

    /**
     * Obtiene todos los datos necesarios para generar reportes PDF/CSV
     * Incluye: reserva, cliente, salón, turno y servicios
     * @returns {Promise<Array>} Array de reservas con todos sus datos
     */
    buscarDatosReporte = async () => {
        try {
            // Obtener todas las reservas activas con datos básicos
            const [reservas] = await pool.execute(
                `SELECT
                    r.reserva_id,
                    DATE_FORMAT(r.fecha_reserva, '%d/%m/%Y') as fecha_reserva,
                    r.tematica,
                    r.importe_salon,
                    r.importe_total,
                    s.titulo as salon_titulo,
                    s.direccion as salon_direccion,
                    DATE_FORMAT(t.hora_desde, '%H:%i') as hora_desde,
                    DATE_FORMAT(t.hora_hasta, '%H:%i') as hora_hasta,
                    t.orden as turno_orden,
                    CONCAT(u.nombre, ' ', u.apellido) as cliente_nombre,
                    u.nombre_usuario as cliente_email,
                    u.celular as cliente_celular
                FROM reservas r
                LEFT JOIN salones s ON r.salon_id = s.salon_id
                LEFT JOIN turnos t ON r.turno_id = t.turno_id
                LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
                WHERE r.activo = 1
                ORDER BY r.fecha_reserva DESC, r.reserva_id DESC`
            );

            // Para cada reserva, obtener sus servicios
            const reservasConServicios = await Promise.all(
                reservas.map(async (reserva) => {
                    const [serviciosRows] = await pool.execute(
                        `SELECT s.descripcion, rs.importe
                        FROM reservas_servicios rs
                        LEFT JOIN servicios s ON rs.servicio_id = s.servicio_id
                        WHERE rs.reserva_id = ?`,
                        [reserva.reserva_id]
                    );

                    const servicios = serviciosRows.map(s => ({
                        descripcion: s.descripcion,
                        importe: parseFloat(s.importe || 0)
                    }));

                    const subtotalServicios = servicios.reduce((sum, s) => sum + s.importe, 0);

                    return {
                        ...reserva,
                        servicios: servicios,
                        subtotal_servicios: subtotalServicios,
                        tiene_servicios: servicios.length > 0
                    };
                })
            );

            return reservasConServicios;
        } catch (error) {
            console.error('Error en buscarDatosReporte:', error);
            throw new Error('Error al obtener datos para el reporte');
        }
    }
}

