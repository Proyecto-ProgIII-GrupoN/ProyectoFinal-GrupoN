import express from 'express';
import passport from 'passport';
import './auth/passport.js';
import { router as v1SalonesRoutes } from './v1/routes/salonesRoutes.js';
import { router as v1ServiciosRoutes } from './v1/routes/serviciosRoutes.js';
import { router as v1AuthRoutes } from './v1/routes/authRoutes.js';

const app = express();
app.use(express.json());

app.get('/estado', (_req, res) => {
    res.json({ ok: true });
});
app.get('/estado', (_req, res) => res.json({ ok: true }));

app.use(passport.initialize());
app.use('/api/v1/auth', v1AuthRoutes);
app.use('/api/v1/salones', v1SalonesRoutes);
app.use('/api/v1/servicios', v1ServiciosRoutes);

export default app;
