import { body, param, validationResult } from 'express-validator';

const manejarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ estado: false, errores: errors.array() });
  }
  next();
};

export const validateReservaId = [
  param('id').isInt({ gt: 0 }).withMessage('El ID de la reserva debe ser un entero positivo.'),
  manejarErrores
];

export const validateCrearReserva = [
  body('reserva_id').not().exists().withMessage('No se permite enviar reserva_id.'),
  body('activo').not().exists().withMessage('No se permite enviar activo.'),
  body('usuario_id').not().exists().withMessage('El usuario_id se obtiene del token de autenticación.'),
  body('creado').not().exists().withMessage('La fecha de creación se asigna automáticamente.'),
  body('modificado').not().exists().withMessage('La fecha de modificación se actualiza automáticamente.'),
  body('fecha_reserva')
    .exists()
    .withMessage('La fecha de reserva es requerida.')
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD).')
    .toDate(),
  body('salon_id')
    .exists()
    .withMessage('El salón es requerido.')
    .isInt({ gt: 0 })
    .withMessage('El salón debe ser un ID válido.'),
  body('turno_id')
    .exists()
    .withMessage('El turno es requerido.')
    .isInt({ gt: 0 })
    .withMessage('El turno debe ser un ID válido.'),
  body('foto_cumpleaniero')
    .optional()
    .isString()
    .withMessage('La foto debe ser una cadena de texto.'),
  body('tematica')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La temática no puede superar 255 caracteres.'),
  body('servicios')
    .optional()
    .isArray()
    .withMessage('Los servicios deben ser un array.'),
  body('servicios.*.servicio_id')
    .if(body('servicios').isArray())
    .isInt({ gt: 0 })
    .withMessage('Cada servicio debe tener un servicio_id válido.'),
  body('servicios.*.importe')
    .if(body('servicios').isArray())
    .isFloat({ min: 0 })
    .withMessage('El importe de cada servicio debe ser un número mayor o igual a 0.'),
  manejarErrores
];

export const validateActualizarReserva = [
  body('reserva_id').not().exists().withMessage('El ID de la reserva no puede modificarse. Se obtiene de la URL.'),
  body('activo').not().exists().withMessage('El campo activo no puede modificarse directamente.'),
  body('usuario_id').not().exists().withMessage('El usuario_id no puede modificarse.'),
  body('creado').not().exists().withMessage('La fecha de creación no puede modificarse.'),
  body('modificado').not().exists().withMessage('La fecha de modificación se actualiza automáticamente.'),
  body('fecha_reserva')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD).')
    .toDate(),
  body('salon_id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El salón debe ser un ID válido.'),
  body('turno_id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El turno debe ser un ID válido.'),
  body('foto_cumpleaniero')
    .optional()
    .isString()
    .withMessage('La foto debe ser una cadena de texto.'),
  body('tematica')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La temática no puede superar 255 caracteres.'),
  body('servicios')
    .optional()
    .isArray()
    .withMessage('Los servicios deben ser un array.'),
  body('servicios.*.servicio_id')
    .if(body('servicios').isArray())
    .isInt({ gt: 0 })
    .withMessage('Cada servicio debe tener un servicio_id válido.'),
  body('servicios.*.importe')
    .if(body('servicios').isArray())
    .isFloat({ min: 0 })
    .withMessage('El importe de cada servicio debe ser un número mayor o igual a 0.'),
  manejarErrores
];

export const validateReservasPaginacion = [
  (req, res, next) => {
    const { page, limit, sortBy, sortOrder } = req.query;

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
      const allowedFields = ['reserva_id', 'fecha_reserva', 'importe_total', 'creado', 'modificado'];
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

    next();
  }
];

export { body, param };

