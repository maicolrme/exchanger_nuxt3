# Sistema de Exchange de Criptomonedas

Este es un sistema de intercambio de criptomonedas desarrollado con Laravel que permite a los usuarios realizar operaciones de compra y venta de criptomonedas.

## Requisitos del Sistema

- PHP >= 8.1
- Composer
- MySQL >= 5.7
- Node.js y NPM

## Instalación

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
```

2. Instalar dependencias de PHP
```bash
composer install
```

3. Instalar dependencias de Node.js
```bash
npm install
```

4. Configurar el archivo .env
```bash
cp .env.example .env
php artisan key:generate
```

5. Ejecutar migraciones
```bash
php artisan migrate
```

6. Iniciar el servidor
```bash
php artisan serve
```

## Documentación de la API

### Autenticación

#### Registro de Usuario
```http
POST /api/register
```
**Parámetros:**
- `name` (string, requerido): Nombre del usuario
- `email` (string, requerido): Correo electrónico
- `password` (string, requerido): Contraseña
- `password_confirmation` (string, requerido): Confirmación de contraseña

#### Inicio de Sesión
```http
POST /api/login
```
**Parámetros:**
- `email` (string, requerido): Correo electrónico
- `password` (string, requerido): Contraseña

#### Cierre de Sesión
```http
POST /api/logout
```
**Headers requeridos:**
- `Authorization: Bearer {token}`

#### Obtener Información del Usuario
```http
GET /api/user
```
**Headers requeridos:**
- `Authorization: Bearer {token}`

### Mercados y Precios

#### Obtener Precio de Mercado
```http
GET /api/getMarketPrice/{market}
```
**Parámetros de URL:**
- `market` (string, requerido): ID del mercado (ej: BTC-USD)

#### Obtener Información de Mercado
```http
GET /api/market/{market}
```
**Parámetros de URL:**
- `market` (string, requerido): ID del mercado

#### Listar Mercados
```http
GET /api/markets
```

#### Obtener Precios Actuales
```http
GET /api/prices
```

### Órdenes

#### Crear Orden
```http
POST /api/orders
```
**Parámetros:**
- `market_id` (integer, requerido): ID del mercado
- `type` (string, requerido): Tipo de orden ('buy' o 'sell')
- `amount` (decimal, requerido): Cantidad
- `price` (decimal, requerido): Precio por unidad

#### Obtener Órdenes Completadas
```http
GET /api/orders/completed
```

#### Obtener Órdenes Abiertas
```http
GET /api/orders/open
```

#### Obtener Órdenes de Usuario
```http
GET /api/orders/{userId}
```
**Parámetros de URL:**
- `userId` (integer, requerido): ID del usuario

#### Cancelar Orden
```http
PUT /api/orders/cancel/{orderId}
```
**Parámetros de URL:**
- `orderId` (integer, requerido): ID de la orden

#### Emparejar Órdenes
```http
POST /api/match-orders/{marketId}
```
**Parámetros de URL:**
- `marketId` (integer, requerido): ID del mercado

## Modelos y Parámetros

### User
Modelo para la gestión de usuarios del sistema.

**Parámetros:**
- `name` (string): Nombre del usuario
- `email` (string): Correo electrónico único
- `password` (string): Contraseña hasheada
- `email_verified_at` (datetime): Fecha de verificación del email
- `remember_token` (string): Token para "recordar sesión"

**Relaciones:**
- `orders()`: HasMany - Órdenes del usuario
- `wallets()`: HasMany - Carteras del usuario

### Order
Modelo para la gestión de órdenes de compra/venta.

**Parámetros:**
- `user_id` (integer): ID del usuario que creó la orden
- `market_id` (integer): ID del mercado
- `market` (string): Nombre del mercado (ej: BTC-USD)
- `type` (string): Tipo de orden
- `side` (string): Lado de la orden (compra/venta)
- `price` (decimal): Precio por unidad
- `amount` (decimal): Cantidad total
- `filled_quantity` (decimal): Cantidad ejecutada
- `status` (string): Estado de la orden

**Atributos Calculados:**
- `total`: Precio total (price * amount)

**Relaciones:**
- `user()`: BelongsTo - Usuario propietario
- `market()`: BelongsTo - Mercado asociado
- `transactions()`: HasMany - Transacciones relacionadas

### Transaction
Modelo para el registro de transacciones ejecutadas.

**Parámetros:**
- `market` (string): Nombre del mercado
- `buy_order_id` (integer): ID de la orden de compra
- `sell_order_id` (integer): ID de la orden de venta
- `price` (decimal): Precio de ejecución
- `amount` (decimal): Cantidad ejecutada
- `fee` (decimal): Comisión total
- `fee_buyer` (decimal): Comisión del comprador
- `fee_seller` (decimal): Comisión del vendedor

**Relaciones:**
- `buyOrder()`: BelongsTo - Orden de compra
- `sellOrder()`: BelongsTo - Orden de venta

### Market
Modelo para la gestión de mercados disponibles.

**Parámetros:**
- `name` (string): Nombre del mercado
- `base_currency` (string): Moneda base (ej: BTC)
- `quote_currency` (string): Moneda cotizada (ej: USD)
- `min_price` (decimal): Precio mínimo permitido
- `max_price` (decimal): Precio máximo permitido
- `min_amount` (decimal): Cantidad mínima permitida
- `max_amount` (decimal): Cantidad máxima permitida

**Relaciones:**
- `orders()`: HasMany - Órdenes en este mercado

### Wallet
Modelo para la gestión de carteras de usuarios.

**Parámetros:**
- `user_id` (integer): ID del usuario propietario
- `currency` (string): Tipo de moneda
- `balance` (decimal): Balance disponible
- `locked_balance` (decimal): Balance bloqueado en órdenes

**Relaciones:**
- `user()`: BelongsTo - Usuario propietario

## Eventos en Tiempo Real

El sistema implementa varios eventos en tiempo real utilizando Laravel Broadcasting para mantener a los clientes actualizados sobre cambios importantes.

### Canales de Eventos

#### Canal General
- Nombre: `exchanger`
- Eventos:
  - `price-update`: Actualizaciones de precios generales
  - `order-updated`: Actualizaciones de estado de órdenes
  - `order-closed`: Órdenes cerradas
  - `order-open`: Nuevas órdenes abiertas

#### Canales de Mercado
- Formato: `market.{market_id}`
- Eventos:
  - `order.created`: Nueva orden creada en el mercado específico

#### Canales de Candlesticks
- Formato: `market.{market_id}.candlesticks.{interval}`
- Eventos:
  - `candlestick.updated`: Actualización de velas japonesas

### Estructura de los Eventos

#### PriceUpdated
```json
{
    "price": float,
    "timestamp": integer
}
```

#### OrderCreated
```json
{
    "order": {
        "id": integer,
        "market": string,
        "type": string,
        "side": string,
        "price": float,
        "amount": float,
        "status": string
    },
    "timestamp": integer
}
```

#### CandlestickUpdated
```json
{
    "market": string,
    "interval": string,
    "candlestick": {
        "open": float,
        "high": float,
        "low": float,
        "close": float,
        "volume": float,
        "timestamp": integer
    },
    "timestamp": integer
}
```

#### OrderUpdated/OrderClosed/OrderOpen
```json
{
    "order": {
        "id": integer,
        "market": string,
        "type": string,
        "side": string,
        "price": float,
        "amount": float,
        "status": string
    }
}
```

### Implementación del Cliente

Para suscribirse a estos eventos, los clientes deben:

1. Configurar Laravel Echo en el frontend
2. Suscribirse a los canales relevantes
3. Escuchar los eventos específicos

Ejemplo de implementación con Laravel Echo:

```javascript
// Suscripción al canal general
Echo.channel('exchanger')
    .listen('PriceUpdated', (e) => {
        console.log('Nuevo precio:', e.price);
    })
    .listen('OrderUpdated', (e) => {
        console.log('Orden actualizada:', e.order);
    });

// Suscripción a un mercado específico
Echo.channel('market.BTC-USD')
    .listen('OrderCreated', (e) => {
        console.log('Nueva orden:', e.order);
    });

// Suscripción a candlesticks
Echo.channel('market.BTC-USD.candlesticks.1m')
    .listen('CandlestickUpdated', (e) => {
        console.log('Nueva vela:', e.candlestick);
    });
```

## Sistema de Candlesticks

El sistema de candlesticks proporciona datos de precios en diferentes intervalos de tiempo para análisis técnico y visualización de gráficos.

### Modelo Candle

```php
use App\Models\Candle;

// Campos disponibles
[
    'market' => 'string',      // Par de trading (ej: BTC/USDT)
    'interval' => 'string',    // Intervalo (1m, 5m, 15m, 1h, 1d)
    'open' => 'decimal:8',     // Precio de apertura
    'high' => 'decimal:8',     // Precio más alto
    'low' => 'decimal:8',      // Precio más bajo
    'close' => 'decimal:8',    // Precio de cierre
    'volume' => 'decimal:8',   // Volumen
    'time_group' => 'integer', // Grupo de tiempo
    'timestamp' => 'datetime'  // Marca de tiempo
]

// Scopes disponibles
Candle::byMarket('BTC/USDT')           // Filtrar por mercado
Candle::byInterval('1m')               // Filtrar por intervalo
Candle::latest()                       // Ordenar por más reciente
Candle::timeRange($start, $end)        // Filtrar por rango de tiempo
```

### APIs Disponibles

#### Obtener Candlesticks Recientes
```http
GET /api/candlesticks/{market}?interval=1m&limit=100
```

Parámetros:
- `market`: Par de trading (ej: BTC/USDT)
- `interval`: Intervalo de tiempo (1m, 5m, 15m, 1h, 1d)
- `limit`: Número máximo de registros (default: 100)

Respuesta:
```json
{
    "success": true,
    "data": [
        {
            "market": "BTC/USDT",
            "interval": "1m",
            "open": "50000.00000000",
            "high": "50100.00000000",
            "low": "49900.00000000",
            "close": "50050.00000000",
            "volume": "1.50000000",
            "time_group": 1679232000,
            "timestamp": "2024-03-19T12:00:00.000000Z"
        }
        // ...
    ]
}
```

#### Obtener Candlesticks por Rango de Tiempo
```http
GET /api/candlesticks/{market}/range?interval=1h&start=2024-03-19&end=2024-03-20
```

Parámetros:
- `market`: Par de trading (ej: BTC/USDT)
- `interval`: Intervalo de tiempo (1m, 5m, 15m, 1h, 1d)
- `start`: Fecha de inicio (YYYY-MM-DD)
- `end`: Fecha de fin (YYYY-MM-DD)

### Eventos en Tiempo Real

El sistema emite eventos en tiempo real cuando se actualizan los candlesticks:

```javascript
// Suscribirse a actualizaciones de candlesticks
Echo.channel(`candlesticks.${market}.${interval}`)
    .listen('CandlestickUpdated', (e) => {
        console.log('Nuevo candlestick:', e.candlestick);
        // Actualizar gráfico o UI
    });
```

### Comandos Disponibles

#### Generar Candlesticks
```bash
# Generar candlesticks para un intervalo específico
php artisan candlesticks:generate --interval=1m

# Intervalos disponibles: 1m, 5m, 15m, 1h, 1d
```

#### Limpiar Datos Antiguos
```bash
# Limpiar candlesticks más antiguos que 7 días (default)
php artisan candlesticks:clean

# Especificar número de días a mantener
php artisan candlesticks:clean --days=30
```

### Integración con Órdenes

Los candlesticks se actualizan automáticamente cuando:
1. Se crea una nueva orden
2. Se ejecuta una orden
3. Se completa una transacción

#### Generación Automática al Crear Órdenes

Cuando se crea una nueva orden, el sistema automáticamente:

1. Crea la orden en la base de datos
2. Genera candlesticks para todos los intervalos (1m, 5m, 15m, 1h, 1d)
3. Emite un evento `OrderCreated` para actualización en tiempo real
4. Intenta emparejar la orden con órdenes existentes

Ejemplo de creación de orden:
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}

{
    "market": "BTC_USDT",
    "type": "buy",
    "price": "50000.00",
    "amount": "1.5"
}
```

Respuesta:
```json
{
    "success": true,
    "message": "Orden creada exitosamente",
    "data": {
        "id": 1,
        "user_id": 1,
        "market": "BTC_USDT",
        "type": "buy",
        "price": "50000.00",
        "amount": "1.5",
        "status": "open",
        "created_at": "2024-03-19T12:00:00.000000Z"
    }
}
```

Los candlesticks generados pueden consultarse inmediatamente:
```http
GET /api/candlesticks/BTC_USDT?interval=1m
```

#### Flujo de Actualización de Candlesticks

1. **Creación de Orden**:
   - Se valida la orden
   - Se inicia una transacción de base de datos
   - Se crea la orden
   - Se generan los candlesticks
   - Se intenta emparejar la orden
   - Se confirma la transacción
   - Se emite el evento

2. **Actualización de Candlesticks**:
   - Se actualizan los precios OHLCV
   - Se mantiene el historial por intervalo
   - Se emiten eventos en tiempo real

3. **Manejo de Errores**:
   - Si ocurre algún error, se revierte la transacción
   - Se mantiene la consistencia de los datos
   - Se notifica el error al usuario

## Estructura del Proyecto

```
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AuthController.php
│   │       ├── ExchangeController.php
│   │       └── OrderController.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Order.php
│   │   ├── Transaction.php
│   │   ├── CryptoPrice.php
│   │   ├── Market.php
│   │   └── Wallet.php
│   └── Services/
│       ├── PriceService.php
│       ├── MatchEngineService.php
│       └── CandlestickDataEngineService.php
├── database/
│   └── migrations/
│       └── 2024_12_27_013453_create_exchange_tables.php
└── routes/
    └── api.php
```

## Seguridad

- Todas las rutas de la API están protegidas con autenticación mediante Sanctum
- Las contraseñas se almacenan de forma segura con hash
- Se implementan validaciones en todos los endpoints
- Se utilizan tokens CSRF para protección contra ataques cross-site

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Mercados Predefinidos

El sistema incluye tres mercados predefinidos:

1. **BTC_USDT**
   - Moneda base: BTC
   - Moneda cotizada: USDT
   - Precisión de precio: 2 decimales
   - Precisión de cantidad: 6 decimales
   - Comisión: 0.2%
   - Cantidad mínima: 0.0001 BTC
   - Cantidad máxima: 1000 BTC

2. **ETH_USDT**
   - Moneda base: ETH
   - Moneda cotizada: USDT
   - Precisión de precio: 2 decimales
   - Precisión de cantidad: 6 decimales
   - Comisión: 0.2%
   - Cantidad mínima: 0.001 ETH
   - Cantidad máxima: 10000 ETH

3. **BSC_USDT**
   - Moneda base: BSC
   - Moneda cotizada: USDT
   - Precisión de precio: 4 decimales
   - Precisión de cantidad: 2 decimales
   - Comisión: 0.2%
   - Cantidad mínima: 0.01 BSC
   - Cantidad máxima: 100000 BSC

Para cargar los mercados predefinidos, ejecuta:
```bash
php artisan db:seed --class=MarketSeeder
```

### Ejemplos de Uso

#### Crear una Orden
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}

{
    "market": "BTC_USDT",
    "type": "buy",
    "price": "50000.00",
    "amount": "1.5"
}
```

#### Consultar Candlesticks
```http
GET /api/candlesticks/BTC_USDT?interval=1m
```

#### Consultar Precio de Mercado
```http
GET /api/getMarketPrice/BTC_USDT
```

## Usuarios de Prueba

El sistema incluye dos usuarios predefinidos:

1. **Administrador**
   - Email: admin@example.com
   - Contraseña: password

2. **Usuario de Prueba**
   - Email: test@example.com
   - Contraseña: password

Para cargar los usuarios de prueba, ejecuta:
```bash
php artisan db:seed --class=UserSeeder
```

### Ejemplo de Autenticación

```http
POST /api/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "password"
}
```

Respuesta:
```json
{
    "success": true,
    "token": "1|abcdef123456...",
    "user": {
        "id": 2,
        "name": "Test User",
        "email": "test@example.com"
    }
}
```

Usa el token recibido en las cabeceras de las siguientes peticiones:
```http
Authorization: Bearer 1|abcdef123456...
```

## Frontend

El frontend de la aplicación está disponible en `public/index.html`. Esta es una interfaz web que permite:

- Visualizar gráficos de precios en tiempo real
- Crear y gestionar órdenes de compra/venta
- Ver el historial de transacciones
- Monitorear el estado de las órdenes
- Acceder a diferentes intervalos de tiempo (1m, 5m, 15m, 1h, 1d)

### Características del Frontend

1. **Gráficos en Tiempo Real**
   - Visualización de candlesticks
   - Indicadores técnicos
   - Diferentes intervalos de tiempo
   - Actualización automática

2. **Panel de Órdenes**
   - Creación de órdenes de compra/venta
   - Visualización de órdenes abiertas
   - Historial de órdenes completadas
   - Cancelación de órdenes

3. **Libro de Órdenes**
   - Visualización de profundidad del mercado
   - Órdenes de compra y venta pendientes
   - Precios más recientes

4. **Historial de Transacciones**
   - Lista de transacciones ejecutadas
   - Detalles de cada transacción
   - Filtros por mercado y fecha

### Acceso al Frontend

Para acceder al frontend:

1. Asegúrate de que el servidor esté corriendo:
```bash
php artisan serve
```

2. Abre tu navegador y visita:
```
http://localhost:8000
```

3. Inicia sesión con tus credenciales:
   - Email: test@example.com
   - Contraseña: password

### Tecnologías Frontend

- HTML5
- CSS3
- JavaScript
- Chart.js para gráficos
- WebSocket para actualizaciones en tiempo real

## Wallets y Balances

El sistema incluye wallets predefinidas para los usuarios de prueba con los siguientes balances:

### Usuario Administrador (admin@example.com)

- **BTC**: 10.0 BTC
- **ETH**: 100.0 ETH
- **BSC**: 1000.0 BSC
- **USDT**: 100,000 USDT

### Usuario de Prueba (test@example.com)

- **BTC**: 10.0 BTC
- **ETH**: 100.0 ETH
- **BSC**: 1000.0 BSC
- **USDT**: 100,000 USDT

### Cargar Wallets

Para cargar las wallets con los balances iniciales:

```bash
php artisan db:seed --class=WalletSeeder
```

### Gestión de Wallets

Cada usuario tiene una wallet separada para cada moneda disponible en el sistema. Las wallets permiten:

- Ver balance disponible
- Ver balance bloqueado en órdenes
- Realizar depósitos y retiros
- Ver historial de transacciones

### Endpoints de Wallets

#### Consultar Todas las Wallets

```http
GET /api/wallets
Authorization: Bearer {token}
```

Respuesta:
```json
{
    "success": true,
    "data": [
        {
            "currency": "BTC",
            "balance": "10.00000000",
            "locked_balance": "0.00000000"
        },
        {
            "currency": "ETH",
            "balance": "100.00000000",
            "locked_balance": "0.00000000"
        },
        {
            "currency": "BSC",
            "balance": "1000.00000000",
            "locked_balance": "0.00000000"
        },
        {
            "currency": "USDT",
            "balance": "100000.00000000",
            "locked_balance": "0.00000000"
        }
    ]
}
```

#### Consultar Wallet Específica por Moneda

```http
GET /api/wallets/{currency}
Authorization: Bearer {token}
```

**Parámetros de URL:**
- `currency` (string, requerido): Código de la moneda (ej: BTC, ETH, USDT)

Respuesta:
```json
{
    "success": true,
    "data": {
        "currency": "BTC",
        "balance": "10.00000000",
        "locked_balance": "0.00000000"
    }
}
```
