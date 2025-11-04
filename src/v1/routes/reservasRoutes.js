import { Router } from 'express';
import ReservasController from '../../controllers/reservasController.js';
import { verificarToken, requerirRol, ROLES } from '../../middlewares/auth.js';
import {
    validateReservaId,
    validateActualizarReserva,
    validateServicioEnReserva
} from '../../middlewares/validators.js';

const router = Router();
const controller = new ReservasController();

// --- Rutas Persona D---



router.put('/:id',
    verificarToken,
    requerirRol(ROLES.ADMIN), 
    validateReservaId,
    validateActualizarReserva,
    controller.actualizar
);

router.delete('/:id',
    verificarToken,
    requerirRol(ROLES.ADMIN, ROLES.EMPLEADO), 
    validateReservaId,
    controller.eliminar
);

router.post('/:id/servicios',
    verificarToken,
    requerirRol(ROLES.ADMIN, ROLES.EMPLEADO), 
    validateReservaId,
    validateServicioEnReserva,
    controller.agregarServicio
);

router.delete('/:id/servicios',
    verificarToken,
    requerirRol(ROLES.ADMIN, ROLES.EMPLEADO), 
    validateReservaId,
    validateServicioEnReserva,
    controller.quitarServicio
);

export default router;