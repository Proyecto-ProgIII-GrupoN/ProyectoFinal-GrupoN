# ProyectoFinal-GrupoN

Trabajo integrador de Programación 3 - Sistema de Reservas de Salones

## 👥 **Equipo**
- Valentina Angeletti
- Rubí Alarcón
- Elizabeth Jatip
- Lamine Mechedou
- Taoufik Saidi
- Mairene Villasmil

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js (versión 18 o superior)
- XAMPP con MySQL
- Base de datos MySQL configurada

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/Proyecto-ProgIII-GrupoN/ProyectoFinal-GrupoN.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones de base de datos
```

### **Configuración de Base de Datos**
1. Iniciar XAMPP y activar MySQL
2. Crear base de datos llamada `reservas`
3. Importar el archivo `src/db/reservas.sql` en phpMyAdmin

### **Ejecución**
```bash
# Desarrollo con nodemon (recomendado)
npm run dev
o
nodemon

# Desarrollo con node --watch
npm run dev:watch

# Producción
npm start
```

## 📋 **API de Salones**

### **Base URL:** `http://localhost:3000/api/v1/salones`

### **🔍 GET /api/v1/salones - Listar salones con paginación**

Lista todos los salones con opciones avanzadas de filtrado, búsqueda y ordenamiento.

#### **Parámetros de Query:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página (mínimo 1) |
| `limit` | number | 10 | Registros por página (1-100) |
| `q` | string | '' | Búsqueda por título o dirección |
| `activo` | number | 1 | Filtrar por estado (1=activo, 0=inactivo) |
| `sortBy` | string | 'salon_id' | Ordenar por: `salon_id`, `titulo`, `importe`, `creado`, `modificado` |
| `sortOrder` | string | 'ASC' | Orden: `ASC` o `DESC` |

#### **Ejemplos de uso: Ver el archivo de BRUNO API**

```bash
# Página 1, 5 registros por página
GET /api/v1/salones?page=1&limit=5

# Buscar salones con "Centro" en título o dirección
GET /api/v1/salones?q=Centro

# Ordenar por importe descendente
GET /api/v1/salones?sortBy=importe&sortOrder=DESC

# Combinado: página 2, 3 registros, buscar "Sala", ordenado por título
GET /api/v1/salones?page=2&limit=3&q=Sala&sortBy=titulo
```

#### **Respuesta exitosa:**
```json
{
  "estado": true,
  "datos": [
    {
      "salon_id": 1,
      "titulo": "Salón Principal",
      "direccion": "Av. Principal 123",
      "capacidad": 100,
      "importe": 1500.00,
      "latitud": -34.6037,
      "longitud": -58.3816,
      "activo": 1,
      "creado": "2025-10-15 10:30:00",
      "modificado": "2025-10-15 10:30:00"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 7,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### **🎯 GET /api/v1/salones/:id - Obtener salón específico**

Obtiene los detalles de un salón por su ID.

```bash
# Obtener salón con ID 1
GET /api/v1/salones/1
```

**Respuesta exitosa:**
```json
{
  "estado": true,
  "datos": {
    "salon_id": 1,
    "titulo": "Salón Principal",
    "direccion": "Av. Principal 123",
    "capacidad": 100,
    "importe": 1500.00,
    "latitud": -34.6037,
    "longitud": -58.3816,
    "activo": 1,
    "creado": "2025-10-15 10:30:00",
    "modificado": "2025-10-15 10:30:00"
  }
}
```

### **➕ POST /api/v1/salones - Crear nuevo salón**

Crea un nuevo salón en el sistema.

**Campos requeridos:** `titulo`, `direccion`, `importe`  
**Campos opcionales:** `capacidad`, `latitud`, `longitud`

```bash
curl -X POST http://localhost:3000/api/v1/salones \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nuevo Salón",
    "direccion": "Calle Nueva 456",
    "importe": 2000.00,
    "capacidad": 50
  }'
```

### **✏️ PUT /api/v1/salones/:id - Actualizar salón**

Actualiza los datos de un salón existente.

```bash
curl -X PUT http://localhost:3000/api/v1/salones/1 \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Salón Actualizado",
    "importe": 1800.00
  }'
```

## 🧪 **Testing con Bruno**

Para probar las APIs, puedes usar Bruno (similar a Postman) importando la colección desde el directorio `bruno/` del proyecto.

## 📁 **Estructura del Proyecto**

```
src/
├── controllers/
│   └── salonesController.js
├── db/
│   ├── conexion.js
│   ├── salones.js
│   └── reservas.sql
├── middlewares/
│   └── validators.js
├── services/
│   └── salonesService.js
├── utils/
│   └── handlebars/
│       └── plantilla.hbs
├── v1/
│   └── routes/
│       └── salonesRoutes.js
├── servidor.js
└── reservas.js
```

## 🛠️ **Tecnologías Utilizadas**

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver de base de datos
- **Express Validator** - Validación de datos
- **Handlebars** - Motor de plantillas
- **Nodemon** - Reinicio automático en desarrollo
- **ESLint** - Linting de código

## 📝 **Scripts Disponibles**

```bash
npm run dev          # Desarrollo con nodemon
npm run dev:watch    # Desarrollo con node --watch
npm start           # Producción
npm test           # Ejecutar tests (no implementado)
```



## 📄 **Licencia**

Este proyecto está bajo la Licencia ISC.