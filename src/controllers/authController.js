import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuarios from '../db/usuarios.js';

const ROLE = {
    ADMIN: 1,
    EMPLEADO: 2,
    CLIENTE: 3
};

export default class AuthController {
    constructor() {
        this.usuarios = new Usuarios();
    }

    login = async (req, res) => {
        try {
            const { nombre_usuario, contrasenia } = req.body;
            if (!nombre_usuario || !contrasenia) {
                return res.status(400).json({ estado: false, mensaje: 'nombre_usuario y contrasenia son requeridos' });
            }

            const user = await this.usuarios.buscarPorNombreUsuario(nombre_usuario);
            if (!user) {
                return res.status(401).json({ estado: false, mensaje: 'Credenciales inválidas' });
            }

            // Verificar contraseña: primero intenta bcrypt, luego MD5 (para compatibilidad con datos existentes)
            let passwordMatch = false;
            const isBcryptHash = user.contrasenia.startsWith('$2a$') || user.contrasenia.startsWith('$2b$') || user.contrasenia.startsWith('$2y$');
            
            if (isBcryptHash) {
                // Contraseña en BD es bcrypt
                passwordMatch = await bcrypt.compare(contrasenia, user.contrasenia);
            } else {
                // Contraseña en BD es MD5 (legacy)
                const md5Hash = crypto.createHash('md5').update(contrasenia).digest('hex');
                passwordMatch = md5Hash === user.contrasenia;
            }

            if (!passwordMatch) {
                return res.status(401).json({ estado: false, mensaje: 'Credenciales inválidas' });
            }

            const payload = { sub: user.usuario_id, rol: user.tipo_usuario };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });

            return res.json({
                estado: true,
                token,
                usuario: {
                    usuario_id: user.usuario_id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    nombre_usuario: user.nombre_usuario,
                    tipo_usuario: user.tipo_usuario
                }
            });
        } catch (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ estado: false, mensaje: 'Error interno en login' });
        }
    }
}

export { ROLE };


