<template>
  <div class="compare-container">
    <div class="header-section">
      <h2 class="title">Comparar Escenarios</h2>
      <p class="subtitle">Selecciona hasta 3 simulaciones de tu historial para enfrentarlas lado a lado.</p>
    </div>

    <!-- Selector -->
    <div class="selector-section card mb-4">
      <div class="form-group">
        <label>AÑADIR SIMULACIÓN PARA COMPARAR</label>
        <div class="add-row">
          <select v-model="selectedSimId" class="custom-select">
            <option value="" disabled>Elige una simulación de tu historial...</option>
            <option v-for="sim in savedSimulationsList" :key="sim.id" :value="sim.id">
              {{ sim.name }} ({{ sim.entity.toUpperCase() }}) - S/ {{ formatMoney(sim.monthlyPayment) }}/mes
            </option>
          </select>
          <button @click="addToCompare" :disabled="!selectedSimId || compareList.length >= 3" class="btn btn-primary">
            Añadir a tabla ({{ compareList.length }}/3)
          </button>
        </div>
      </div>
    </div>

    <div v-if="compareList.length === 0" class="empty-state card">
      <div class="empty-icon">⚖️</div>
      <h3>Selecciona simulaciones para empezar</h3>
      <p>Necesitas añadir al menos 2 simulaciones para ver las diferencias.</p>
    </div>

    <!-- Tabla Comparativa -->
    <div v-else class="compare-table-wrapper card">
      <table class="compare-table">
        <thead>
          <tr>
            <th class="feature-col">Característica</th>
            <th v-for="(sim, index) in compareList" :key="sim.id" class="sim-col">
              <div class="col-header">
                <h4>{{ sim.name }}</h4>
                <span class="badge">{{ sim.entity.toUpperCase() }}</span>
                <button @click="removeFromCompare(index)" class="btn-remove">✖</button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- PRESTAMO -->
          <tr class="section-row"><td :colspan="compareList.length + 1">DATOS DEL PRÉSTAMO</td></tr>
          <tr>
            <td class="feature-col">Precio Vehículo</td>
            <td v-for="sim in compareList" :key="'pv'+sim.id">S/ {{ formatMoney(sim.vehiclePrice) }}</td>
          </tr>
          <tr>
            <td class="feature-col">Cuota Inicial</td>
            <td v-for="sim in compareList" :key="'ci'+sim.id">S/ {{ formatMoney(sim.downPayment) }}</td>
          </tr>
          <tr>
            <td class="feature-col">Plazo</td>
            <td v-for="sim in compareList" :key="'pl'+sim.id">{{ sim.periods }} meses</td>
          </tr>

          <!-- TASAS -->
          <tr class="section-row"><td :colspan="compareList.length + 1">TASAS Y COSTOS</td></tr>
          <tr>
            <td class="feature-col">Tipo de Tasa</td>
            <td v-for="sim in compareList" :key="'tt'+sim.id">{{ sim.rateType }}</td>
          </tr>
          <tr>
            <td class="feature-col">Valor Tasa</td>
            <td v-for="sim in compareList" :key="'vt'+sim.id">{{ sim.rateValue }}%</td>
          </tr>
          <tr>
            <td class="feature-col highlight-cell">TCEA (Costo Real)</td>
            <td v-for="sim in compareList" :key="'tc'+sim.id" class="highlight-cell text-warning font-bold">
              {{ sim.tcea.toFixed(2) }}%
            </td>
          </tr>

          <!-- RESULTADO -->
          <tr class="section-row"><td :colspan="compareList.length + 1">IMPACTO EN BOLSILLO</td></tr>
          <tr>
            <td class="feature-col highlight-cell">Cuota Mensual</td>
            <td v-for="sim in compareList" :key="'cm'+sim.id" class="highlight-cell text-blue giant-val">
              S/ {{ formatMoney(sim.monthlyPayment) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCreditSimulator } from '../../application/useCreditSimulator';

const { savedSimulationsList } = useCreditSimulator();

const compareList = ref([]);
const selectedSimId = ref('');

const addToCompare = () => {
  if (selectedSimId.value && compareList.value.length < 3) {
    const sim = savedSimulationsList.value.find(s => s.id === selectedSimId.value);
    // Evitar duplicados
    if (sim && !compareList.value.find(s => s.id === sim.id)) {
      compareList.value.push(sim);
    }
  }
};

const removeFromCompare = (index) => {
  compareList.value.splice(index, 1);
};

const formatMoney = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>

<style scoped>
.compare-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-section { margin-bottom: 8px; }
.title { font-size: 1.8rem; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
.subtitle { color: #8b949e; font-size: 1rem; }

.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
}
.mb-4 { margin-bottom: 24px; }

.form-group { display: flex; flex-direction: column; gap: 8px; }
label { font-size: 0.75rem; font-weight: 700; color: #8b949e; letter-spacing: 0.05em; }

.add-row {
  display: flex;
  gap: 16px;
}

.custom-select {
  flex: 1;
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}
.custom-select:focus { border-color: #3b82f6; }

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:disabled { background-color: #21262d; color: #8b949e; cursor: not-allowed; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 60px 20px; text-align: center;
}
.empty-icon { font-size: 4rem; margin-bottom: 16px; }

/* Table */
.compare-table-wrapper {
  overflow-x: auto;
  padding: 0; /* Remueve el padding para que la tabla llegue a los bordes */
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.compare-table th, .compare-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #30363d;
  border-right: 1px solid #30363d;
}

.compare-table th:last-child, .compare-table td:last-child {
  border-right: none;
}

.feature-col {
  width: 200px;
  background-color: rgba(255, 255, 255, 0.02);
  color: #8b949e;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.sim-col {
  width: 30%;
  background-color: #161b22;
}

.col-header {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-header h4 {
  font-size: 1.1rem;
  color: #ffffff;
  margin: 0;
  padding-right: 24px;
}

.badge {
  align-self: flex-start;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.btn-remove {
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
}
.btn-remove:hover { color: #f85149; }

.section-row td {
  background-color: rgba(255, 255, 255, 0.05);
  font-weight: 700;
  font-size: 0.8rem;
  color: #ffffff;
  letter-spacing: 0.05em;
  padding: 8px 24px;
}

.highlight-cell {
  background-color: rgba(255, 255, 255, 0.02);
}

.font-bold { font-weight: 700; }
.giant-val { font-size: 1.25rem; font-weight: 700; }
.text-blue { color: #3b82f6; }
.text-warning { color: #f59e0b; }
</style>
