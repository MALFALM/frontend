# Altoque - Simulador de Crédito Vehicular

Aplicación frontend moderna desarrollada con **Vue 3 (Composition API)** y **Vite**. Esta herramienta permite simular cronogramas de pago bajo el método francés, implementando características financieras avanzadas como tasas efectivas/nominales, seguros vehiculares, seguro de desgravamen dinámico, periodos de gracia (parcial/total) y compra inteligente (valor residual).

## Arquitectura

El proyecto sigue lineamientos de **Domain-Driven Design (DDD)** adaptados al frontend:
*   `src/frontend/domain/`: Lógica matemática pura y de negocio (`financialCalculations.js`).
*   `src/frontend/application/`: Casos de uso e integración (Ej. `useCreditSimulator.js` como gestor de estado).
*   `src/frontend/infrastructure/`: Comunicación externa y Mocks.
*   `src/frontend/presentation/`: Componentes UI y Vistas de Vue.

## Mocks y "Backend" Simulado (Para el equipo)

> [Aviso para los demás jsjs]
> Dado que la aplicación es actualmente un frontend puro y solo... obviamente xd, se está utilizando herramientas locales para simular bases de datos y APIs.

### 1. Sistema Multi-Tenant (Bancos y Suscripciones)
- **Base de datos inicial de Bancos (`infrastructure/mocks/entities.js`)**: Contiene la semilla inicial de bancos disponibles (BCP, Interbank, BBVA) con su `themeColor`, productos y promociones de ejemplo.
- **Persistencia Reactiva (`useEntitiesStore.js`)**: Al cargar la app, se lee el archivo `entities.js` y se inyecta en el `localStorage` (bajo la llave `altoque_financial_entities`).
  - **CRUD Realizado**: Cuando un Banco crea un "Nuevo Producto", "Nueva Promoción" o edita su "Color de Marca" en el panel de Configuración, la data se guarda en esta variable reactiva (Pinia/Composable) y se **sobrescribe en el localStorage**.
  - **Suspensión de Bancos**: La base de datos simulada de entidades ahora incluye el campo `isSuspended` (Booleano). Cuando el Administrador suspende un banco, el login de ese banco queda inhabilitado automáticamente. El backend deberá añadir este estado a la tabla de Entidades y verificarlo durante el Login.
  - **Alta de Bancos**: Desde el portal del **Super Administrador**, cualquier banco nuevo que se cree también será inyectado aquí dinámicamente. 
  > [!WARNING]
  > **Responsabilidad del Backend:** Actualmente, cuando el Administrador registra un nuevo banco, el frontend solo guarda su nombre, ID y color en la base de datos simulada. En un entorno real, el backend deberá generar automáticamente una contraseña temporal para esta entidad y enviarla mediante email al representante del banco, ya que las entidades financieras NO se registran por su cuenta.

### 2. Base de Datos de Usuarios y Sesiones
- **Autenticación (`useAuthStore.js` / `useProfile.js`)**: Todo el inicio de sesión y registro de clientes se simula usando `localStorage`. El login de Entidades Financieras ahora valida el correo contra el dominio de la entidad (ej. `@bcp.com.pe`) antes de dejar acceder al panel bancario. El backend deberá sustituir esto conectándose al sistema de usuarios real. No hay validación de JWT real.
- **Tabla de Clientes (`AdminUsersView.vue`)**: La tabla del administrador consume un array llamado `mockUsers` con datos falsos de clientes (Nombres, correos, cantidad de simulaciones).
- **Detalle e Historial del Cliente (`AdminUserDetailsModal.vue`)**: Cuando se abre el modal de perfil de un cliente, lee las propiedades `bankPreferences` (para el mini-gráfico circular) y `recentSimulations` (para su historial exacto) desde ese mismo array `mockUsers`.

### 3. Dashboards y Analítica Global
- **Gráficos Globales (`AdminDashboardView.vue`)**: El gráfico de Dona (Doughnut) de *Market Share* de bancos se genera calculando la data directamente del composable `entities.value`. Se le inyectan valores aleatorios falsos (`Math.random()`) al vuelo si se trata de entidades recién creadas para simular tráfico. 

### 4. Simulador de Crédito del Cliente
- **Persistencia de Escenarios (`useCreditSimulator.js`)**: Cuando el cliente final guarda un escenario (una cotización vehicular), la configuración y el cronograma de pagos completo se guardan en el almacenamiento local para mostrarlo en el panel "Mis Simulaciones" y poder exportarlo a PDF en el futuro. El backend deberá crear una tabla `Simulations` o similar.

### 5. Centro de Ayuda y Soporte
- **Tickets Interconectados (`useSupportStore.js`)**: Todo el sistema de mensajería (soporte) entre los clientes, las entidades financieras y los administradores está simulado usando una redención reactiva de `localStorage`. Los mensajes se actualizan en tiempo real entre pestañas usando el evento de ventana `storage`. El backend deberá reemplazar esto posiblemente implementando WebSockets (ej. Socket.io) y una tabla relacional de Mensajes/Tickets.

### 6. Sistema de Notificaciones
- **Notificaciones del Administrador (`useAdminNotificationsStore.js`)**: Registra alertas del sistema guardándolas en memoria de la sesión local. Deberá conectarse al servidor en la implementación real.

Cuando se implemente las bases de datos (Ej. Postgres/MongoDB) y los endpoints (REST/GraphQL), deberán conectarse a los *Composables* mencionados (todos los archivos dentro de carpetas `application/`) sustituyendo la lectura de `localStorage` por llamadas HTTP usando `fetch` o `axios`.

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
