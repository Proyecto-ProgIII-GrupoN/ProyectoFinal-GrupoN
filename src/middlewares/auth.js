import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { pool } from '../db/conexion.js';

export const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ estado: false, mensaje: 'Token requerido' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    
    // Validar que el usuario existe y está activo en BD
    const [rows] = await pool.execute(
      'SELECT usuario_id, tipo_usuario, activo FROM usuarios WHERE usuario_id = ?',
      [payload.sub]
    );
    
    if (!rows.length || !rows[0].activo) {
      return res.status(401).json({ estado: false, mensaje: 'Usuario no válido o inactivo' });
    }
    
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ estado: false, mensaje: 'Token inválido o expirado' });
  }
};

export const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ estado: false, mensaje: 'No autorizado' });
    }
    next();
  };
};


