import express from 'express';
import passport from 'passport';
import SalonesController from '../../controllers/salonesController.js';
import {
  validateSalonId,
  validateCrearSalon,
  validateActualizarSalon,
  validatePaginacion,
  validateEliminarSalon
} from '../../middlewares/validators.js';
import { requireRole } from '../../middlewares/requireRole.js';

const router = express.Router();
const salonesController = new SalonesController();

router.get('/', validatePaginacion, salonesController.buscarTodos);
router.get('/:id', validateSalonId, salonesController.buscarPorId);

router.post('/',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin', 'empleado']),
  validateCrearSalon,
  salonesController.crear
);

router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin', 'empleado']),
  validateSalonId,
  validateActualizarSalon,
  salonesController.actualizarSalon
);

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin']), 
  validateEliminarSalon,
  salonesController.eliminarSalon
);

export { router };
