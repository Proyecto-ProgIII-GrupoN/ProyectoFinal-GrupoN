
import express from 'express';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';





import { router as v1SalonesRoutes } from './v1/routes/salonesRoutes.js';
import { router as v1ServiciosRoutes } from './v1/routes/serviciosRoutes.js';
import { router as v1TurnosRoutes } from './v1/routes/turnosRoutes.js';
import { router as v1ReservasRoutes } from './v1/routes/reservasRoutes.js';
import { router as v1UsuariosRoutes } from './v1/routes/usuariosRoutes.js';
import { router as v1AuthRoutes } from './v1/routes/authRoutes.js';

const app = express();


//morgan
const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream })); 
app.use(morgan('combined'));
app.use(express.json());

/**
 * @swagger
 * /estado:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Estado del servidor
 *     description: Verifica que el servidor esté funcionando (endpoint público)
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get('/estado', (_req, res) => {
  res.json({ ok: true });
});

// Swagger UI - Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gestión de Reservas - Documentación'
}));


app.use('/api/v1/salones', v1SalonesRoutes);
app.use('/api/v1/servicios', v1ServiciosRoutes);
app.use('/api/v1/turnos', v1TurnosRoutes);
app.use('/api/v1/reservas', v1ReservasRoutes);
app.use('/api/v1/usuarios', v1UsuariosRoutes);
app.use('/api/v1/auth', v1AuthRoutes);

export default app;
