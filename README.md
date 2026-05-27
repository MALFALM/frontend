# Altoque - Simulador de Crédito Vehicular

Aplicación frontend moderna desarrollada con **Vue 3 (Composition API)** y **Vite**. Esta herramienta permite simular cronogramas de pago bajo el método francés, implementando características financieras avanzadas como tasas efectivas/nominales, seguros vehiculares, seguro de desgravamen dinámico, periodos de gracia (parcial/total) y compra inteligente (valor residual).

## Arquitectura

El proyecto sigue lineamientos de **Domain-Driven Design (DDD)** adaptados al frontend:
*   `src/frontend/domain/`: Lógica matemática pura y de negocio (`financialCalculations.js`).
*   `src/frontend/application/`: Casos de uso e integración (Ej. `useCreditSimulator.js` como gestor de estado).
*   `src/frontend/infrastructure/`: Comunicación externa y Mocks.
*   `src/frontend/presentation/`: Componentes UI y Vistas de Vue.

## Mocks y "Backend" Simulado

> [!NOTE]
> Dado que la aplicación aún no cuenta con un backend real ni una base de datos, estamos utilizando **Mocks** en la capa de infraestructura para simular estas integraciones.

*   **Catálogo de Entidades (`infrastructure/mocks/entities.js`)**: Este archivo actúa como nuestra base de datos NoSQL de bancos. Contiene la lista de entidades financieras (Ej. BCP, Interbank) y sus respectivos productos de crédito, con las tasas (TEA/TNA) y políticas de seguro predefinidas.
*   **Persistencia de Sesión (`localStorage`)**: Para mantener la simulación activa mientras el usuario navega entre el Wizard ("Nueva Simulación") y el Dashboard Avanzado, el estado se guarda temporalmente en el `localStorage` del navegador.

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
