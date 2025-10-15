import { body, param, validationResult } from 'express-validator';

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

export const validateSalonId = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID del salón tiene que ser un entero positivo.'),
  manejarErrores
];

export const validateCrearSalon = [
  body('salon_id').not().exists().withMessage('No se permite enviar salon_id.'),
  body('activo').not().exists().withMessage('No se permite enviar activo.'),
  body('titulo')
    .exists({ checkFalsy: true }).withMessage('Falta el título.')
    .isLength({ min: 3, max: 255 }).withMessage('El título debe tener entre 3 y 255 caracteres.')
    .trim(),
  body('direccion')
    .exists({ checkFalsy: true }).withMessage('Falta la dirección.')
    .trim(),
  body('importe')
    .exists().withMessage('Falta el importe.')
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número mayor o igual a 0.'),
  body('capacidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacidad, si la enviás, debe ser un entero mayor o igual a 1.'),
  (req, _res, next) => {
    if (req.body.titulo) {
      const t = req.body.titulo.trim();
      req.body.titulo = t.charAt(0).toUpperCase() + t.slice(1);
    }
    if (req.body.direccion) {
      req.body.direccion = req.body.direccion.trim();
    }
    next();
  },
  manejarErrores
];

// Middleware para validar la actualizacion de un salon
export const validateActualizarSalon = [
  // Bloquear campos que no deben actualizarse
  body('salon_id').not().exists().withMessage('El ID del salón no puede modificarse. Se obtiene de la URL.'),
  body('activo').not().exists().withMessage('El campo activo no puede modificarse directamente. Usá el endpoint de eliminación.'),
  body('creado').not().exists().withMessage('La fecha de creación no puede modificarse.'),
  body('modificado').not().exists().withMessage('La fecha de modificación se actualiza automáticamente.'),
  
  // Validar campos opcionales de tipo text
  body('titulo')
    .optional()
    .isLength({ min: 3, max: 255 }).withMessage('El título debe tener entre 3 y 255 caracteres.')
    .trim(),
  body('direccion')
    .optional()
    .trim(),
  
  // Validar campos opcionales de tipo numerico
  body('importe')
    .optional()
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número mayor o igual a 0.'),
  body('capacidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacidad debe ser un entero mayor o igual a 1.'),
  
  // Validar coordenadas opcionales
  body('latitud')
    .optional()
    .isFloat().withMessage('La latitud debe ser un número decimal válido.'),
  body('longitud')
    .optional()
    .isFloat().withMessage('La longitud debe ser un número decimal válido.'),
  
  // Transformar datos antes de enviar
  (req, _res, next) => {
    if (req.body.titulo) {
      const t = req.body.titulo.trim();
      req.body.titulo = t.charAt(0).toUpperCase() + t.slice(1);
    }
    if (req.body.direccion) {
      req.body.direccion = req.body.direccion.trim();
    }
    next();
  },
  
  manejarErrores
];


export { body, param };
