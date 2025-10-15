import express from 'express';
import SalonesController from '../../controllers/salonesController.js';
import { validateSalonId, validateCrearSalon,validateActualizarSalon, validatePaginacion } from '../../middlewares/validators.js';

const router = express.Router();
const salonesController = new SalonesController();

router.get('/', validatePaginacion, salonesController.buscarTodos);
router.get('/:id', validateSalonId, salonesController.buscarPorId);
router.post('/', validateCrearSalon, salonesController.crear);
router.put('/:id', validateSalonId,validateActualizarSalon, salonesController.actualizarSalon);

export { router };
