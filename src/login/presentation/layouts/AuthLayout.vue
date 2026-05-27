<template>
  <div class="auth-container">
    <div class="auth-box">
      <!-- Left Branding Panel -->
      <div class="auth-branding">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4L4 36H12L20 20L28 36H36L20 4Z" fill="white"/>
            <path d="M9 25L35 15L32 10L6 20L9 25Z" fill="#00b4d8"/>
          </svg>
          <span class="logo-text-white">ALTOQUE</span>
        </div>
        
        <h1 class="branding-title">Simula créditos vehiculares de forma inteligente</h1>
        <p class="branding-desc">
          Calcula TCEA, VAN, TIR y cronogramas financieros en segundos con una experiencia fintech moderna y profesional.
        </p>
        
        <!-- Mock Resumen Financiero -->
        <div class="mock-card">
          <div class="mock-card-header">
            <span>Resumen financiero</span>
            <span class="badge-active">Activo</span>
          </div>
          <div class="mock-grid">
            <div class="mock-item">
              <span class="mock-label">TCEA</span>
              <span class="mock-value">14.2%</span>
            </div>
            <div class="mock-item">
              <span class="mock-label">VAN</span>
              <span class="mock-value text-success">S/ 8,520</span>
            </div>
            <div class="mock-item">
              <span class="mock-label">TIR</span>
              <span class="mock-value text-primary">18.6%</span>
            </div>
            <div class="mock-item">
              <span class="mock-label">CUOTA MENSUAL</span>
              <span class="mock-value">S/ 1,850</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Form Panel (Router View) -->
      <div class="auth-form-panel">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-color: #1a202c; /* Dark background */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .auth-box {
    flex-direction: row;
    min-height: 600px;
  }
}

.auth-branding {
  flex: 1;
  background-color: #0f172a;
  color: white;
  padding: 48px;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

.logo-text-white {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: white;
}

.branding-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
}

.branding-desc {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 40px;
}

/* Mock Card */
.mock-card {
  background-color: #1e293b;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #334155;
}

.mock-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.badge-active {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
}

.mock-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mock-item {
  background-color: #0f172a;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mock-label {
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.mock-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.text-success { color: #10b981; }
.text-primary { color: #3b82f6; }

/* Right Panel */
.auth-form-panel {
  flex: 1;
  background-color: #ffffff;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
