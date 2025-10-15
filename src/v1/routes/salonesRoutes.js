import express from 'express';
import SalonesController from '../../controllers/salonesController.js';
import { validateSalonId, validateCrearSalon,validateActualizarSalon, validatePaginacion, validateEliminarSalon } from '../../middlewares/validators.js';

const router = express.Router();
const salonesController = new SalonesController();

router.get('/', validatePaginacion, salonesController.buscarTodos);
router.get('/:id', validateSalonId, salonesController.buscarPorId);
router.post('/', validateCrearSalon, salonesController.crear);
router.put('/:id', validateSalonId,validateActualizarSalon, salonesController.actualizarSalon);
router.delete('/:id', validateEliminarSalon, salonesController.eliminarSalon);

export { router };
