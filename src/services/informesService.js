import { createObjectCsvWriter } from 'csv-writer';
import puppeteer from "puppeteer";
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class InformesService {
    
    /**
     * Genera un archivo CSV con los datos de reservas
     * @param {Array} datosReporte - Array de reservas con todos sus datos
     * @returns {Promise<string>} Ruta del archivo CSV generado
     */
    informeReservasCsv = async (datosReporte) => {
        try {
            // Validar que hay datos
            if (!datosReporte || datosReporte.length === 0) {
                throw new Error('No hay datos para generar el reporte CSV');
            }

            // Crear directorio temporal si no existe
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Generar nombre de archivo con fecha y hora
            const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const nombreArchivo = `reservas_${fecha}.csv`;
            const rutaArchivo = path.join(tempDir, nombreArchivo);

            // Preparar datos para CSV (aplanar servicios)
            const datosCsv = [];
            datosReporte.forEach(reserva => {
                if (reserva.servicios && reserva.servicios.length > 0) {
                    // Si tiene servicios, crear una fila por cada servicio
                    reserva.servicios.forEach((servicio, index) => {
                        datosCsv.push({
                            reserva_id: reserva.reserva_id,
                            fecha_reserva: reserva.fecha_reserva,
                            cliente_nombre: reserva.cliente_nombre,
                            cliente_email: reserva.cliente_email,
                            cliente_celular: reserva.cliente_celular || 'N/A',
                            salon_titulo: reserva.salon_titulo,
                            salon_direccion: reserva.salon_direccion || 'N/A',
                            turno: `${reserva.hora_desde} - ${reserva.hora_hasta}`,
                            turno_orden: reserva.turno_orden || 'N/A',
                            tematica: reserva.tematica || 'No especificada',
                            servicio_descripcion: servicio.descripcion,
                            servicio_importe: servicio.importe.toFixed(2),
                            importe_salon: parseFloat(reserva.importe_salon || 0).toFixed(2),
                            importe_total: parseFloat(reserva.importe_total || 0).toFixed(2),
                            es_servicio: index > 0 ? '' : 'Principal' // Marcar solo la primera fila
                        });
                    });
                } else {
                    // Si no tiene servicios, crear una fila simple
                    datosCsv.push({
                        reserva_id: reserva.reserva_id,
                        fecha_reserva: reserva.fecha_reserva,
                        cliente_nombre: reserva.cliente_nombre,
                        cliente_email: reserva.cliente_email,
                        cliente_celular: reserva.cliente_celular || 'N/A',
                        salon_titulo: reserva.salon_titulo,
                        salon_direccion: reserva.salon_direccion || 'N/A',
                        turno: `${reserva.hora_desde} - ${reserva.hora_hasta}`,
                        turno_orden: reserva.turno_orden || 'N/A',
                        tematica: reserva.tematica || 'No especificada',
                        servicio_descripcion: 'Sin servicios',
                        servicio_importe: '0.00',
                        importe_salon: parseFloat(reserva.importe_salon || 0).toFixed(2),
                        importe_total: parseFloat(reserva.importe_total || 0).toFixed(2),
                        es_servicio: 'Principal'
                    });
                }
            });

            const csvWriter = createObjectCsvWriter({
                path: rutaArchivo,
                header: [
                    {id: 'reserva_id', title: 'ID Reserva'},
                    {id: 'fecha_reserva', title: 'Fecha Reserva'},
                    {id: 'cliente_nombre', title: 'Cliente'},
                    {id: 'cliente_email', title: 'Email Cliente'},
                    {id: 'cliente_celular', title: 'Teléfono Cliente'},
                    {id: 'salon_titulo', title: 'Salón'},
                    {id: 'salon_direccion', title: 'Dirección Salón'},
                    {id: 'turno', title: 'Turno'},
                    {id: 'turno_orden', title: 'Orden Turno'},
                    {id: 'tematica', title: 'Temática'},
                    {id: 'servicio_descripcion', title: 'Servicio'},
                    {id: 'servicio_importe', title: 'Importe Servicio'},
                    {id: 'importe_salon', title: 'Importe Salón'},
                    {id: 'importe_total', title: 'Importe Total'}
                ],
                encoding: 'utf8'
            });
            
            await csvWriter.writeRecords(datosCsv);
            return rutaArchivo;
            
        } catch (error) {
            console.error('Error generando CSV:', error);
            throw new Error(`Error al generar el reporte CSV: ${error.message}`);
        }
    }

    /**
     * Genera un PDF con los datos de reservas usando Puppeteer
     * @param {Array} datosReporte - Array de reservas con todos sus datos
     * @returns {Promise<Buffer>} Buffer del PDF generado
     */
    informeReservasPdf = async (datosReporte) => {
        try {
            // Validar que hay datos
            if (!datosReporte || datosReporte.length === 0) {
                throw new Error('No hay datos para generar el reporte PDF');
            }

            const plantillaPath = path.join(__dirname, '../utils/handlebars/informe.hbs');
            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            
            const template = handlebars.compile(plantillaHtml);
            
            // Formatear datos para la plantilla
            const datosFormateados = datosReporte.map(reserva => ({
                ...reserva,
                importe_salon: parseFloat(reserva.importe_salon || 0).toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                }),
                importe_total: parseFloat(reserva.importe_total || 0).toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                }),
                subtotal_servicios: reserva.subtotal_servicios.toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                }),
                servicios: reserva.servicios.map(s => ({
                    descripcion: s.descripcion,
                    importe: s.importe.toLocaleString('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                    })
                }))
            }));

            const htmlFinal = template({
                reservas: datosFormateados,
                fechaGeneracion: new Date().toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                totalReservas: datosFormateados.length
            });
            
            let browser = null;
            try {
                browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage'
                    ]
                });

                const page = await browser.newPage();
                await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

                const buffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '20mm',
                        right: '15mm',
                        bottom: '20mm',
                        left: '15mm'
                    }
                });

                // Guardar PDF en carpeta temp
                const tempDir = path.join(process.cwd(), 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }

                // Generar nombre de archivo con fecha y hora
                const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const nombreArchivo = `reservas_${fecha}.pdf`;
                const rutaArchivo = path.join(tempDir, nombreArchivo);

                // Guardar buffer en archivo
                fs.writeFileSync(rutaArchivo, buffer);
                console.log(`📄 PDF guardado en: ${rutaArchivo}`);

                return buffer;
            } finally {
                if (browser) {
                    await browser.close();
                }
            }

        } catch (error) {
            console.error('Error generando el PDF:', error);
            throw new Error(`Error al generar el reporte PDF: ${error.message}`);
        }
    }

    /**
     * Limpia archivos temporales antiguos (más de 1 hora)
     */
    limpiarArchivosTemporales = async () => {
        try {
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                return;
            }

            const archivos = fs.readdirSync(tempDir);
            const ahora = Date.now();
            const unaHora = 60 * 60 * 1000; // 1 hora en milisegundos

            archivos.forEach(archivo => {
                const rutaArchivo = path.join(tempDir, archivo);
                const stats = fs.statSync(rutaArchivo);
                const tiempoTranscurrido = ahora - stats.mtimeMs;

                if (tiempoTranscurrido > unaHora) {
                    fs.unlinkSync(rutaArchivo);
                    console.log(`🗑️  Archivo temporal eliminado: ${archivo}`);
                }
            });
        } catch (error) {
            console.error('Error limpiando archivos temporales:', error);
            // No lanzar error, solo log
        }
    }
}

