import { body, param, validationResult } from 'express-validator';

const manejarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ estado: false, errores: errors.array() });
  }
  next();
};

export const validateUsuarioId = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del usuario debe ser un entero positivo.'),
  manejarErrores
];

export const validateCrearUsuario = [
  body('usuario_id').not().exists().withMessage('No se permite enviar usuario_id.'),
  body('activo').not().exists().withMessage('No se permite enviar activo.'),
  body('creado').not().exists().withMessage('La fecha de creación se asigna automáticamente.'),
  body('modificado').not().exists().withMessage('La fecha de modificación se actualiza automáticamente.'),
  body('nombre')
    .exists({ checkFalsy: true })
    .withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres.')
    .trim(),
  body('apellido')
    .exists({ checkFalsy: true })
    .withMessage('El apellido es requerido.')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres.')
    .trim(),
  body('nombre_usuario')
    .exists({ checkFalsy: true })
    .withMessage('El nombre de usuario (email) es requerido.')
    .isEmail()
    .withMessage('El nombre de usuario debe ser un email válido.')
    .trim(),
  body('contrasenia')
    .exists({ checkFalsy: true })
    .withMessage('La contraseña es requerida.')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('tipo_usuario')
    .exists()
    .withMessage('El tipo de usuario es requerido.')
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente).'),
  body('celular')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El celular no puede superar 20 caracteres.')
    .trim(),
  body('foto')
    .optional()
    .isString()
    .withMessage('La foto debe ser una cadena de texto (URL).')
    .trim(),
  manejarErrores
];

export const validateActualizarUsuario = [
  body('usuario_id').not().exists().withMessage('El ID del usuario no puede modificarse. Se obtiene de la URL.'),
  body('activo').not().exists().withMessage('El campo activo no puede modificarse directamente.'),
  body('creado').not().exists().withMessage('La fecha de creación no puede modificarse.'),
  body('modificado').not().exists().withMessage('La fecha de modificación se actualiza automáticamente.'),
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres.')
    .trim(),
  body('apellido')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres.')
    .trim(),
  body('nombre_usuario')
    .optional()
    .isEmail()
    .withMessage('El nombre de usuario debe ser un email válido.')
    .trim(),
  body('contrasenia')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('tipo_usuario')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente).'),
  body('celular')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El celular no puede superar 20 caracteres.')
    .trim(),
  body('foto')
    .optional()
    .isString()
    .withMessage('La foto debe ser una cadena de texto (URL).')
    .trim(),
  manejarErrores
];

export const validateUsuariosPaginacion = [
  (req, res, next) => {
    const { page, limit, sortBy, sortOrder, tipo_usuario } = req.query;

    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ estado: false, mensaje: 'El parámetro page debe ser un entero positivo' });
      }
      req.query.page = pageNum;
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ estado: false, mensaje: 'El parámetro limit debe ser un número entre 1 y 100' });
      }
      req.query.limit = limitNum;
    }

    if (sortBy !== undefined) {
      const allowedFields = ['usuario_id', 'nombre', 'apellido', 'nombre_usuario', 'tipo_usuario', 'creado', 'modificado'];
      if (!allowedFields.includes(sortBy)) {
        return res.status(400).json({ estado: false, mensaje: `El parámetro sortBy debe ser uno de: ${allowedFields.join(', ')}` });
      }
    }

    if (sortOrder !== undefined) {
      const order = String(sortOrder).toUpperCase();
      if (!['ASC', 'DESC'].includes(order)) {
        return res.status(400).json({ estado: false, mensaje: 'El parámetro sortOrder debe ser ASC o DESC' });
      }
      req.query.sortOrder = order;
    }

    if (tipo_usuario !== undefined) {
      const tipoNum = parseInt(tipo_usuario);
      if (isNaN(tipoNum) || ![1, 2, 3].includes(tipoNum)) {
        return res.status(400).json({ estado: false, mensaje: 'El parámetro tipo_usuario debe ser 1, 2 o 3' });
      }
      req.query.tipo_usuario = tipoNum;
    }

    next();
  }
];

export { body, param };

