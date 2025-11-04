import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import AuthController from '../../controllers/authController.js';

const router = express.Router();

const controller = new AuthController();

router.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      nombre_usuario: req.user.nombre_usuario,
      rol: req.user.tipo_usuario
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    res.json({ estado: true, token, usuario: payload });
  }
);

router.post('/register', controller.register);

export { router };