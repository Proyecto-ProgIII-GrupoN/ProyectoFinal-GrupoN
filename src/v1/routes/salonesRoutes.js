import express from "express";
import SalonesController from "../../controllers/salonesController.js";
import { validateSalonId } from "../../middlewares/validators.js";

const salonesController = new SalonesController();
const router = express.Router();

router.get('/', salonesController.buscarTodos);

router.get('/:id', validateSalonId, salonesController.buscarPorId);

export { router };