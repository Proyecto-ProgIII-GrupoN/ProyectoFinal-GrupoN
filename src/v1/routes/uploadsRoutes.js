import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload, uploadsDir } from '../../config/multer.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @swagger
 * /api/v1/uploads:
 *   post:
 *     tags:
 *       - Uploads
 *     summary: Subir archivo (imagen)
 *     description: Sube un archivo de imagen. Disponible para Admin y Empleado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (jpeg, jpg, png, gif, webp) - máximo 5MB
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Archivo subido exitosamente
 *                 url:
 *                   type: string
 *                   example: /uploads/foto-1234567890.jpg
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.post(
    '/',
    authenticate,
    authorizeRoles(1, 2), // Solo Admin y Empleado
    upload.single('file'),
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'No se proporcionó ningún archivo'
                });
            }

            // Retornar URL relativa del archivo
            const fileUrl = `/uploads/${req.file.filename}`;
            
            res.json({
                estado: true,
                mensaje: 'Archivo subido exitosamente',
                url: fileUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            res.status(500).json({
                estado: false,
                mensaje: 'Error al subir el archivo'
            });
        }
    }
);

// Servir archivos estáticos desde la carpeta uploads
router.use('/uploads', express.static(uploadsDir));

export default router;

