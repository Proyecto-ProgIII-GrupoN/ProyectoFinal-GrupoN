import jwt from 'jsonwebtoken';

export const ROLES = {
  ADMIN: 1,
  EMPLEADO: 2,
  CLIENTE: 3,
};

export const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '8h',
  });
};

export const verificarToken = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ estado: false, mensaje: 'Token faltante o inválido.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; 
    next();
  } catch {
    return res.status(401).json({ estado: false, mensaje: 'Token expirado o inválido.' });
  }
};

export const requerirRol = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ estado: false, mensaje: 'No autenticado.' });
  }
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ estado: false, mensaje: 'No tenés permisos para esta acción.' });
  }
  next();
};
