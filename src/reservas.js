import express from 'express';
import passport from 'passport';
import './auth/passport.js';
import v1SalonesRoutes from './v1/routes/salonesRoutes.js';
import v1ServiciosRoutes from './v1/routes/serviciosRoutes.js';
import { router as v1AuthRoutes } from './v1/routes/authRoutes.js';
import v1ReservasRoutes from './v1/routes/reservasRoutes.js';


const app = express();
app.use(express.json());

app.get('/estado', (_req, res) => {
    res.json({ ok: true });
});

app.use(passport.initialize());
app.use('/api/v1/auth', v1AuthRoutes);
app.use('/api/v1/salones', v1SalonesRoutes);
app.use('/api/v1/servicios', v1ServiciosRoutes);
app.use('/api/v1/reservas', v1ReservasRoutes);


export default app;