import express from 'express';
import { body, validationResult } from 'express-validator';
import AuthController from '../../controllers/authController.js';

const router = express.Router();
const authController = new AuthController();

const manejarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      estado: false,
      errores: errors.array()
    });
  }
  next();
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Login Admin
 *               value:
 *                 nombre_usuario: admisalones@gmail.com
 *                 contrasenia: admi123*
 *             empleado:
 *               summary: Login Empleado
 *               value:
 *                 nombre_usuario: empeadoreservas@gmail.com
 *                 contrasenia: emp123***
 *             cliente:
 *               summary: Login Cliente
 *               value:
 *                 nombre_usuario: clientereservas@outlook.com
 *                 contrasenia: cli123***
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', 
  [
    body('nombre_usuario')
      .notEmpty()
      .withMessage('El nombre de usuario es requerido')
      .isEmail()
      .withMessage('El nombre de usuario debe ser un email válido'),
    body('contrasenia')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    manejarErrores
  ],
  authController.login
);

export { router };


