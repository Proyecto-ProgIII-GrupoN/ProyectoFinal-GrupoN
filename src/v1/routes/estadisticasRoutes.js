import express from 'express';
import EstadisticasController from '../../controllers/estadisticasController.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const estadisticasController = new EstadisticasController();

/**
 * @swagger
 * /api/v1/estadisticas:
 *   get:
 *     tags:
 *       - Estadísticas
 *     summary: Obtener estadísticas del sistema
 *     description: |
 *       Obtiene estadísticas del sistema usando stored procedures.
 *       Solo disponible para administradores.
 *       Tipos disponibles:
 *       - `general` o `generales`: Estadísticas generales (total reservas, ingresos, promedios)
 *       - `salon` o `salones`: Estadísticas agrupadas por salón
 *       - `periodo` o `periodos`: Estadísticas agrupadas por mes/año
 *       - `servicio` o `servicios`: Estadísticas de servicios más contratados
 *       - `cliente` o `clientes`: Estadísticas de clientes más frecuentes
 *       - `todas` o `all`: Retorna todas las estadísticas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [general, generales, salon, salones, periodo, periodos, servicio, servicios, cliente, clientes, todas, all]
 *         description: Tipo de estadística a obtener. Si no se especifica, retorna todas.
 *         example: general
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Estadísticas obtenidas exitosamente
 *                 tipo:
 *                   type: string
 *                   example: general
 *                 datos:
 *                   type: object
 *                   description: Datos de las estadísticas según el tipo solicitado
 *       400:
 *         description: Tipo de estadística no válido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo administradores)
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/',
    authenticate,
    authorizeRoles([1]), // Solo administradores
    estadisticasController.obtener
);

export default router;

