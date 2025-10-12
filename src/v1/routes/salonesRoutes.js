import express from "express";
import SalonesController from "../../controllers/salonesController.js";

const salonesController = new SalonesController();
const router = express.Router();

router.get('/', salonesController.buscarTodos);

export { router };