import express from 'express';
import { router as v1SalonesRoutes } from './v1/routes/salonesRoutes.js';
import { router as v1ServiciosRoutes } from './v1/routes/serviciosRoutes.js';

const app = express();

app.use(express.json());

app.get('/estado', (_req, res) => {
    res.json({ ok: true });
});

app.use('/api/v1/salones', v1SalonesRoutes);
app.use('/api/v1/servicios', v1ServiciosRoutes);

export default app;
