import express from 'express';
import apicache from 'apicache';
import TurnosController from '../../controllers/turnosController.js';
import { validateTurnoId, validateCrearTurno, validateActualizarTurno, validateTurnosPaginacion } from '../../middlewares/turnosValidators.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const turnosController = new TurnosController();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/v1/turnos:
 *   get:
 *     tags:
 *       - Turnos
 *     summary: Listar turnos
 *     description: Obtiene un listado paginado de turnos (público)
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
 *         name: activo
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [turno_id, orden, hora_desde, hora_hasta, creado, modificado]
 *           default: turno_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Listado de turnos
 */
router.get('/', cache('2 minutes'), validateTurnosPaginacion, turnosController.buscarTodos);

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   get:
 *     tags:
 *       - Turnos
 *     summary: Obtener turno por ID
 *     description: Obtiene los detalles de un turno específico (público)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del turno
 *       404:
 *         description: Turno no encontrado
 */
router.get('/:id', cache('2 minutes'), validateTurnoId, turnosController.buscarPorId);

/**
 * @swagger
 * /api/v1/turnos:
 *   post:
 *     tags:
 *       - Turnos
 *     summary: Crear turno
 *     description: Crea un nuevo turno (requiere Admin o Empleado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orden
 *               - hora_desde
 *               - hora_hasta
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 1
 *               hora_desde:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *                 description: Formato HH:MM o HH:MM:SS
 *               hora_hasta:
 *                 type: string
 *                 format: time
 *                 example: "13:00:00"
 *                 description: Formato HH:MM o HH:MM:SS
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/', authenticate, authorizeRoles(1, 2), validateCrearTurno, turnosController.crear);

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   put:
 *     tags:
 *       - Turnos
 *     summary: Actualizar turno
 *     description: Actualiza un turno existente (requiere Admin o Empleado)
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
 *               orden:
 *                 type: integer
 *               hora_desde:
 *                 type: string
 *                 format: time
 *                 description: Formato HH:MM o HH:MM:SS
 *               hora_hasta:
 *                 type: string
 *                 format: time
 *                 description: Formato HH:MM o HH:MM:SS
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Turno no encontrado
 */
router.put('/:id', authenticate, authorizeRoles(1, 2), validateTurnoId, validateActualizarTurno, turnosController.actualizarTurno);

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   delete:
 *     tags:
 *       - Turnos
 *     summary: Eliminar turno
 *     description: Elimina un turno (soft delete) (requiere Admin o Empleado)
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
 *         description: Turno eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Turno no encontrado
 */
router.delete('/:id', authenticate, authorizeRoles(1, 2), validateTurnoId, turnosController.eliminarTurno);

export { router };


