<script setup>
import { computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

// Datos para el gráfico circular del usuario
const doughnutData = computed(() => {
  if (!props.user || !props.user.bankPreferences) return { labels: [], datasets: [] };
  
  return {
    labels: props.user.bankPreferences.map(p => p.bankName),
    datasets: [{
      data: props.user.bankPreferences.map(p => p.count),
      backgroundColor: props.user.bankPreferences.map(p => p.color),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: { display: false }
  }
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      
      <!-- Header -->
      <div class="modal-header">
        <h3>Detalle del Cliente</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      
      <!-- Body -->
      <div class="modal-body" v-if="user">
        
        <div class="profile-layout">
          <!-- Columna Izquierda: Perfil Base -->
          <div class="profile-sidebar">
            <div class="avatar-container">
              <img :src="`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&size=120&background=f1f5f9&color=0f172a`" class="large-avatar" />
              <span class="status-indicator" :class="user.status === 'Activo' ? 'bg-success' : 'bg-gray'"></span>
            </div>
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-email">{{ user.email }}</p>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-label">Ticket Promedio</span>
                <span class="stat-value text-blue">{{ user.avgTicket }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Simulaciones</span>
                <span class="stat-value">{{ user.simulations }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Fecha de Registro</span>
                <span class="stat-value">{{ user.registeredAt }}</span>
              </div>
            </div>
          </div>
          
          <!-- Columna Derecha: Gráficos e Historial -->
          <div class="profile-main">
            
            <!-- Preferencias de Banco -->
            <div class="section-card">
              <h4>Bancos de Interés</h4>
              <div class="chart-flex">
                <div class="mini-chart">
                  <Doughnut :data="doughnutData" :options="doughnutOptions" v-if="doughnutData.labels.length > 0" />
                </div>
                <div class="chart-legend">
                  <div class="legend-item" v-for="(pref, i) in user.bankPreferences" :key="i">
                    <span class="dot" :style="{ backgroundColor: pref.color }"></span>
                    <span class="legend-name">{{ pref.bankName }}</span>
                    <span class="legend-count">{{ pref.count }} sim.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Últimas simulaciones -->
            <div class="section-card mt-4">
              <h4>Últimas Simulaciones</h4>
              <table class="history-table">
                <thead>
                  <tr>
                    <th>VEHÍCULO</th>
                    <th>BANCO</th>
                    <th>CUOTA INICIAL</th>
                    <th>PLAZO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sim, i) in user.recentSimulations" :key="i">
                    <td class="font-bold">{{ sim.vehicle }}</td>
                    <td>
                      <span class="bank-pill" :style="{ backgroundColor: sim.color + '20', color: sim.color }">
                        {{ sim.bankName }}
                      </span>
                    </td>
                    <td>{{ sim.downPayment }}</td>
                    <td>{{ sim.term }} meses</td>
                  </tr>
                  <tr v-if="!user.recentSimulations || user.recentSimulations.length === 0">
                    <td colspan="4" class="text-center text-gray">No hay simulaciones recientes.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
        
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: #f8fafc;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.profile-layout {
  display: flex;
  gap: 24px;
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }
}

/* Sidebar Profile */
.profile-sidebar {
  flex: 0 0 280px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.large-avatar {
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
}

.bg-success { background-color: #10b981; }
.bg-gray { background-color: #94a3b8; }

.user-name {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.user-email {
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 0.9rem;
}

.profile-stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px dashed #e2e8f0;
  padding-top: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.stat-label {
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-weight: 700;
  color: #334155;
}

.text-blue { color: #3b82f6; font-size: 1rem; }

/* Main Content */
.profile-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-card h4 {
  margin: 0 0 16px 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.chart-flex {
  display: flex;
  align-items: center;
  gap: 32px;
}

.mini-chart {
  width: 120px;
  height: 120px;
  position: relative;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-name {
  font-weight: 600;
  color: #334155;
  flex: 1;
}

.legend-count {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Table */
.history-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.history-table th {
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.history-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #334155;
}

.font-bold { font-weight: 600; color: #0f172a; }

.bank-pill {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.text-center { text-align: center; }
.text-gray { color: #94a3b8; }
.mt-4 { margin-top: 16px; }
</style>
