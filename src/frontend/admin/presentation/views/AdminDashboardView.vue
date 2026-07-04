<script setup>
import { computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import { useEntitiesStore } from '../../../entidad-financiera/application/useEntitiesStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const { entities } = useEntitiesStore();

// Datos del Gráfico de Dona (Bancos Más Simulados)
const doughnutData = computed(() => {
  // Mocks globales. Si hay entidades cargadas, mapeamos.
  const activeEntities = entities.value.filter(e => e.id === 'bcp' || e.id === 'bbva' || e.id === 'interbank' || e.id === 'scotiabank');
  const labels = [];
  const data = [];
  const backgroundColors = [];

  // Data ficticia por defecto para el MVP si las entidades existen
  if (entities.value.find(e => e.id === 'bcp')) { labels.push('BCP'); data.push(2715); backgroundColors.push('#ff5a00'); }
  if (entities.value.find(e => e.id === 'bbva')) { labels.push('BBVA'); data.push(1629); backgroundColors.push('#072146'); }
  if (entities.value.find(e => e.id === 'interbank')) { labels.push('Interbank'); data.push(1086); backgroundColors.push('#00b14f'); }
  
  // Agregar entidades nuevas con data genérica
  entities.value.forEach(e => {
    if (!['bcp', 'bbva', 'interbank'].includes(e.id)) {
      labels.push(e.name);
      data.push(Math.floor(Math.random() * 500) + 100);
      backgroundColors.push(e.themeColor || '#64748b');
    }
  });

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: backgroundColors,
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
    }
  }
};
</script>

<template>
  <div class="dashboard-view">
    <div class="header-actions">
      <h2>Métricas Generales</h2>
      <p class="subtitle">Resumen de la salud y uso de la plataforma en tiempo real.</p>
    </div>

    <!-- Tarjetas de métricas -->
    <div class="metrics-grid mt-4">
      <div class="metric-card">
        <span class="metric-label">TOTAL USUARIOS</span>
        <span class="metric-value">1,245</span>
        <span class="metric-sub text-success">↑ 12% vs mes anterior</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">SIMULACIONES ESTE MES</span>
        <span class="metric-value">5,430</span>
        <span class="metric-sub text-success">↑ 8% vs mes anterior</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">BANCOS AFILIADOS</span>
        <span class="metric-value">3</span>
        <span class="metric-sub text-blue">Activos en la plataforma</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">BANCO MÁS POPULAR</span>
        <span class="metric-value" style="color: #072146;">BBVA</span>
        <span class="metric-sub">45% de las simulaciones</span>
      </div>

      <router-link to="/admin/soporte" class="metric-card support-card-link">
  <span class="metric-label">SOPORTE</span>
  <span class="metric-value">🎧</span>
  <span class="metric-sub text-blue">Ir a Soporte y Atención</span>
</router-link>
    </div>

    <!-- Gráfico y Tips -->
    <div class="middle-section mt-4">
      <!-- Gráfico Tráfico Mensual (Barras estáticas) -->
      <div class="chart-card">
        <div class="card-header">
          <div>
            <h3>Tráfico de Simulaciones (Últimos 6 meses)</h3>
            <p>Cantidad de simulaciones generadas por usuarios</p>
          </div>
          <span class="badge">Datos Globales</span>
        </div>
        <div class="chart-placeholder">
          <div class="bar" style="height: 40%;"><span>Ene</span></div>
          <div class="bar" style="height: 60%;"><span>Feb</span></div>
          <div class="bar" style="height: 50%;"><span>Mar</span></div>
          <div class="bar" style="height: 80%;"><span>Abr</span></div>
          <div class="bar" style="height: 70%;"><span>May</span></div>
          <div class="bar" style="height: 95%;"><span>Jun</span></div>
        </div>
      </div>

      <!-- Gráfico de Bancos Populares (Dona) -->
      <div class="chart-card">
        <div class="card-header">
          <div>
            <h3>Market Share de Cotizaciones</h3>
            <p>Porcentaje de interés según el banco elegido</p>
          </div>
          <span class="badge">Tiempo Real</span>
        </div>
        <div class="doughnut-container">
          <Doughnut :data="doughnutData" :options="doughnutOptions" v-if="doughnutData.labels.length > 0" />
          
          <div class="doughnut-center-text" v-if="doughnutData.labels.length > 0">
            <span class="total-number">{{ doughnutData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString() }}</span>
            <span class="total-label">Total</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.support-card-link {
  text-decoration: none;
  cursor: pointer;
}

.support-card-link:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.12);
}

.header-actions h2 {
  margin: 0;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.metric-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.metric-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.text-success { color: #10b981; }
.text-blue { color: #3b82f6; }

.middle-section {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .middle-section {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.card-header p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.badge {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.chart-placeholder {
  height: 250px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: 24px;
  border-bottom: 1px dashed #e2e8f0;
}

.bar {
  width: 40px;
  background-color: #3b82f6;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 1s ease-in-out;
}

.bar span {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.doughnut-container {
  position: relative;
  height: 250px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.doughnut-center-text {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.total-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.total-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.mt-4 { margin-top: 24px; }
</style>
