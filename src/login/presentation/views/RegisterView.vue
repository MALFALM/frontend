<template>
  <AuthLayout>
    <div class="register-view">
      <h2 class="view-title">Crea tu cuenta</h2>
      <p class="view-subtitle">Empieza a simular créditos en minutos.</p>
      
      <div class="role-selector">
        <button 
          type="button"
          class="role-btn" 
          :class="{ active: role === 'cliente' }" 
          @click="role = 'cliente'"
        >
          Cliente
        </button>

        <button 
          type="button"
          class="role-btn" 
          :class="{ active: role === 'entidad' }" 
          @click="role = 'entidad'"
        >
          Entidad financiera
        </button>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Nombre completo</label>
          <input
            v-model="fullName"
            type="text"
            placeholder="Ej: Juan Pérez"
            required
            class="input-field"
          />
        </div>
        
        <div class="form-group">
          <label>Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            placeholder="correo@ejemplo.com"
            required
            class="input-field"
          />

          <span v-if="role === 'entidad'" class="field-hint">
            Usa el correo corporativo proporcionado por el banco.
          </span>
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="input-field"
          />
        </div>
        
        <div class="form-group">
          <label>Confirmar contraseña</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            class="input-field"
          />
        </div>
        
        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
      </form>
      
      <p class="auth-footer">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="link-primary font-bold">
          Inicia sesión
        </router-link>
      </p>

      <div v-if="toastMessage" class="toast-notification" :class="toastType">
        {{ toastMessage }}
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { registerRequest } from '../../../frontend/shared/api/altoqueApi.js';

const router = useRouter();
const role = ref('cliente');
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const toastMessage = ref('');
const toastType = ref('success');
const isLoading = ref(false);

const showToast = (message, type = 'success') => {
  toastMessage.value = message;
  toastType.value = type;

  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
};

const getBackendRole = () => {
  if (role.value === 'entidad') return 'bank';
  return 'client';
};

const handleRegister = async () => {
  try {
    toastMessage.value = '';
    isLoading.value = true;

    if (!fullName.value.trim()) {
      throw new Error('Ingresa tu nombre completo');
    }

    if (!email.value.trim()) {
      throw new Error('Ingresa tu correo electrónico');
    }

    if (password.value !== confirmPassword.value) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (password.value.length < 8) {
      throw new Error('La contraseña debe tener mínimo 8 caracteres');
    }

    await registerRequest({
      username: email.value,
      password: password.value,
      rol: getBackendRole(),
      name: fullName.value
    });

    showToast('Cuenta creada correctamente', 'success');

    setTimeout(() => {
      router.push('/login');
    }, 1000);
  } catch (error) {
    showToast(error.message || 'No se pudo crear la cuenta', 'error');
  } finally {
    isLoading.value = false;
  }
};


const handleGoogleRegister = () => {
  router.push('/inicio');
};
</script>

<style scoped>
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 14px 18px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: slideIn 0.25s ease-out;
}

.toast-notification.success {
  background-color: #16a34a;
}

.toast-notification.error {
  background-color: #dc2626;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
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

.google-icon {
  width: 20px;
  height: 20px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
