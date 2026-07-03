<template>
  <AuthLayout>
    <div class="register-view">
      <h2 class="view-title">Crea tu cuenta</h2>
      <p class="view-subtitle">Empieza a simular créditos en minutos.</p>
      

      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" placeholder="Ej: Juan Pérez" required class="input-field" />
        </div>
        
        <div class="form-group">
          <label>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" required class="input-field" />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <div class="input-wrapper">
            <input :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="input-field" style="width: 100%; padding-right: 40px;" />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Confirmar contraseña</label>
          <div class="input-wrapper">
            <input :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" required class="input-field" style="width: 100%; padding-right: 40px;" />
            <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary btn-block">Crear cuenta</button>
      </form>
      

      
      <p class="auth-footer">
        ¿Ya tienes cuenta? <router-link to="/login" class="link-primary font-bold">Inicia sesión</router-link>
      </p>
    </div>

    <!-- Modal de Términos y Condiciones -->
    <div class="modal-overlay" v-if="showTermsModal">
      <div class="modal-content">
        <h3>Términos y Condiciones</h3>
        <div class="terms-text">
          <p>Al utilizar Altoque, aceptas nuestros términos de servicio y política de privacidad.</p>
          <p>Tus datos personales, incluyendo tu nombre y correo electrónico, serán utilizados únicamente para proporcionarte simulaciones vehiculares precisas y permitir la comunicación con las entidades financieras que tú autorices.</p>
          <p>No compartiremos tu información con terceros sin tu consentimiento explícito.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showTermsModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="acceptAndRegister">Aceptar y Continuar</button>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';

const router = useRouter();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showTermsModal = ref(false);

const handleRegister = () => {
  showTermsModal.value = true;
};

const acceptAndRegister = () => {
  showTermsModal.value = false;
  router.push('/inicio');
};
</script>

<style scoped>
.register-view {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

.role-selector {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.role-btn {
  flex: 1;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.2s;
}

.role-btn.active {
  background-color: white;
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.input-field {
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9375rem;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: white;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.link-primary {
  color: var(--primary-color);
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: var(--text-light);
  font-size: 0.875rem;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 16px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-primary);
  font-weight: 600;
  border-color: var(--border-color);
  padding: 10px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-btn:hover {
  opacity: 1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-content h3 {
  margin-top: 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.terms-text {
  margin: 16px 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.terms-text p {
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
