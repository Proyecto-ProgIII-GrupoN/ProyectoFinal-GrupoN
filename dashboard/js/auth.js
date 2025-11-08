// Configuración de la API
// Si estamos en el mismo servidor, usar URL relativa, sino usar la absoluta
const API_BASE_URL = window.location.origin + '/api/v1';

// Servicio de autenticación
class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    saveAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    async fetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // For API calls we force network fetch to avoid stale cached responses
        // `cache: 'no-store'` ensures the browser does not reuse cached responses
        // and we also set Cache-Control header as a fallback.
        headers['Cache-Control'] = headers['Cache-Control'] || 'no-cache';

        const fetchOptions = {
            ...options,
            headers,
            cache: options.cache || 'no-store'
        };

        const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

        if (response.status === 401) {
            this.logout();
            throw new Error('Sesión expirada o no autorizada');
        }

        return response;
    }
}

const auth = new AuthService();

// Lógica de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';

            const nombre_usuario = document.getElementById('nombre_usuario').value;
            const contrasenia = document.getElementById('contrasenia').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre_usuario, contrasenia })
                });

                const data = await response.json();

                if (data.estado) {
                    auth.saveAuth(data.token, data.usuario);
                    
                    // Redirigir según el tipo de usuario
                    if (data.usuario.tipo_usuario === 1) { // Admin
                        window.location.href = '/dashboard/admin-dashboard';
                    } else if (data.usuario.tipo_usuario === 2) { // Empleado
                        window.location.href = '/dashboard/empleado-dashboard';
                    } else {
                        errorMessage.textContent = 'Tipo de usuario no soportado para este acceso.';
                        errorMessage.style.display = 'block';
                        auth.logout();
                    }
                } else {
                    errorMessage.textContent = data.mensaje || 'Error de autenticación';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Error en el login:', error);
                errorMessage.textContent = 'Error de conexión o servidor.';
                errorMessage.style.display = 'block';
            }
        });
    }

    // Redirigir si ya está autenticado
    if (auth.getToken() && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('empleado.html'))) {
        const user = auth.getUser();
        if (user) {
            if (user.tipo_usuario === 1) {
                window.location.href = '/dashboard/admin-dashboard';
            } else if (user.tipo_usuario === 2) {
                window.location.href = '/dashboard/empleado-dashboard';
            }
        }
    }
});

// Exportar para que otros scripts puedan usarlo
window.auth = auth;

