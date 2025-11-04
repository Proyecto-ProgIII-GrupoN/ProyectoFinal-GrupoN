import express from 'express';
import apicache from 'apicache';
import UsuariosController from '../../controllers/usuariosController.js';
import { validateUsuarioId, validateCrearUsuario, validateActualizarUsuario, validateUsuariosPaginacion } from '../../middlewares/usuariosValidators.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const usuariosController = new UsuariosController();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/v1/usuarios/clientes:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Listar clientes
 *     description: |
 *       Obtiene un listado paginado de clientes (tipo_usuario = 3).
 *       - Requiere Admin o Empleado
 *       - Para cumplir TP: Empleado puede listar clientes
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
 *         name: activo
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, creado, modificado]
 *           default: usuario_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Listado de clientes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get('/clientes', authenticate, authorizeRoles(1, 2), cache('2 minutes'), validateUsuariosPaginacion, (req, res, next) => {
    req.query.tipo_usuario = 3; // Filtrar solo clientes
    next();
}, usuariosController.buscarTodos);

/**
 * @swagger
 * /api/v1/usuarios:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Listar usuarios
 *     description: Obtiene un listado paginado de todos los usuarios (requiere Admin)
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
 *         name: activo
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *       - in: query
 *         name: tipo_usuario
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: Filtrar por tipo (1=Admin, 2=Empleado, 3=Cliente)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, creado, modificado]
 *           default: usuario_id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Listado de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin)
 */
router.get('/', authenticate, authorizeRoles(1), cache('2 minutes'), validateUsuariosPaginacion, usuariosController.buscarTodos);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuario por ID
 *     description: Obtiene los detalles de un usuario específico (requiere Admin)
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
 *         description: Detalles del usuario (sin contraseña)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin)
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', authenticate, authorizeRoles(1), cache('2 minutes'), validateUsuarioId, usuariosController.buscarPorId);

/**
 * @swagger
 * /api/v1/usuarios:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear usuario
 *     description: Crea un nuevo usuario (requiere Admin). La contraseña se hashea automáticamente con bcrypt.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *               - tipo_usuario
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *                 example: "juanperez@correo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "password123"
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 example: 3
 *                 description: 1=Admin, 2=Empleado, 3=Cliente
 *               celular:
 *                 type: string
 *                 example: "1234567890"
 *               foto:
 *                 type: string
 *                 format: uri
 *                 example: "https://ejemplo.com/foto.jpg"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación o email duplicado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin)
 */
router.post('/', authenticate, authorizeRoles(1), validateCrearUsuario, usuariosController.crear);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar usuario
 *     description: Actualiza un usuario existente (requiere Admin). Si se actualiza la contraseña, se hashea con bcrypt.
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
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *               contrasenia:
 *                 type: string
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *               celular:
 *                 type: string
 *               foto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin)
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', authenticate, authorizeRoles(1), validateUsuarioId, validateActualizarUsuario, usuariosController.actualizarUsuario);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario
 *     description: Elimina un usuario (soft delete - marca activo=0) (requiere Admin)
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
 *         description: Usuario eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo Admin)
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authenticate, authorizeRoles(1), validateUsuarioId, usuariosController.eliminarUsuario);

export { router };

