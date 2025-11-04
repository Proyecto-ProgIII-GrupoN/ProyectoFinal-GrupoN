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

export const validateServicioId = [
    param('id')
        .isInt({ gt: 0 })
        .withMessage('El ID del servicio debe ser un entero positivo.'),
    manejarErrores
];

export const validateCrearServicio = [
    body('servicio_id').not().exists().withMessage('No se permite enviar servicio_id.'),
    body('activo').not().exists().withMessage('No se permite enviar activo.'),
    body('descripcion')
        .exists({ checkFalsy: true }).withMessage('Falta la descripción.')
        .isLength({ min: 3, max: 255 }).withMessage('La descripción debe tener entre 3 y 255 caracteres.')
        .trim(),
    body('importe')
        .exists().withMessage('Falta el importe.')
        .isFloat({ min: 0 }).withMessage('El importe debe ser un número mayor o igual a 0.'),
    manejarErrores
];

export const validateActualizarServicio = [
    body('servicio_id').not().exists().withMessage('El ID del servicio no puede modificarse.'),
    body('activo').not().exists().withMessage('El campo activo no puede modificarse directamente.'),
    body('descripcion')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('La descripción debe tener entre 3 y 255 caracteres.')
        .trim(),
    body('importe')
        .optional()
        .isFloat({ min: 0 }).withMessage('El importe debe ser un número mayor o igual a 0.'),
    manejarErrores
];

export { body, param };

// validación de paginación/orden y saneo de q para servicios
export const validateServiciosPaginacion = [
    (req, res, next) => {
        const { page, limit, sortBy, sortOrder, q } = req.query;

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
            const allowedFields = ['servicio_id', 'descripcion', 'importe', 'creado', 'modificado'];
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

        if (q !== undefined) {
            const text = String(q).trim();
            if (text.length > 255) {
                return res.status(400).json({ estado: false, mensaje: 'El parámetro q no puede superar 255 caracteres' });
            }
            req.query.q = text;
        }

        next();
    }
];