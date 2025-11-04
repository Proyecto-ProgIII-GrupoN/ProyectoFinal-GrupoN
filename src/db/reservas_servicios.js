import { pool } from "./conexion.js";

export default class ReservasServicios {
    buscarPorReservaId = async (reserva_id) => {
        const [rows] = await pool.execute(
            `SELECT 
                rs.reserva_servicio_id,
                rs.reserva_id,
                rs.servicio_id,
                rs.importe,
                s.descripcion as servicio_descripcion,
                DATE_FORMAT(rs.creado, '%Y-%m-%d %H:%i:%s') as creado,
                DATE_FORMAT(rs.modificado, '%Y-%m-%d %H:%i:%s') as modificado
            FROM reservas_servicios rs
            LEFT JOIN servicios s ON rs.servicio_id = s.servicio_id
            WHERE rs.reserva_id = ?`,
            [reserva_id]
        );
        return rows;
    }

    crear = async (reserva_id, servicios) => {
        if (!servicios || servicios.length === 0) {
            return true; // No hay servicios, no hacer nada
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const servicio of servicios) {
                await connection.execute(
                    'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
                    [reserva_id, servicio.servicio_id, servicio.importe]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Error al crear reservas_servicios:', error);
            throw new Error('Error al crear servicios de la reserva');
        } finally {
            connection.release();
        }
    }

    eliminarPorReservaId = async (reserva_id) => {
        const [result] = await pool.execute(
            'DELETE FROM reservas_servicios WHERE reserva_id = ?',
            [reserva_id]
        );
        return result.affectedRows;
    }

    actualizarServicios = async (reserva_id, servicios) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Eliminar servicios existentes
            await connection.execute(
                'DELETE FROM reservas_servicios WHERE reserva_id = ?',
                [reserva_id]
            );

            // Insertar nuevos servicios (si hay)
            if (servicios && servicios.length > 0) {
                for (const servicio of servicios) {
                    await connection.execute(
                        'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
                        [reserva_id, servicio.servicio_id, servicio.importe]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Error al actualizar reservas_servicios:', error);
            throw new Error('Error al actualizar servicios de la reserva');
        } finally {
            connection.release();
        }
    }
}

