<template>
  <AuthLayout>
    <div class="login-view">
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'client' }" @click="tab = 'client'">Cliente</button>
        <button class="tab" :class="{ active: tab === 'bank' }" @click="tab = 'bank'">Entidad Financiera</button>
        <button class="tab" :class="{ active: tab === 'admin' }" @click="tab = 'admin'">Administrador</button>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <h2 class="view-title">{{ titles[tab] }}</h2>
        <p class="view-subtitle">{{ subtitles[tab] }}</p>

        <div class="form-group">
          <label>{{ tab === 'admin' ? 'Usuario / correo' : 'Correo electronico' }}</label>
          <input v-model.trim="username" :type="tab === 'admin' ? 'text' : 'email'" placeholder="correo@ejemplo.com" required class="input-field" />
        </div>

        <div class="form-group">
          <label>Contrasena</label>
          <div class="input-wrapper">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="********" required class="input-field password-field" />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-text">{{ successMessage }}</div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : buttonText }}
        </button>

        <button v-if="tab === 'admin'" type="button" class="btn btn-outline btn-block" :disabled="isLoading" @click="handleBootstrapAdmin">
          Crear primer admin
        </button>
      </form>

      <p v-if="tab === 'client'" class="auth-footer">
        No tienes cuenta? <router-link to="/register" class="link-primary font-bold">Registrate</router-link>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { useAuthStore } from '../../application/useAuthStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const tab = ref('client');
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const titles = {
  client: 'Bienvenido',
  bank: 'Portal Financiero',
  admin: 'Super Admin'
};

const subtitles = {
  client: 'Accede a tu simulador financiero y guarda tus escenarios.',
  bank: 'Administra productos y promociones de tu entidad financiera.',
  admin: 'Gestiona bancos, usuarios y seguridad de la plataforma.'
};

const buttonText = computed(() => {
  if (tab.value === 'bank') return 'Ingresar como entidad';
  if (tab.value === 'admin') return 'Ingresar a la consola';
  return 'Iniciar sesion';
});

watch(tab, () => {
  username.value = '';
  password.value = '';
  errorMessage.value = '';
  successMessage.value = '';
});

const redirectByRole = (role) => {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    router.push(redirect);
    return;
  }

  if (role === 'admin') router.push('/admin');
  else if (role === 'bank') router.push('/banco');
  else router.push('/inicio');
};

const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    const user = await authStore.login(username.value, password.value);
    redirectByRole(user.rol || user.role);
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo iniciar sesion';
  } finally {
    isLoading.value = false;
  }
};

const handleBootstrapAdmin = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!username.value || !password.value) {
    errorMessage.value = 'Ingresa usuario y contrasena para crear el primer admin.';
    return;
  }

  isLoading.value = true;

  try {
    await authStore.bootstrapAdmin({ username: username.value, password: password.value });
    successMessage.value = 'Admin creado. Ahora puedes iniciar sesion con estas credenciales.';
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo crear el admin inicial';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-view { width: 100%; max-width: 400px; margin: 0 auto; }
.tabs { display: flex; margin-bottom: 24px; background-color: #f1f5f9; border-radius: 8px; padding: 4px; }
.tab { flex: 1; padding: 10px; border: none; background: transparent; font-weight: 600; color: var(--text-secondary); border-radius: 6px; cursor: pointer; }
.tab.active { background-color: white; color: var(--primary-color); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.view-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
.view-subtitle { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.5; margin-bottom: 28px; }
.auth-form { display: flex; flex-direction: column; gap: 18px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.input-field { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; font-size: 0.9375rem; background-color: #f8fafc; }
.input-field:focus { outline: none; border-color: var(--primary-color); background-color: white; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.password-field { width: 100%; padding-right: 72px; }
.eye-btn { position: absolute; right: 10px; background: transparent; border: none; cursor: pointer; color: var(--primary-color); font-weight: 700; }
.btn-block { width: 100%; padding: 14px; }
.btn-outline { background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.error-text { color: #ef4444; font-size: 0.875rem; text-align: center; }
.success-text { color: #10b981; font-size: 0.875rem; text-align: center; }
.auth-footer { text-align: center; margin-top: 32px; font-size: 0.9375rem; color: var(--text-secondary); }
.link-primary { color: var(--primary-color); text-decoration: none; }
.link-primary:hover { text-decoration: underline; }
</style>
