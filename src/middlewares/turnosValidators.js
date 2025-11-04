import { body, param, validationResult } from 'express-validator';

const manejarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ estado: false, errores: errors.array() });
  }
  next();
};

export const validateTurnoId = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del turno debe ser un entero positivo.'),
  manejarErrores
];

export const validateCrearTurno = [
  body('turno_id').not().exists().withMessage('No se permite enviar turno_id.'),
  body('activo').not().exists().withMessage('No se permite enviar activo.'),
  body('orden').exists().withMessage('Falta el orden.').isInt({ gt: 0 }).withMessage('El orden debe ser un entero positivo.'),
  body('hora_desde').exists().withMessage('Falta hora_desde.').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_desde debe estar en formato HH:MM o HH:MM:SS.'),
  body('hora_hasta').exists().withMessage('Falta hora_hasta.').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_hasta debe estar en formato HH:MM o HH:MM:SS.'),
  manejarErrores
];

export const validateActualizarTurno = [
  body('turno_id').not().exists().withMessage('El ID del turno no puede modificarse.'),
  body('activo').not().exists().withMessage('El campo activo no puede modificarse directamente.'),
  body('orden').optional().isInt({ gt: 0 }).withMessage('El orden debe ser un entero positivo.'),
  body('hora_desde').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_desde debe estar en formato HH:MM o HH:MM:SS.'),
  body('hora_hasta').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_hasta debe estar en formato HH:MM o HH:MM:SS.'),
  manejarErrores
];

export const validateTurnosPaginacion = [
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
      const allowedFields = ['turno_id', 'orden', 'hora_desde', 'hora_hasta', 'creado', 'modificado'];
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


