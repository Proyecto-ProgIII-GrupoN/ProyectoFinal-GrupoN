# Copilot Instructions for ProyectoFinal-GrupoN

## Project Overview
This is a Node.js REST API for managing event venues ("salones"). It uses Express, MySQL, and follows a modular service/controller architecture. The main entry point is `src/servidor.js`, which loads environment variables and starts the server using the port from `.env` (`PUERTO`).

## Architecture & Data Flow
- **Express App**: Defined in `src/reservas.js`. All API routes are mounted here.
- **Routing**: Main API routes are under `/api/v1/salones` (see `src/v1/routes/salonesRoutes.js`).
- **Controllers**: Business logic for salones is in `src/controllers/salonesController.js`.
- **Services**: Data access logic is abstracted in `src/services/salonesService.js`.
- **Database Layer**: MySQL queries are implemented in `src/db/salones.js`, using a connection pool from `src/db/conexion.js`.
- **Validation**: Request validation is handled by middleware in `src/middlewares/validators.js` using `express-validator`.
- **Templates**: Handlebars templates are located in `src/utils/handlebars/` (currently only `plantilla.hbs`).

## Developer Workflows
- **Start Server (Development)**: `npm run des` (uses `node --watch src/servidor.js` for auto-reload)
- **Environment Variables**: Required in `.env` (DB credentials, PUERTO)
- **Database**: MySQL required; schema and queries may be in `src/db/reservas.sql`
- **Testing**: No test suite is present; `npm test` is a placeholder

## Project-Specific Patterns
- **Controllers and Services**: Each resource (e.g., salones) has a dedicated controller and service class. Controllers handle HTTP, services handle DB logic.
- **Validation**: All POST/GET by ID routes use custom middleware for validation. See `validateSalonId` and `validateCrearSalon` in `src/middlewares/validators.js`.
- **Error Handling**: Errors are logged to console and returned as JSON with a friendly message and `estado: false`.
- **Active Records**: Only records with `activo = 1` are returned by default queries.
- **Response Format**: All API responses use `{ estado: true/false, datos?, mensaje? }`.

## Integration Points
- **MySQL**: Connection via `mysql2/promise`, pool config in `src/db/conexion.js`. Credentials from `.env`.
- **Handlebars**: For email or document templates (future use).
- **Nodemailer**: Installed, but not yet integrated in codebase.

## Conventions & Tips
- Use ES modules throughout (`type: module` in `package.json`).
- All new routes should follow the `/api/v1/[resource]` pattern and use validation middleware.
- Keep business logic out of controllers; use services for DB and external calls.
- Always return consistent JSON structure for API responses.

## Key Files & Directories
- `src/servidor.js`: Server entry point
- `src/reservas.js`: Express app setup
- `src/v1/routes/salonesRoutes.js`: Main API routes
- `src/controllers/salonesController.js`: Controller logic
- `src/services/salonesService.js`: Service logic
- `src/db/salones.js`: DB queries
- `src/db/conexion.js`: MySQL pool
- `src/middlewares/validators.js`: Validation middleware
- `src/utils/handlebars/plantilla.hbs`: Handlebars template

---
If any conventions or workflows are unclear, please provide feedback so this guide can be improved.
