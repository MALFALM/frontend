<template>
  <div class="simple-simulator-page">
    <header class="header">
      <div class="container logo-wrapper">
        <router-link to="/" class="logo-link">
          <svg class="logo-icon" viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4L4 36H12L20 20L28 36H36L20 4Z" fill="#3b82f6"/>
            <path d="M12 28L28 12" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">Altoque</span>
        </router-link>
      </div>
    </header>

    <main class="container simulator-main">
      <div class="page-intro">
        <h3 class="subtitle">Simulador financiero</h3>
        <h1 class="title">Configura tu crédito<br/>vehicular</h1>
        <p class="desc">Ingresa los datos principales del cliente, vehículo y préstamo para generar un cronograma estimado bajo el método francés.</p>
      </div>

      <div class="simulator-grid">
        <!-- Left Panel: Form -->
        <div class="card form-card">
          <h2 class="card-title">Datos del crédito</h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Cliente</label>
              <input type="text" placeholder="Tu nombre" class="input" />
            </div>
            <div class="form-group">
              <label>Moneda</label>
              <select v-model="currency" class="input">
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Precio del vehículo</label>
              <input type="number" v-model="vehiclePrice" class="input" />
            </div>
            <div class="form-group">
              <label>Cuota Inicial</label>
              <input type="number" v-model="downPayment" class="input" />
            </div>
            
            <div class="form-group">
              <label>TEA %</label>
              <input type="number" v-model="teaRate" class="input" />
            </div>
            <div class="form-group">
              <label>Plazo en meses</label>
              <select v-model="periods" class="input">
                <option :value="12">12 meses</option>
                <option :value="24">24 meses</option>
                <option :value="36">36 meses</option>
                <option :value="48">48 meses</option>
              </select>
            </div>

            <div class="form-group">
              <label>Valor residual</label>
              <input type="number" value="0" class="input" disabled title="Informativo por ahora." />
              <small class="text-muted">En crédito tradicional, el valor residual se considera S/ 0.</small>
            </div>
            <div class="form-group">
              <label>Seguro mensual</label>
              <input type="number" v-model="monthlyInsurance" class="input" />
            </div>
          </div>
          
          <button class="btn-primary mt-4" @click="handleCalculate">Calcular simulación</button>
        </div>

        <!-- Right Panel: Summary -->
        <div class="summary-column">
          <div class="card summary-card">
            <h2 class="card-title">Resumen financiero</h2>
            
            <div class="big-blue-box">
              <span class="box-label">Cuota mensual estimada</span>
              <span class="box-value">S/ {{ formatMoney(monthlyPayment) }}</span>
            </div>
            
            <div class="summary-list">
              <div class="summary-item">
                <span>Monto financiado</span>
                <span class="font-bold">S/ {{ formatMoney(loanAmount) }}</span>
              </div>
              <div class="summary-item">
                <span>TCEA</span>
                <span class="font-bold">{{ metrics.tcea.toFixed(2) }}%</span>
              </div>
              <div class="summary-item">
                <span>VAN</span>
                <span class="font-bold">S/ {{ formatMoney(metrics.van) }}</span>
              </div>
              <div class="summary-item">
                <span>TIR</span>
                <span class="font-bold">{{ metrics.tir.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="card table-card" v-if="schedule.length > 0">
        <div class="table-header">
          <span class="text-blue">Cronograma de pagos</span>
          <h2 class="card-title mt-1">Método francés vencido</h2>
        </div>
        
        <div class="table-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Tipo</th>
                <th>Saldo inicial</th>
                <th>Interés</th>
                <th>Amortización</th>
                <th>Seguro</th>
                <th class="highlight-col-header">Cuota total</th>
                <th>Saldo final</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in schedule" :key="item.month">
                <td>{{ item.month }}</td>
                <td>Cuota mensual</td>
                <td>S/ {{ formatMoney(item.initialBalance) }}</td>
                <td>S/ {{ formatMoney(item.interest) }}</td>
                <td>S/ {{ formatMoney(item.amortization) }}</td>
                <td>S/ {{ formatMoney(monthlyInsurance) }}</td>
                <td class="font-bold text-blue highlight-col">S/ {{ formatMoney(item.totalQuota) }}</td>
                <td>S/ {{ formatMoney(item.initialBalance - item.amortization) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { generateSchedule, effectiveAnnualToPeriod, calculateNPV, calculateIRR, calculateTCEA } from '../../domain/financialCalculations';

const currency = ref('PEN');
const vehiclePrice = ref(150000);
const downPayment = ref(1500);
const teaRate = ref(12);
const periods = ref(24);
const monthlyInsurance = ref(65);

const loanAmount = computed(() => vehiclePrice.value - downPayment.value);
const schedule = ref([]);
const metrics = ref({ van: 0, tir: 0, tcea: 0 });
const monthlyPayment = ref(0);

const handleCalculate = () => {
    const teaDecimal = teaRate.value / 100;
    const monthlyRate = effectiveAnnualToPeriod(teaDecimal, 12);
    
    schedule.value = generateSchedule({
        loanAmount: loanAmount.value,
        monthlyRate,
        periods: periods.value,
        monthlyInsuranceFixed: monthlyInsurance.value
    });
    
    if (schedule.value.length > 0) {
        monthlyPayment.value = schedule.value[0].totalQuota;
        
        const cashFlows = schedule.value.map(item => item.cashFlow ?? item.totalQuota);
        const discountRate = effectiveAnnualToPeriod(0.1, 12); // 10% COK test
        
        metrics.value.van = calculateNPV(loanAmount.value, cashFlows, discountRate);
        const mIRR = calculateIRR(loanAmount.value, cashFlows);
        metrics.value.tir = (Math.pow(1 + mIRR, 12) - 1) * 100;
        metrics.value.tcea = calculateTCEA(mIRR) * 100;
    }
};

const formatMoney = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Calcular inicialmente
handleCalculate();
</script>

<style scoped>
.simple-simulator-page {
  min-height: 100vh;
  background-color: #f3f6f9;
  font-family: 'Inter', sans-serif;
  color: #333;
  padding-bottom: 60px;
}

.header {
  background: white;
  padding: 20px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.logo-wrapper a {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0d52ff;
  letter-spacing: -0.05em;
}

.text-muted {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 4px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.simulator-main {
  margin-top: 40px;
}

.page-intro {
  margin-bottom: 40px;
}

.subtitle {
  color: #0d52ff;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  color: #0d276b; /* Dark blue from mockup */
  line-height: 1.1;
  margin-bottom: 16px;
}

.desc {
  color: #666;
  max-width: 500px;
  line-height: 1.5;
}

.simulator-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}

@media (min-width: 992px) {
  .simulator-grid {
    grid-template-columns: 3fr 2fr;
  }
}

.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #333;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
  background-color: #fafbfc;
}

.input:focus {
  outline: none;
  border-color: #0d52ff;
  background-color: white;
}

.input:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: #0d52ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #003cdb;
}

.mt-4 { margin-top: 24px; }
.mt-1 { margin-top: 8px; }

/* Right Summary Panel */
.big-blue-box {
  background-color: #0d52ff;
  color: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.box-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.box-value {
  font-size: 2.5rem;
  font-weight: 800;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
  color: #444;
}

.summary-item:last-child {
  border-bottom: none;
}

.font-bold { font-weight: 700; color: #222; }

/* Table */
.table-card {
  margin-top: 24px;
}

.text-blue { color: #0d52ff; }

.table-container {
  overflow-x: auto;
  margin-top: 24px;
}

table.styled-table {
  width: 100%;
  border-collapse: collapse;
}

.styled-table th {
  text-align: right;
  padding: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.styled-table th:first-child, .styled-table th:nth-child(2) { text-align: left; }

.styled-table td {
  text-align: right;
  padding: 16px;
  font-size: 0.85rem;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.styled-table td:first-child { text-align: left; font-weight: 600; color: #0f172a; }
.styled-table td:nth-child(2) { text-align: left; color: #475569; }

.highlight-col-header {
  background-color: #eff6ff !important;
  color: #1d4ed8 !important;
}

.highlight-col {
  background-color: #eff6ff !important;
}

.styled-table tbody tr:hover td {
  background-color: #f8fafc;
}
.styled-table tbody tr:hover td.highlight-col {
  background-color: #dbeafe !important;
}
</style>
