
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { uploadsDir } from './config/multer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import { router as v1SalonesRoutes } from './v1/routes/salonesRoutes.js';
import { router as v1ServiciosRoutes } from './v1/routes/serviciosRoutes.js';
import { router as v1TurnosRoutes } from './v1/routes/turnosRoutes.js';
import { router as v1ReservasRoutes } from './v1/routes/reservasRoutes.js';
import { router as v1UsuariosRoutes } from './v1/routes/usuariosRoutes.js';
import { router as v1AuthRoutes } from './v1/routes/authRoutes.js';
import v1EstadisticasRoutes from './v1/routes/estadisticasRoutes.js';
import v1InformesRoutes from './v1/routes/informesRoutes.js';
import v1UploadsRoutes from './v1/routes/uploadsRoutes.js';

const app = express();

// CORS - Permite peticiones desde Live Server (dashboard) o desde el mismo servidor
app.use(cors());

//morgan
const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream })); 
app.use(morgan('combined'));
app.use(express.json());

// API: evitar caché en respuestas para que el frontend siempre reciba datos actualizados
// Esto aplica a todas las rutas que comienzan con /api
app.use('/api', (_req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
});

// Ruta absoluta al dashboard (desde src/ vamos una carpeta arriba a la raíz del proyecto)
const dashboardPath = path.resolve(__dirname, '../dashboard');

// Rutas específicas para las páginas del dashboard (ANTES de express.static)
app.get('/', (_req, res) => {
    res.sendFile(path.resolve(dashboardPath, 'index.html'));
});

app.get('/dashboard/admin', (_req, res) => {
    res.sendFile(path.resolve(dashboardPath, 'admin.html'));
});

app.get('/dashboard/admin-dashboard', (_req, res) => {
    res.sendFile(path.resolve(dashboardPath, 'admin-dashboard.html'));
});

app.get('/dashboard/empleado', (_req, res) => {
    res.sendFile(path.resolve(dashboardPath, 'empleado.html'));
});

app.get('/dashboard/empleado-dashboard', (_req, res) => {
    res.sendFile(path.resolve(dashboardPath, 'empleado-dashboard.html'));
});

// Página de registro de cliente
// (Registro solo desde frontend separado - Live Server)

// Servir archivos estáticos del dashboard (CSS, JS, imágenes, etc.)
// Esta ruta debe ir DESPUÉS de las rutas específicas para evitar conflictos
app.use('/dashboard', express.static(dashboardPath, {
    index: false, // No servir index.html automáticamente en /dashboard
    extensions: ['html', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico']
}));

// Servir archivos subidos desde una URL simple
app.use('/uploads', express.static(uploadsDir));

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
app.use('/api/v1/estadisticas', v1EstadisticasRoutes);
app.use('/api/v1/informes', v1InformesRoutes);
app.use('/api/v1/uploads', v1UploadsRoutes);

export default app;
