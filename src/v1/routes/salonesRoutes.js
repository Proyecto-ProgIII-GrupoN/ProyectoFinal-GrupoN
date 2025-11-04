
import express from 'express';
import apicache from 'apicache';
import SalonesController from '../../controllers/salonesController.js';
import { validateSalonId, validateCrearSalon,validateActualizarSalon, validatePaginacion, validateEliminarSalon } from '../../middlewares/validators.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';


const router = express.Router();
const salonesController = new SalonesController();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/v1/salones:
 *   get:
 *     tags:
 *       - Salones
 *     summary: Listar salones
 *     description: Obtiene un listado paginado de salones (público)
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
 *         name: activo
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *         description: Filtrar por estado (1=activo, 0=inactivo)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [salon_id, titulo, capacidad, importe, creado, modificado]
 *           default: salon_id
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Listado de salones
 *       400:
 *         description: Error de validación
 */
router.get('/', cache('2 minutes'), validatePaginacion, salonesController.buscarTodos);

/**
 * @swagger
 * /api/v1/salones/{id}:
 *   get:
 *     tags:
 *       - Salones
 *     summary: Obtener salón por ID
 *     description: Obtiene los detalles de un salón específico (público)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Detalles del salón
 *       404:
 *         description: Salón no encontrado
 */
router.get('/:id', cache('2 minutes'), validateSalonId, salonesController.buscarPorId);

/**
 * @swagger
 * /api/v1/salones:
 *   post:
 *     tags:
 *       - Salones
 *     summary: Crear salón
 *     description: Crea un nuevo salón (requiere Admin o Empleado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - direccion
 *               - capacidad
 *               - importe
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Salón Principal"
 *               direccion:
 *                 type: string
 *                 example: "Av. Libertador 123"
 *               latitud:
 *                 type: number
 *                 format: float
 *                 example: -34.603722
 *               longitud:
 *                 type: number
 *                 format: float
 *                 example: -58.381592
 *               capacidad:
 *                 type: integer
 *                 example: 50
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 25000.00
 *     responses:
 *       201:
 *         description: Salón creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (requiere Admin o Empleado)
 */
router.post('/', authenticate, authorizeRoles(1, 2), validateCrearSalon, salonesController.crear);

/**
 * @swagger
 * /api/v1/salones/{id}:
 *   put:
 *     tags:
 *       - Salones
 *     summary: Actualizar salón
 *     description: Actualiza un salón existente (requiere Admin o Empleado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               capacidad:
 *                 type: integer
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salón actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Salón no encontrado
 */
router.put('/:id', authenticate, authorizeRoles(1, 2), validateSalonId, validateActualizarSalon, salonesController.actualizarSalon);

/**
 * @swagger
 * /api/v1/salones/{id}:
 *   delete:
 *     tags:
 *       - Salones
 *     summary: Eliminar salón
 *     description: Elimina un salón (soft delete - marca activo=0) (requiere Admin o Empleado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Salón eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Salón no encontrado
 */
router.delete('/:id', authenticate, authorizeRoles(1, 2), validateEliminarSalon, salonesController.eliminarSalon);

export { router };
