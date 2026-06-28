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
  - **Alta de Bancos**: Desde el portal del **Super Administrador**, cualquier banco nuevo que se cree también será inyectado aquí dinámicamente.

### 2. Base de Datos de Usuarios y Sesiones
- **Autenticación (`useAuthStore.js`)**: Todo el inicio de sesión se simula. Al dar click a un botón de "Iniciar Sesión", guardamos en el `localStorage` bajo `altoque_auth_session` un objeto como `{ role: 'admin' }` o `{ role: 'bank', bankId: 'bcp' }`. No hay validación de JWT real.
- **Tabla de Clientes (`AdminUsersView.vue`)**: La tabla del administrador consume un array llamado `mockUsers` con datos falsos de clientes (Nombres, correos, cantidad de simulaciones).
- **Detalle e Historial del Cliente (`AdminUserDetailsModal.vue`)**: Cuando se abre el modal de perfil de un cliente, lee las propiedades `bankPreferences` (para el mini-gráfico circular) y `recentSimulations` (para su historial exacto) desde ese mismo array `mockUsers`.

### 3. Dashboards y Analítica Global
- **Gráficos Globales (`AdminDashboardView.vue`)**: El gráfico de Dona (Doughnut) de *Market Share* de bancos se genera calculando la data directamente del composable `entities.value`. Se le inyectan valores aleatorios falsos (`Math.random()`) al vuelo si se trata de entidades recién creadas para simular tráfico. 

### 4. Simulador de Crédito del Cliente
- **Persistencia de Escenarios (`useCreditSimulator.js`)**: Cuando el cliente final guarda un escenario (una cotización vehicular), se guarda en memoria local para mostrarlo en el panel "Mis Simulaciones".

Cuando se implemente las bases de datos (Ej. Postgres/MongoDB) y los endpoints (REST/GraphQL), deberán conectarse a los *Composables* mencionados (`useEntitiesStore`, `useAuthStore`) sustituyendo la lectura de `localStorage` por llamadas HTTP usando `fetch` o `axios`.

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
