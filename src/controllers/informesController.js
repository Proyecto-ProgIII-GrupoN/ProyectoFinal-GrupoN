import ReservasService from "../services/reservasService.js";
import InformesService from "../services/informesService.js";

const formatosPermitidos = ['pdf', 'csv'];

export default class InformesController {
    constructor() {
        this.reservasService = new ReservasService();
        this.informesService = new InformesService();
    }

    /**
     * Genera un informe de reservas en formato PDF o CSV
     * GET /informes?formato=pdf|csv
     */
    generarInforme = async (req, res) => {
        try {
            const formato = req.query.formato?.toLowerCase();

            // Validar formato
            if (!formato || !formatosPermitidos.includes(formato)) {
                return res.status(400).json({
                    estado: false,
                    mensaje: `Formato inválido. Formatos permitidos: ${formatosPermitidos.join(', ')}`
                });
            }

            // Obtener datos de reservas
            const datosReporte = await this.reservasService.obtenerDatosReporte();

            // Validar que hay datos
            if (!datosReporte || datosReporte.length === 0) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'No hay reservas para generar el informe'
                });
            }

            // Generar informe según el formato
            if (formato === 'pdf') {
                const buffer = await this.informesService.informeReservasPdf(datosReporte);
                
                // Generar nombre de archivo con fecha
                const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const nombreArchivo = `reservas_${fecha}.pdf`;

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="${nombreArchivo}"`,
                    'Content-Length': buffer.length
                });

                return res.status(200).end(buffer);

            } else if (formato === 'csv') {
                const rutaArchivo = await this.informesService.informeReservasCsv(datosReporte);
                
                // Generar nombre de archivo con fecha
                const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const nombreArchivo = `reservas_${fecha}.csv`;

                res.set({
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${nombreArchivo}"`
                });

                return res.status(200).download(rutaArchivo, nombreArchivo, (err) => {
                    if (err) {
                        console.error('Error descargando CSV:', err);
                        if (!res.headersSent) {
                            return res.status(500).json({
                                estado: false,
                                mensaje: 'Error al descargar el archivo CSV'
                            });
                        }
                    }
                    // Limpiar archivos temporales después de enviar
                    this.informesService.limpiarArchivosTemporales().catch(console.error);
                });
            }

        } catch (error) {
            console.error('Error generando informe:', error);
            
            return res.status(500).json({
                estado: false,
                mensaje: `Error interno del servidor: ${error.message}`
            });
        }
    }
}

