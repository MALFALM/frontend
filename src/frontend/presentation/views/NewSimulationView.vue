<template>
  <div class="wizard-page">
    <div class="wizard-container">
      
      <!-- Cabecera y Progreso -->
      <header class="wizard-header">
        <h1 class="wizard-title">Nueva Simulación</h1>
        <p class="wizard-subtitle">Configura tu crédito paso a paso</p>
        
        <div class="progress-container mt-4">
          <div class="progress-labels">
            <span>Paso {{ currentStep }} de {{ totalSteps }}</span>
            <span>{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: (currentStep / totalSteps) * 100 + '%' }"></div>
          </div>
        </div>
      </header>

      <!-- Cuerpo del Wizard -->
      <main class="wizard-body card">
        
        <!-- PASO 1: Datos del vehículo -->
        <div v-show="currentStep === 1" class="step-content">
          <h2 class="step-title">1. Datos del vehículo</h2>
          <p class="step-desc">Ingresa el precio del auto que deseas financiar.</p>

          <div class="form-group mt-4">
            <label>MONEDA</label>
            <div class="currency-selector">
              <button 
                class="currency-btn" 
                :class="{ active: currency === 'PEN' }" 
                @click="currency = 'PEN'">Soles (PEN)
              </button>
              <button 
                class="currency-btn" 
                :class="{ active: currency === 'USD' }" 
                @click="currency = 'USD'">Dólares (USD)
              </button>
            </div>
          </div>

          <div class="form-group mt-4">
            <label>PRECIO DEL VEHÍCULO</label>
            <div class="input-with-prefix giant-input">
              <span class="prefix">{{ currency === 'PEN' ? 'S/' : '$' }}</span>
              <input type="number" v-model="vehiclePrice" />
            </div>
          </div>
        </div>

        <!-- PASO 2: Entidad financiera -->
        <div v-show="currentStep === 2" class="step-content">
          <h2 class="step-title">2. Entidad Financiera</h2>
          <p class="step-desc">¿Deseas simular con las tasas reales de un banco o hacerlo manualmente?</p>

          <div class="form-group mt-4">
            <label>BANCO / ENTIDAD</label>
            <select v-model="selectedEntityId" class="giant-select">
              <option value="custom">Personalizado (Manual)</option>
              <option v-for="entity in financialEntities" :key="entity.id" :value="entity.id">
                {{ entity.name }}
              </option>
            </select>
          </div>

          <div class="form-group mt-4" v-if="selectedEntityId !== 'custom'">
            <label>PRODUCTO FINANCIERO</label>
            <select v-model="selectedProductId" class="giant-select">
              <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
            <div class="alert-box mt-4">
              <strong>¡Genial!</strong> Hemos cargado las tasas y políticas de seguro oficiales de este producto.
            </div>
          </div>
        </div>

        <!-- PASO 3: Cuota inicial y plazo -->
        <div v-show="currentStep === 3" class="step-content">
          <h2 class="step-title">3. Cuota inicial y plazo</h2>
          <p class="step-desc">Define cuánto pagarás hoy y en cuánto tiempo deseas cancelar el resto.</p>

          <div class="form-group mt-4">
            <label>CUOTA INICIAL (%)</label>
            <div class="slider-container">
              <input type="range" v-model="downPaymentPercentage" min="10" max="80" class="slider" />
              <div class="slider-values">
                <span class="font-bold text-blue">{{ downPaymentPercentage }}%</span>
                <span class="font-bold">Equivale a: {{ currency === 'PEN' ? 'S/' : '$' }} {{ formatMoney((vehiclePrice * downPaymentPercentage) / 100) }}</span>
              </div>
            </div>
          </div>

          <div class="form-group mt-4">
            <label>PLAZO DEL CRÉDITO</label>
            <select v-model="periods" class="giant-select">
              <option :value="12">12 meses (1 año)</option>
              <option :value="24">24 meses (2 años)</option>
              <option :value="36">36 meses (3 años)</option>
              <option :value="48">48 meses (4 años)</option>
              <option :value="60">60 meses (5 años)</option>
            </select>
          </div>
        </div>

        <!-- PASO 4: Tasas y Seguros -->
        <div v-show="currentStep === 4" class="step-content">
          <h2 class="step-title">4. Tasas, Seguros y Gastos</h2>
          <p class="step-desc">Verifica los costos asociados a tu crédito.</p>

          <div v-if="isProductLocked" class="locked-alert mb-4">
            🔒 Los campos están definidos automáticamente por <strong>{{ selectedEntityId.toUpperCase() }}</strong>.
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>TIPO DE TASA</label>
              <select v-model="rateType" class="giant-select" :disabled="isProductLocked">
                <option value="TEA">TEA</option>
                <option value="TNA">TNA</option>
              </select>
            </div>
            <div class="form-group">
              <label>VALOR (%)</label>
              <div class="input-with-suffix giant-input">
                <input type="number" v-model="rateValue" step="0.01" :disabled="isProductLocked" />
                <span class="suffix">%</span>
              </div>
            </div>
          </div>

          <div class="form-group mt-4">
            <label>SEGUROS INCLUIDOS</label>
            <div class="checkbox-cards">
              <label class="check-card" :class="{ disabled: isProductLocked }">
                <input type="checkbox" v-model="hasVehicularInsurance" :disabled="isProductLocked" />
                <div class="check-content">
                  <span class="font-bold">Seguro Vehicular</span>
                  <span class="text-sm text-muted">Aprox {{ vehicularInsurancePercentage }}% del auto</span>
                </div>
              </label>

              <label class="check-card" :class="{ disabled: isProductLocked }">
                <input type="checkbox" v-model="hasDesgravamen" :disabled="isProductLocked" />
                <div class="check-content">
                  <span class="font-bold">Desgravamen</span>
                  <span class="text-sm text-muted">{{ desgravamenRate }}% mensual al saldo</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- PASO 5: Resultado preliminar -->
        <div v-show="currentStep === 5" class="step-content">
          <h2 class="step-title">5. Tu Resultado Preliminar 🎉</h2>
          <p class="step-desc">Aquí tienes un vistazo rápido de cómo quedaría tu crédito.</p>

          <div class="result-box mt-4">
            <div class="result-item text-center">
              <span class="result-label">CUOTA MENSUAL ESTIMADA</span>
              <span class="result-value giant-value text-blue">
                {{ currency === 'PEN' ? 'S/' : '$' }} {{ formatMoney(metrics.monthlyPayment) }}
              </span>
            </div>
            
            <div class="result-grid mt-4">
              <div class="result-item">
                <span class="result-label">MONTO FINANCIADO</span>
                <span class="result-value">{{ currency === 'PEN' ? 'S/' : '$' }} {{ formatMoney(loanAmount) }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">TCEA (Costo Total)</span>
                <span class="result-value">{{ metrics.tcea.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      <!-- Footer de Controles -->
      <footer class="wizard-footer">
        <button 
          v-if="currentStep > 1" 
          @click="prevStep" 
          class="btn btn-secondary">
          Anterior
        </button>
        <div class="spacer"></div>
        <button 
          v-if="currentStep < totalSteps" 
          @click="nextStep" 
          class="btn btn-primary btn-large">
          Siguiente paso →
        </button>
        <div v-if="currentStep === totalSteps" class="action-buttons">
          <button @click="goToDashboard" class="btn btn-primary btn-large">
            Ver Dashboard Avanzado
          </button>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCreditSimulator } from '../../application/useCreditSimulator';

const router = useRouter();
const currentStep = ref(1);
const totalSteps = 5;

const {
  financialEntities,
  selectedEntityId,
  selectedProductId,
  availableProducts,
  isProductLocked,
  vehiclePrice,
  currency,
  downPaymentPercentage,
  periods,
  rateType,
  rateValue,
  hasVehicularInsurance,
  vehicularInsurancePercentage,
  hasDesgravamen,
  desgravamenRate,
  loanAmount,
  metrics
} = useCreditSimulator();

const nextStep = () => {
  if (currentStep.value < totalSteps) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const goToDashboard = () => {
  router.push('/inicio');
};

const formatMoney = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>

<style scoped>
.wizard-page {
  min-height: 100vh;
  background-color: #0d1117; /* Github dark theme base */
  color: #c9d1d9;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
}

.wizard-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.wizard-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}

.wizard-subtitle {
  color: #8b949e;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b949e;
  margin-bottom: 8px;
}

.progress-bar-bg {
  height: 8px;
  background-color: #21262d;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #3b82f6; /* Blue */
  transition: width 0.3s ease;
}

.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.step-content {
  animation: fadeInRight 0.3s ease;
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.step-desc {
  color: #8b949e;
  font-size: 0.95rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}
.form-row .form-group { flex: 1; margin-top: 0; }

label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b949e;
  letter-spacing: 0.05em;
}

/* Big UI Elements */
.giant-input input, .giant-select {
  width: 100%;
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s;
}

.giant-input input:focus, .giant-select:focus {
  border-color: #3b82f6;
}

.giant-input input:disabled, .giant-select:disabled {
  background-color: #21262d;
  color: #8b949e;
}

.input-with-prefix, .input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}
.input-with-prefix .prefix { position: absolute; left: 20px; color: #8b949e; font-size: 1.25rem; font-weight: 600;}
.input-with-prefix input { padding-left: 48px; }

.input-with-suffix .suffix { position: absolute; right: 20px; color: #8b949e; font-size: 1.25rem; font-weight: 600;}
.input-with-suffix input { padding-right: 48px; }

/* Currency Toggle */
.currency-selector {
  display: flex;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
}

.currency-btn {
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  color: #8b949e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.currency-btn.active {
  background-color: #21262d;
  color: #ffffff;
}

/* Slider */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider {
  width: 100%;
  accent-color: #3b82f6;
}

.slider-values {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.text-blue { color: #3b82f6; }
.font-bold { font-weight: 700; }

/* Alert Box */
.alert-box {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.locked-alert {
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}

/* Checkbox Cards */
.checkbox-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.check-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.check-card:hover:not(.disabled) {
  border-color: #8b949e;
}

.check-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.check-content {
  display: flex;
  flex-direction: column;
}

.text-sm { font-size: 0.8rem; }
.text-muted { color: #8b949e; }

/* Results */
.result-box {
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 32px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b949e;
}

.result-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.giant-value {
  font-size: 2.5rem;
}

.text-center { text-align: center; }

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
}

/* Footer Buttons */
.wizard-footer {
  display: flex;
  align-items: center;
  padding-top: 16px;
}

.spacer { flex: 1; }

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-large {
  padding: 16px 32px;
  font-size: 1.1rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover { background-color: #2563eb; }

.btn-secondary {
  background-color: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.btn-secondary:hover {
  background-color: #30363d;
  color: #ffffff;
}

.mt-4 { margin-top: 24px; }
.mb-4 { margin-bottom: 24px; }
</style>
