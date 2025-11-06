import express from 'express';
import InformesController from '../../controllers/informesController.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const informesController = new InformesController();

/**
 * @swagger
 * /api/v1/informes:
 *   get:
 *     tags:
 *       - Informes
 *     summary: Generar informe de reservas en PDF o CSV
 *     description: |
 *       Genera un informe completo de todas las reservas activas.
 *       El informe incluye:
 *       - Datos de la reserva (fecha, temática)
 *       - Información del cliente (nombre, email, teléfono)
 *       - Información del salón (título, dirección)
 *       - Información del turno (horario, orden)
 *       - Servicios contratados con sus importes
 *       - Importes totales (salón + servicios)
 *       
 *       Solo disponible para administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formato
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, csv]
 *         description: Formato del informe a generar
 *         example: pdf
 *     responses:
 *       200:
 *         description: Informe generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *             description: Archivo PDF con el informe de reservas
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *             description: Archivo CSV con el informe de reservas
 *       400:
 *         description: Formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                   example: false
 *                 mensaje:
 *                   type: string
 *                   example: Formato inválido. Formatos permitidos: pdf, csv
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo administradores)
 *       404:
 *         description: No hay reservas para generar el informe
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/',
    authenticate,
    authorizeRoles([1]), // Solo administradores
    informesController.generarInforme
);

export default router;

