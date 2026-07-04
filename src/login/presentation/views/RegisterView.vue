<template>
  <AuthLayout>
    <div class="register-view">
      <h2 class="view-title">Crea tu cuenta</h2>
      <p class="view-subtitle">Empieza a simular creditos en minutos.</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model.trim="fullName" type="text" placeholder="Ej: Juan Perez" required class="input-field" />
        </div>

        <div class="form-group">
          <label>Correo electronico</label>
          <input v-model.trim="email" type="email" placeholder="correo@ejemplo.com" required class="input-field" />
        </div>

        <div class="form-group">
          <label>Contrasena</label>
          <div class="input-wrapper">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="********" required class="input-field password-field" />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">{{ showPassword ? 'Ocultar' : 'Ver' }}</button>
          </div>
        </div>

        <div class="form-group">
          <label>Confirmar contrasena</label>
          <div class="input-wrapper">
            <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="********" required class="input-field password-field" />
            <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">{{ showConfirmPassword ? 'Ocultar' : 'Ver' }}</button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">{{ isLoading ? 'Creando...' : 'Crear cuenta' }}</button>
      </form>

      <p class="auth-footer">
        Ya tienes cuenta? <router-link to="/login" class="link-primary font-bold">Inicia sesion</router-link>
      </p>
    </div>

    <div class="modal-overlay" v-if="showTermsModal">
      <div class="modal-content">
        <h3>Terminos y Condiciones</h3>
        <div class="terms-text">
          <p>Al utilizar Altoque aceptas el tratamiento de tus datos para registrar tu cuenta y guardar simulaciones vehiculares.</p>
          <p>Las simulaciones son referenciales y no representan una oferta financiera vinculante.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showTermsModal = false">Cancelar</button>
          <button class="btn btn-primary" :disabled="isLoading" @click="acceptAndRegister">Aceptar y continuar</button>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { useAuthStore } from '../../application/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showTermsModal = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const validate = () => {
  if (password.value.length < 8) return 'La contrasena debe tener minimo 8 caracteres.';
  if (password.value !== confirmPassword.value) return 'Las contrasenas no coinciden.';
  return '';
};

const handleRegister = () => {
  errorMessage.value = validate();
  if (!errorMessage.value) showTermsModal.value = true;
};

const acceptAndRegister = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    await authStore.register({ username: email.value, password: password.value, name: fullName.value });
    await authStore.login(email.value, password.value);
    showTermsModal.value = false;
    router.push('/inicio');
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo crear la cuenta';
    showTermsModal.value = false;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-view { width: 100%; max-width: 400px; margin: 0 auto; }
.view-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
.view-subtitle { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.5; margin-bottom: 24px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.input-field { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; font-size: 0.9375rem; background-color: #f8fafc; }
.input-field:focus { outline: none; border-color: var(--primary-color); background-color: white; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.password-field { width: 100%; padding-right: 72px; }
.eye-btn { position: absolute; right: 10px; background: transparent; border: none; cursor: pointer; color: var(--primary-color); font-weight: 700; }
.btn-block { width: 100%; padding: 12px; margin-top: 8px; }
.btn-outline { background: transparent; color: #64748b; border: 1px solid #cbd5e1; }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.error-text { color: #ef4444; font-size: 0.875rem; text-align: center; }
.auth-footer { text-align: center; margin-top: 24px; font-size: 0.875rem; color: var(--text-secondary); }
.link-primary { color: var(--primary-color); text-decoration: none; }
.link-primary:hover { text-decoration: underline; }
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background-color: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-content h3 { margin-top: 0; font-size: 1.25rem; color: #0f172a; }
.terms-text { margin: 16px 0; font-size: 0.9rem; line-height: 1.6; color: #475569; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
</style>
