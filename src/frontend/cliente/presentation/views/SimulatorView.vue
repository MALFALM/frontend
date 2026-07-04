<template>
  <div class="simulator-view">
    <div class="left-column">
      
      <!-- Panel Izquierdo: Configuración -->
      <div class="config-panel">
        <div class="panel-header">
          <h2>Configuración financiera</h2>
          <p>Ajusta los parámetros del crédito</p>
        </div>

      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'basico' }" @click="activeTab = 'basico'">Básico</button>
        <button class="tab" :class="{ active: activeTab === 'tasas' }" @click="activeTab = 'tasas'">Tasas</button>
        <button class="tab" :class="{ active: activeTab === 'seguros' }" @click="activeTab = 'seguros'">Seguros</button>
        <button class="tab" :class="{ active: activeTab === 'avanzado' }" @click="activeTab = 'avanzado'">Avanzado</button>
      </div>

      <!-- Tab Básico -->
      <div v-if="activeTab === 'basico'" class="tab-content">
        
        <div class="form-row">
          <div class="form-group">
            <label>ENTIDAD FINANCIERA</label>
            <select v-model="selectedEntityId">
              <option value="custom">Personalizado (Manual)</option>
              <option v-for="entity in financialEntities" :key="entity.id" :value="entity.id">
                {{ entity.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row" v-if="selectedEntityId !== 'custom'">
          <div class="form-group">
            <label>PRODUCTO VEHICULAR</label>
            <select v-model="selectedProductId">
              <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group mt-4">
          <label>PRECIO DEL VEHÍCULO</label>
          <div class="input-with-prefix">
            <span class="prefix">S/</span>
            <input type="number" v-model="vehiclePrice" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>MONEDA</label>
            <select v-model="currency">
              <option value="PEN">Soles</option>
              <option value="USD">Dólares</option>
            </select>
          </div>
          <div class="form-group">
            <label>PLAZO (MESES)</label>
            <select v-model="periods">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
              <option :value="48">48</option>
              <option :value="60">60</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>CUOTA INICIAL (Min: {{ minDownPaymentPercentage }}%)</label>
          <div class="dual-input">
            <div class="input-with-suffix" style="flex: 1;">
              <input type="number" v-model="downPaymentPercentage" :min="minDownPaymentPercentage" max="90" />
              <span class="suffix">%</span>
            </div>
            <div class="computed-value">
              S/ {{ formatMoney((vehiclePrice * downPaymentPercentage) / 100) }}
            </div>
          </div>
          <div class="range-slider mt-2">
            <input type="range" v-model="downPaymentPercentage" :min="minDownPaymentPercentage" max="90" class="slider" />
          </div>
        </div>
      </div>

      <!-- Tab Tasas -->
      <div v-if="activeTab === 'tasas'" class="tab-content">
        
        <div v-if="isProductLocked" class="locked-alert">
          🔒 Valores predefinidos por {{ selectedEntityId.toUpperCase() }}
        </div>

        <div class="form-group mt-2">
          <label>TIPO DE TASA</label>
          <select v-model="rateType" :disabled="isProductLocked">
            <option value="TEA">Tasa Efectiva Anual (TEA)</option>
            <option value="TNA">Tasa Nominal Anual (TNA)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>VALOR DE TASA</label>
          <div class="input-with-suffix">
            <input type="number" v-model="rateValue" step="0.01" :disabled="isProductLocked" />
            <span class="suffix">%</span>
          </div>
        </div>

        <div class="form-group mt-4" v-if="rateType === 'TNA'">
          <label>PERIODO DE CAPITALIZACIÓN</label>
          <select v-model="capitalization" :disabled="isProductLocked">
            <option :value="360">Diaria</option>
            <option :value="12">Mensual</option>
            <option :value="4">Trimestral</option>
            <option :value="2">Semestral</option>
          </select>
        </div>
      </div>

      <!-- Tab Seguros -->
      <div v-if="activeTab === 'seguros'" class="tab-content">
        <div v-if="isProductLocked" class="locked-alert">
          🔒 Políticas de seguros definidas por la entidad.
        </div>

        <div class="checkbox-group mt-2">
          <label class="checkbox-container">
            <input type="checkbox" v-model="hasVehicularInsurance" :disabled="isProductLocked" />
            <span class="checkmark" :class="{ 'disabled-check': isProductLocked }"></span>
            Seguro vehicular incluido
          </label>
          <p class="helper-text">Costo aproximado sobre el valor del vehículo mensualmente.</p>

          <label class="checkbox-container mt-4">
            <input type="checkbox" v-model="hasDesgravamen" :disabled="isProductLocked" />
            <span class="checkmark" :class="{ 'disabled-check': isProductLocked }"></span>
            Seguro de Desgravamen
          </label>
          
          <div class="form-group" style="margin-left: 30px;" v-if="hasDesgravamen">
            <label>TASA MENSUAL (SOBRE SALDO)</label>
            <div class="input-with-suffix">
              <input type="number" v-model="desgravamenRate" step="0.01" :disabled="isProductLocked" />
              <span class="suffix">%</span>
            </div>
          </div>

          <label class="checkbox-container mt-4">
            <input type="checkbox" v-model="hasPortes" :disabled="isProductLocked" />
            <span class="checkmark" :class="{ 'disabled-check': isProductLocked }"></span>
            Incluir Portes (Envío de estado de cuenta)
          </label>
        </div>
      </div>

      <!-- Tab Avanzado -->
      <div v-if="activeTab === 'avanzado'" class="tab-content">
        <div class="form-row">
          <div class="form-group">
            <label>GRACIA TOTAL</label>
            <select v-model="gracePeriodsTotal">
              <option :value="0">0 meses</option>
              <option :value="1">1 mes</option>
              <option :value="2">2 meses</option>
              <option :value="3">3 meses</option>
            </select>
            <p class="helper-text">No se paga ni capital ni interés.</p>
          </div>
          <div class="form-group">
            <label>GRACIA PARCIAL</label>
            <select v-model="gracePeriodsPartial">
              <option :value="0">0 meses</option>
              <option :value="1">1 mes</option>
              <option :value="2">2 meses</option>
              <option :value="3">3 meses</option>
            </select>
            <p class="helper-text">Solo se paga interés.</p>
          </div>
        </div>

        <div class="form-group mt-4">
          <label>VALOR RESIDUAL (COMPRA INTELIGENTE)</label>
          <div class="input-with-prefix">
            <span class="prefix">S/</span>
            <input type="number" v-model="residualValue" />
          </div>
          <p class="helper-text">Cuota balón a pagar al final del crédito para quedarte con el vehículo o renovarlo.</p>
        </div>
        <!-- Botón Simular Actual -->
        <button class="btn btn-primary btn-block mt-4">
          Simulación activa
        </button>
      </div> <!-- Cierra tab-content -->
    </div> <!-- Cierra config-panel -->

    <!-- Recuadro Guardar -->
    <div class="save-panel mt-4">
      <button class="btn btn-primary btn-block" @click="handleSave">
        Guardar Escenario
      </button>

      <div v-if="toast.show" class="toast-notification" :class="toast.type">
  <div class="toast-icon">
    {{ toast.type === 'success' ? '✓' : '!' }}
  </div>
  <div>
    <strong>{{ toast.title }}</strong>
    <p>{{ toast.message }}</p>
  </div>
</div>
    </div> <!-- Cierra save-panel -->

  </div> <!-- Cierra left-column -->

    <!-- Panel Derecho: Resultados -->
    <div class="results-panel">
      <!-- Tarjetas de resumen -->
      <div class="metrics-grid">
        <div class="metric-card bg-primary">
          <span class="metric-label">CUOTA MENSUAL (Aprox)</span>
          <span class="metric-value">{{ currency === 'PEN' ? 'S/' : '$' }} {{ formatMoney(metrics.monthlyPayment) }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">TCEA</span>
          <span class="metric-value highlight">{{ metrics.tcea.toFixed(2) }}%</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">TIR MENSUAL</span>
          <span class="metric-value">{{ (metrics.tir / 12).toFixed(2) }}%</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">VAN (COK 10%)</span>
          <span class="metric-value">{{ formatMoney(metrics.van) }}</span>
        </div>
      </div>

      <!-- Gráfico y Tips -->
      <div class="middle-section">
        <div class="chart-card">
          <div class="card-header">
            <div>
              <h3>Proyección del crédito</h3>
              <p>Evolución de saldo vs amortización</p>
            </div>
            <span class="badge">Método Francés Avanzado</span>
          </div>
          <div class="chart-container">
            <Bar :data="chartData" :options="chartOptions" v-if="chartData.labels.length > 0" />
          </div>
        </div>
        <div class="tips-column">
          <div class="tip-card">
            <span class="tip-icon">💡</span>
            <p>El interés total pagado representa aproximadamente el <strong>{{ ((totalInterest / vehiclePrice) * 100).toFixed(0) }}%</strong> del valor del vehículo.</p>
          </div>
          <div class="tip-card" v-if="residualValue > 0">
            <span class="tip-icon">🚗</span>
            <p>Tienes una <strong>Compra Inteligente</strong> activa. Al mes {{ periods }}, deberás pagar una cuota balón de <strong>S/ {{ formatMoney(residualValue) }}</strong> para liquidar el vehículo.</p>
          </div>
          <div class="tip-card" v-else>
            <span class="tip-icon">🛡️</span>
            <p>Tu crédito amortiza el 100% de la deuda. El vehículo será completamente tuyo al finalizar el mes {{ periods }}.</p>
          </div>
        </div>
      </div>

      <!-- Cronograma de pagos -->
      <div class="schedule-card">
        <div class="card-header">
          <h3>Cronograma de pagos</h3>
          <button class="btn-link" style="color: white !important;" @click="exportScheduleToPDF">
            Exportar en PDF
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>TIPO</th>
                <th>SALDO INI</th>
                <th>INTERÉS</th>
                <th>AMORTIZACIÓN</th>
                <th>SEGUROS</th>
                <th>CUOTA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in schedule.slice(0, 6)" :key="item.month">
                <td>{{ item.month }}</td>
                <td><span class="type-badge" :class="getTypeClass(item.type)">{{ item.type }}</span></td>
                <td><span class="currency">S/</span> {{ formatMoney(item.initialBalance) }}</td>
                <td><span class="currency">S/</span> {{ formatMoney(item.interest) }}</td>
                <td><span class="currency">S/</span> {{ formatMoney(item.amortization) }}</td>
                <td><span class="currency">S/</span> {{ formatMoney(item.insurance) }}</td>
                <td class="font-bold text-blue"><span class="currency">S/</span> {{ formatMoney(item.totalQuota) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCreditSimulator } from '../../application/useCreditSimulator';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';
import { saveCreditRequest } from '../../../shared/api/altoqueApi';
import { useAuthStore } from '../../../login/application/useAuthStore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const activeTab = ref('basico');

const {
  financialEntities,
  selectedEntityId,
  selectedProductId,
  availableProducts,
  isProductLocked,
  
  vehiclePrice,
  currency,
  downPaymentPercentage,
  minDownPaymentPercentage,
  periods,
  rateType,
  rateValue,
  capitalization,
  hasVehicularInsurance,
  hasDesgravamen,
  desgravamenRate,
  gracePeriodsTotal,
  gracePeriodsPartial,
  residualValue,
  hasPortes,
  
  loanAmount,
  monthlyInsuranceFixed,
  schedule,
  metrics,
  saveCurrentSimulation
} = useCreditSimulator();

const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
});

const showToast = (type, title, message) => {
  toast.value = {
    show: true,
    type,
    title,
    message
  };

  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const authStore = useAuthStore();
const isSaving = ref(false);

const handleSave = async () => {
  try {
    isSaving.value = true;

    const currentUser = authStore.user.value;

    if (!currentUser || !currentUser.id_user) {
      throw new Error('Debes iniciar sesión antes de guardar la simulación.');
    }

    const timestamp = Date.now().toString().slice(-8);

    const payload = {
      userId: currentUser.id_user,
      cliente: {
        tipoDocumento: 'DNI',
        numeroDocumento: timestamp,
        nombres: currentUser.username || 'Cliente',
        apellidos: 'Simulado',
        telefono: `9${timestamp}`,
        ingresoMensual: 3500,
        correo: `${currentUser.username || 'cliente'}${timestamp}@altoque.com`
      },
      vehiculo: {
        marca: 'Vehículo',
        modelo: 'Simulado',
        yearFabricacion: '2026',
        precioVenta: Number(vehiclePrice.value),
        tipoMoneda: currency.value
      },
      credito: {
        vehiclePrice: Number(vehiclePrice.value),
        currency: currency.value,
        downPaymentPercentage: Number(downPaymentPercentage.value),
        periods: Number(periods.value),
        rateType: rateType.value,
        rateValue: Number(rateValue.value),
        capitalization: Number(capitalization.value),
        hasVehicularInsurance: hasVehicularInsurance.value,
        vehicularInsurancePercentage: 0,
        hasDesgravamen: hasDesgravamen.value,
        desgravamenRate: Number(desgravamenRate.value),
        hasPortes: hasPortes.value,
        portesValue: 0,
        gracePeriodsTotal: Number(gracePeriodsTotal.value),
        gracePeriodsPartial: Number(gracePeriodsPartial.value),
        residualValue: Number(residualValue.value)
      },
      summary: {
        loanAmount: Number(loanAmount.value),
        monthlyRate: 0,
        monthlyPayment: Number(metrics.value.monthlyPayment),
        van: Number(metrics.value.van),
        tirMonthly: Number(metrics.value.tir / 12),
        tirAnnual: Number(metrics.value.tir),
        tcea: Number(metrics.value.tcea),
        totalPaid: schedule.value.reduce((sum, item) => sum + item.totalQuota, 0),
        totalInterest: schedule.value.reduce((sum, item) => sum + item.interest, 0),
        totalDesgravamen: schedule.value.reduce((sum, item) => sum + (item.desgravamen || 0), 0),
        totalFixedCharges: 0
      },
      schedule: schedule.value.map((item) => ({
        ...item,
        finalBalance: Number(item.finalBalance ?? (item.initialBalance - item.amortization)),
        desgravamen: Number(item.desgravamen ?? 0),
        fixedCharges: Number(item.fixedCharges ?? 0),
        insurance: Number(item.insurance ?? 0),
        totalQuota: Number(item.totalQuota ?? 0),
        interest: Number(item.interest ?? 0),
        amortization: Number(item.amortization ?? 0),
        initialBalance: Number(item.initialBalance ?? 0)
      }))
    };

    await saveCreditRequest(payload);

    saveCurrentSimulation();

    showToast(
      'success',
      'Simulación guardada',
      'Tu escenario fue guardado correctamente'
    );
   
  } catch (error) {
   showToast(
    'error',
    'No se pudo guardar',
    error.message || 'Ocurrió un error al guardar la simulación.'
  );
  } finally {
    isSaving.value = false;
   
  }
};

const exportScheduleToPDF = () => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const logoX = pageWidth - 50;
  const logoY = 12;
  const scale = 0.25;

  doc.setFillColor(59, 130, 246);
  doc.lines(
    [[-16, 32], [8, 0], [8, -16], [8, 16], [8, 0], [-16, -32]],
    logoX + 20 * scale,
    logoY + 4 * scale,
    [scale, scale],
    'F'
  );

  doc.setFillColor(0, 180, 216);
  doc.lines(
    [[26, -10], [-3, -5], [-26, 10], [3, 5]],
    logoX + 9 * scale,
    logoY + 25 * scale,
    [scale, scale],
    'F'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Altoque', logoX + 12, logoY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(139, 148, 158);
  doc.text('PREMIUM FINTECH', logoX + 12, logoY + 9);

  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Cronograma de Pagos', 14, 22);

  doc.setFontSize(11);
  doc.text(
    `Vehículo: ${currency.value === 'PEN' ? 'S/' : '$'} ${formatMoney(vehiclePrice.value)} | Plazo: ${periods.value} meses`,
    14,
    30
  );

  const scheduleBody = schedule.value.map(row => [
    row.month,
    row.type,
    `${currency.value === 'PEN' ? 'S/' : '$'} ${formatMoney(row.initialBalance)}`,
    `${currency.value === 'PEN' ? 'S/' : '$'} ${formatMoney(row.interest)}`,
    `${currency.value === 'PEN' ? 'S/' : '$'} ${formatMoney(row.amortization)}`,
    `${currency.value === 'PEN' ? 'S/' : '$'} ${formatMoney(row.insurance)}`,
    `${currency.value === 'PEN' ? 'S/' : '$'} ${formatMoney(row.totalQuota)}`
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['N°', 'Tipo', 'Saldo Ini.', 'Interés', 'Amortización', 'Seguros', 'Cuota']],
    body: scheduleBody,
    theme: 'grid',
    headStyles: { fillColor: [33, 38, 45] },
    styles: { fontSize: 9 }
  });

  doc.save('Cronograma_Pagos.pdf');
};

const formatMoney = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const totalInterest = computed(() => {
  return schedule.value.reduce((acc, curr) => acc + curr.interest, 0);
});

const getTypeClass = (type) => {
  if (type === 'Gracia Total') return 'badge-danger';
  if (type === 'Gracia Parcial') return 'badge-warning';
  return 'badge-normal';
};

// Chart.js Configuration
const chartData = computed(() => {
  if (!schedule.value.length) return { labels: [], datasets: [] };
  
  const dataPoints = schedule.value;
  
  return {
    labels: dataPoints.map(s => `Mes ${s.month}`),
    datasets: [
      {
        label: 'Saldo Restante',
        backgroundColor: '#1e3a8a',
        data: dataPoints.map(s => s.initialBalance - s.amortization),
        barPercentage: 0.5
      },
      {
        label: 'Amortización Acumulada',
        backgroundColor: '#bfdbfe',
        data: dataPoints.map(s => {
          return schedule.value.slice(0, s.month).reduce((acc, curr) => acc + curr.amortization, 0);
        }),
        barPercentage: 0.5
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      grid: { display: false, color: '#30363d' },
      ticks: { color: '#8b949e', maxTicksLimit: 12 }
    },
    y: {
      stacked: true,
      grid: { color: '#30363d', borderDash: [5, 5] },
      ticks: { color: '#8b949e', callback: (value) => 'S/' + (value/1000) + 'k' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += 'S/ ' + formatMoney(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
};
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 320px;
  max-width: 420px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 16px;
  color: #ffffff;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  animation: slideInToast 0.25s ease-out;
}

.toast-notification.success {
  background: #16a34a;
}

.toast-notification.error {
  background: #dc2626;
}

.toast-icon {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.toast-notification strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 4px;
}

.toast-notification p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.95;
}

@keyframes slideInToast {
  from {
    opacity: 0;
    transform: translateY(-12px) translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}

.btn-link {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
  color: #60a5fa;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.simulator-view {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

@media (max-width: 1024px) {
  .simulator-view {
    flex-direction: column;
  }
}

/* Left Column Layout */
.left-column {
  width: 380px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Config Panel */
.config-panel {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Save Panel */
.save-panel {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.panel-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.panel-header p {
  font-size: 0.875rem;
  color: #8b949e;
}

.tabs {
  display: flex;
  background-color: #0d1117;
  border-radius: 8px;
  padding: 4px;
}

.tab {
  flex: 1;
  background: transparent;
  border: none;
  color: #8b949e;
  padding: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background-color: #21262d;
  color: #c9d1d9;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #8b949e;
  letter-spacing: 0.05em;
}

.helper-text {
  font-size: 0.7rem;
  color: #8b949e;
  line-height: 1.4;
  margin-top: 4px;
}

input[type="number"], select {
  width: 100%;
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #e6edf3;
  padding: 10px 12px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
}

input[type="number"]:focus, select:focus {
  border-color: #3b82f6;
}

input:disabled, select:disabled {
  background-color: #21262d;
  color: #8b949e;
  cursor: not-allowed;
  border-color: #30363d;
}

.locked-alert {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-prefix .prefix {
  position: absolute;
  left: 12px;
  color: #8b949e;
}

.input-with-prefix input {
  padding-left: 32px;
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-suffix .suffix {
  position: absolute;
  right: 12px;
  color: #8b949e;
}

.input-with-suffix input {
  padding-right: 32px;
}

.dual-input {
  display: flex;
  align-items: center;
  gap: 16px;
}

.computed-value {
  flex: 1;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 600;
  color: #e6edf3;
}

.slider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background-color: #30363d;
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.mt-4 { margin-top: 16px; }
.mt-auto { margin-top: auto; }

/* Custom Checkbox */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: #c9d1d9;
  cursor: pointer;
  text-transform: none;
  font-weight: 500;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-container input:checked ~ .checkmark.disabled-check {
  background-color: #4b5563;
  border-color: #4b5563;
}

.checkbox-container input:checked ~ .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
}

.btn-block {
  width: 100%;
  padding: 12px;
}

/* Results Panel */
.results-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #8b949e;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.metric-value.highlight {
  color: #3b82f6;
}

.metric-sub {
  font-size: 0.75rem;
  color: #8b949e;
}

.text-success { color: #10b981; }
.text-blue { color: #3b82f6; }

.middle-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .middle-section {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-header p {
  font-size: 0.875rem;
  color: #8b949e;
}

.badge {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.chart-container {
  height: 250px;
  width: 100%;
}

.tips-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.tip-icon {
  font-size: 1.5rem;
}

.tip-card p {
  font-size: 0.875rem;
  color: #c9d1d9;
  line-height: 1.5;
}

.tip-card strong {
  color: #ffffff;
}

.schedule-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
}

.btn-ghost {
  background: transparent;
  color: #c9d1d9;
  border: none;
}

.btn-ghost:hover {
  color: #ffffff;
}

.table-container {
  overflow-x: auto;
  max-height: 500px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: right;
  padding: 12px 16px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #8b949e;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #30363d;
  position: sticky;
  top: 0;
  background-color: #161b22;
  z-index: 10;
}

th:first-child, th:nth-child(2) { text-align: left; }

td {
  text-align: right;
  padding: 16px;
  font-size: 0.95rem;
  color: #e6edf3;
  border-bottom: 1px solid #30363d;
}

td:first-child { text-align: left; font-weight: 600; }
td:nth-child(2) { text-align: left; }

.currency {
  font-size: 0.75rem;
  color: #8b949e;
  margin-right: 4px;
}

.font-bold { font-weight: 600; color: #ffffff; }

/* Badges for Type */
.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge-normal {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.badge-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.badge-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
</style>
