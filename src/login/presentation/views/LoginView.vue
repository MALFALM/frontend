<template>
  <AuthLayout>
    <div class="login-view">
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'client' }" @click="tab = 'client'">Cliente</button>
        <button class="tab" :class="{ active: tab === 'bank' }" @click="tab = 'bank'">Entidad Financiera</button>
        <button class="tab" :class="{ active: tab === 'admin' }" @click="tab = 'admin'">Administrador</button>
      </div>

      <!-- CLIENTE -->
      <div v-if="tab === 'client'" class="tab-content">
        <h2 class="view-title">Bienvenido</h2>
        <p class="view-subtitle">
          Accede a tu simulador financiero y empieza a analizar créditos vehiculares al instante.
        </p>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input
              v-model="username"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              class="input-field"
            />
          </div>
          
          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <input
                v-model="password"
                :type="showClientPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="input-field"
                style="width: 100%; padding-right: 40px;"
              />
              <button type="button" class="eye-btn" @click="showClientPassword = !showClientPassword">
                {{ showClientPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" class="link-primary">¿Olvidaste tu contraseña?</a>
          </div>

          <p v-if="errorMessage" class="error-text">
            {{ errorMessage }}
          </p>
          
          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>
        
        <p class="auth-footer">
          ¿No tienes cuenta?
          <router-link to="/register" class="link-primary font-bold">Regístrate</router-link>
        </p>
      </div>

      <!-- ENTIDAD FINANCIERA -->
      <div v-if="tab === 'bank'" class="tab-content">
        <h2 class="view-title">Portal Financiero</h2>
        <p class="view-subtitle">
          Ingresa con tu cuenta corporativa para administrar tus productos y campañas.
        </p>
        
        <form @submit.prevent="handleBankLoginSubmit" class="auth-form">
          <div class="form-group">
            <label>Correo corporativo</label>
            <input
              v-model="bankEmail"
              type="email"
              placeholder="correo@banco.com.pe"
              required
              class="input-field"
            />
          </div>
          
          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <input
                v-model="bankPassword"
                :type="showBankPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="input-field"
                style="width: 100%; padding-right: 40px;"
              />
              <button type="button" class="eye-btn" @click="showBankPassword = !showBankPassword">
                {{ showBankPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" class="link-primary">¿Olvidaste tu contraseña?</a>
          </div>

          <p v-if="bankLoginError" class="error-text">
            {{ bankLoginError }}
          </p>
          
          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            {{ isLoading ? 'Ingresando...' : 'Ingresar como Entidad' }}
          </button>
        </form>
      </div>

      <!-- ADMIN -->
      <div v-if="tab === 'admin'" class="tab-content">
        <h2 class="view-title">Super Admin</h2>
        <p class="view-subtitle">
          Acceso exclusivo para el administrador global de la plataforma.
        </p>
        
        <form @submit.prevent="handleAdminLogin" class="auth-form">
          <div class="form-group">
            <label>Usuario / Correo</label>
            <input
              v-model="adminUsername"
              type="text"
              placeholder="admin@altoque.com"
              required
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label>Contraseña maestra</label>
            <div class="input-wrapper">
              <input
                v-model="adminPassword"
                :type="showAdminPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="input-field"
                style="width: 100%; padding-right: 40px;"
              />
              <button type="button" class="eye-btn" @click="showAdminPassword = !showAdminPassword">
                {{ showAdminPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <p v-if="adminLoginError" class="error-text">
            {{ adminLoginError }}
          </p>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            style="background-color: #000; border-color: #000;"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Ingresando...' : 'Ingresar a la Consola' }}
          </button>
        </form>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { useAuthStore } from '../../application/useAuthStore';
import {loginRequest} from '../../../frontend/shared/api/altoqueApi';

const router = useRouter();
const authStore = useAuthStore();
const tab = ref('client');

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const showClientPassword = ref(false);
const showBankPassword = ref(false);
const showAdminPassword = ref(false);

const bankEmail = ref('');
const bankPassword = ref('');
const bankLoginError = ref('');

const adminUsername = ref('');
const adminPassword = ref('');
const adminLoginError = ref('');


const redirectByRole = (user) => {
  const role = (user?.rol || user?.role || '').toLowerCase();

  if (role === 'admin') {
    router.push('/admin');
  } else if (role === 'bank' || role === 'asesor' || role === 'entidad') {
    router.push('/banco');
  } else {
    router.push('/inicio');
  }
};

const loginWithBackend = async (loginUsername, loginPassword, errorRef) => {
  try {
    isLoading.value = true;
    errorRef.value = '';

    const data = await loginRequest(loginUsername, loginPassword);

    authStore.loginWithBackend({
      token: data.token,
      user: data.user
    });

    redirectByRole(data.user);
  } catch (error) {
    errorRef.value = error.message || 'No se pudo iniciar sesión';
  } finally {
    isLoading.value = false;
  }
};

const handleLogin = () => {
  loginWithBackend(username.value, password.value, errorMessage);
};

const handleBankLoginSubmit = () => {
  loginWithBackend(bankEmail.value, bankPassword.value, bankLoginError);
};

const handleAdminLogin = () => {
  loginWithBackend(adminUsername.value, adminPassword.value, adminLoginError);
};
</script>

<style scoped>
.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 8px;
}

.mt-2 {
  margin-top: 16px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-view {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  margin-bottom: 24px;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background-color: white;
  color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.input-field {
  padding: 12px 16px;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
}

.link-primary {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 14px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
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
}

.google-icon {
  width: 20px;
  height: 20px;
}

.auth-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.bank-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bank-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  font-size: 1rem;
  border: 2px solid transparent;
  background-color: white;
  transition: all 0.2s;
}

.bank-btn .icon {
  font-size: 1.25rem;
}
</style>
