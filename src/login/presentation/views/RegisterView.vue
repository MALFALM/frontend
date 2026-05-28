<template>
  <AuthLayout>
    <div class="register-view">
      <h2 class="view-title">Crea tu cuenta</h2>
      <p class="view-subtitle">Empieza a simular créditos en minutos.</p>
      
      <div class="role-selector">
        <button 
          class="role-btn" 
          :class="{ active: role === 'cliente' }" 
          @click="role = 'cliente'"
        >Cliente</button>
        <button 
          class="role-btn" 
          :class="{ active: role === 'entidad' }" 
          @click="role = 'entidad'"
        >Entidad financiera</button>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Nombre completo</label>
          <input 
          type="text" 
          v-model="fullName"
          placeholder="Ej: Juan Pérez" 
          required 
          class="input-field" 
          />
        </div>
        
        <div class="form-group">
          <label>Correo electrónico</label>
          <input
          type="email" 
          v-model="email"
          placeholder="correo@ejemplo.com" 
          required 
          class="input-field" 
          />
          <span v-if="role === 'entidad'" class="field-hint">Usa el correo corporativo proporcionado por el banco.</span>
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input 
          type="password" 
          v-model="password"
          placeholder="••••••••" 
          required 
          class="input-field" 
          />
        </div>
        
        <div class="form-group">
          <label>Confirmar contraseña</label>
          <input 
          type="password" 
          v-model="confirmPassword"
          placeholder="••••••••" 
          required 
          class="input-field" 
          />
        </div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">Crear cuenta</button>
      </form>
      
      <div class="divider">
        <span>o continuar con</span>
      </div>
      
      <button class="btn btn-outline btn-block google-btn" @click="handleGoogleRegister">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="google-icon" />
        Continuar con Google
      </button>
      
      <p class="auth-footer">
        ¿Ya tienes cuenta? <router-link to="/login" class="link-primary font-bold">Inicia sesión</router-link>
      </p>
    </div>

    <div 
    v-if="toast.show" 
    class="toast-message"
    :class="toast.type">
    {{ toast.message }}
    </div>

  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

const router = useRouter();
const role = ref('cliente');

const API_URL = import.meta.env.VITE_API_URL;

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  };

  setTimeout(() => {
    toast.value.show = false;
  }, 2500);
};

const handleRegister = async () => {

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener mínimo 8 caracteres.';
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email.value,
        password: password.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo crear la cuenta.');
    }
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    loading.value = false;
  }
};

const handleGoogleRegister = () => {
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
