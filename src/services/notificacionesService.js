import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

export default class NotificacionesService {
    
    /**
     * Envía correo de confirmación al cliente cuando se crea una reserva
     */
    enviarCorreoCliente = async (datosReserva) => {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const plantillaPath = path.join(__dirname, '../utils/handlebars/plantillaCliente.hbs');
            const plantilla = fs.readFileSync(plantillaPath, 'utf-8');

            const template = handlebars.compile(plantilla);
            
            const importeSalon = parseFloat(datosReserva.importe_salon || 0);
            const subtotalServicios = datosReserva.subtotal_servicios || 0;
            const importeTotal = parseFloat(datosReserva.importe_total || 0);

            const datos = {
                nombreCliente: datosReserva.cliente_nombre,
                fecha: datosReserva.fecha_reserva,
                salon: datosReserva.salon_titulo,
                direccion: datosReserva.salon_direccion,
                turno: `${datosReserva.hora_desde} - ${datosReserva.hora_hasta}`,
                tematica: datosReserva.tematica || 'No especificada',
                importeSalon: importeSalon.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                servicios: (datosReserva.servicios || []).map(s => ({
                    descripcion: s.descripcion,
                    importe: s.importe.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
                })),
                subtotalServicios: subtotalServicios.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                importeTotal: importeTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                tieneServicios: (datosReserva.servicios || []).length > 0
            };

            const correoHtml = template(datos);
            
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: datosReserva.cliente_email,
                subject: "✅ Reserva Confirmada - Reservas de Salones",
                html: correoHtml
            };
            
            await transporter.sendMail(mailOptions);
            console.log('✅ Correo de confirmación enviado al cliente:', datosReserva.cliente_email);
            return true;
        } catch (error) {
            console.error('❌ Error enviando correo al cliente:', error);
            return false;
        }
    }

    /**
     * Envía correo de notificación a todos los administradores cuando se crea una reserva
     */
    enviarCorreoAdmin = async (datosReserva, correosAdmin) => {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const plantillaPath = path.join(__dirname, '../utils/handlebars/plantillaAdmin.hbs');
            const plantilla = fs.readFileSync(plantillaPath, 'utf-8');

            const template = handlebars.compile(plantilla);
            
            const importeSalon = parseFloat(datosReserva.importe_salon || 0);
            const subtotalServicios = datosReserva.subtotal_servicios || 0;
            const importeTotal = parseFloat(datosReserva.importe_total || 0);

            const datos = {
                clienteNombre: datosReserva.cliente_nombre,
                clienteEmail: datosReserva.cliente_email,
                clienteCelular: datosReserva.cliente_celular || 'No proporcionado',
                fecha: datosReserva.fecha_reserva,
                salon: datosReserva.salon_titulo,
                direccion: datosReserva.salon_direccion,
                turno: `${datosReserva.hora_desde} - ${datosReserva.hora_hasta}`,
                tematica: datosReserva.tematica || 'No especificada',
                importeSalon: importeSalon.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                servicios: (datosReserva.servicios || []).map(s => ({
                    descripcion: s.descripcion,
                    importe: s.importe.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
                })),
                subtotalServicios: subtotalServicios.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                importeTotal: importeTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                tieneServicios: (datosReserva.servicios || []).length > 0,
                reservaId: datosReserva.reserva_id
            };

            const correoHtml = template(datos);
            
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Unir todos los correos de administradores con comas
            const destinatarios = correosAdmin.join(', ');

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: destinatarios,
                subject: "🔔 Nueva Reserva Realizada",
                html: correoHtml
            };
            
            await transporter.sendMail(mailOptions);
            console.log('✅ Correo de notificación enviado a administradores:', destinatarios);
            return true;
        } catch (error) {
            console.error('❌ Error enviando correo a administradores:', error);
            return false;
        }
    }

    // OTROS TIPOS DE NOTIFICACION (para futuras implementaciones)
    enviarMensaje = async (datos) => {
        // Implementar envío de SMS u otro método
    }
    
    enviarWhatsapp = async (datos) => {
        // Implementar envío por WhatsApp
    }

    enviarNotificacionPush = async (datos) => {
        // Implementar notificaciones push
    }
}

