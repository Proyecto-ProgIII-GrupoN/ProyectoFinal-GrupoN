import ReservasDB from '../db/reservas.js';
import ServiciosDB from '../db/servicios.js'; 

export default class ReservasService {
    constructor() {
        this.reservas = new ReservasDB();
        this.servicios = new ServiciosDB(); 
    }

    actualizarReserva = async (id, datos) => {
        const existe = await this.reservas.buscarPorId(id);
        if (!existe) throw new Error('Reserva no encontrada.');

        const debeRecalcular = datos.importe_salon !== undefined;

        await this.reservas.actualizarReserva(id, datos);
        
        if (debeRecalcular) {
            await this.reservas.recalcularTotal(id);
        }
        
        return this.reservas.buscarPorId(id);
    }

    eliminarReserva = async (id) => {
        const existe = await this.reservas.buscarPorId(id);
        if (!existe) throw new Error('Reserva no encontrada.');
        
        const afectado = await this.reservas.eliminarReserva(id);
        if (!afectado) throw new Error('No se pudo eliminar la reserva.');
        return true;
    }

    agregarServicio = async (reserva_id, servicio_id) => {
        const reserva = await this.reservas.buscarPorId(reserva_id);
        if (!reserva) throw new Error('Reserva no encontrada.');

        const servicio = await this.servicios.buscarServicioPorId(servicio_id);
        if (!servicio) throw new Error('Servicio no encontrado o inactivo.');

        await this.reservas.agregarServicio(reserva_id, servicio_id, servicio.importe);
        
        return this.reservas.buscarPorId(reserva_id);
    }

    quitarServicio = async (reserva_id, servicio_id) => {
        const reserva = await this.reservas.buscarPorId(reserva_id);
        if (!reserva) throw new Error('Reserva no encontrada.');
        
        await this.reservas.quitarServicio(reserva_id, servicio_id);
        
        return this.reservas.buscarPorId(reserva_id);
    }

    crearReserva = async (datos, servicios) => { 
        // Persona D
        console.warn('SERVICE: crearReserva NO IMPLEMENTADO');
        return { id: 999, ...datos }; 
    }
    
    listarReservas = async (filtros) => { 
        // Persona D
        console.warn('SERVICE: listarReservas NO IMPLEMENTADO');
        return []; 
    }

    buscarPorId = async (id) => {
        // Persona D
        console.warn('SERVICE: buscarPorId NO IMPLEMENTADO');
        return this.reservas.buscarPorId(id); 
    }
}