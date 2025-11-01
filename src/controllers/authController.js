import UsuariosService from '../services/usuariosService.js';
import { generarToken } from '../middlewares/auth.js';

export default class AuthController {
    constructor() {
        this.service = new UsuariosService();
    }

    login = async (req, res) => {
        try {
            const { nombre_usuario, password } = req.body;
            const payload = await this.service.login({ nombre_usuario, password });
            if (!payload) {
                return res.status(401).json({ estado: false, mensaje: 'Credenciales inválidas.' });
            }
            const token = generarToken(payload);
            res.json({ estado: true, token, usuario: payload });
        } catch (e) {
            console.log('Error en login -->', e);
            res.status(500).json({ estado: false, mensaje: 'Error interno en login.' });
        }
    };

    register = async (req, res) => {
        try {
            const { nombre, apellido, nombre_usuario, password, tipo_usuario } = req.body;
            const user = await this.service.registrar({ nombre, apellido, nombre_usuario, password, tipo_usuario });
            res.status(201).json({ estado: true, datos: user });
        } catch (e) {
            console.log('Error en register -->', e);
            res.status(500).json({ estado: false, mensaje: 'No se pudo registrar el usuario.' });
        }
    };
}
