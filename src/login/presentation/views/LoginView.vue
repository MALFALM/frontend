<template>
  <AuthLayout>
    <div class="login-view">
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'client' }" @click="tab = 'client'">Cliente</button>
        <button class="tab" :class="{ active: tab === 'bank' }" @click="tab = 'bank'">Entidad Financiera</button>
        <button class="tab" :class="{ active: tab === 'admin' }" @click="tab = 'admin'">Administrador</button>
      </div>

      <div v-if="tab === 'client'" class="tab-content">
        <h2 class="view-title">Bienvenido</h2>
        <p class="view-subtitle">Accede a tu simulador financiero y empieza a analizar créditos vehiculares al instante.</p>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" required class="input-field" />
          </div>
          
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" required class="input-field" />
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" class="link-primary">¿Olvidaste tu contraseña?</a>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block">Iniciar sesión</button>
        </form>
        
        <div class="divider">
          <span>o continuar con</span>
        </div>
        
        <button class="btn btn-outline btn-block google-btn" @click="handleGoogleLogin">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="google-icon" />
          Continuar con Google
        </button>
        
        <p class="auth-footer">
          ¿No tienes cuenta? <router-link to="/register" class="link-primary font-bold">Regístrate</router-link>
        </p>
      </div>

      <div v-if="tab === 'bank'" class="tab-content">
        <h2 class="view-title">Portal Financiero</h2>
        <p class="view-subtitle">Selecciona tu entidad financiera para administrar tus productos y campañas.</p>
        
        <div class="bank-options">
          <button 
            v-for="entity in entitiesStore.entities" 
            :key="entity.id"
            class="btn btn-block bank-btn" 
            :style="{ borderColor: entity.themeColor, color: entity.themeColor }"
            @click="handleBankLogin(entity.id)"
            @mouseover="e => { e.target.style.backgroundColor = entity.themeColor; e.target.style.color = 'white'; }"
            @mouseleave="e => { e.target.style.backgroundColor = 'white'; e.target.style.color = entity.themeColor; }"
          >
            <span class="icon">🏦</span> Ingresar como {{ entity.name }}
          </button>
        </div>
      </div>

      <div v-if="tab === 'admin'" class="tab-content">
        <h2 class="view-title">Super Admin</h2>
        <p class="view-subtitle">Acceso exclusivo para el administrador global de la plataforma.</p>
        
        <form @submit.prevent="handleAdminLogin" class="auth-form">
          <div class="form-group">
            <label>Usuario / Correo</label>
            <input type="text" placeholder="admin@altoque.com" required class="input-field" />
          </div>
          <div class="form-group">
            <label>Contraseña maestra</label>
            <input type="password" placeholder="••••••••" required class="input-field" />
          </div>
          <button type="submit" class="btn btn-primary btn-block" style="background-color: #000; border-color: #000;">Ingresar a la Consola</button>
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
import { useEntitiesStore } from '../../../frontend/entidad-financiera/application/useEntitiesStore';

const router = useRouter();
const authStore = useAuthStore();
const entitiesStore = useEntitiesStore();
const tab = ref('client');

const handleLogin = () => {
  authStore.loginAsClient('Alex Mercer', 'alex@ejemplo.com');
  router.push('/inicio');
};

const handleGoogleLogin = () => {
  authStore.loginAsClient('Alex Mercer', 'alex@gmail.com');
  router.push('/inicio');
};

const handleBankLogin = (bankId) => {
  authStore.loginAsBank(bankId);
  router.push('/banco');
};

const handleAdminLogin = () => {
  authStore.loginAsAdmin();
  router.push('/admin');
};
</script>

<style scoped>
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
