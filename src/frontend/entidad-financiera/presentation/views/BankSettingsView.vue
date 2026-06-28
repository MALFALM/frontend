<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../../../login/application/useAuthStore';
import { useEntitiesStore } from '../../application/useEntitiesStore';

const authStore = useAuthStore();
const { getEntityById, updateEntity } = useEntitiesStore();

const BANK_ID = computed(() => authStore.user.value?.bankId || 'bcp');
const bankEntity = computed(() => getEntityById(BANK_ID.value));

const brandColor = ref(bankEntity.value?.themeColor || '#ff5a00');
const saveMessage = ref('');

const saveSettings = () => {
  if (bankEntity.value) {
    const updatedEntity = { ...bankEntity.value, themeColor: brandColor.value };
    updateEntity(updatedEntity);
    saveMessage.value = 'Configuración guardada exitosamente';
    setTimeout(() => saveMessage.value = '', 3000);
  }
};
</script>

<template>
  <div class="settings-view">
    <div class="header-actions">
      <h2>Configuración de la Entidad</h2>
      <p class="subtitle">Ajustes generales del perfil bancario.</p>
    </div>

    <div class="card mt-4 text-left">
      <h3>Branding y Marca</h3>
      <p class="subtitle mb-4">Personaliza los colores de tu portal para mantener tu identidad visual.</p>
      
      <div class="form-group">
        <label>Color Principal (Hexadecimal)</label>
        <div class="color-picker-wrapper">
          <input type="color" v-model="brandColor" class="color-input" />
          <input type="text" v-model="brandColor" class="text-input" />
        </div>
        <p class="helper-text">Este color se usará en el logo y elementos activos del menú.</p>
      </div>

      <div class="action-footer mt-4">
        <button class="btn btn-primary" @click="saveSettings">Guardar Cambios</button>
        <span class="success-message" v-if="saveMessage">{{ saveMessage }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-actions h2 {
  margin: 0;
  color: #ffffff;
}

.subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin-top: 4px;
}

.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 32px;
}

.text-left {
  text-align: left;
}

.mb-4 {
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #c9d1d9;
}

.color-picker-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.text-input {
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 10px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 1rem;
  width: 120px;
}

.helper-text {
  font-size: 0.75rem;
  color: #8b949e;
  margin: 0;
}

.action-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #30363d;
}

.btn {
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #ff5a00;
  color: white;
}

.btn-primary:hover {
  background-color: #e65100;
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
}

.mt-4 {
  margin-top: 24px;
}
</style>
