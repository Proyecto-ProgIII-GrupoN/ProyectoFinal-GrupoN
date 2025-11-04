import express from 'express';
import apicache from 'apicache';
import ReservasController from '../../controllers/reservasController.js';
import { validateReservaId, validateCrearReserva, validateActualizarReserva, validateReservasPaginacion } from '../../middlewares/reservasValidators.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const reservasController = new ReservasController();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/v1/reservas:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Listar reservas
 *     description: |
 *       Obtiene un listado paginado de reservas.
 *       - Cliente: Solo ve sus propias reservas
 *       - Empleado/Admin: Ven todas las reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde fecha (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta fecha (YYYY-MM-DD)
 *       - in: query
 *         name: salon_id
 *         schema:
 *           type: integer
 *         description: Filtrar por salón
 *       - in: query
 *         name: activo
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *     responses:
 *       200:
 *         description: Listado de reservas
 *       401:
 *         description: No autenticado
 */
router.get('/', authenticate, cache('2 minutes'), validateReservasPaginacion, reservasController.buscarTodos);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener reserva por ID
 *     description: |
 *       Obtiene los detalles de una reserva específica.
 *       - Cliente: Solo puede ver sus propias reservas
 *       - Empleado/Admin: Pueden ver cualquier reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la reserva
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (Cliente intentando ver reserva ajena)
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/:id', authenticate, cache('2 minutes'), validateReservaId, reservasController.buscarPorId);

/**
 * @swagger
 * /api/v1/reservas:
 *   post:
 *     tags:
 *       - Reservas
 *     summary: Crear reserva
 *     description: Crea una nueva reserva (requiere Cliente o Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_reserva
 *               - salon_id
 *               - turno_id
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-15"
 *                 description: Fecha de la reserva (YYYY-MM-DD)
 *               salon_id:
 *                 type: integer
 *                 example: 1
 *               turno_id:
 *                 type: integer
 *                 example: 2
 *               tematica:
 *                 type: string
 *                 example: "Superhéroes"
 *               foto_cumpleaniero:
 *                 type: string
 *                 format: uri
 *                 example: "https://ejemplo.com/foto.jpg"
 *               servicios:
 *                 type: array
 *                 description: Array opcional de servicios a incluir
 *                 items:
 *                   type: object
 *                   required:
 *                     - servicio_id
 *                     - importe
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                       example: 1
 *                     importe:
 *                       type: number
 *                       format: float
 *                       example: 15000.00
 *           examples:
 *             reservaSimple:
 *               summary: Reserva solo con salón
 *               value:
 *                 fecha_reserva: "2025-11-15"
 *                 salon_id: 1
 *                 turno_id: 2
 *             reservaConServicios:
 *               summary: Reserva con servicios
 *               value:
 *                 fecha_reserva: "2025-11-15"
 *                 salon_id: 1
 *                 turno_id: 2
 *                 tematica: "Superhéroes"
 *                 servicios:
 *                   - servicio_id: 1
 *                     importe: 15000.00
 *                   - servicio_id: 2
 *                     importe: 25000.00
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Error de validación o conflicto (salón ocupado)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/', authenticate, authorizeRoles(1, 3), validateCrearReserva, reservasController.crear);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   put:
 *     tags:
 *       - Reservas
 *     summary: Actualizar reserva
 *     description: |
 *       Actualiza una reserva existente.
 *       ⚠️ **REGLА DEL TP: Solo Administrador puede modificar reservas**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *               salon_id:
 *                 type: integer
 *               turno_id:
 *                 type: integer
 *               tematica:
 *                 type: string
 *               foto_cumpleaniero:
 *                 type: string
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                     importe:
 *                       type: number
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin puede modificar)
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id', authenticate, authorizeRoles(1), validateReservaId, validateActualizarReserva, reservasController.actualizarReserva);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   delete:
 *     tags:
 *       - Reservas
 *     summary: Eliminar reserva
 *     description: Elimina una reserva (soft delete - marca activo=0) (requiere Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin)
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/:id', authenticate, authorizeRoles(1), validateReservaId, reservasController.eliminarReserva);

export { router };

