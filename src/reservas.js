import express from 'express';
import { router as v1SalonesRoutes } from './v1/routes/salonesRoutes.js';

//instancia express
const app = express();

// parsea las solicitudes con un body a json
app.use(express.json());

app.use('/api/v1/salones', v1SalonesRoutes);

export default app;