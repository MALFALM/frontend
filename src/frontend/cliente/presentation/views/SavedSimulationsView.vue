<template>
  <div class="saved-simulations-container">
    <div class="header-section">
      <h2 class="title">Mis Simulaciones Guardadas</h2>
      <p class="subtitle">Revisa tu historial, compara opciones o genera un PDF para llevar al banco.</p>
    </div>

    <div v-if="savedSimulationsList.length === 0" class="empty-state card">
      <div class="empty-icon">📁</div>
      <h3>Aún no tienes simulaciones</h3>
      <p>Ve a "Nueva Simulación" para crear tu primer escenario financiero.</p>
      <router-link to="/inicio/nueva-simulacion" class="btn btn-primary mt-4">Crear Simulación</router-link>
    </div>

    <div v-else class="simulations-grid">
      <div v-for="sim in savedSimulationsList" :key="sim.id" class="simulation-card card printable" @click="handleCardClick(sim)">
        
        <div class="card-header">
          <div>
            <h3 class="sim-name">{{ sim.name }}</h3>
            <span class="sim-date">{{ new Date(sim.date).toLocaleDateString() }} - {{ sim.entity.toUpperCase() }}</span>
          </div>
          <button @click.stop="deleteSimulation(sim.id)" class="btn-icon" title="Eliminar">🗑️</button>
        </div>

        <div class="card-body">
          <div class="data-row">
            <span class="label">Vehículo:</span>
            <span class="value">S/ {{ formatMoney(sim.vehiclePrice) }}</span>
          </div>
          <div class="data-row">
            <span class="label">Cuota Inicial:</span>
            <span class="value">S/ {{ formatMoney(sim.downPayment) }}</span>
          </div>
          <div class="data-row">
            <span class="label">Préstamo:</span>
            <span class="value">S/ {{ formatMoney(sim.loanAmount) }}</span>
          </div>
          <div class="data-row">
            <span class="label">Plazo:</span>
            <span class="value">{{ sim.periods }} meses</span>
          </div>
          <div class="data-row">
            <span class="label">Tasa ({{ sim.rateType || 'TEA' }}):</span>
            <span class="value">{{ sim.rateValue || 0 }}%</span>
          </div>
          <div class="divider"></div>
          <div class="data-row highlight-row">
            <span class="label">TCEA (Costo Total):</span>
            <span class="value text-warning">{{ sim.tcea ? sim.tcea.toFixed(2) : '0.00' }}%</span>
          </div>
          <div class="data-row highlight-row">
            <span class="label">Cuota Mensual:</span>
            <span class="value text-blue giant-val">S/ {{ formatMoney(sim.monthlyPayment) }}</span>
          </div>
        </div>

        <div class="card-footer no-print">
          <button @click.stop="printCard(sim.id)" class="btn btn-secondary w-100">
            📄 Exportar a PDF (Imprimir)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCreditSimulator } from '../../application/useCreditSimulator';
import { useRouter } from 'vue-router';

const router = useRouter();
const { savedSimulationsList, deleteSimulation, loadSimulation } = useCreditSimulator();

const handleCardClick = (sim) => {
  loadSimulation(sim);
  router.push('/inicio');
};

const formatMoney = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const printCard = (id) => {
  window.print();
};
</script>

<style scoped>
.saved-simulations-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-section {
  margin-bottom: 8px;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.subtitle {
  color: #8b949e;
  font-size: 1rem;
}

.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.simulations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.simulation-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.simulation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: rgba(255, 255, 255, 0.02);
}

.sim-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.sim-date {
  font-size: 0.75rem;
  color: #8b949e;
  font-weight: 500;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-icon:hover { opacity: 1; }

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.label {
  color: #8b949e;
  font-weight: 500;
}

.value {
  color: #e6edf3;
  font-weight: 600;
}

.divider {
  height: 1px;
  background-color: #30363d;
  margin: 8px 0;
}

.highlight-row {
  font-size: 1rem;
}

.giant-val {
  font-size: 1.25rem;
  font-weight: 700;
}

.text-blue { color: #3b82f6; }
.text-warning { color: #f59e0b; }

.card-footer {
  padding: 16px;
  border-top: 1px solid #30363d;
  background-color: rgba(255, 255, 255, 0.02);
}

.w-100 { width: 100%; }

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary { background-color: #3b82f6; color: white; text-decoration: none; display: inline-block;}
.btn-primary:hover { background-color: #2563eb; }

.btn-secondary { background-color: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
.btn-secondary:hover { background-color: #30363d; color: #ffffff; }

.mt-4 { margin-top: 16px; }

/* Print Styles - Solo imprimir la cuadrícula limpia */
@media print {
  .no-print, .btn-icon, .sidebar, .topbar {
    display: none !important;
  }
  body {
    background-color: white;
    color: black;
  }
  .card {
    background-color: white;
    border: 1px solid #ccc;
    color: black;
    break-inside: avoid;
  }
  .label, .value, .sim-name, .sim-date, .title, .subtitle {
    color: black !important;
  }
  .text-blue, .text-warning {
    color: black !important;
  }
  .saved-simulations-container {
    padding: 0;
  }
}
</style>
