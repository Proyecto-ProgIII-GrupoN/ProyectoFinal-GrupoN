import { param, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
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
        .withMessage('El ID del salón debe ser un número entero positivo.'),

    handleValidationErrors
];