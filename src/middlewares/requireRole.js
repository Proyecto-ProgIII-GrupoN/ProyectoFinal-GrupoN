const ROLE_NAME = { 1: 'admin', 2: 'empleado', 3: 'cliente' };

export const requireRole = (allowed = []) => (req, res, next) => {
  const raw = req.user?.tipo_usuario; // 1|2|3 o 'admin'|'empleado'|'cliente'
  const role = typeof raw === 'number' ? ROLE_NAME[raw] : (raw || '').toLowerCase();

  if (!role || !allowed.map(r => r.toLowerCase()).includes(role)) {
    return res.status(403).json({ estado: false, mensaje: 'No autorizado' });
  }
  next();
};
