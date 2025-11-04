import { pool } from './conexion.js';

export default class ReservasDB {

    recalcularTotal = async (reserva_id) => {
        const sql = `
            UPDATE reservas r
            SET r.importe_total = (
                COALESCE(r.importe_salon, 0) + 
                COALESCE((SELECT SUM(rs.importe) FROM reservas_servicios rs WHERE rs.reserva_id = r.reserva_id), 0)
            )
            WHERE r.reserva_id = ?;
        `;
        await pool.execute(sql, [reserva_id]);
    }

    buscarPorId = async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM reservas WHERE reserva_id = ?', 
            [id]
        );
        if (!rows[0]) return null;
        
        const reserva = rows[0];

        const [servicios] = await pool.execute(
            `SELECT rs.servicio_id, s.descripcion, rs.importe 
             FROM reservas_servicios rs
             JOIN servicios s ON rs.servicio_id = s.servicio_id
             WHERE rs.reserva_id = ?`,
            [id]
        );
        reserva.servicios = servicios;
        return reserva;
    }

    actualizarReserva = async (id, datos) => {
        const campos = Object.keys(datos).map(k => `${k} = ?`).join(', ');
        const valores = [...Object.values(datos), id];
        const sql = `UPDATE reservas SET ${campos}, modificado = CURRENT_TIMESTAMP WHERE reserva_id = ?`;
        
        const [result] = await pool.execute(sql, valores);
        return result.affectedRows > 0;
    }

    eliminarReserva = async (id) => {
        const [result] = await pool.execute(
            'UPDATE reservas SET activo = 0 WHERE reserva_id = ?', 
            [id]
        );
        return result.affectedRows > 0;
    }

    agregarServicio = async (reserva_id, servicio_id, importe) => {
        const [existe] = await pool.execute(
            'SELECT 1 FROM reservas_servicios WHERE reserva_id = ? AND servicio_id = ?',
            [reserva_id, servicio_id]
        );
        if (existe.length > 0) {
            throw new Error('El servicio ya está agregado a esta reserva.');
        }

        await pool.execute(
            'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
            [reserva_id, servicio_id, importe]
        );
        
        await this.recalcularTotal(reserva_id);
    }

    quitarServicio = async (reserva_id, servicio_id) => {
        const [result] = await pool.execute(
            'DELETE FROM reservas_servicios WHERE reserva_id = ? AND servicio_id = ?',
            [reserva_id, servicio_id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Servicio no encontrado en esta reserva.');
        }

        await this.recalcularTotal(reserva_id);
    }

    // Metodos Persona D
    crearReserva = async (datos) => { 
        // Persona D
        console.warn('DB: crearReserva NO IMPLEMENTADO');
        return 999; 
    }
    
    agregarServiciosBatch = async (reserva_id, servicios) => {
        // Persona D
        console.warn('DB: agregarServiciosBatch NO IMPLEMENTADO');
    }

    listarReservas = async ({ usuario_id = null }) => {
        // Persona D
        console.warn('DB: listarReservas NO IMPLEMENTADO');
        return []; 
    }

    verificarColision = async ({ fecha_reserva, salon_id, turno_id, excluir_id = 0 }) => {
        // Persona D
        console.warn('DB: verificarColision NO IMPLEMENTADO');
        return false; 
    }
}