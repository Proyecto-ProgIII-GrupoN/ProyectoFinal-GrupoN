import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { pool } from '../db/conexion.js';

passport.use('local', new LocalStrategy(
  {
    usernameField: 'nombre_usuario',
    passwordField: 'contrasenia',
    session: false
  },
  async (nombre_usuario, contrasenia, done) => {
    try {
      const [rows] = await pool.execute(
        'SELECT usuario_id, nombre_usuario, contrasenia, tipo_usuario, activo FROM usuarios WHERE nombre_usuario = ? LIMIT 1',
        [nombre_usuario]
      );

      if (!rows.length) return done(null, false);
      const user = rows[0];
      if (!user.activo) return done(null, false);

      const ok = await bcrypt.compare(contrasenia, user.contrasenia);
      if (!ok) return done(null, false);

      return done(null, {
        id: user.usuario_id,
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario
      });
    } catch (err) {
      return done(err);
    }
  }
));

passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (payload, done) => {
    try {
      // Si querés validar contra DB que el usuario exista y esté activo:
      const [rows] = await pool.execute(
        'SELECT usuario_id, nombre_usuario, tipo_usuario, activo FROM usuarios WHERE usuario_id = ? LIMIT 1',
        [payload.id]
      );
      if (!rows.length) return done(null, false);
      const dbUser = rows[0];
      if (!dbUser.activo) return done(null, false);

      return done(null, {
        id: dbUser.usuario_id,
        nombre_usuario: dbUser.nombre_usuario,
        tipo_usuario: dbUser.tipo_usuario
      });
    } catch (err) {
      return done(err, false);
    }
  }
));

export default passport;
