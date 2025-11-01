import express from 'express';
import ServiciosController from '../../controllers/serviciosController.js';
import { validateServicioId, validateActualizarServicio, validateCrearServicio } from '../../middlewares/validators.js';
import { verificarToken, requerirRol, ROLES } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';

const router = express.Router();
const serviciosController = new ServiciosController();

//despues añadir verifyToken y requireRole() en los PUT/POST/DELETE. 

router.use(verificarToken, requerirRol(ROLES.ADMIN, ROLES.EMPLEADO));

router.get('/', serviciosController.mostrarServicios);
router.get('/:id', validateServicioId, serviciosController.obtenerServicioPorId);

router.post('/', validateCrearServicio, serviciosController.crearServicio);

router.put('/:id', validateActualizarServicio, serviciosController.actualizarServicio);

router.delete('/:id', validateServicioId, serviciosController.eliminarServicio);

export default router;


