import express from 'express';
import apicache from 'apicache';
import ServiciosController from '../../controllers/serviciosController.js';
import { validateServicioId, validateCrearServicio, validateActualizarServicio, validateServiciosPaginacion } from '../../middlewares/serviciosValidators.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const serviciosController = new ServiciosController();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/v1/servicios:
 *   get:
 *     tags:
 *       - Servicios
 *     summary: Listar servicios
 *     description: Obtiene un listado paginado de servicios con búsqueda por nombre (público)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por descripción
 *       - in: query
 *         name: activo
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *         description: Filtrar por estado
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [servicio_id, descripcion, importe, creado, modificado]
 *           default: servicio_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Listado de servicios
 */
router.get('/', cache('2 minutes'), validateServiciosPaginacion, serviciosController.buscarTodos);

/**
 * @swagger
 * /api/v1/servicios/{id}:
 *   get:
 *     tags:
 *       - Servicios
 *     summary: Obtener servicio por ID
 *     description: Obtiene los detalles de un servicio específico (público)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del servicio
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', cache('2 minutes'), validateServicioId, serviciosController.buscarPorId);

/**
 * @swagger
 * /api/v1/servicios:
 *   post:
 *     tags:
 *       - Servicios
 *     summary: Crear servicio
 *     description: Crea un nuevo servicio (requiere Admin o Empleado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - importe
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Decoración temática"
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 15000.00
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/', authenticate, authorizeRoles(1, 2), validateCrearServicio, serviciosController.crear);

/**
 * @swagger
 * /api/v1/servicios/{id}:
 *   put:
 *     tags:
 *       - Servicios
 *     summary: Actualizar servicio
 *     description: Actualiza un servicio existente (requiere Admin o Empleado)
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
 *               descripcion:
 *                 type: string
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Servicio no encontrado
 */
router.put('/:id', authenticate, authorizeRoles(1, 2), validateServicioId, validateActualizarServicio, serviciosController.actualizarServicio);

/**
 * @swagger
 * /api/v1/servicios/{id}:
 *   delete:
 *     tags:
 *       - Servicios
 *     summary: Eliminar servicio
 *     description: Elimina un servicio (soft delete) (requiere Admin o Empleado)
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
 *         description: Servicio eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/:id', authenticate, authorizeRoles(1, 2), validateServicioId, serviciosController.eliminarServicio);

export { router };
