import express from 'express';
import SalonesController from '../../controllers/salonesController.js';
import { validateSalonId, validateCrearSalon } from '../../middlewares/validators.js';

const router = express.Router();
const salonesController = new SalonesController();

router.get('/', salonesController.buscarTodos);
router.get('/:id', validateSalonId, salonesController.buscarPorId);
router.post('/', validateCrearSalon, salonesController.crear);

export { router };
