import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST - Gestión de Reservas de Salones',
      version: '1.0.0',
      description: 'API REST para la gestión de reservas de salones de cumpleaños. Incluye autenticación JWT, autorización por roles, y BREAD completo de todas las entidades.',
      contact: {
        name: 'Grupo N - Programación III',
        email: 'support@prog3.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido del endpoint /api/v1/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            estado: {
              type: 'boolean',
              example: false
            },
            mensaje: {
              type: 'string',
              example: 'Mensaje de error'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            estado: {
              type: 'boolean',
              example: true
            },
            mensaje: {
              type: 'string',
              example: 'Operación exitosa'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['nombre_usuario', 'contrasenia'],
          properties: {
            nombre_usuario: {
              type: 'string',
              format: 'email',
              example: 'admisalones@gmail.com',
              description: 'Email del usuario'
            },
            contrasenia: {
              type: 'string',
              example: 'admi123*',
              description: 'Contraseña del usuario'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            estado: {
              type: 'boolean',
              example: true
            },
            mensaje: {
              type: 'string',
              example: 'Login exitoso'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'Token JWT para autenticación'
            },
            usuario: {
              type: 'object',
              properties: {
                usuario_id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'Admin' },
                apellido: { type: 'string', example: 'Sistema' },
                nombre_usuario: { type: 'string', example: 'admisalones@gmail.com' },
                tipo_usuario: { type: 'integer', example: 1, description: '1=Admin, 2=Empleado, 3=Cliente' }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación'
      },
      {
        name: 'Salones',
        description: 'BREAD de salones'
      },
      {
        name: 'Servicios',
        description: 'BREAD de servicios'
      },
      {
        name: 'Turnos',
        description: 'BREAD de turnos'
      },
      {
        name: 'Reservas',
        description: 'BREAD de reservas'
      },
      {
        name: 'Usuarios',
        description: 'BREAD de usuarios'
      },
      {
        name: 'Sistema',
        description: 'Endpoints del sistema'
      }
    ]
  },
  apis: ['./src/v1/routes/*.js', './src/reservas.js'] // Rutas donde buscar documentación
};

export const swaggerSpec = swaggerJsdoc(options);

