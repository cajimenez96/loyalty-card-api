# Loyalty Card API

Sistema de puntos y premios por compra desarrollado con NestJS, MongoDB y autenticación JWT.

## 📋 Descripción

API REST escalable para gestionar un sistema de loyalty card que permite:
- Registro de clientes y acumulación de puntos por compra
- Gestión de campañas con productos y premios asociados
- Generación de códigos QR para validación de ventas
- Detección automática de ganadores y generación de códigos de premio
- Sistema de roles (Cajero, Admin, Marketing)

## 🏗️ Arquitectura

```
src/
├── auth/              # Autenticación JWT y gestión de usuarios
├── clients/           # Gestión de clientes y puntos
├── products/          # Catálogo de productos
├── campaigns/         # Campañas con productos y premios
├── sales/             # Registro de ventas, QR y ganadores
├── common/            # Decorators, guards, filters, interceptors
└── database/          # Seeders y configuración
```

## 🚀 Instalación

### Prerequisitos

- Node.js 18+
- MongoDB 6.0+ (local o MongoDB Atlas)
- Yarn o npm

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd loyalty-card-api
```

2. **Instalar dependencias**
```bash
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/loyalty-card

# JWT
JWT_SECRET=tu-secret-super-seguro
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro

# Frontend URL para CORS
FRONTEND_URL=http://localhost:5173

# Winner Configuration
WINNER_THRESHOLD_POINTS=100
```

4. **Iniciar MongoDB** (si es local)
```bash
mongod --dbpath /path/to/data/db
```

5. **Ejecutar en desarrollo**
```bash
yarn start:dev
```

La API estará disponible en `http://localhost:3000/api`

## 📚 Documentación API

### Swagger UI
Acceder a la documentación interactiva en:
```
http://localhost:3000/api/docs
```

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Login con PIN
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual

#### Clientes
- `GET /api/clients` - Listar clientes (paginado)
- `GET /api/clients/dni/:dni` - Buscar por DNI
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id/puntos` - Obtener puntos del cliente

#### Productos  
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto (Admin)
- `GET /api/products/codigo/:codigo` - Buscar por código

#### Campañas
- `GET /api/campaigns` - Listar campañas
- `GET /api/campaigns/active` - Campaña activa
- `POST /api/campaigns` - Crear campaña (Admin/Marketing)
- `POST /api/campaigns/:id/productos` - Agregar producto
- `POST /api/campaigns/:id/premios` - Agregar premio

#### Ventas
- `POST /api/sales` - Registrar venta (genera QR y detecta ganadores)
- `GET /api/sales/qr?token=XXX` - Ver datos de venta (público)

#### Ganadores
- `GET /api/winners` - Listar ganadores
- `POST /api/winners/claim` - Canjear premio con código

## 🔐 Autenticación

El sistema usa JWT con roles:
- **Cajero**: Registrar ventas, buscar clientes
- **Admin**: Todas las operaciones
- **Marketing**: Campañas, notificaciones, reportes

### Usuarios por defecto (desarrollo)
- Admin: PIN `1234`
- Cajero: PIN `5678`
- Marketing: PIN `9012`

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage
yarn test:cov
```

## 📦 Build para Producción

```bash
yarn build
yarn start:prod
```

## 🛠️ Scripts Disponibles

```bash
yarn start:dev      # Desarrollo con hot reload
yarn start:debug    # Desarrollo con debugger
yarn build          # Compilar para producción
yarn start:prod     # Ejecutar build de producción
yarn lint           # Linter
yarn format         # Prettier
```

## 📊 Flujo de Negocio

### Registro de Venta
1. Cajero escanea DNI del cliente
2. Escanea código de producto
3. Sistema valida campaña activa
4. Acumula puntos al cliente
5. Genera código QR único
6. Detecta si el cliente alcanzó umbral de ganador
7. Si es ganador: genera código de 5 caracteres y notifica

### Canje de Premio
1. Cliente presenta código ganador
2. Cajero ingresa código en sistema
3. Sistema valida y marca como canjeado
4. Entrega premio físico

## 🔧 Tecnologías

- **NestJS 11** - Framework backend
- **MongoDB + Mongoose** - Base de datos
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **class-validator** - Validación de DTOs
- **bcrypt** - Hash de PINs
- **nanoid** - Generación de tokens únicos

## 📝 Notas de Desarrollo

### Índices MongoDB
El sistema crea automáticamente índices para optimizar queries:
- `clients.dni` (único)
- `sales.qrToken` (único)
- `winners.codigoGanador` (único)
- `campaigns.fechaInicio`, `campaigns.fechaFin`

### Estado de Campañas
El estado se calcula dinámicamente:
- **activa**: `fechaInicio <= hoy <= fechaFin`
- **vencida**: `hoy > fechaFin`
- **próxima**: `hoy < fechaInicio`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

UNLICENSED - Uso privado
