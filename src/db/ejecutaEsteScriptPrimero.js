import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import { pool } from './conexion.js';
//compas ejecuten este script primero >>>   node src/db/ejecutaEsteScriptPrimero.js
// Usuarios del TP
const usuarios = [
    {
        nombre: 'Admin',
        apellido: 'Sistema',
        nombre_usuario: 'admisalones@gmail.com',
        contrasenia: 'admi123*',
        tipo_usuario: 1 // Admin
    },
    {
        nombre: 'Empleado',
        apellido: 'Reservas',
        nombre_usuario: 'empeadoreservas@gmail.com',
        contrasenia: 'emp123***',
        tipo_usuario: 2 // Empleado
    },
    {
        nombre: 'Cliente',
        apellido: 'Reservas',
        nombre_usuario: 'clientereservas@outlook.com',
        contrasenia: 'cli123***',
        tipo_usuario: 3 // Cliente
    }
];

async function crearUsuarios() {
    try {
        console.log('🚀 Creando usuarios del TP...\n');

        for (const usuario of usuarios) {
            // Hashear contraseña con bcrypt
            const salt = await bcrypt.genSalt(10);
            const contrasenia_hash = await bcrypt.hash(usuario.contrasenia, salt);

            // Insertar en BD
            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo) VALUES (?, ?, ?, ?, ?, 1)',
                [usuario.nombre, usuario.apellido, usuario.nombre_usuario, contrasenia_hash, usuario.tipo_usuario]
            );

            const rolNombre = usuario.tipo_usuario === 1 ? 'Admin' : usuario.tipo_usuario === 2 ? 'Empleado' : 'Cliente';
            console.log(`✅ ${rolNombre} creado:`);
            console.log(`   ID: ${result.insertId}`);
            console.log(`   Email: ${usuario.nombre_usuario}`);
            console.log(`   Contraseña: ${usuario.contrasenia}`);
            console.log('');
        }

        console.log('✨ Todos los usuarios creados exitosamente!\n');
        console.log('📝 Credenciales para probar:\n');
        usuarios.forEach(u => {
            const rol = u.tipo_usuario === 1 ? 'Admin' : u.tipo_usuario === 2 ? 'Empleado' : 'Cliente';
            console.log(`${rol}: ${u.nombre_usuario} / ${u.contrasenia}`);
        });

        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Algunos usuarios ya existen. Elimínalos primero si querés recrearlos.');
        }
        process.exit(1);
    }
}

crearUsuarios();

