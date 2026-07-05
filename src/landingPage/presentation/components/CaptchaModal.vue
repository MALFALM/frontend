<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="captcha-box">
        <div class="captcha-left">
          <input type="checkbox" id="captcha-check" class="captcha-checkbox" @change="handleCheck" :disabled="isChecked" />
          <label for="captcha-check" class="captcha-label">
            <span v-if="!isChecked">No soy un robot</span>
            <span v-else class="text-success font-bold">Verificado</span>
          </label>
        </div>
        <div class="captcha-right">
          <img src=".../captcha-logo.png" alt="Captcha logo" class="recaptcha-logo" />
          <div class="captcha-terms">Privacidad - Condiciones</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['verified']);

const isChecked = ref(false);

const handleCheck = () => {
  if (isChecked.value) return;
  isChecked.value = true;
  
  // Simulamos un pequeño delay de validación de red antes de continuar
  setTimeout(() => {
    emit('verified');
    // Reseteamos por si vuelven a abrirlo
    setTimeout(() => {
      isChecked.value = false;
    }, 500);
  }, 800);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: var(--shadow-lg);
  border: 1px solid #d3d3d3;
}

.captcha-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  height: 74px;
  background-color: #f9f9f9;
  border: 1px solid #d3d3d3;
  border-radius: 3px;
  padding: 0 12px;
}

.captcha-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-checkbox {
  width: 28px;
  height: 28px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.captcha-label {
  font-family: Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #222;
  cursor: pointer;
}

.text-success {
  color: #4CAF50;
}

.captcha-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.recaptcha-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-bottom: 4px;
}

.captcha-terms {
  font-size: 10px;
  color: #555;
}
</style>
