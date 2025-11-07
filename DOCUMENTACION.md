# DOCUMENTACION

## 1) Arquitectura general
- Front Dashboard: Servido por el backend en http://localhost:3000/dashboard
- Front Registro (público, client-side): Carpeta RegisterFrontLiveServer/ (se abre con Live Server)
- Backend API REST: Node/Express en http://localhost:3000/api/v1
- Almacenamiento de fotos subidas: public/uploads expuestas en /uploads/<archivo>

## 2) Registro público (Cliente)
- URL Front (Live Server): abrir RegisterFrontLiveServer/index.html
- Endpoint Backend: POST /api/v1/auth/register (público)
- Envío: multipart/form-data con campos
  - nombre (string, requerido)
  - apellido (string, requerido)
  - nombre_usuario (email, requerido)
  - contrasenia (string, min 6, requerido)
  - celular (string, opcional)
  - foto (file, opcional; tipos: jpeg/jpg/png/gif/webp; máximo 5MB)
- Respuesta: { estado: true, usuario: { ... , foto: "/uploads/xxx.ext" } }
- Redirección tras éxito: success.html?name=<Nombre Apellido>&foto=<URL>
- Configurar API Base desde el front (si no es localhost:3000):
  ```html
  <script>
    window.API_BASE_URL_OVERRIDE = 'http://TU_HOST:PUERTO/api/v1'
  </script>
  <script src="js/register.js"></script>
  ```

## 3) Dashboard (servido por backend)
- Inicio: http://localhost:3000/
- Admin (landing): http://localhost:3000/dashboard/admin
- Admin Dashboard: http://localhost:3000/dashboard/admin-dashboard
- Empleado (landing): http://localhost:3000/dashboard/empleado
- Empleado Dashboard: http://localhost:3000/dashboard/empleado-dashboard
- Estáticos de dashboard: http://localhost:3000/dashboard/... (css, js, images)

## 4) API principal (ejemplos)
- Auth: POST /api/v1/auth/login, POST /api/v1/auth/register (público, cliente)
- Usuarios: /api/v1/usuarios (según rol)
- Salones: /api/v1/salones
- Servicios: /api/v1/servicios
- Turnos: /api/v1/turnos
- Reservas: /api/v1/reservas
- Estadísticas: /api/v1/estadisticas
- Informes: /api/v1/informes
- Subidas (administradas): /api/v1/uploads
- Swagger: http://localhost:3000/api-docs
- Salud: GET /estado -> { ok: true }

## 5) Subida y exposición de fotos
- Multer guarda en: public/uploads (se crea automáticamente)
- URL pública: /uploads/<filename> (ej: http://localhost:3000/uploads/abc.jpg)
- Campos permitidos: imágenes (jpeg/jpg/png/gif/webp), 5MB máx.
- BD (usuarios.foto): guarda la ruta relativa /uploads/...

## 6) CORS y orígenes
- Backend usa app.use(cors())
- Live Server (ej. http://127.0.0.1:5500) puede llamar a http://localhost:3000 sin problemas.
- Dashboard no requiere CORS (mismo origen que la API).

## 7) Pasos para correr
1. Backend: npm run dev (escucha en http://localhost:3000)
2. Front Registro: abrir RegisterFrontLiveServer/index.html con Live Server
3. Dashboard: navegar a http://localhost:3000/dashboard/... (desde el backend)

## 8) Troubleshooting
- NetworkError/Failed to fetch: asegurarse que el backend no esté reiniciando (nodemon). Reintentar.
- 400/415 al registrar: verificar enctype="multipart/form-data", nombres de campos, y contraseña >= 6.
- CORS: si el backend no está en localhost:3000, configurar window.API_BASE_URL_OVERRIDE.
- Foto no visible: confirmar que la respuesta trae usuario.foto y acceder a http://localhost:3000/uploads/<archivo>.

## 9) Decisiones de diseño
- Separación de concerns: Dashboard servido por backend; registro público como front independiente (Live Server).
- Evitar mezclar assets del front con subidas de usuarios: public/uploads solo para datos dinámicos; assets del dashboard dentro de dashboard/.
- Rutas amigables para imágenes: /uploads/.
- Seguridad: bcrypt para contraseñas; validaciones con express-validator; nunca devolver contraseñas.

## 10) Ubicaciones clave en el repo
- Front Registro: RegisterFrontLiveServer/
- Dashboard: dashboard/
- API: src/
- Multer config: src/config/multer.js
- Auth Controller (login/register): src/controllers/authController.js
- Rutas auth: src/v1/routes/authRoutes.js
- App/servidor: src/reservas.js (monta rutas, estáticos, cors, swagger)

## 11) Setup y ejecución
- Requisitos: Node 20+, MySQL
- Variables de entorno (.env):
  - `PUERTO=3000`
  - `DB_HOST=localhost`
  - `DB_PORT=3306`
  - `DB_USER=usuario`
  - `DB_PASSWORD=clave`
  - `DB_NAME=reservas`
  - `JWT_SECRET=dev_secret`
  - `EMAIL_USER=Email de la empresa`
  - `EMAIL_PASS= App pass de la empresa`
  
- Scripts:
  - `npm run dev` (con nodemon)
  - `npm start`

Nota de seguridad:
- No subir `.env` al repo (ya está en `.gitignore`). Usar `.env.example` como plantilla.

## 12) Estructura del proyecto (resumen)
```
ProyectoFinal-GrupoN/
  DOCUMENTACION.md
  RegisterFrontLiveServer/
    index.html
    success.html
    js/register.js
  dashboard/
    admin.html, admin-dashboard.html, empleado.html, empleado-dashboard.html
    css/, js/
  public/
    uploads/                # fotos subidas (Multer)
  src/
    config/ (multer.js, swagger.js)
    controllers/
    db/ (conexion.js, *.js)
    middlewares/ (auth.js, validators ...)
    services/
    v1/routes/ (*.js)
    reservas.js             # app Express
    servidor.js             # arranque
```

## 13) Roles y autenticación
- Roles: 1=Admin, 2=Empleado, 3=Cliente
- Autenticación: JWT (header `Authorization: Bearer <token>`)
- Middleware `authenticate`: valida token y que el usuario esté activo
- Middleware `authorizeRoles(...roles)`: restringe acceso por rol

## 14) Middlewares relevantes
- `cors()` habilitado globalmente (front Live Server puede consumir API)
- `morgan` logging (access.log)
- `express.json()` para JSON
- `multer` almacenamiento en `public/uploads` y serving en `/uploads`
- `express-validator` en rutas (Auth/Usuarios/Salones/etc.)
- `apicache` para GETs de listados

## 15) Mapa de endpoints (principal)
- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
- Usuarios: `GET/POST/PUT/DELETE /api/v1/usuarios`, `GET /api/v1/usuarios/clientes`
- Salones: `GET/GET:id/POST/PUT/DELETE /api/v1/salones`
- Servicios: `GET/GET:id/POST/PUT/DELETE /api/v1/servicios`
- Turnos: `GET/GET:id/POST/PUT/DELETE /api/v1/turnos`
- Reservas: `GET/GET:id/POST/PUT/DELETE /api/v1/reservas`
- Estadísticas: `GET /api/v1/estadisticas` (Admin)
- Informes: `GET /api/v1/informes?formato=pdf|csv` (Admin)
- Salud: `GET /estado`
- Swagger UI: `GET /api-docs`

## 16) Uso de Swagger
- Abrir http://localhost:3000/api-docs
- Usar el botón Authorize con el token JWT para probar endpoints protegidos
- Endpoints documentados en `src/v1/routes/*.js` y `src/reservas.js`

## 17) Flujo de registro (Live Server)
- Abrir `RegisterFrontLiveServer/index.html` con Live Server (p.ej. http://127.0.0.1:5500)
- `register.js` envía `multipart/form-data` a `POST /api/v1/auth/register`
  - Al éxito, redirige a `success.html?name=<Nombre Apellido>&foto=<URL>`
  - Si el backend no está en 3000, setear `window.API_BASE_URL_OVERRIDE`

## 18) Ejemplos cURL
- Login:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"nombre_usuario":"admisalones@gmail.com","contrasenia":"admi123*"}'
```
- Listar salones (público):
```bash
curl -s http://localhost:3000/api/v1/salones
```
- Crear servicio (token requerido):
```bash
curl -s -X POST http://localhost:3000/api/v1/servicios \
  -H 'Authorization: Bearer <TOKEN>' -H 'Content-Type: application/json' \
  -d '{"descripcion":"Decoración temática","importe":15000}'
```

## 19) Extra implementado
- Registro público de usuarios tipo Cliente con foto (Multer + CORS + Front Live Server)
- Serving de imágenes subidas en `/uploads/<archivo>`
