import Reservas from "../db/reservas.js";
import ReservasServicios from "../db/reservas_servicios.js";
import Salones from "../db/salones.js";
import Usuarios from "../db/usuarios.js";
import NotificacionesService from "./notificacionesService.js";

export default class ReservasService {
    constructor() {
        this.reservas = new Reservas();
        this.reservasServicios = new ReservasServicios();
        this.salones = new Salones();
        this.usuarios = new Usuarios();
        this.notificacionesService = new NotificacionesService();
    }

    buscarTodos = (params) => {
        return this.reservas.buscarTodos(params);
    }

    buscarPorId = async (id) => {
        const reserva = await this.reservas.buscarPorId(id);
        if (!reserva) {
            return null;
        }
        // Agregar servicios asociados
        const servicios = await this.reservasServicios.buscarPorReservaId(id);
        return { ...reserva, servicios };
    }

    crear = async (data) => {
        const { fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, servicios } = data;

        // Validar disponibilidad
        const disponible = await this.reservas.verificarDisponibilidad(salon_id, turno_id, fecha_reserva);
        if (!disponible) {
            throw new Error('El salón ya está reservado para esa fecha y turno');
        }

        // Obtener importe del salón
        const salon = await this.salones.buscarPorId(salon_id);
        if (!salon) {
            throw new Error('El salón especificado no existe');
        }
        const importe_salon = salon.importe;

        // Calcular importe_total = importe_salon + suma de servicios
        let importe_total = importe_salon;
        if (servicios && servicios.length > 0) {
            const sumaServicios = servicios.reduce((sum, s) => sum + parseFloat(s.importe || 0), 0);
            importe_total += sumaServicios;
        }

        // Crear reserva
        const nuevaReserva = await this.reservas.crear({
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero,
            tematica,
            importe_salon,
            importe_total
        });

        // Crear servicios asociados si hay
        if (servicios && servicios.length > 0) {
            await this.reservasServicios.crear(nuevaReserva.reserva_id, servicios);
        }

        // ENVIAR NOTIFICACIONES
        try {
            // Obtener datos completos de la reserva para notificación
            const datosReserva = await this.reservas.datosParaNotificacion(nuevaReserva.reserva_id);
            
            if (datosReserva) {
                // Enviar correo al cliente (confirmación)
                await this.notificacionesService.enviarCorreoCliente(datosReserva);
                
                // Obtener correos de administradores y enviar notificación
                const correosAdmin = await this.usuarios.obtenerCorreosAdministradores();
                if (correosAdmin && correosAdmin.length > 0) {
                    await this.notificacionesService.enviarCorreoAdmin(datosReserva, correosAdmin);
                }
            }
        } catch (notificationError) {
            // No fallar la creación de la reserva si falla la notificación
            console.error('⚠️ Advertencia: No se pudieron enviar las notificaciones:', notificationError);
        }

        // Retornar reserva completa con servicios
        return this.buscarPorId(nuevaReserva.reserva_id);
    }

    actualizarReserva = async (reserva_id, datos, esAdmin) => {
        // Verificar que solo admin puede modificar
        if (!esAdmin) {
            throw new Error('Solo los administradores pueden modificar reservas');
        }

        const existe = await this.reservas.buscarPorId(reserva_id);
        if (!existe) {
            throw new Error('No existe la reserva');
        }

        // Si se modifica fecha, salón o turno, validar disponibilidad
        if (datos.fecha_reserva || datos.salon_id || datos.turno_id) {
            const fecha = datos.fecha_reserva || existe.fecha_reserva;
            const salon = datos.salon_id || existe.salon_id;
            const turno = datos.turno_id || existe.turno_id;

            const disponible = await this.reservas.verificarDisponibilidad(salon, turno, fecha, reserva_id);
            if (!disponible) {
                throw new Error('El salón ya está reservado para esa fecha y turno');
            }
        }

        // Si se actualizan servicios, recalcular importe_total
        if (datos.servicios) {
            const servicios = datos.servicios;
            delete datos.servicios; // Eliminar del objeto datos para que no se intente actualizar directamente

            // Obtener importe del salón (actual o nuevo)
            const salonId = datos.salon_id || existe.salon_id;
            const salon = await this.salones.buscarPorId(salonId);
            const importe_salon = salon.importe;

            // Calcular nuevo importe_total
            let importe_total = importe_salon;
            if (servicios && servicios.length > 0) {
                const sumaServicios = servicios.reduce((sum, s) => sum + parseFloat(s.importe || 0), 0);
                importe_total += sumaServicios;
            }

            datos.importe_salon = importe_salon;
            datos.importe_total = importe_total;

            // Actualizar servicios
            await this.reservasServicios.actualizarServicios(reserva_id, servicios);
        }

        // Actualizar reserva
        const actualizada = await this.reservas.actualizarReserva(reserva_id, datos);
        
        // Retornar reserva completa con servicios
        return this.buscarPorId(actualizada.reserva_id);
    }

    eliminarReserva = async (reserva_id) => {
        const existe = await this.reservas.buscarPorId(reserva_id);
        if (!existe) {
            throw new Error('No existe la reserva');
        }
        return this.reservas.eliminarReserva(reserva_id);
    }
}

