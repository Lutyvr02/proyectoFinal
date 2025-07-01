# Plataforma de Subastas Online

Una plataforma de subastas en tiempo real desarrollada con React, TypeScript y Node.js. Incluye sistema de pujas en vivo, chat global, panel de administración y soporte multiidioma.

## ✨ Características

- **Subastas en Tiempo Real**: Sistema de pujas con actualizaciones automáticas vía Server-Sent Events (SSE)
- **Chat Global**: Sistema de mensajería accesible desde cualquier página
- **Panel de Administración**: Gestión completa de productos y usuarios
- **Multiidioma**: Soporte para Español e Inglés
- **Interfaz Responsiva**: Diseño adaptativo para desktop y móvil
- **Autenticación**: Sistema de login con roles de usuario y administrador

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Material-UI (MUI)** para componentes de interfaz
- **Zustand** para manejo de estado global
- **React Router** para navegación
- **React i18next** para internacionalización
- **Formik + Yup** para formularios y validación
- **Axios** para comunicación con API

### Backend
- **Node.js + Express** para servidor SSE
- **JSON Server** para API REST mock
- **CORS** habilitado para desarrollo

## � Prerrequisitos

- Node.js 18.0 o superior
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd proyectoFinal
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar la aplicación**

Necesitas ejecutar tres servicios simultáneamente. Abre tres terminales y ejecuta:

**Terminal 1 - Servidor API (Puerto 3001)**
```bash
npx json-server --watch db.json --port 3001
```

**Terminal 2 - Servidor SSE (Puerto 3002)**
```bash
node server/index.js
```

**Terminal 3 - Aplicación React (Puerto 5173)**
```bash
npm run dev
```

4. **Acceder a la aplicación**
- Aplicación web: http://localhost:5173
- API REST: http://localhost:3001
- Servidor SSE: http://localhost:3002

## � Guía de Uso

### Para Usuarios Regulares

1. **Iniciar Sesión**: Selecciona un usuario existente o crea uno nuevo
2. **Explorar Subastas**: Navega entre subastas actuales, próximas y pasadas
3. **Participar en Pujas**: Haz clic en una subasta activa e introduce tu oferta
4. **Chat Global**: Usa el botón flotante en la esquina inferior derecha
5. **Cambiar Idioma**: Utiliza el selector de idioma en la barra de navegación

### Para Administradores

1. **Panel de Administración**: Accede desde el menú principal
2. **Gestionar Productos**: Crear, editar y eliminar subastas
3. **Gestionar Usuarios**: Administrar cuentas y asignar roles
4. **Configurar Fechas**: Establecer horarios de inicio flexibles (pasado, presente o futuro)

## � Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye la aplicación para producción
```

## 🌐 API Endpoints

### Productos
- `GET /products` - Obtener todas las subastas
- `GET /products/:id` - Obtener subasta específica
- `POST /products` - Crear nueva subasta
- `PUT /products/:id` - Actualizar subasta
- `DELETE /products/:id` - Eliminar subasta

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios
- `POST /usuarios` - Crear nuevo usuario

### Pujas
- `GET /bids` - Obtener todas las pujas
- `POST /bids` - Crear nueva puja

### Chat
- `GET /chat` - Obtener mensajes de chat
- `POST /chat` - Enviar mensaje

### SSE Events
- `GET /events` - Conexión para eventos en tiempo real
- `POST /update-bid` - Actualizar puja
- `POST /add-message` - Enviar mensaje


