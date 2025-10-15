import { body, param, validationResult } from 'express-validator';
import { pool } from '../db/conexion.js';

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

// middleware pa validar la actualizacion de un salon
export const validateActualizarSalon = [
  // bloquear campos que no se deben tocar
  body('salon_id').not().exists().withMessage('El ID del salón no puede modificarse. Se obtiene de la URL.'),
  body('activo').not().exists().withMessage('El campo activo no puede modificarse directamente. Usá el endpoint de eliminación.'),
  body('creado').not().exists().withMessage('La fecha de creación no puede modificarse.'),
  body('modificado').not().exists().withMessage('La fecha de modificación se actualiza automáticamente.'),
  
  // chequear campos opcionales de texto
  body('titulo')
    .optional()
    .isLength({ min: 3, max: 255 }).withMessage('El título debe tener entre 3 y 255 caracteres.')
    .trim(),
  body('direccion')
    .optional()
    .trim(),
  
  // chequear campos opcionales de numero
  body('importe')
    .optional()
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número mayor o igual a 0.'),
  body('capacidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacidad debe ser un entero mayor o igual a 1.'),
  
  // chequear coordenadas opcionales
  body('latitud')
    .optional()
    .isFloat().withMessage('La latitud debe ser un número decimal válido.'),
  body('longitud')
    .optional()
    .isFloat().withMessage('La longitud debe ser un número decimal válido.'),
  
  // transformar datos antes de mandar
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

// middleware pa validar params de paginacion
export const validatePaginacion = [
  (req, res, next) => {
    const { page, limit, sortBy, sortOrder } = req.query;

    // chequear page
    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          estado: false,
          mensaje: 'El parámetro page debe ser un número entero positivo'
        });
      }
      req.query.page = pageNum;
    }

    // chequear limit
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          estado: false,
          mensaje: 'El parámetro limit debe ser un número entre 1 y 100'
        });
      }
      req.query.limit = limitNum;
    }

    // chequear sortBy
    if (sortBy !== undefined) {
      const allowedFields = ['salon_id', 'titulo', 'importe', 'creado', 'modificado'];
      if (!allowedFields.includes(sortBy)) {
        return res.status(400).json({
          estado: false,
          mensaje: `El parámetro sortBy debe ser uno de: ${allowedFields.join(', ')}`
        });
      }
    }

    // chequear sortOrder
    if (sortOrder !== undefined) {
      const order = sortOrder.toUpperCase();
      if (!['ASC', 'DESC'].includes(order)) {
        return res.status(400).json({
          estado: false,
          mensaje: 'El parámetro sortOrder debe ser ASC o DESC'
        });
      }
      req.query.sortOrder = order;
    }

    next();
  }
];


// middleware pa validar eliminacion de salon
export const validateEliminarSalon = [
  // chequear que el id sea valido
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID del salón tiene que ser un entero positivo.'),
  
  // chequear que no tenga reservas activas
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const [reservas] = await pool.execute(
        'SELECT COUNT(*) as total FROM reservas WHERE salon_id = ? AND fecha_reserva >= CURDATE()',
        [id]
      );
      
      if (reservas[0].total > 0) {
        return res.status(400).json({
          estado: false,
          mensaje: 'No se puede eliminar el salón porque tiene reservas activas'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error al verificar reservas:', error);
      return res.status(500).json({
        estado: false,
        mensaje: 'Error al validar eliminación'
      });
    }
  },
  
  manejarErrores
];

