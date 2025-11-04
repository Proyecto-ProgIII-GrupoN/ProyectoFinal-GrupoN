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

//----- VALIDACIONES PARA SERVICIOS -----
export const validateServicioId = [
    param('id')
        .exists().withMessage('Falta el id del servicio')
        .isInt({ gt: 0 }).withMessage('El id tiene que ser un número entero positivo'),
];

export const validateCrearServicio = [
    body('descripcion')
        .exists({ checkFalsy: true }).withMessage('Falta la descripcion del servicio')
        .isLength({ min: 3, max: 255 }).withMessage('La descripcion debe tener entre 3 y 255 caracteres')
        .trim(),

    body('importe')
        .exists().withMessage('Falta el importe del servicio')
        .isFloat({ gt: 0 }).withMessage('El importe debe ser un número mayor a 0'),
]

export const validateActualizarServicio = [
    param('id')
        .exists().withMessage('Falta el id del servicio')
        .isInt({ gt: 0 }).withMessage('El id tiene que ser un número entero positivo'),

    body('descripcion')
        .exists({ checkFalsy: true }).withMessage('Falta la descripcion del servicio')
        .isLength({ min: 3, max: 255 }).withMessage('La descripcion debe tener entre 3 y 255 caracteres')
        .trim(),

    body('importe')
        .exists().withMessage('Falta el importe del servicio')
        .isFloat({ gt: 0 }).withMessage('El importe debe ser un número mayor a 0'),
]

export const ensureSalonExisteActivo = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del salón tiene que ser un entero positivo.'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute(
                'SELECT salon_id FROM salones WHERE salon_id = ? AND activo = 1',
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Salón no encontrado o inactivo'
                });
            }
            next();
        } catch (err) {
            console.error('Error ensureSalonExisteActivo:', err);
            res.status(500).json({ estado: false, mensaje: 'Error al validar el salón' });
        }
    }
];

export const ensureSalonUnicoAlCrear = async (req, res, next) => {
    try {
        const { titulo, direccion } = req.body;
        const [dup] = await pool.execute(
            'SELECT 1 FROM salones WHERE LOWER(titulo)=LOWER(?) AND LOWER(direccion)=LOWER(?) LIMIT 1',
            [titulo, direccion]
        );
        if (dup.length) {
            return res.status(409).json({
                estado: false,
                mensaje: 'Ya existe un salón con ese título y dirección'
            });
        }
        next();
    } catch (err) {
        console.error('Error ensureSalonUnicoAlCrear:', err);
        res.status(500).json({ estado: false, mensaje: 'Error al validar unicidad' });
    }
};

export const ensureSalonUnicoAlActualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { titulo, direccion } = req.body;

        const [actualRows] = await pool.execute(
            'SELECT titulo, direccion FROM salones WHERE salon_id = ?',
            [id]
        );
        if (!actualRows.length) {
            return res.status(404).json({ estado: false, mensaje: 'Salón no encontrado' });
        }

        const t = (titulo ?? actualRows[0].titulo);
        const d = (direccion ?? actualRows[0].direccion);

        const [dup] = await pool.execute(
            'SELECT 1 FROM salones WHERE LOWER(titulo)=LOWER(?) AND LOWER(direccion)=LOWER(?) AND salon_id <> ? LIMIT 1',
            [t, d, id]
        );
        if (dup.length) {
            return res.status(409).json({
                estado: false,
                mensaje: 'Ya existe otro salón con ese título y dirección'
            });
        }
        next();
    } catch (err) {
        console.error('Error ensureSalonUnicoAlActualizar:', err);
        res.status(500).json({ estado: false, mensaje: 'Error al validar unicidad' });
    }
};

export const aplicarDefaultsLista = (req, _res, next) => {
    if (req.query.page === undefined) req.query.page = 1;
    if (req.query.limit === undefined) req.query.limit = 10;
    if (!req.query.sortBy) req.query.sortBy = 'salon_id';
    if (!req.query.sortOrder) req.query.sortOrder = 'ASC';
    if (req.query.q) req.query.q = String(req.query.q).trim().slice(0, 100);
    next();
};

export const requireRole = (roles = []) => (req, res, next) => {
    const tipo = req.user?.tipo_usuario; // ej: 'admin' | 'empleado' | 'cliente'
    if (!tipo || !roles.includes(tipo)) {
        return res.status(403).json({ estado: false, mensaje: 'No autorizado' });
    }
    next();
};


export const validateReservaId = [
    param('id')
        .isInt({ gt: 0 })
        .withMessage('El ID de la reserva debe ser un número entero positivo.'),
    manejarErrores
];

export const validateActualizarReserva = [
    body('tematica')
        .optional()
        .isString().withMessage('La temática debe ser texto.')
        .isLength({ min: 3, max: 255 }).withMessage('La temática debe tener entre 3 y 255 caracteres.')
        .trim(),
    body('foto_cumpleaniero')
        .optional({ nullable: true }) 
        .isURL().withMessage('La foto debe ser una URL válida.')
        .trim(),
    body('importe_salon')
        .optional()
        .isFloat({ min: 0 }).withMessage('El importe del salón debe ser un número positivo.'),
    body('reserva_id').not().exists().withMessage('No se puede modificar el ID.'),
    body('usuario_id').not().exists().withMessage('No se puede cambiar el propietario de la reserva.'),
    body('importe_total').not().exists().withMessage('El importe total se calcula automáticamente.'),
    manejarErrores
];

export const validateServicioEnReserva = [
    body('servicio_id')
        .exists({ checkFalsy: true }).withMessage('Falta el servicio_id.')
        .isInt({ gt: 0 }).withMessage('El servicio_id debe ser un número entero positivo.'),
    manejarErrores
];